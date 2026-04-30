export default function Footer() {
  const lms = (() => {
    if (typeof window === 'undefined') return '';
    const host = window.location.hostname || '';
    const lmsHost = host.indexOf('apps.') === 0 ? host.slice(5) : host;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//${lmsHost}${port}`;
  })();

  return (
    <footer className="footer">
      <div className="section-inner">
        <div className="row align-items-center mb-4">
          <div className="col-md-4">
            <div className="d-flex align-items-center">
              <img src={`${lms}/static/cba-theme/images/logo.svg`} alt="Center for Business Acceleration" />
            </div>
          </div>

          <div className="col-md-8">
            <div className="d-flex justify-content-center justify-content-md-end">
              <ul className="list-unstyled d-flex flex-column flex-md-row mb-0">
                <li><a href={`${lms}/about`}>About</a></li>
                <li><a href={`${lms}/courses`}>Catalog</a></li>
                <li><a href={`${lms}/programs`}>Our Programs</a></li>
                <li><a href={`${lms}/credentialing`}>Credentialing</a></li>
                <li><a href={`${lms}/contact`}>Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>

        <hr />

        <div className="row align-items-center">
          <div className="col-12 text-center">
            <div className="d-flex flex-column flex-md-row justify-content-center align-items-center footer-bottom">
              <p>© 2025 Center for Business Acceleration. All rights reserved.</p>
              <div className="d-flex flex-column flex-md-row footer-links">
                <a href={`${lms}/privacy`}>Privacy</a>
                <a href={`${lms}/tos`}>Terms</a>
                <a href={`${lms}/cookies`}>Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
