import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Header from './cba-shell/Header';
import Footer from './cba-shell/Footer';

const THEME_KEY = 'cba-theme';
const RECAPTCHA_SITE_KEY = '6LfBVV0tAAAAAI2M3K2FFcMz2tbLZ2EXgkAo81G_';

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function cookieDomainForHost(hostname) {
  if (!hostname || hostname === 'localhost' || /^[\d.]+$/.test(hostname)) {
    return '';
  }
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return `.${parts.slice(-3).join('.')}`;
  }
  return `.${hostname}`;
}

function setThemeCookie(value) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const domain = cookieDomainForHost(window.location.hostname);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const domainPart = domain ? `; Domain=${domain}` : '';
  document.cookie = `${THEME_KEY}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${domainPart}${secure}`;
}

export default function CbaAuthnChrome({ children }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const fromStorage = window.localStorage.getItem(THEME_KEY);
    const fromCookie = getCookie(THEME_KEY);
    const saved = fromCookie || fromStorage;
    const shouldUseDark = saved === 'dark';
    setDark(shouldUseDark);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute('data-theme', 'dark');
      window.localStorage.setItem(THEME_KEY, 'dark');
      setThemeCookie('dark');
    } else {
      root.removeAttribute('data-theme');
      window.localStorage.setItem(THEME_KEY, 'light');
      setThemeCookie('light');
    }
  }, [dark]);

  useEffect(() => {
    const widgetIds = {};
    const targetForms = [
      { formId: 'sign-in-form', action: 'LOGIN' },
      { formId: 'registration-form', action: 'REGISTER' },
    ];

    const ensureWidgets = () => {
      const grecaptchaApi = window.grecaptcha?.enterprise;
      if (!grecaptchaApi?.render) return;

      targetForms.forEach(({ formId, action }) => {
        const form = document.getElementById(formId);
        if (!(form instanceof HTMLFormElement)) return;

        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (!submitBtn?.parentNode) return;

        const existingSlot = form.querySelector('.cba-recaptcha-slot');
        if (!existingSlot) {
          const slot = document.createElement('div');
          slot.className = 'cba-recaptcha-slot';
          submitBtn.parentNode.insertBefore(slot, submitBtn);
          widgetIds[formId] = grecaptchaApi.render(slot, {
            sitekey: RECAPTCHA_SITE_KEY,
            action,
          });
        }
      });
    };

    const renderLoop = window.setInterval(ensureWidgets, 350);
    ensureWidgets();

    const submitHandler = (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      const widgetId = widgetIds[form.id];
      if (widgetId === undefined) return;
      const token = window.grecaptcha?.enterprise?.getResponse?.(widgetId);
      if (!token) event.preventDefault();
    };

    document.addEventListener('submit', submitHandler, true);
    return () => {
      window.clearInterval(renderLoop);
      document.removeEventListener('submit', submitHandler, true);
    };
  }, []);

  return (
    <div className="cba-layout">
      <Header dark={dark} onToggleDark={setDark} />

      <main className="cba-layout__content">{children}</main>

      <Footer />
    </div>
  );
}

CbaAuthnChrome.propTypes = {
  children: PropTypes.node.isRequired,
};
