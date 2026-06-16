import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/dashboard',           icon: 'dashboard',      label: 'Dashboard',     end: true },
  { to: '/dashboard/ai-camera', icon: 'videocam',        label: 'AI Vision'            },
  { to: '/setup',               icon: 'settings',        label: 'Preferences'          },
];

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.name || 'User';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=39ff14&color=000`;

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: '#0a1a0a', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden flex flex-col items-center justify-center transition-opacity" 
          style={{ background: 'rgba(10, 26, 10, 0.98)', backdropFilter: 'blur(12px)' }}
        >
          <button 
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>close</span>
          </button>

          <nav className="flex flex-col items-center gap-6 w-full px-8 max-w-sm">
            {NAV_LINKS.map(({ to, icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-3 w-full transition-all"
                style={({ isActive }) => ({
                  padding: '16px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(57,255,20,0.15)' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid rgba(57,255,20,0.25)' : '1px solid rgba(255,255,255,0.05)',
                  textDecoration: 'none',
                })}
              >
                {({ isActive }) => (
                  <>
                    <span className="material-symbols-outlined" style={{ color: isActive ? '#39ff14' : '#9cba9c', fontSize: '28px' }}>{icon}</span>
                    <p style={{ color: isActive ? '#fff' : '#9cba9c', fontSize: '20px', fontWeight: '600' }}>{label}</p>
                  </>
                )}
              </NavLink>
            ))}

            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }}></div>

            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="flex items-center justify-center gap-3 w-full transition-all"
              style={{ padding: '16px', borderRadius: '12px', color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', fontSize: '20px', fontWeight: '600', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>logout</span>
              Logout
            </button>
          </nav>
        </div>
      )}

      {/* Sidebar (Desktop Only) */}
      <aside
        className="hidden lg:flex flex-col w-64 h-full flex-shrink-0"
        style={{ borderRight: '1px solid #283928', background: '#111811' }}
      >
        <div className="flex flex-col h-full justify-between p-6">
          <div className="flex flex-col gap-8">
            {/* User info */}
            <div className="flex gap-3 items-center">
              <div
                className="rounded-full flex-shrink-0"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundImage: `url("${avatarUrl}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2px solid #39ff14',
                }}
              ></div>
              <div className="flex flex-col">
                <h1 style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </h1>
                <p style={{ color: 'rgba(57,255,20,0.8)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pro Member</p>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map(({ to, icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 transition-all"
                  style={({ isActive }) => ({
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(57,255,20,0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(57,255,20,0.25)' : '1px solid transparent',
                    textDecoration: 'none',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <span className="material-symbols-outlined" style={{ color: isActive ? '#39ff14' : '#9cba9c' }}>{icon}</span>
                      <p style={{ color: isActive ? '#fff' : '#9cba9c', fontSize: '14px', fontWeight: '500' }}>{label}</p>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full transition-colors"
            style={{ padding: '8px 16px', borderRadius: '8px', color: '#9cba9c', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9cba9c'; e.currentTarget.style.background = 'transparent'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto" style={{ background: '#0a1a0a' }}>
        {/* Mobile Header */}
        <header
          className="lg:hidden flex items-center justify-between sticky top-0 z-20"
          style={{ padding: '16px', background: '#111811', borderBottom: '1px solid #283928' }}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color: '#39ff14' }}>bolt</span>
            <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>FitNex AI</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
