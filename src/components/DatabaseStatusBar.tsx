import { useState, useEffect, useCallback, useRef } from 'react';
import { isNeonConfigured } from '../lib/neon';
import { checkDatabaseConnection, type DatabaseConnectionStatus } from '../services/settingsRepository';
import { RefreshCw, Database, WifiOff } from 'lucide-react';

type NotificationType = 'online' | 'offline' | 'synced' | null;

export default function DatabaseStatusBar() {
  const [notification, setNotification] = useState<NotificationType>(null);
  const [checking, setChecking] = useState(true);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const isConnectedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const hideNotification = useCallback(() => {
    setVisible(false);
    setTimeout(() => setNotification(null), 300);
  }, []);

  const showNotification = useCallback((type: NotificationType, msg = '') => {
    setMessage(msg);
    setNotification(type);
    setVisible(true);
    if (type === 'online' || type === 'synced') {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(hideNotification, 4000);
    }
  }, [hideNotification]);

  const check = useCallback(async () => {
    if (!isNeonConfigured) {
      isConnectedRef.current = false;
      setChecking(false);
      return;
    }
    setChecking(true);
    const result = await checkDatabaseConnection();
    isConnectedRef.current = result.isConnected;
    setChecking(false);
    if (result.isConnected) {
      showNotification('online');
    } else {
      showNotification('offline', result.message);
    }
  }, [showNotification]);

  useEffect(() => {
    void check();
    const onSynced = () => {
      if (isConnectedRef.current) showNotification('synced');
    };
    window.addEventListener('db:synced', onSynced);
    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('db:synced', onSynced);
    };
  }, [check, showNotification]);

  if (!notification || !visible) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div
        className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm shadow-lg backdrop-blur-md ${
          notification === 'offline'
            ? 'bg-amber-500/95 text-white'
            : 'bg-emerald-500/95 text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {notification === 'offline' ? (
            <WifiOff className="h-4 w-4 shrink-0" />
          ) : (
            <Database className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate font-medium">
            {notification === 'online' && 'Database terhubung'}
            {notification === 'synced' && 'Database tersinkronisasi'}
            {notification === 'offline' && (
              <>Database offline &mdash; {message || 'Koneksi terputus'}</>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {notification === 'offline' && (
            <button
              onClick={() => void check()}
              disabled={checking}
              className="flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${checking ? 'animate-spin' : ''}`} />
              Coba Lagi
            </button>
          )}
          <button
            onClick={hideNotification}
            className="flex items-center justify-center rounded-full p-1 hover:bg-white/20 transition-colors"
            aria-label="Tutup"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
