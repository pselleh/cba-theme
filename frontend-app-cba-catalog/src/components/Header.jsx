import React, { useEffect, useState } from 'react';
import { getAppsOrigin, getLmsOrigin } from '../utils/lmsOrigin';

export default function Header() {
  const lms = getLmsOrigin();
  const appsOrigin = getAppsOrigin();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const key = 'cba-theme';
    const html = document.documentElement;
    const storageGet = (name) => {
      try {
        return localStorage.getItem(name);
      } catch (_e) {
        return null;
      }
    };
    const storageSet = (name, value) => {
      try {
        localStorage.setItem(name, value);
      } catch (_e) {
        // Ignore storage failures (private mode, blocked storage, etc.)
      }
    };
    const getPreferredTheme = () => {
      const saved = storageGet(key);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    };
    const applyTheme = (theme) => {
      const dark = theme === 'dark';
      if (dark) {
        html.setAttribute('data-theme', 'dark');
      } else {
        html.removeAttribute('data-theme');
      }
      storageSet(key, dark ? 'dark' : 'light');
      setIsDark(dark);
    };

    applyTheme(getPreferredTheme());

    const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const onChange = (event) => {
      if (!storageGet(key)) {
        applyTheme(event.matches ? 'dark' : 'light');
      }
    };
    if (mql) {
      if (mql.addEventListener) {
        mql.addEventListener('change', onChange);
      } else if (mql.addListener) {
        mql.addListener(onChange);
      }
    }

    return () => {
      if (!mql) {
        return;
      }
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange);
      } else if (mql.removeListener) {
        mql.removeListener(onChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const nextDark = !isDark;
    if (nextDark) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem('cba-theme', nextDark ? 'dark' : 'light');
    } catch (_e) {
      // Ignore storage failures.
    }
    setIsDark(nextDark);
  };

  return (
    <div className="cba-nav-wrap fixed-top">
      <nav className="navbar cba-navbar navbar-expand-lg navbar-dark">
        <div className="container cba-nav__inner">
          <a className="navbar-brand cba-nav__brand d-flex align-items-center" href={`${lms}/`}>
            <img src={`${lms}/static/cba-theme/images/logo.svg`} alt="Center for Business Acceleration" />
          </a>

          <button
            className="navbar-toggler cba-nav__toggler"
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`collapse navbar-collapse cba-nav__collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
            <div className="cba-nav__row d-flex flex-column flex-lg-row align-items-lg-center ml-lg-auto">
              <ul className="navbar-nav cba-nav__main align-items-lg-center mb-0">
                <li className="nav-item"><a className="nav-link" href={`${lms}/about`}>About</a></li>
                <li className="nav-item"><a className="nav-link" href={`${appsOrigin}/catalog`}>Catalog</a></li>
                <li className="nav-item"><a className="nav-link" href={`${appsOrigin}/programs/`}>Our Programs</a></li>
                <li className="nav-item"><a className="nav-link" href={`${lms}/credentialing`}>Credentialing</a></li>
                <li className="nav-item"><a className="nav-link" href={`${lms}/contact`}>Contact Us</a></li>
                <li className="nav-item">
                  <a className="nav-link cba-nav__enroll" href={`${lms}/register`}>Enroll now</a>
                </li>
              </ul>

              <div className="cba-nav__actions d-flex flex-column flex-lg-row align-items-lg-center">
                <div className="d-flex flex-column flex-lg-row align-items-center mb-3 mb-lg-0">
                  <a href={`${lms}/login`} className="cba-nav__login mb-2 mb-lg-0 mr-lg-2">Login</a>
                </div>
                <div className="custom-control custom-switch cba-nav__theme-switch d-flex align-items-center ml-lg-3 mt-3 mt-lg-0">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="themeToggle"
                    aria-label="Toggle dark mode"
                    checked={isDark}
                    onChange={toggleTheme}
                  />
                  <label className="custom-control-label mb-0" htmlFor="themeToggle" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
