import { useEffect, useState } from 'react';

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/graphql`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query { _empty }`,
          }),
        });
        const json = await res.json();
        setData(JSON.stringify(json.data));
      } catch (err) {
        console.error('⚠️ Failed to fetch GraphQL:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading user dashboard...</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '10%' }}>
      <h1>Welcome User 🎉</h1>
      <p>GraphQL response:</p>
      <pre>{data}</pre>
    </div>
  );
}