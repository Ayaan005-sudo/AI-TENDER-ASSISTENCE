import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import TenderUpload from './pages/TenderUpload';
import TenderDetails from './pages/TenderDetails';
import TenderExplore from './pages/TenderExplore';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProfileSetup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tender-upload" element={<TenderUpload />} />
        <Route path="/tender/:id" element={<TenderDetails />} />
        <Route path="/explore-tenders" element={<TenderExplore />} />
      </Routes>
    </Router>
  );
}

export default App;
