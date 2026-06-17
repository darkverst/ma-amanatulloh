import { useEffect, useState, useCallback, useRef } from 'react';
import { isNeonConfigured } from '../lib/neon';
import { checkDatabaseConnection } from '../services/settingsRepository';
import { Database, WifiOff } from 'lucide-react';

type Status = 'connecting' | 'online' | 'offline';

export default function DbIndicator() {
  const [status, setStatus] = useState<Status>('connecting');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const check = useCallback(async () => {
    if (!isNeonConfigured) { setStatus('offline'); return; }
    const result = await checkDatabaseConnection();
    setStatus(result.isConnected ? 'online' : 'offline');
  }, []);

  useEffect(() => {
    void check();
    const onSynced = () => {
      setStatus('online');
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setStatus('online'), 100);
    };
    window.addEventListener('db:synced', onSynced);
    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('db:synced', onSynced);
    };
  }, [check]);

  const color = status === 'online' ? 'text-green-400' : status === 'offline' ? 'text-red-400' : 'text-amber-400';
  const Icon = status === 'offline' ? WifiOff : Database;

  return (
    <div className={`flex items-center gap-1.5 text-[10px] font-medium ${color}`} title={
      status === 'online' ? 'Database terhubung' :
      status === 'offline' ? 'Database offline' : 'Menghubungkan...'
    }>
      <Icon className={`h-3 w-3 ${status === 'connecting' ? 'animate-pulse' : ''}`} />
      <span className="hidden sm:inline">
        {status === 'online' ? 'Tersambung' : status === 'offline' ? 'Offline' : '...'}
      </span>
    </div>
  );
}
