import importlib.resources
import os
import shutil
import subprocess
import sys

import click

from tutor import fmt, hooks

try:
    from tutormfe.hooks import MFE_APPS, PLUGIN_SLOTS
except Exception:  # pragma: no cover - tutormfe may be disabled
    MFE_APPS = None
    PLUGIN_SLOTS = None


def _cba_theme_repo_root() -> str:
    """
    Root of the git checkout (contains django-theme/, mfe-brand/, frontend-app-cba-catalog/).

    With a normal `pip install` (wheel), the plugin lives under site-packages and this path
    is NOT the repo — set CBA_THEME_ROOT or use `pip install -e /path/to/cba-theme`.
    """
    env = (os.environ.get("CBA_THEME_ROOT") or "").strip()
    if env:
        return os.path.abspath(env)
    pkg_parent = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if os.path.isdir(os.path.join(pkg_parent, "django-theme")):
        return pkg_parent
    return pkg_parent


_REPO_ROOT = _cba_theme_repo_root()
_DJANGO_THEME = os.path.join(_REPO_ROOT, "django-theme")
_CBA_CATALOG_MFE = os.path.join(_REPO_ROOT, "frontend-app-cba-catalog")
_MFE_BRAND = os.path.join(_REPO_ROOT, "mfe-brand")
_AUTHN_OVERRIDE = os.path.join(_REPO_ROOT, "authn-override")
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
    """
    Resolve Tutor root even when PROJECT_ROOT_READY did not run yet.
    """
    if _TUTOR_ROOT:
        return _TUTOR_ROOT
    env_root = os.environ.get("TUTOR_ROOT")
    if env_root:
        return env_root
    return os.path.expanduser("~/.local/share/tutor")


def _register_env_patches_from_package() -> None:
    """Load tutor_cba_theme_content/patches/* into ENV_PATCHES (e.g. MFE Dockerfile fragments)."""
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


if MFE_APPS is not None:

    @MFE_APPS.add()
    def _cba_catalog_mfe_app(apps: dict) -> dict:
        """
        Tutor MFE served at https://apps.<LMS_HOST>/cba-catalog/ (Caddy strip_prefix).
        Sources are synced from this repo into the image build context by IMAGES_BUILD;
        Dockerfile patch mfe-dockerfile-pre-npm-build-cba-catalog replaces the git checkout.
        """
        apps["cba-catalog"] = {
            # Satisfies Docker ADD; real app files come from cba-catalog-override/ after sync + patch.
            "repository": "https://github.com/openedx/frontend-template-application.git",
            # Template repo has no openedx named releases (e.g. release/ulmo.2); pin a ref that exists.
            "version": "master",
            "port": 2010,
        }
        return apps


@hooks.Filters.IMAGES_BUILD.add(priority=hooks.priorities.HIGH)
def _sync_cba_catalog_mfe_into_build_context(build_images, config):
    """Before `docker build` for image mfe, sync local frontend overrides used by Dockerfile patches."""
    tutor_root = _resolved_tutor_root()
    if not any(name == "mfe" for name, *_ in build_images):
        return build_images
    if not os.path.isdir(_CBA_CATALOG_MFE):
        fmt.echo_alert(
            "cba-theme: frontend-app-cba-catalog/ missing at:\n"
            f"  {_CBA_CATALOG_MFE}\n"
            "MFE overrides are not synced (Docker will build stock apps). Fix:\n"
            "  pip install -e /path/to/cba-theme\n"
            "  or: export CBA_THEME_ROOT=/path/to/cba-theme\n"
            "Then: tutor config save && tutor images build mfe"
        )
        return build_images
    catalog_dest = os.path.join(
        tutor_root,
        "env",
        "plugins",
        "mfe",
        "build",
        "mfe",
        "cba-catalog-override",
    )
    os.makedirs(catalog_dest, exist_ok=True)
    fmt.echo_info(f"cba-theme: syncing catalog MFE → {catalog_dest}")
    subprocess.run(
        ["rsync", "-a", "--delete", f"{_CBA_CATALOG_MFE}/", f"{catalog_dest}/"],
        check=True,
    )
    if os.path.isdir(_MFE_BRAND):
        brand_dest = os.path.join(
            tutor_root,
            "env",
            "plugins",
            "mfe",
            "build",
            "mfe",
            "mfe-brand-override",
        )
        os.makedirs(brand_dest, exist_ok=True)
        fmt.echo_info(f"cba-theme: syncing mfe-brand → {brand_dest}")
        subprocess.run(
            ["rsync", "-a", "--delete", f"{_MFE_BRAND}/", f"{brand_dest}/"],
            check=True,
        )
    else:
        fmt.echo_info("cba-theme: mfe-brand/ missing — authn branding override skipped.")
    if os.path.isdir(_AUTHN_OVERRIDE):
        authn_ov_dest = os.path.join(
            tutor_root,
            "env",
            "plugins",
            "mfe",
            "build",
            "mfe",
            "authn-override",
        )
        os.makedirs(authn_ov_dest, exist_ok=True)
        fmt.echo_info(f"cba-theme: syncing authn-override → {authn_ov_dest}")
        subprocess.run(
            ["rsync", "-a", "--delete", f"{_AUTHN_OVERRIDE}/", f"{authn_ov_dest}/"],
            check=True,
        )
    else:
        fmt.echo_info("cba-theme: authn-override/ missing — authn layout chrome skipped.")
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
MKTG_URL_LINK_MAP:
  CATALOG: "catalog"
  COURSE-CATALOG: "course_catalog"
  PROGRAMS: "programs"
"""
))

# Enable comprehensive theming and set default theme for CMS
hooks.Filters.ENV_PATCHES.add_item((
    "cms-env",
    """
ENABLE_COMPREHENSIVE_THEMING: true
DEFAULT_SITE_THEME: "cba-theme"
MKTG_URL_LINK_MAP:
  CATALOG: "catalog"
  COURSE-CATALOG: "course_catalog"
  PROGRAMS: "programs"
"""
))

# Expose CBA catalog app on clean routes (without /cba-catalog prefix) on apps.<host>.
# Keep /cba-catalog as canonical asset/publicPath mount; these handles serve the same dist.
# Only match /courses/course-v1... (catalog detail), not every /courses/* — other apps or proxies
# may use /courses/... on the apps host.
hooks.Filters.ENV_PATCHES.add_item((
    "mfe-caddyfile",
    """
    @cba_catalog_clean {
        path /catalog /catalog/* /courses /courses/* /programs /programs/* /records/transcript /records/transcript/*
    }
    @cba_catalog_course path_regexp cbaCatalogCourse ^/courses/(course-v1|ccx-v1)
    handle @cba_catalog_clean {
        root * /openedx/dist/cba-catalog
        try_files /{path} /index.html
        file_server
    }
    handle @cba_catalog_course {
        root * /openedx/dist/cba-catalog
        try_files /{path} /index.html
        file_server
    }
"""
))

# Harden npm during `tutor images build mfe`: parallel `npm clean-install` for many MFes often hits
# ECONNRESET against registry.npmjs.org. These env vars apply to every MFE common stage (Tutor injects
# `mfe-dockerfile-pre-npm-install` immediately before `RUN npm clean-install`).
hooks.Filters.ENV_PATCHES.add_item((
    "mfe-dockerfile-pre-npm-install",
    """
ENV NPM_CONFIG_FETCH_RETRIES=10
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000
ENV NPM_CONFIG_FETCH_TIMEOUT=600000
ENV NPM_CONFIG_MAXSOCKETS=3
""",
))


# MFE shell (header/footer) — aligned with static pages navigation.
# NOTE: MFE is served on apps.<LMS_HOST>. Relative /static and /about hit the MFE host, not LMS.
# We derive LMS origin by stripping a leading "apps." from the hostname (standard Tutor layout).
# Catalog/courses/programs UI: frontend-app-cba-catalog (Tutor app id cba-catalog). mfe-brand/ mirrors the same UI for optional local packaging; the live MFE is frontend-app-cba-catalog.
#
# Learner Dashboard does NOT mount `header_slot`: it uses @edx/frontend-component-header, whose slots are
# org.openedx.frontend.layout.header_desktop.v1 / header_mobile.v1 (see Open edX frontend-plugin-slots docs).
# Learning MFE uses org.openedx.frontend.layout.header_learning.v1. Footer uses footer_slot alias of
# org.openedx.frontend.layout.footer.v1 — so footer worked everywhere footer_slot is honored.
_MFE_HEADER_HIDE = """
{
  op: PLUGIN_OPERATIONS.Hide,
  widgetId: 'default_contents',
}
"""

# Placeholder replaced per slot so widget ids stay unique in the FPF config.
_MFE_HEADER_INSERT_TEMPLATE = """
{
  op: PLUGIN_OPERATIONS.Insert,
  widget: {
    id: '__CBA_HDR_WIDGET_ID__',
    type: DIRECT_PLUGIN,
    RenderWidget: () => {
      var lms = '';
      if (typeof window !== 'undefined') {
        var h = window.location.hostname || '';
        var lmsHost = h.indexOf('apps.') === 0 ? h.slice(5) : h;
        lms = window.location.protocol + '//' + lmsHost + (window.location.port ? ':' + window.location.port : '');
      }
      return (
      <header style={{ background: '#0a2a66', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.18)', position: 'relative', zIndex: 1000 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href={lms + '/'} style={{ color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
            <img
              src={lms + '/static/cba-theme/images/logo.svg'}
              alt="Center for Business Acceleration"
              style={{ height: '34px', width: 'auto', display: 'block' }}
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
            />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
              Center for Business Acceleration
            </span>
          </a>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }} aria-label="Primary">
              <a href={lms + '/about'} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>About</a>
              <a href="/catalog" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Catalog</a>
              <a href="/courses" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Courses</a>
              <a href="/programs" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Programs</a>
              <a href={lms + '/credentialing'} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Credentialing</a>
              <a href={lms + '/contact'} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Contact Us</a>
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <a href={lms + '/register'} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.55)', borderRadius: '999px', padding: '0.35rem 0.85rem' }}>Enroll now</a>
              <a href={lms + '/login'} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>Login</a>
            </div>
          </div>
        </div>
      </header>
      );
    },
  },
}
"""

_MFE_FOOTER_HIDE = _MFE_HEADER_HIDE

_MFE_FOOTER_INSERT = """
{
  op: PLUGIN_OPERATIONS.Insert,
  widget: {
    id: 'cba_custom_footer',
    type: DIRECT_PLUGIN,
    RenderWidget: () => {
      var lms = '';
      if (typeof window !== 'undefined') {
        var h = window.location.hostname || '';
        var lmsHost = h.indexOf('apps.') === 0 ? h.slice(5) : h;
        lms = window.location.protocol + '//' + lmsHost + (window.location.port ? ':' + window.location.port : '');
      }
      return (
      <footer style={{ background: '#0a2a66', color: '#fff', marginTop: '2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.75rem 1.25rem 1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <a href={lms + '/'} style={{ color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
              <img
                src={lms + '/static/cba-theme/images/logo.svg'}
                alt="Center for Business Acceleration"
                style={{ height: '32px', width: 'auto', display: 'block' }}
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
              />
              <strong style={{ fontSize: '0.95rem', lineHeight: 1.2 }}>Center for Business Acceleration</strong>
            </a>
            <nav style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }} aria-label="Footer">
              <a href={lms + '/about'} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>About</a>
              <a href="/catalog" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Catalog</a>
              <a href="/courses" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Courses</a>
              <a href="/programs" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Programs</a>
              <a href={lms + '/credentialing'} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Credentialing</a>
              <a href={lms + '/contact'} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Contact Us</a>
            </nav>
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.24)', display: 'flex', justifyContent: 'space-between', gap: '0.8rem', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: '0.86rem' }}>© 2026 Center for Business Acceleration. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
              <a href={lms + '/privacy'} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.86rem' }}>Privacy</a>
              <a href={lms + '/tos'} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.86rem' }}>Terms</a>
              <a href={lms + '/cookies'} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.86rem' }}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>
      );
    },
  },
}
"""

# Slot ids that carry the main site header in different MFE shells (see frontend-plugin-slots reference).
_MFE_HEADER_SLOT_NAMES = (
    "header_slot",
    "org.openedx.frontend.layout.header_desktop.v1",
    "org.openedx.frontend.layout.header_mobile.v1",
    "org.openedx.frontend.layout.header_learning.v1",
)

# Skip plugin-slot injection for cba-catalog (owns Layout + FPF can break that app).
_EXCLUDE_MFE_PLUGIN_SLOTS = frozenset({"cba-catalog"})


def _register_cba_mfe_plugin_slots() -> None:
    if PLUGIN_SLOTS is None:
        return
    try:
        from tutormfe.plugin import iter_mfes
    except ImportError:
        return
    for mfe_name, _attrs in iter_mfes():
        if mfe_name in _EXCLUDE_MFE_PLUGIN_SLOTS:
            continue
        for slot_name in _MFE_HEADER_SLOT_NAMES:
            widget_id = f"cba_hdr_{mfe_name}_{slot_name.replace('.', '_')}"
            insert_cfg = _MFE_HEADER_INSERT_TEMPLATE.replace("__CBA_HDR_WIDGET_ID__", widget_id)
            combined = f"{_MFE_HEADER_HIDE.strip()},\n{insert_cfg.strip()}"
            PLUGIN_SLOTS.add_item((mfe_name, slot_name, combined))
        footer_cfg = f"{_MFE_FOOTER_HIDE.strip()},\n{_MFE_FOOTER_INSERT.strip()}"
        PLUGIN_SLOTS.add_item((mfe_name, "footer_slot", footer_cfg))


_register_cba_mfe_plugin_slots()
