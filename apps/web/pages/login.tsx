// web/pages/login.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GRAPHQL_URL } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState('admin');


  useEffect(() => {
    const testConnection = async () => {
      try {
        const res = await fetch(GRAPHQL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: `query { _empty }` }),
        });
        const data = await res.json();
        console.log('✅ GraphQL API connected:', data);
      } catch (err) {
        console.error('❌ GraphQL connection failed:', err);
      }
    };

    testConnection();
  }, []);

  const handleLogin = () => {
    localStorage.setItem('role', role);
    if (role === 'admin') router.push('/admin/dashboard');
    else router.push('/user/dashboard');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20%' }}>
      <h2>Login Page</h2>
      <p>Select Role to Continue:</p>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
      <br />
      <button onClick={handleLogin} style={{ marginTop: '10px' }}>
        Login
      </button>
    </div>
  );
}
