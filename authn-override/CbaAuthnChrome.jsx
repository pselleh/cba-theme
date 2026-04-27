import PropTypes from 'prop-types';

function lmsBaseUrl() {
  if (typeof window === 'undefined') {
    return '';
  }
  const h = window.location.hostname || '';
  const lmsHost = h.indexOf('apps.') === 0 ? h.slice(5) : h;
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${window.location.protocol}//${lmsHost}${port}`;
}

export default function CbaAuthnChrome({ children }) {
  const lms = lmsBaseUrl();

  return (
    <div className="cba-layout">
      <header className="cba-mfe-header">
        <div className="cba-mfe-header__inner">
          <a className="cba-mfe-header__brand" href={`${lms}/`} aria-label="Center for Business Acceleration home">
            <img
              src={`${lms}/static/cba-theme/images/logo.svg`}
              alt="Center for Business Acceleration"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <span className="cba-mfe-header__brand-text">Center for Business Acceleration</span>
          </a>

          <nav className="cba-mfe-header__nav" aria-label="Primary">
            <a href={`${lms}/about`}>About</a>
            <a href="/catalog">Catalog</a>
            <a href="/courses">Courses</a>
            <a href="/programs">Programs</a>
            <a href={`${lms}/credentialing`}>Credentialing</a>
            <a href={`${lms}/contact`}>Contact Us</a>
          </nav>

          <div className="cba-mfe-header__actions">
            <a className="cba-mfe-header__enroll" href={`${lms}/register`}>Enroll now</a>
            <a className="cba-mfe-header__login" href={`${lms}/login`}>Login</a>
          </div>
        </div>
      </header>

      <div className="cba-layout__content">
        {children}
      </div>

      <footer className="cba-mfe-footer">
        <div className="cba-mfe-footer__inner">
          <div className="cba-mfe-footer__top">
            <a className="cba-mfe-footer__brand" href={`${lms}/`} aria-label="Center for Business Acceleration home">
              <img
                src={`${lms}/static/cba-theme/images/logo.svg`}
                alt="Center for Business Acceleration"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </a>
            <nav className="cba-mfe-footer__links" aria-label="Footer">
              <a href={`${lms}/about`}>About</a>
              <a href="/catalog">Catalog</a>
              <a href="/courses">Courses</a>
              <a href="/programs">Programs</a>
              <a href={`${lms}/credentialing`}>Credentialing</a>
              <a href={`${lms}/contact`}>Contact Us</a>
            </nav>
          </div>

          <div className="cba-mfe-footer__bottom">
            <p>© 2026 Center for Business Acceleration. All rights reserved.</p>
            <div className="cba-mfe-footer__legal">
              <a href={`${lms}/privacy`}>Privacy</a>
              <a href={`${lms}/tos`}>Terms</a>
              <a href={`${lms}/cookies`}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

CbaAuthnChrome.propTypes = {
  children: PropTypes.node.isRequired,
};
