import { getConfig } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, Route, Routes } from 'react-router-dom';

import CbaAuthnChrome from './CbaAuthnChrome';
import {
  EmbeddedRegistrationRoute, NotFoundPage, registerIcons, UnAuthOnlyRoute, Zendesk,
} from './common-components';
import configureStore from './data/configureStore';
import {
  AUTHN_PROGRESSIVE_PROFILING,
  LOGIN_PAGE,
  PAGE_NOT_FOUND,
  PASSWORD_RESET_CONFIRM,
  RECOMMENDATIONS,
  REGISTER_EMBEDDED_PAGE,
  REGISTER_PAGE,
  RESET_PAGE,
} from './data/constants';
import { updatePathWithQueryParams } from './data/utils';
import { ForgotPasswordPage } from './forgot-password';
import Logistration from './logistration/Logistration';
import { ProgressiveProfiling } from './progressive-profiling';
import { RecommendationsPage } from './recommendations';
import { RegistrationPage } from './register';
import { ResetPasswordPage } from './reset-password';

import './index.scss';
import './styles.scss';

registerIcons();
const RECAPTCHA_SITE_KEY = '6LfBVV0tAAAAAI2M3K2FFcMz2tbLZ2EXgkAo81G_';

const buildFaviconUrl = () => {
  const configured = getConfig().FAVICON_URL;
  if (configured && configured !== 'null' && !configured.includes('edx-cdn.org')) {
    return configured;
  }

  return '/favicon.ico';
};

const MainApp = () => (
  <AppProvider store={configureStore()}>
    <CbaAuthnChrome>
      <Helmet>
        <link rel="shortcut icon" href={buildFaviconUrl()} type="image/x-icon" />
        <script src={`https://www.google.com/recaptcha/enterprise.js?render=explicit&sitekey=${RECAPTCHA_SITE_KEY}`} />
      </Helmet>
      {getConfig().ZENDESK_KEY && <Zendesk />}
      <Routes>
        <Route path="/" element={<Navigate replace to={updatePathWithQueryParams(REGISTER_PAGE)} />} />
        <Route
          path={REGISTER_EMBEDDED_PAGE}
          element={<EmbeddedRegistrationRoute><RegistrationPage /></EmbeddedRegistrationRoute>}
        />
        <Route
          path={LOGIN_PAGE}
          element={
            <UnAuthOnlyRoute><Logistration selectedPage={LOGIN_PAGE} /></UnAuthOnlyRoute>
          }
        />
        <Route path={REGISTER_PAGE} element={<UnAuthOnlyRoute><Logistration /></UnAuthOnlyRoute>} />
        <Route path={RESET_PAGE} element={<UnAuthOnlyRoute><ForgotPasswordPage /></UnAuthOnlyRoute>} />
        <Route path={PASSWORD_RESET_CONFIRM} element={<ResetPasswordPage />} />
        <Route path={AUTHN_PROGRESSIVE_PROFILING} element={<ProgressiveProfiling />} />
        <Route path={RECOMMENDATIONS} element={<RecommendationsPage />} />
        <Route path={PAGE_NOT_FOUND} element={<NotFoundPage />} />
        <Route path="*" element={<Navigate replace to={PAGE_NOT_FOUND} />} />
      </Routes>
    </CbaAuthnChrome>
  </AppProvider>
);

export default MainApp;
