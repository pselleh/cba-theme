from tutor import hooks

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
