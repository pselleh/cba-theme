import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CatalogPage from './pages/catalog/CatalogPage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import ProgramsPage from './pages/programs/ProgramsPage';
import ProgramDetailPage from './pages/programs/ProgramDetailPage';
import TranscriptPage from './pages/transcript/TranscriptPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/courses/:courseKey" element={<CourseDetailPage />} />
        <Route path="/programs/:programUuid" element={<ProgramDetailPage />} />
        <Route path="/records/transcript" element={<TranscriptPage />} />
        <Route path="*" element={<Navigate to="/catalog" replace />} />
      </Routes>
    </Layout>
  );
}
