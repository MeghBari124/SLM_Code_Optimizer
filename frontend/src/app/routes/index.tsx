import { Routes, Route } from 'react-router-dom';
import Landing from '@/pages/Landing';
import NotFound from '@/pages/NotFound';

// Placeholder: Import other pages as they're implemented
// import Dashboard from '@/pages/Dashboard';
// import RepositoryAnalysis from '@/pages/RepositoryAnalysis';
// import AnalysisProgress from '@/pages/AnalysisProgress';
// import AnalysisResults from '@/pages/AnalysisResults';
// import History from '@/pages/History';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* Phase 2+ routes */}
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      {/* <Route path="/analyze" element={<RepositoryAnalysis />} /> */}
      {/* <Route path="/analysis/:id/progress" element={<AnalysisProgress />} /> */}
      {/* <Route path="/analysis/:id/results" element={<AnalysisResults />} /> */}
      {/* <Route path="/history" element={<History />} /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
