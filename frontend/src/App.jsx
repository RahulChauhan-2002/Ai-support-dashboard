// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import EmailList from './pages/EmailList';
import EmailDetail from './pages/EmailDetail';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/emails" element={<EmailList />} />
      <Route path="/emails/:id" element={<EmailDetail />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
