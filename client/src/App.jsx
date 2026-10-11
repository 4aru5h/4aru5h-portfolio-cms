import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Portfolio from './pages/Portfolio';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ContentEditor from './pages/admin/ContentEditor';
import SkillsManager from './pages/admin/SkillsManager';
import CategoriesManager from './pages/admin/CategoriesManager';
import CertificationsManager from './pages/admin/CertificationsManager';
import ExperiencesManager from './pages/admin/ExperiencesManager';
import ProjectsManager from './pages/admin/ProjectsManager';
import BlogManager from './pages/admin/BlogManager';
import BlogEditor from './pages/admin/BlogEditor';
import SettingsManager from './pages/admin/SettingsManager';
import NavigationManager from './pages/admin/NavigationManager';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Portfolio />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="content" element={<ContentEditor />} />
          <Route path="skills" element={<SkillsManager />} />
          <Route path="categories" element={<CategoriesManager />} />
          <Route path="certifications" element={<CertificationsManager />} />
          <Route path="experiences" element={<ExperiencesManager />} />
          <Route path="projects" element={<ProjectsManager />} />
          <Route path="blog" element={<BlogManager />} />
          <Route path="blog/new" element={<BlogEditor />} />
          <Route path="blog/edit/:id" element={<BlogEditor />} />
          <Route path="navigation" element={<NavigationManager />} />
          <Route path="settings" element={<SettingsManager />} />
        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
