/**
 * Dark/Light Theme Toggle
 */

(function() {
    'use strict';

    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    const THEME_KEY = 'cba-theme';

    // Check for saved theme preference or default to 'light'
    function getPreferredTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
            return savedTheme;
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    }

    // Apply theme
    function setTheme(theme) {
        if (theme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
            if (themeToggle) {
                themeToggle.checked = true;
            }
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            if (themeToggle) {
                themeToggle.checked = false;
            }
        }
        localStorage.setItem(THEME_KEY, theme);
    }

    // Toggle theme
    function toggleTheme() {
        const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }

    // Initialize theme on page load
    function initTheme() {
        const preferredTheme = getPreferredTheme();
        setTheme(preferredTheme);
    }

    // Event listeners
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }

    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            if (!localStorage.getItem(THEME_KEY)) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }

})();

