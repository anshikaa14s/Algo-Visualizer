import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('nexus-algo-theme') || 'neon';
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('nexus-algo-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('nexus-algo-theme', themeId);
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('nexus-algo-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexus-algo-user');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return (
    <AppContext.Provider value={{
      soundEnabled,
      toggleSound,
      currentTheme,
      changeTheme,
      user,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
