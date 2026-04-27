export default function Header() {
  return (
    <header className="cba-mfe-header">
      <div className="cba-mfe-header__inner">
        <a className="cba-mfe-header__brand" href="/" aria-label="Center for Business Acceleration home">
          <img
            src="/images/logo.svg"
            alt="Center for Business Acceleration"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <span className="cba-mfe-header__brand-text">Center for Business Acceleration</span>
        </a>

        <nav className="cba-mfe-header__nav" aria-label="Primary">
          <a href="/about">About</a>
          <a href="/cba-catalog">Catalog</a>
          <a href="/cba-catalog/courses">Courses</a>
          <a href="/cba-catalog/programs">Programs</a>
          <a href="/credentialing">Credentialing</a>
          <a href="/contact">Contact Us</a>
        </nav>

        <div className="cba-mfe-header__actions">
          <a className="cba-mfe-header__enroll" href="/register">Enroll now</a>
          <a className="cba-mfe-header__login" href="/login">Login</a>
        </div>
      </div>
    </header>
  );
}
