import React from 'react';
import { getAppsOrigin, getLmsOrigin } from '../utils/lmsOrigin';

export default function Footer() {
  const lms = getLmsOrigin();
  const appsOrigin = getAppsOrigin();

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
                <li><a href={`${appsOrigin}/catalog`}>Catalog</a></li>
                <li><a href={`${appsOrigin}/programs/`}>Our Programs</a></li>
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
              <p>© {new Date().getFullYear()} Center for Business Acceleration. All rights reserved.</p>
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
