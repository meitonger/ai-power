// apps/web/components/Sidebar.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    const r = localStorage.getItem('role');
    setRole(r || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <aside style={{ width: 200, background: '#eee', padding: 20 }}>
      <h3>Menu</h3>
      {role === 'admin' && <p>Admin Menu</p>}
      {role === 'user' && <p>User Menu</p>}
      <button onClick={handleLogout}>Logout</button>
    </aside>
  );
}
