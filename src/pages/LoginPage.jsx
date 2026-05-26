import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogIn, ShieldAlert, Cpu, LogOut } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, login, logout } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState(null); // 'google'
  
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [googlePromptOpen, setGooglePromptOpen] = useState(false);
  const [customGmail, setCustomGmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loginStep, setLoginStep] = useState(1);

  const runHandshake = (provider, callback) => {
    setLoading(true);
    setAuthProvider(provider);
    setTerminalLogs([]);
    setProgress(0);

    const logSteps = [
      { log: "▶ INITIALIZING SECURE SANDBOX CONNECTION ENGINE...", delay: 0, progress: 10 },
      { log: "▶ ESTABLISHING SECURE TLS CRYPTOGRAPHIC GATES...", delay: 350, progress: 25 },
      { log: "▶ AUTHENTICATING SINGLE SIGN-ON (SSO) SIGNATURE SYNC...", delay: 700, progress: 45 },
      { log: "▶ EXCHANGING SHA-256 PLATFORM TOKENS WITH AUTH GATEWAY...", delay: 1100, progress: 65 },
      { log: "▶ TOKENS SYNCHRONIZED: token=sha256_d1e8bc9f3c2a188414fa8e9c...", delay: 1500, progress: 85 },
      { log: "▶ SYNCING LOCAL CACHED ENVIRONMENT STATE...", delay: 1850, progress: 95 },
      { log: "▶ CONNECTION ONLINE. SYNCHRONIZING NEXUS LABS MODULES...", delay: 2200, progress: 100 }
    ];

    logSteps.forEach((step) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, step.log]);
        setProgress(step.progress);
      }, step.delay);
    });

    setTimeout(() => {
      callback();
      setLoading(false);
    }, 2500);
  };

  const handleGoogleLogin = () => {
    setLoginStep(1);
    setGooglePromptOpen(true);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!customGmail) return;

    const knownUsers = JSON.parse(localStorage.getItem('nexus-algo-known-users') || '{}');
    const existingName = knownUsers[customGmail.toLowerCase()];

    if (existingName) {
      setGooglePromptOpen(false);
      runHandshake('google', () => {
        login({
          name: existingName,
          email: customGmail,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(existingName)}&background=00f2fe&color=0b0f19&bold=true`,
          provider: 'google'
        });
        navigate('/');
      });
    } else {
      const username = customGmail.split('@')[0];
      const derivedName = username
        .split(/[\._-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setCustomName(derivedName);
      setLoginStep(2);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!customName) return;
    setGooglePromptOpen(false);

    const knownUsers = JSON.parse(localStorage.getItem('nexus-algo-known-users') || '{}');
    knownUsers[customGmail.toLowerCase()] = customName;
    localStorage.setItem('nexus-algo-known-users', JSON.stringify(knownUsers));

    runHandshake('google', () => {
      login({
        name: customName,
        email: customGmail,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customName)}&background=00f2fe&color=0b0f19&bold=true`,
        provider: 'google'
      });
      navigate('/');
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden grid-bg-overlay animate-fade-in">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-brand-secondary/10 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative z-10">
        {/* Connection Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/95 rounded-3xl z-50 flex flex-col p-6 backdrop-blur-md justify-between border border-brand-primary/30">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Secure Handshake Console
                  </span>
                </div>
                <Cpu className="w-4 h-4 text-brand-primary animate-spin" style={{ animationDuration: '3s' }} />
              </div>

              {/* Monospaced Log Screen */}
              <div className="font-mono text-[10px] text-emerald-400 space-y-2 h-[220px] overflow-y-auto no-scrollbar bg-black/40 border border-emerald-950/50 p-4 rounded-xl leading-relaxed select-none">
                {terminalLogs.map((log, index) => (
                  <div key={index} className="animate-fade-in">
                    {log}
                  </div>
                ))}
                {/* Blinking cursor */}
                <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse ml-0.5" />
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
                <span>Handshake Progress</span>
                <span className="text-brand-primary font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-brand-primary to-brand-secondary h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Conditional rendering based on login session state */}
        {user ? (
          <div className="space-y-6">
            {/* Branding Title */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-brand-glow mx-auto mb-4 font-mono">
                N
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Active Session Connected</h2>
              <p className="text-text-muted text-xs mt-1">Platform sync is currently fully operational</p>
            </div>

            {/* User Profile Info */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4">
              <img 
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80'} 
                alt={user.name} 
                className="w-16 h-16 rounded-full border-2 border-brand-primary/50 object-cover flex-shrink-0"
              />
              <div className="min-w-0 text-left">
                <h3 className="text-sm font-bold text-white truncate">{user.name}</h3>
                <p className="text-xs text-text-muted truncate font-mono">{user.email}</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded bg-brand-primary/10 border border-brand-primary/20 text-[9px] font-mono text-brand-primary uppercase">
                  Authenticated via {user.provider}
                </div>
              </div>
            </div>

            {/* Platform Environment Specs */}
            <div className="glass-panel rounded-2xl p-5 border border-white/5 font-mono text-xs text-text-muted space-y-3 bg-black/15">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold block border-b border-white/5 pb-2">
                Engine Diagnostics
              </span>
              <div className="flex justify-between items-center">
                <span>Session Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping animate-duration-1000" />
                  ACTIVE
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Platform Sync:</span>
                <span className="text-white font-bold">100% (COMPLETE)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Network Node:</span>
                <span className="text-brand-secondary font-bold">LOCAL_SANDBOX</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Diagnostic Latency:</span>
                <span className="text-cyan-400 font-bold">2.4ms (IDEAL)</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-bold tracking-wide transition-all cursor-pointer shadow-lg shadow-brand-glow text-sm hover:scale-[1.02]"
              >
                <Cpu className="w-4 h-4 text-black" />
                Go to Sandbox Dashboard
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-rose-500/30 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-semibold tracking-wide transition-all cursor-pointer text-sm hover:scale-[1.02]"
              >
                <LogOut className="w-4 h-4" />
                Disconnect Platform Engine
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Branding Title */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-brand-glow mx-auto mb-4 font-mono">
                N
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Access NexusAlgo Engine</h2>
              <p className="text-text-muted text-xs mt-1">Unlock real-time trace metrics and benchmarking speeds</p>
            </div>

            {/* Social Connects */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-white/10 hover:border-brand-primary/50 bg-white/5 hover:bg-white/10 text-white text-sm font-bold tracking-wide transition-all cursor-pointer shadow-lg"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Connect with Google
            </button>


            {/* Sandbox compliance banner */}
            <div className="flex items-start gap-3 mt-6 bg-white/5 border border-white/5 rounded-xl p-3.5 text-[11px] text-text-muted font-mono leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-brand-secondary flex-shrink-0 mt-0.5" />
              <span>This console operates on local secure token sync. Connecting with Google mimics premium SSO handshake. No credentials are stored.</span>
            </div>
          </>
        )}
      </div>

      {/* Google Identity Auth Simulation Dialog */}
      {googlePromptOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#1a1f2c] border border-white/10 rounded-2xl p-8 shadow-2xl relative">
            
            {/* Google Logo */}
            <div className="flex justify-center mb-6">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            </div>

            <h3 className="text-xl font-bold text-white text-center">Sign in with Google</h3>
            <p className="text-xs text-text-muted text-center mt-1 mb-6">to continue to NexusAlgo Visualizer</p>

            {loginStep === 1 ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-text-muted uppercase">Google Email / Gmail Address</label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={customGmail}
                    onChange={(e) => setCustomGmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 focus:border-brand-primary text-sm text-white placeholder-text-muted outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setGooglePromptOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-extrabold text-xs cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Next
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div className="space-y-2 text-center mb-2">
                  <p className="text-xs text-white">Welcome!</p>
                  <p className="text-xs text-text-muted font-mono">{customGmail}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-text-muted uppercase">Confirm Your Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 focus:border-brand-primary text-sm text-white placeholder-text-muted outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setLoginStep(1)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-extrabold text-xs cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
