import React from 'react';
import Layout from '../../components/Layout';
import ProgramsPage from './ProgramsPage';

export default function ProgramsApp() {
  return (
    <Layout>
      <ProgramsPage />
    </Layout>
  );
}

export const pageConfig = {
  name: 'Programs',
  path: '/programs',
  layout: 'default',
};
