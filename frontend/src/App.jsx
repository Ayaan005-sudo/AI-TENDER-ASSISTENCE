import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import TenderUpload from './pages/TenderUpload';
import { Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProfileSetup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tender-upload" element={<TenderUpload />} />
      </Routes>
    </Router>
  );
}

export default App;
