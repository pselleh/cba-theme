import React from 'react';
import Layout from '../../components/Layout';
import CoursesPage from './CoursesPage';

export default function CoursesApp() {
  return (
    <Layout>
      <CoursesPage />
    </Layout>
  );
}

export const pageConfig = {
  name: 'Courses',
  path: '/courses',
  layout: 'default',
};
