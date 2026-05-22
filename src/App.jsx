import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CollapsibleSidebar } from './components/CollapsibleSidebar';
import { ParticleBackground } from './components/common/ParticleBackground';

// Pages
import { Landing } from './pages/Landing';
import { SortingPage } from './pages/SortingPage';
import { SearchingPage } from './pages/SearchingPage';
import { DataStructures } from './pages/DataStructures';
import { PathfindingPage } from './pages/PathfindingPage';
import { RaceModePage } from './pages/RaceModePage';
import { LoginPage } from './pages/LoginPage';
import { GraphAlgorithms } from './pages/GraphAlgorithms';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex w-screen h-screen overflow-hidden bg-bg-primary text-text-main transition-colors duration-300 relative select-none">
          {/* Futuristic Floating Particles Canvas */}
          <ParticleBackground />

          {/* Navigation Sidebar */}
          <CollapsibleSidebar />

          {/* Screen Container */}
          <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-black/10">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/sorting" element={<SortingPage />} />
              <Route path="/searching" element={<SearchingPage />} />
              <Route path="/datastructures" element={<DataStructures />} />
              <Route path="/pathfinding" element={<PathfindingPage />} />
              <Route path="/race" element={<RaceModePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/graph" element={<GraphAlgorithms />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}
