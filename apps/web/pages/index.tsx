// apps/web/pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ maxWidth: 760, margin: '24px auto', padding: '0 16px' }}>
      <h1>ServiceOps Web</h1>
      <p><Link href="/appointments/new">Create a new appointment →</Link></p>
    </main>
  );
}