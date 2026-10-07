import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, MessageSquare, Link2, History, BarChart3, Info, Menu, X, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/scan-message', icon: MessageSquare, label: 'Scan Message' },
  { path: '/scan-url', icon: Link2, label: 'Scan URL' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/about', icon: Info, label: 'About' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-lg leading-none">ScamShield</div>
              <div className="text-blue-400 text-xs font-medium">AI Analyzer</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  active
                    ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{label}</span>
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-xs text-slate-400 text-center">⚠️ Educational tool only</p>
            <p className="text-xs text-slate-500 text-center mt-1">Local demo storage</p>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-bold text-white">ScamShield AI</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-400 hover:text-white">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20 pt-16 bg-slate-900">
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  location.pathname === path
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <div className="flex-1 pt-16 lg:pt-0">
          {children}
        </div>
        <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
          ScamShield AI is an <strong className="text-slate-400">educational cybersecurity tool</strong> for demo purposes only.
          It does not guarantee detection of all scams. Never share personal or financial information online.
          | Built with React + Node.js | Local SQLite storage
        </footer>
      </main>
    </div>
  );
}
