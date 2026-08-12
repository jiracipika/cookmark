import Link from 'next/link';

export default function RecipeNotFound() {
  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '80px 16px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Recipe not found</h1>
      <p style={{ color: 'var(--ios-label3)', marginBottom: 20 }}>This recipe may have been removed or the link may be incorrect.</p>
      <Link href="/recipes" style={{ color: 'var(--ios-blue)', fontWeight: 600 }}>Browse all recipes →</Link>
    </main>
  );
}