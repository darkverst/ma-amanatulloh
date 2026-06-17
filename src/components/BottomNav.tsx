import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Calendar, User, Camera, MessageSquare, LayoutDashboard, LogIn, Download, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DbIndicator from './DbIndicator';

interface NavItem {
  path: string;
  label: string;
  icon: typeof Home;
}

const primaryItems: NavItem[] = [
  { path: '/', label: 'Beranda', icon: Home },
  { path: '/berita', label: 'Berita', icon: Newspaper },
  { path: '/agenda', label: 'Agenda', icon: Calendar },
];

const secondaryItems: NavItem[] = [
  { path: '/profil', label: 'Profil', icon: User },
  { path: '/galeri', label: 'Galeri', icon: Camera },
  { path: '/kontak', label: 'Kontak', icon: MessageSquare },
  { path: '/download', label: 'Download', icon: Download },
];

export default function BottomNav() {
  const location = useLocation();
  const { isLoggedIn } = useApp();
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isMoreActive = [...secondaryItems, { path: '/login' }, { path: '/dashboard' }].some(
    item => isActive(item.path)
  );

  const isSomeMoreActive = showMore || isMoreActive;

  useEffect(() => { setShowMore(false); }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    if (showMore) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMore]);

  return (
    <>
      {/* Backdrop */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden animate-fadeIn"
          onClick={() => setShowMore(false)}
        />
      )}

      <div ref={moreRef} className="z-50 md:hidden">
        {/* Expanded panel */}
        {showMore && (
          <div className="animate-slideUp border-t border-white/10 bg-slate-900/95 backdrop-blur-2xl">
            <div className="max-w-md mx-auto px-4 pt-4 pb-2">
              <div className="grid grid-cols-4 gap-1">
                {secondaryItems.map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all active:scale-90 ${
                        active ? 'bg-primary-500/20' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-11 h-11 rounded-xl mb-1 transition-all ${
                        active ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'text-slate-400'
                      }`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className={`text-[10px] leading-tight text-center ${
                        active ? 'font-semibold text-primary-300' : 'font-medium text-slate-400'
                      }`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

                {/* Login / Dashboard */}
                {isLoggedIn ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all active:scale-90 ${
                      isActive('/dashboard') ? 'bg-primary-500/20' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-11 h-11 rounded-xl mb-1 transition-all ${
                      isActive('/dashboard') ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'text-slate-400'
                    }`}>
                      <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] leading-tight text-center ${
                      isActive('/dashboard') ? 'font-semibold text-primary-300' : 'font-medium text-slate-400'
                    }`}>
                      Dashboard
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setShowMore(false)}
                    className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all active:scale-90 hover:bg-white/5"
                  >
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl mb-1 text-slate-400">
                      <LogIn className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] leading-tight text-center font-medium text-slate-400">
                      Login
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Close handle */}
            <div className="flex justify-center pb-3 pt-1">
              <div
                onClick={() => setShowMore(false)}
                className="h-1 w-10 rounded-full bg-slate-600 active:scale-90 transition-transform cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Main bar */}
        <nav className="relative border-t border-white/10 bg-slate-900/95 backdrop-blur-2xl px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="max-w-md mx-auto flex items-center justify-around">
            {primaryItems.map(item => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-1 flex-col items-center justify-center py-2 transition-all active:scale-90 ${
                    active ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 -translate-y-2'
                      : ''
                  }`}>
                    <item.icon className={`h-5 w-5 transition-all ${active ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                  </div>
                  <span className={`text-[10px] font-medium mt-0.5 transition-all ${
                    active ? 'text-white font-semibold' : 'text-slate-400'
                  }`}>
                    {item.label}
                  </span>
                  {active && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400" />
                  )}
                </Link>
              );
            })}

            {/* More button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className={`relative flex flex-1 flex-col items-center justify-center py-2 transition-all active:scale-90 ${
                isSomeMoreActive ? 'text-white' : 'text-slate-400'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                isSomeMoreActive
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 -translate-y-2'
                  : ''
              }`}>
                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`} />
              </div>
              <span className={`text-[10px] font-medium mt-0.5 transition-all ${
                isSomeMoreActive ? 'text-white font-semibold' : 'text-slate-400'
              }`}>
                Lainnya
              </span>
              {isSomeMoreActive && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400" />
              )}
            </button>
          </div>
          <div className="absolute right-2 -top-0.5">
            <DbIndicator />
          </div>
        </nav>
      </div>
    </>
  );
}
