import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Handelser from './pages/Handelser';
import Budget from './pages/Budget';
import Packlista from './pages/Packlista';
import Sasongsoversikt from './pages/Sasongsoversikt';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Handelser />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/packlista" element={<Packlista />} />
          <Route path="/sasongsoversikt" element={<Sasongsoversikt />} />
        </Routes>
      </Layout>
    </Router>
  );
}
