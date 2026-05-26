import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
  Palette,
  Network,
  LogIn,
  LogOut,
  GitFork
} from 'lucide-react';

export function CollapsibleSidebar() {
  const navigate = useNavigate();
  const { soundEnabled, toggleSound, currentTheme, changeTheme, user, logout } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard Home', path: '/', icon: Home },
    { name: 'Sorting Visualizer', path: '/sorting', icon: BarChart3 },
    { name: 'Searching Visualizer', path: '/searching', icon: Search },
    { name: 'Data Structures', path: '/datastructures', icon: Database },
    { name: 'Tree Visualizer', path: '/tree', icon: GitFork },
    { name: 'Pathfinding Visualizer', path: '/pathfinding', icon: Grid },
    { name: 'Graph Visualizer', path: '/graph', icon: Network },
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

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Branding header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3 overflow-hidden">
          <div className="min-w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-brand-glow font-mono">
            N
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-fade-in">
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
                <span className="absolute left-24 scale-0 group-hover:scale-100 bg-bg-secondary text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 shadow-xl transition-all duration-150 whitespace-nowrap z-50">
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
            <div className="flex flex-col items-start text-xs text-left animate-fade-in">
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

        {/* Authentication Account Profile Widget */}
        <div className="border-t border-white/5 pt-4">
          {user ? (
            <div 
              onClick={() => navigate('/login')}
              className="flex items-center justify-between gap-3 bg-white/5 border border-white/5 hover:border-brand-primary/30 rounded-xl p-3 cursor-pointer transition-all duration-200 group"
              title="Manage Platform Session"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80'} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full border border-brand-primary/40 object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 text-left animate-fade-in">
                    <span className="text-xs font-bold text-white truncate">{user.name}</span>
                    <span className="text-[10px] text-text-muted truncate">{user.email}</span>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <button 
                  onClick={(e) => { e.stopPropagation(); logout(); navigate('/'); }}
                  className="text-text-muted hover:text-rose-500 cursor-pointer p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 hover:from-brand-primary/30 hover:to-brand-secondary/30 border border-brand-primary/30 hover:border-brand-primary text-sm font-semibold text-white tracking-wide transition-all cursor-pointer shadow-lg hover:shadow-brand-glow/20"
            >
              <LogIn className="w-4 h-4 text-brand-primary" />
              {!isCollapsed && <span className="animate-fade-in">Connect Platform</span>}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
