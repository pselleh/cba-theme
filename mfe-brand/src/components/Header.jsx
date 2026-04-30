import PropTypes from 'prop-types';

function lmsBaseUrl() {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname || '';
  const lmsHost = host.indexOf('apps.') === 0 ? host.slice(5) : host;
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${window.location.protocol}//${lmsHost}${port}`;
}

export default function Header({ dark = false, onToggleDark = null }) {
  const lms = lmsBaseUrl();

  const handleToggle = (event) => {
    if (typeof onToggleDark === 'function') {
      onToggleDark(event.target.checked);
    }
  };

  return (
    <div className="cba-nav-wrap fixed-top">
      <nav className="navbar cba-navbar navbar-expand-lg navbar-dark">
        <div className="container cba-nav__inner">
          <a className="navbar-brand cba-nav__brand d-flex align-items-center" href={`${lms}/`}>
            <img src={`${lms}/static/cba-theme/images/logo.svg`} alt="Center for Business Acceleration" />
          </a>

          <button className="navbar-toggler cba-nav__toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse cba-nav__collapse" id="navbarNav">
            <div className="cba-nav__row d-flex flex-column flex-lg-row align-items-lg-center ml-lg-auto">
              <ul className="navbar-nav cba-nav__main align-items-lg-center mb-0">
                <li className="nav-item"><a className="nav-link" href={`${lms}/about`}>About</a></li>
                <li className="nav-item"><a className="nav-link" href={`${lms}/courses`}>Catalog</a></li>
                <li className="nav-item"><a className="nav-link" href={`${lms}/programs`}>Our Programs</a></li>
                <li className="nav-item"><a className="nav-link" href={`${lms}/credentialing`}>Credentialing</a></li>
                <li className="nav-item"><a className="nav-link" href={`${lms}/contact`}>Contact Us</a></li>
                <li className="nav-item"><a className="nav-link cba-nav__enroll" href={`${lms}/register`}>Enroll now</a></li>
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
                    checked={dark}
                    onChange={handleToggle}
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

Header.propTypes = {
  dark: PropTypes.bool,
  onToggleDark: PropTypes.func,
};
