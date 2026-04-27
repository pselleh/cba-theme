export default function Footer() {
  return (
    <footer className="cba-mfe-footer">
      <div className="cba-mfe-footer__inner">
        <div className="cba-mfe-footer__top">
          <a className="cba-mfe-footer__brand" href="/" aria-label="Center for Business Acceleration home">
            <img
              src="/images/logo.svg"
              alt="Center for Business Acceleration"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          </a>
          <nav className="cba-mfe-footer__links" aria-label="Footer">
            <a href="/about">About</a>
            <a href="/cba-catalog">Catalog</a>
            <a href="/cba-catalog/courses">Courses</a>
            <a href="/cba-catalog/programs">Programs</a>
            <a href="/credentialing">Credentialing</a>
            <a href="/contact">Contact Us</a>
          </nav>
        </div>

        <div className="cba-mfe-footer__bottom">
          <p>© 2026 Center for Business Acceleration. All rights reserved.</p>
          <div className="cba-mfe-footer__legal">
            <a href="/privacy">Privacy</a>
            <a href="/tos">Terms</a>
            <a href="/cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
