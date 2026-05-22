import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CollapsibleSidebar } from './components/CollapsibleSidebar';
import { ParticleBackground } from './components/common/ParticleBackground';

// Pages
import { Landing } from './pages/Landing';
import { SortingPage } from './pages/SortingPage';
import { SearchingPage } from './pages/SearchingPage';
import { DataStructures } from './pages/DataStructures';
import { PathfindingPage } from './pages/PathfindingPage';
import { RaceModePage } from './pages/RaceModePage';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('nexus-algo-theme') || 'neon';
  });

  // Toggle Audio Synth settings globally
  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  // Change and save Space Themes
  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('nexus-algo-theme', themeId);
  };

  // Synchronize CSS attributes on HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return (
    <Router>
      <div className="flex w-screen h-screen overflow-hidden bg-bg-primary text-text-main transition-colors duration-300 relative select-none">
        {/* Futuristic Floating Particles Canvas */}
        <ParticleBackground />

        {/* Navigation Sidebar */}
        <CollapsibleSidebar 
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
          currentTheme={currentTheme}
          changeTheme={changeTheme}
        />

        {/* Screen Container */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-black/10">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/sorting" element={<SortingPage />} />
            <Route path="/searching" element={<SearchingPage />} />
            <Route path="/datastructures" element={<DataStructures />} />
            <Route path="/pathfinding" element={<PathfindingPage />} />
            <Route path="/race" element={<RaceModePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
