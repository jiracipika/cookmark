'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllRecipes, recipes, type Recipe } from '../../lib/recipes';

export default function Recipes() {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('All');
  // Built-in + clipped recipes; re-read on focus so a fresh clip appears
  // when the user navigates back without a full reload.
  const [all, setAll] = useState<Recipe[]>(recipes);
  useEffect(() => {
    setAll(getAllRecipes());
  }, []);
  const allTags = ['All', ...Array.from(new Set(all.flatMap(r => r.tags)))];
  const filtered = all.filter(r => {
    if (tag !== 'All' && !r.tags.includes(tag)) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 8, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Recipes</h1>
        <p style={{ fontSize: 15, color: 'var(--ios-label3)', marginBottom: 16 }}>{filtered.length} recipes</p>

        <input type="text" placeholder="Search recipes..." value={search} onChange={e => setSearch(e.target.value)} style={{
          width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--ios-separator)',
          fontSize: 15, background: 'var(--ios-bg2)', color: 'var(--ios-label)', marginBottom: 16, outline: 'none',
        }} />

        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto' }}>
          {allTags.map(t => (
            <button key={t} onClick={() => setTag(t)} style={{
              padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: tag === t ? 'var(--ios-label)' : 'var(--ios-bg2)', color: tag === t ? '#fff' : 'var(--ios-label2)',
            }}>{t}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {filtered.map(recipe => (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`} style={{ padding: 20, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', display: 'block' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{recipe.emoji}</div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--ios-label)', marginBottom: 4 }}>{recipe.title}</h3>
                <div style={{ fontSize: 13, color: 'var(--ios-label3)', marginBottom: 8 }}>{recipe.time} · {recipe.servings} servings</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {recipe.tags.map(t => (
                    <span key={t} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: 'rgba(0,122,255,0.08)', color: 'var(--ios-blue)' }}>{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          {filtered.length === 0 && (
            <p style={{ color: 'var(--ios-label3)', gridColumn: '1 / -1', padding: '24px 0' }}>No recipes match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
