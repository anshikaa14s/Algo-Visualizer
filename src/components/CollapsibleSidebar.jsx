import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Search, 
  Database, 
  Grid, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Palette 
} from 'lucide-react';

export function CollapsibleSidebar({ soundEnabled, toggleSound, currentTheme, changeTheme }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard Home', path: '/', icon: Home },
    { name: 'Sorting Visualizer', path: '/sorting', icon: BarChart3 },
    { name: 'Searching Visualizer', path: '/searching', icon: Search },
    { name: 'Data Structures', path: '/datastructures', icon: Database },
    { name: 'Pathfinding Visualizer', path: '/pathfinding', icon: Grid },
    { name: 'Algorithm Race Mode', path: '/race', icon: Zap },
  ];

  const themes = [
    { id: 'neon', name: 'Futuristic Neon', color: 'bg-cyan-400' },
    { id: 'cyberpunk', name: 'Cyberpunk Yellow', color: 'bg-yellow-400' },
    { id: 'matrix', name: 'Emerald Matrix', color: 'bg-green-500' },
    { id: 'ocean', name: 'Deep Space Ocean', color: 'bg-blue-500' },
  ];

  return (
    <aside 
      className={`glass-panel border-r border-white/5 relative z-30 flex flex-col justify-between transition-all duration-300 h-screen ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-bg-secondary border border-white/10 hover:border-brand-primary/50 text-white rounded-full p-1 cursor-pointer transition-colors duration-200"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div>
        {/* Branding header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3 overflow-hidden">
          <div className="min-w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-brand-glow font-mono">
            N
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold tracking-wider text-sm text-white">NexusAlgo</span>
              <span className="text-xs text-brand-primary font-mono tracking-widest font-semibold">PLATFORM</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-primary/10 to-brand-secondary/5 text-brand-primary border-l-2 border-brand-primary font-semibold shadow-inner shadow-brand-primary/5'
                    : 'text-text-muted hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5 min-w-5" />
              {!isCollapsed && (
                <span className="text-sm tracking-wide transition-opacity duration-200">
                  {item.name}
                </span>
              )}
              {isCollapsed && (
                <span className="absolute left-24 scale-0 group-hover:scale-100 bg-bg-secondary text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 shadow-xl transition-all duration-150 whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Control Panel Footer */}
      <div className="p-4 border-t border-white/5 space-y-4">
        {/* Sound Controls */}
        <button
          onClick={toggleSound}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 hover:border-brand-primary/30 hover:bg-white/5 text-text-muted hover:text-white transition-all duration-200 cursor-pointer"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-brand-primary animate-pulse" />
          ) : (
            <VolumeX className="w-5 h-5 text-text-muted" />
          )}
          {!isCollapsed && (
            <div className="flex flex-col items-start text-xs text-left">
              <span className="font-semibold text-white">Audio Synth</span>
              <span className="text-text-muted text-[10px]">
                {soundEnabled ? 'Enabled (Retro Triangle)' : 'Muted'}
              </span>
            </div>
          )}
        </button>

        {/* Theme customization */}
        <div className="flex flex-col gap-2 bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-3 text-text-muted text-xs">
            <Palette className="w-4 h-4 text-brand-secondary" />
            {!isCollapsed && <span className="font-semibold text-white">Select Space Theme</span>}
          </div>
          
          <div className={`grid gap-2 mt-1.5 ${isCollapsed ? 'grid-cols-1 justify-items-center' : 'grid-cols-4'}`}>
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => changeTheme(theme.id)}
                className={`w-6 h-6 rounded-full cursor-pointer relative border transition-transform duration-200 hover:scale-110 ${theme.color} ${
                  currentTheme === theme.id ? 'border-white scale-110' : 'border-transparent'
                }`}
                title={theme.name}
              >
                {currentTheme === theme.id && (
                  <span className="absolute inset-0.5 rounded-full border border-black/30" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
