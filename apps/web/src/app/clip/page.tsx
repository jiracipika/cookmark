'use client';
import { useState } from 'react';
import Link from 'next/link';
import { saveCustomRecipe } from '../../lib/recipes';

export default function Clip() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<{
    id: string;
    title: string;
    emoji: string;
    ingredients: string[];
    steps: string[];
  } | null>(null);

  const extract = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+\..+/i.test(trimmed)) {
      setError('That does not look like a valid URL. It should start with http:// or https://');
      return;
    }
    setError(null);
    setSaved(false);
    setLoading(true);
    // Placeholder extraction until the server-side scraper ships; generates a
    // deterministic draft from the URL so saved clips are distinct per source.
    setTimeout(() => {
      let host = trimmed;
      try {
        host = new URL(trimmed).hostname.replace(/^www\./, '');
      } catch { /* keep raw text */ }
      setResult({
        id: `clip-${Date.now()}`,
        title: `Recipe from ${host}`,
        emoji: '🍽️',
        ingredients: ['2 cups flour', '1 tsp salt', '3 eggs', '1 cup milk'],
        steps: ['Preheat oven to 350°F', 'Mix dry ingredients', 'Add wet ingredients', 'Bake for 25 minutes'],
      });
      setLoading(false);
    }, 1200);
  };

  const save = () => {
    if (!result || saved) return;
    saveCustomRecipe({ ...result, time: '—', servings: 2, tags: ['Clipped'] });
    setSaved(true);
  };

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 8, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Clip Recipe</h1>
        <p style={{ fontSize: 15, color: 'var(--ios-label3)', marginBottom: 24 }}>Paste a URL to extract a recipe.</p>

        <div style={{ padding: 20, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', marginBottom: 24 }}>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && extract()}
            placeholder="https://example.com/recipe..."
            aria-label="Recipe URL"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--ios-separator)',
              fontSize: 15, background: 'var(--ios-bg)', color: 'var(--ios-label)', marginBottom: 12, outline: 'none',
            }}
          />
          <button onClick={extract} disabled={loading || !url.trim()} style={{
            width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 600, border: 'none', cursor: url.trim() && !loading ? 'pointer' : 'default',
            background: loading ? 'var(--ios-separator)' : 'var(--ios-blue)', color: '#fff',
          }}>{loading ? 'Extracting...' : 'Extract Recipe'}</button>
          {error && (
            <p role="alert" style={{ marginTop: 10, fontSize: 13, color: 'var(--ios-red)' }}>{error}</p>
          )}
        </div>

        {result && (
          <div style={{ padding: 20, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{result.title}</h2>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Ingredients</h3>
            {result.ingredients.map((ing) => (
              <div key={ing} style={{ padding: '6px 0', fontSize: 14, color: 'var(--ios-label2)', borderBottom: '0.5px solid var(--ios-bg)' }}>{ing}</div>
            ))}
            <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Steps</h3>
            {result.steps.map((step, i) => (
              <div key={`${i}-${step}`} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <div aria-hidden="true" style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--ios-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 14, color: 'var(--ios-label2)', paddingTop: 2 }}>{step}</div>
              </div>
            ))}
            <button
              onClick={save}
              disabled={saved}
              style={{
                marginTop: 16, padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none',
                cursor: saved ? 'default' : 'pointer',
                background: saved ? 'var(--ios-fill2)' : 'var(--ios-green)',
                color: saved ? 'var(--ios-label3)' : '#fff',
              }}
            >
              {saved ? '✓ Saved to My Recipes' : 'Save to My Recipes'}
            </button>
            {saved && (
              <Link href="/recipes" style={{ marginLeft: 12, fontSize: 14, color: 'var(--ios-blue)' }}>
                View recipes →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
