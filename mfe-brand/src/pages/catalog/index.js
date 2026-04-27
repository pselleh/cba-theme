import React from 'react';
import Layout from '../../components/Layout';
import CatalogPage from './CatalogPage';

export default function CatalogApp() {
  return (
    <Layout>
      <CatalogPage />
    </Layout>
  );
}

export const pageConfig = {
  name: 'Catalog',
  path: '/catalog',
  layout: 'default',
};
