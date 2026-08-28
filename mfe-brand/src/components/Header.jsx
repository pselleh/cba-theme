import { getConfig } from '@edx/frontend-platform';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { CBA_MARKETING_HOME, LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';
import { updatePathWithQueryParams } from '../data/utils';

function marketingBaseUrl() {
  const fromConfig = (getConfig().MARKETING_SITE_BASE_URL || '')
    .replace(/\/$/, '');
  if (fromConfig && !/localhost|127\.0\.0\.1/.test(fromConfig)) {
    return fromConfig;
  }
  return CBA_MARKETING_HOME;
}

function themeImage(filename) {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    if (host === 'localhost' || host === '127.0.0.1') {
      return `/static/cba-theme/images/${filename}`;
    }
  }
  const lms = (getConfig().LMS_BASE_URL || '').replace(/\/$/, '');
  if (lms) {
    return `${lms}/static/cba-theme/images/${filename}`;
  }
  return `${CBA_MARKETING_HOME}/static/cba/images/${filename}`;
}

export default function Header({ dark = false, onToggleDark = null }) {
  const home = CBA_MARKETING_HOME;
  const lms = (getConfig().LMS_BASE_URL || marketingBaseUrl()).replace(/\/$/, '');
  const loginPath = updatePathWithQueryParams(LOGIN_PAGE);
  const registerPath = updatePathWithQueryParams(REGISTER_PAGE);
  const logoLight = themeImage('logo-dark.svg');
  const logoDark = themeImage('logo.svg');

  const handleToggle = (event) => {
    if (typeof onToggleDark === 'function') {
      onToggleDark(event.target.checked);
    }
  };

  return (
    <div className="cba-nav-wrap fixed-top">
      <nav className="navbar cba-navbar navbar-expand-lg navbar-light">
        <div className="container cba-nav__inner">
          <a className="navbar-brand cba-nav__brand d-flex align-items-center" href={`${home}/`}>
            <img
              className="cba-nav__logo cba-nav__logo--light"
              src={logoLight}
              alt="Center for Business Acceleration"
            />
            <img
              className="cba-nav__logo cba-nav__logo--dark"
              src={logoDark}
              alt=""
            />
          </a>

          <div className="cba-nav__header-controls d-flex align-items-center">
            <div className="custom-control custom-switch cba-nav__theme-switch d-flex align-items-center">
              <input
                type="checkbox"
                className="custom-control-input"
                id="themeToggle"
                aria-label="Toggle dark mode"
                checked={dark}
                onChange={handleToggle}
              />
              <label className="custom-control-label mb-0" htmlFor="themeToggle">
                <span className="cba-nav__theme-label">Dark mode</span>
              </label>
            </div>

            <button
              className="navbar-toggler cba-nav__toggler d-lg-none"
              type="button"
              data-toggle="collapse"
              data-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>

          <div className="collapse navbar-collapse cba-nav__collapse" id="navbarNav">
            <div className="cba-nav__row d-flex flex-column flex-lg-row align-items-lg-center w-100">
              <ul className="navbar-nav cba-nav__main align-items-lg-center mb-0">
                <li className="nav-item"><a className="nav-link" href={`${home}/about`}>About</a></li>
                <li className="nav-item"><a className="nav-link" href={`${lms}/courses`}>Catalog</a></li>
                <li className="nav-item"><a className="nav-link" href={`${home}/`}>Our Programs</a></li>
                <li className="nav-item"><a className="nav-link" href={`${home}/`}>Credentialing</a></li>
                <li className="nav-item"><a className="nav-link" href={`${home}/contact`}>Contact Us</a></li>
              </ul>

              <div className="cba-nav__actions d-flex flex-column flex-lg-row align-items-lg-center">
                <Link to={loginPath} className="cba-nav__login">
                  Login
                </Link>
                <Link to={registerPath} className="cba-nav__enroll">
                  Enroll now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

Header.propTypes = {
  dark: PropTypes.bool,
  onToggleDark: PropTypes.func,
};
