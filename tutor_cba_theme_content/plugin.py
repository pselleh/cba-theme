import importlib.resources
import os
import shutil
import subprocess
import sys

import click

from tutor import fmt, hooks

_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_DJANGO_THEME = os.path.join(_REPO_ROOT, "django-theme")
_MFE = os.path.join(_REPO_ROOT, "mfe")
_BUILD_SCRIPT = os.path.join(_REPO_ROOT, "django-theme", "scripts", "build-theme.sh")

_TUTOR_ROOT: str | None = None
_IMAGES_BUILD_SYNC_DONE = False

_LMS_CONTAINER_CANDIDATES = ("tutor_local-lms-1", "tutor_dev-lms-1")


def _lms_container_name() -> str | None:
    for name in _LMS_CONTAINER_CANDIDATES:
        r = subprocess.run(
            ["docker", "container", "inspect", name],
            capture_output=True,
        )
        if r.returncode == 0:
            return name
    return None


def _run_lms_collectstatic(*, clear_first: bool = False) -> int:
    """
    Run Django collectstatic in the LMS container (refreshes hashed names like lms-main.*.css).

    Returns:
        0 on success
        non-zero on failure
        -1 if no LMS container is running
    """
    cid = _lms_container_name()
    if not cid:
        return -1
    extra = " --clear" if clear_first else ""
    r = subprocess.run(
        [
            "docker",
            "exec",
            cid,
            "bash",
            "-lc",
            "cd /openedx/edx-platform && "
            "SERVICE_VARIANT=lms DJANGO_SETTINGS_MODULE=lms.envs.tutor.production "
            f"./manage.py lms collectstatic --noinput{extra}",
        ],
    )
    return r.returncode


@hooks.Actions.PROJECT_ROOT_READY.add()
def _store_tutor_root(root: str) -> None:
    global _TUTOR_ROOT
    _TUTOR_ROOT = root


def _resolved_tutor_root() -> str:
    if _TUTOR_ROOT:
        return _TUTOR_ROOT
    env_root = os.environ.get("TUTOR_ROOT")
    if env_root:
        return env_root
    return os.path.expanduser("~/.local/share/tutor")


def _register_env_patches_from_package() -> None:
    """Load tutor_cba_theme_content/patches/* into ENV_PATCHES."""
    try:
        pkg_files = importlib.resources.files("tutor_cba_theme_content")
        pdir = pkg_files / "patches"
    except (FileNotFoundError, TypeError, AttributeError, ModuleNotFoundError):
        return
    if not pdir.is_dir():
        return
    for entry in pdir.iterdir():
        if not entry.is_file() or entry.name.startswith("."):
            continue
        try:
            body = entry.read_text(encoding="utf-8")
        except OSError:
            continue
        hooks.Filters.ENV_PATCHES.add_item((entry.name, body))


_register_env_patches_from_package()

def _sync_mfe_to_mfe_build_dir(tutor_root: str) -> None:
    """Rsync repo mfe/ into Tutor's MFE Docker build context."""
    if not os.path.isdir(_MFE):
        fmt.echo_info("cba-theme: mfe/ missing — MFE customizations skipped.")
        return

    mfe_dest = os.path.join(
        tutor_root,
        "env",
        "plugins",
        "mfe",
        "build",
        "mfe",
        "cba-mfe",
    )

    os.makedirs(mfe_dest, exist_ok=True)

    fmt.echo_info(f"cba-theme: syncing mfe → {mfe_dest}")

    subprocess.run(
        ["rsync", "-a", "--delete", f"{_MFE}/", f"{mfe_dest}/"],
        check=True,
    )


# Use LOW so this runs *after* DEFAULT callbacks that append the `mfe` image to the list.
# (HIGH runs first; at that moment the list is still empty or missing `mfe`, so sync was skipped.)
@hooks.Filters.IMAGES_BUILD.add(priority=hooks.priorities.LOW)
def _sync_mfe_into_build_context(build_images, config):
    """
    Before building the Tutor MFE image, sync the local CBA MFE sources
    into the Docker build context.
    """
    if not any(name == "mfe" for name, *_ in build_images):
        return build_images

    _sync_mfe_to_mfe_build_dir(_resolved_tutor_root())
    return build_images


def _should_sync_theme_into_tutor_env() -> bool:
    """True only for real `tutor images build ...` (not tab completion / printtag / pull)."""
    if os.environ.get("COMP_LINE") or os.environ.get("COMP_WORDS"):
        return False
    argv = sys.argv
    if "printtag" in argv or "pull" in argv or "push" in argv:
        return False
    try:
        i = argv.index("images")
    except ValueError:
        return False
    if i + 1 >= len(argv) or argv[i + 1] != "build":
        return False
    return True


def _compile_theme_sass() -> None:
    """
    Build LMS + CMS CSS from SCSS before the theme is copied into the Tutor build context.

    Uses the same entrypoint as local/CI: `npm run build:css` from the repo root
    (locks deps with `npm ci` in django-theme/, then `npm run build` there).
    Falls back to django-theme-only if the root package.json has no build:css script.
    """
    pkg = os.path.join(_DJANGO_THEME, "package.json")
    if not os.path.isfile(pkg):
        return
    npm = shutil.which("npm")
    if not npm:
        fmt.echo_info(
            "cba-theme: WARNING: npm not found; skipping Sass compile. "
            "Install Node.js 18+, or commit up-to-date lms/static/css and cms/static/css."
        )
        return

    root_pkg = os.path.join(_REPO_ROOT, "package.json")
    use_root = os.path.isfile(root_pkg)
    if use_root:
        try:
            with open(root_pkg, encoding="utf-8") as f:
                use_root = '"build:css"' in f.read()
        except OSError:
            use_root = False

    if use_root:
        fmt.echo_info(
            "cba-theme: compiling theme CSS (npm run build:css — LMS + CMS Sass, locked deps)"
        )
        subprocess.run([npm, "run", "build:css"], cwd=_REPO_ROOT, check=True)
        return

    fmt.echo_info("cba-theme: compiling theme CSS (django-theme: npm ci && npm run build)")
    subprocess.run(
        [npm, "ci", "--no-audit", "--no-fund"],
        cwd=_DJANGO_THEME,
        check=True,
    )
    subprocess.run([npm, "run", "build"], cwd=_DJANGO_THEME, check=True)


def _sync_django_theme_into_env_build() -> None:
    """Rsync django-theme/ -> <tutor-root>/env/build/openedx/themes/cba-theme for Docker COPY ./themes/."""
    global _IMAGES_BUILD_SYNC_DONE
    if _IMAGES_BUILD_SYNC_DONE or not _TUTOR_ROOT:
        return
    _compile_theme_sass()
    dest = os.path.join(_TUTOR_ROOT, "env", "build", "openedx", "themes", "cba-theme")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    fmt.echo_info(f"cba-theme: syncing django-theme/ -> {dest} (for openedx image build)")
    subprocess.run(
        ["rsync", "-a", "--delete", f"{_DJANGO_THEME}/", f"{dest}/"],
        check=True,
    )
    _IMAGES_BUILD_SYNC_DONE = True

    # Open edX serves /static/cba-theme/css/lms-main.<contenthash>.css from collectstatic output,
    # not from the theme tree alone. If LMS is already up (typical dev + bind mount), refresh hashes now.
    rc = _run_lms_collectstatic()
    if rc == -1:
        fmt.echo_info(
            "cba-theme: LMS not running — CSS for the new image is in env/build. "
            "After the stack is up, run once: tutor cba-theme collectstatic"
        )
    elif rc != 0:
        fmt.echo_info(
            f"cba-theme: collectstatic failed (exit {rc}). Fix the error, then: tutor cba-theme collectstatic"
        )
    else:
        fmt.echo_info(
            "cba-theme: collectstatic finished — hashed theme CSS in the running LMS is up to date."
        )


@hooks.Filters.IMAGES_BUILD.add(priority=hooks.priorities.HIGH)
def _auto_sync_theme_before_image_build(build_images, config):
    """
    When running `tutor images build openedx`, ensure env/build themes match the repo
    so no separate script is required on dev servers.
    """
    if not _should_sync_theme_into_tutor_env():
        return build_images
    try:
        _sync_django_theme_into_env_build()
    except (subprocess.CalledProcessError, OSError) as e:
        fmt.echo_error(
            f"cba-theme: could not sync theme into Tutor env ({e}). "
            "Install `rsync` or run: tutor cba-theme build --sync-only"
        )
        raise
    return build_images


@click.group(
    name="cba-theme",
    help="Build and sync the CBA comprehensive theme (styles, static assets, Tutor env).",
)
def cba_theme_cli() -> None:
    """CBA theme build tooling."""


@cba_theme_cli.command("build")
@click.option(
    "--sync-only",
    is_flag=True,
    help="Only rsync django-theme/ into Tutor env/build (use before `tutor images build openedx`).",
)
@click.option(
    "--skip-live",
    is_flag=True,
    help="Skip Sass compile + collectstatic in LMS even if a container is running.",
)
def cba_theme_build(sync_only: bool, skip_live: bool) -> None:
    """Sync theme sources and optionally compile Sass in a running LMS."""
    cmd = ["bash", _BUILD_SCRIPT]
    if sync_only:
        cmd.append("--sync-only")
    if skip_live:
        cmd.append("--skip-live")
    subprocess.check_call(cmd)


@cba_theme_cli.command("collectstatic")
@click.option(
    "--clear",
    "clear_first",
    is_flag=True,
    help="Run collectstatic with --clear (removes old hashed files first; use if CSS URL hash seems stuck).",
)
def cba_theme_collectstatic(clear_first: bool) -> None:
    """
    Copy theme static files into Django STATIC_ROOT and refresh manifest hashes.

    Required after changing lms-main.css while using bind mounts: Open edX serves
    /static/cba-theme/css/lms-main.<hash>.css from collectstatic output, not from the theme folder alone.
    """
    fmt.echo_info("cba-theme: running collectstatic in LMS container ...")
    rc = _run_lms_collectstatic(clear_first=clear_first)
    if rc == -1:
        fmt.echo_error(
            "cba-theme: no LMS container (tutor_local-lms-1 / tutor_dev-lms-1). "
            "Start the stack: tutor local start"
        )
        raise SystemExit(1)
    if rc != 0:
        raise SystemExit(rc)
    fmt.echo_info("cba-theme: done. Hard-refresh the browser (Ctrl+Shift+R) if styles look cached.")


@cba_theme_cli.command("sync-mfe-overrides")
def cba_theme_sync_mfe_overrides() -> None:
    """
    Copy the unified mfe/ sources into Tutor's MFE Docker build directory.

    Use after changing those folders, then ``tutor images build mfe``. (The automatic
    sync during image build had a priority bug before; this command is always safe.)
    """
    root = _resolved_tutor_root()
    _sync_authn_override_to_mfe_build_dir(root)
    _sync_mfe_brand_to_mfe_build_dir(root)
    fmt.echo_info("cba-theme: MFE override sync done.")


hooks.Filters.CLI_COMMANDS.add_item(cba_theme_cli)


@hooks.Filters.CONFIG_DEFAULTS.add(priority=hooks.priorities.LOW)
def _cba_theme_bind_mount(items: list) -> list:
    """
    Bind-mount django-theme/ to /openedx/themes/cba-theme so LMS/CMS use the repo
    (templates + sass) without rebuilding the openedx image on every change.
    """
    items.append(
        (
            "MOUNTS",
            [
                f"lms,cms,lms-worker,cms-worker:{_DJANGO_THEME}:/openedx/themes/cba-theme",
            ],
        )
    )
    return items


# Enable comprehensive theming and set default theme for LMS
hooks.Filters.ENV_PATCHES.add_item((
    "lms-env",
    """
ENABLE_COMPREHENSIVE_THEMING: true
DEFAULT_SITE_THEME: "cba-theme"
"""
))

# Enable comprehensive theming and set default theme for CMS
hooks.Filters.ENV_PATCHES.add_item((
    "cms-env",
    """
ENABLE_COMPREHENSIVE_THEMING: true
DEFAULT_SITE_THEME: "cba-theme"
"""
))
