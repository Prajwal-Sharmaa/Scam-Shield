import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ScanMessage from './pages/ScanMessage';
import ScanUrl from './pages/ScanUrl';
import History from './pages/History';
import Analytics from './pages/Analytics';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan-message" element={<ScanMessage />} />
          <Route path="/scan-url" element={<ScanUrl />} />
          <Route path="/history" element={<History />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
