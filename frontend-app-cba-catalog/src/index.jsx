import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { getLmsOrigin } from './utils/lmsOrigin';

import './index.scss';

let rootInstance = null;

function getRoot() {
  if (!rootInstance) {
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Missing #root container');
    }
    rootInstance = createRoot(container);
  }
  return rootInstance;
}

function ensureLmsThemeStylesheet() {
  if (typeof document === 'undefined') {
    return;
  }
  if (document.getElementById('cba-lms-main-css')) {
    return;
  }
  const lms = getLmsOrigin();
  if (!lms) {
    return;
  }
  const link = document.createElement('link');
  link.id = 'cba-lms-main-css';
  link.rel = 'stylesheet';
  link.href = `${lms}/static/cba-theme/css/lms-main.css`;
  document.head.appendChild(link);
}

function ensureDocumentDirection() {
  if (typeof document === 'undefined') {
    return;
  }
  const html = document.documentElement;
  if (!html.getAttribute('dir')) {
    html.setAttribute('dir', 'ltr');
  }
}

ensureLmsThemeStylesheet();
ensureDocumentDirection();

getRoot().render(
  <Router basename="/">
    <App />
  </Router>,
);
