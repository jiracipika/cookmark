'use client';
import { useState } from 'react';
import Link from 'next/link';

const RECIPES = [
  { id: 'r1', title: 'Creamy Garlic Pasta', time: '20 min', servings: 4, tags: ['Quick', 'Italian'], emoji: '🍝', ingredients: ['pasta', 'garlic', 'cream', 'parmesan'], steps: ['Boil pasta', 'Sauté garlic in butter', 'Add cream and parmesan', 'Toss with pasta'] },
  { id: 'r2', title: 'Avocado Toast', time: '5 min', servings: 2, tags: ['Quick', 'Healthy'], emoji: '🥑', ingredients: ['bread', 'avocado', 'lemon', 'salt'], steps: ['Toast bread', 'Mash avocado with lemon', 'Spread and season'] },
  { id: 'r3', title: 'Chicken Stir Fry', time: '25 min', servings: 3, tags: ['Quick', 'Asian'], emoji: '🍳', ingredients: ['chicken', 'vegetables', 'soy sauce', 'rice'], steps: ['Cut chicken', 'Stir fry veggies', 'Add chicken and sauce', 'Serve over rice'] },
  { id: 'r4', title: 'Banana Pancakes', time: '15 min', servings: 2, tags: ['Quick', 'Breakfast'], emoji: '🥞', ingredients: ['banana', 'eggs', 'flour', 'milk'], steps: ['Mash banana', 'Mix with eggs and flour', 'Cook on pan'] },
  { id: 'r5', title: 'Mushroom Risotto', time: '40 min', servings: 4, tags: ['Italian', 'Comfort'], emoji: '🍚', ingredients: ['rice', 'mushrooms', 'onion', 'broth', 'parmesan'], steps: ['Sauté onion and mushrooms', 'Add rice', 'Slowly add broth', 'Stir in parmesan'] },
  { id: 'r6', title: 'Greek Salad', time: '10 min', servings: 2, tags: ['Healthy', 'Quick'], emoji: '🥗', ingredients: ['tomato', 'cucumber', 'feta', 'olives'], steps: ['Chop vegetables', 'Add feta and olives', 'Dress with olive oil'] },
  { id: 'r7', title: 'Chocolate Mug Cake', time: '5 min', servings: 1, tags: ['Dessert', 'Quick'], emoji: '🍫', ingredients: ['flour', 'sugar', 'cocoa', 'milk', 'oil'], steps: ['Mix dry ingredients', 'Add wet ingredients', 'Microwave 90 seconds'] },
  { id: 'r8', title: 'Tom Yum Soup', time: '30 min', servings: 4, tags: ['Asian', 'Soup'], emoji: '🍜', ingredients: ['shrimp', 'mushrooms', 'lemongrass', 'chili'], steps: ['Boil broth with lemongrass', 'Add mushrooms', 'Add shrimp', 'Season'] },
];

export default function Recipes() {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('All');
  const [detail, setDetail] = useState<string | null>(null);

  const allTags = ['All', ...new Set(RECIPES.flatMap(r => r.tags))];
  const filtered = RECIPES.filter(r => {
    if (tag !== 'All' && !r.tags.includes(tag)) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const r = detail ? RECIPES.find(x => x.id === detail) : null;

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

        {r ? (
          <div style={{ padding: 24, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}>
            <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', fontSize: 14, color: 'var(--ios-blue)', cursor: 'pointer', marginBottom: 12 }}>← Back to recipes</button>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{r.emoji}</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{r.title}</h2>
            <div style={{ fontSize: 14, color: 'var(--ios-label3)', marginBottom: 20 }}>{r.time} · {r.servings} servings · {r.tags.join(', ')}</div>
            
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Ingredients</h3>
            <div style={{ marginBottom: 20 }}>
              {r.ingredients.map((ing, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '0.5px solid var(--ios-bg)', fontSize: 14, color: 'var(--ios-label2)' }}>{ing}</div>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Steps</h3>
            {r.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ios-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 14, color: 'var(--ios-label2)', lineHeight: 1.5, paddingTop: 4 }}>{step}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {filtered.map(recipe => (
              <div key={recipe.id} onClick={() => setDetail(recipe.id)} style={{ padding: 20, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', cursor: 'pointer' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{recipe.emoji}</div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--ios-label)', marginBottom: 4 }}>{recipe.title}</h3>
                <div style={{ fontSize: 13, color: 'var(--ios-label3)', marginBottom: 8 }}>{recipe.time} · {recipe.servings} servings</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {recipe.tags.map(t => (
                    <span key={t} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: 'rgba(0,122,255,0.08)', color: 'var(--ios-blue)' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
