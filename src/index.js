import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import App from './App';
import AdminImport from './pages/AdminImport';
import AdminPreferences from './pages/AdminPreferences';
import AdminOpinion from './pages/AdminOpinion';

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin/import" element={<AdminImport />} />
      <Route path="/admin/preferences" element={<AdminPreferences />} />
      <Route path="/admin/opinions" element={<AdminOpinion />} />
    </Routes>
  </BrowserRouter>
);
