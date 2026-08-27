'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const AISLES = ['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Bakery', 'Other'];
const STORE_KEY = 'cookmark-grocery-items';

interface GroceryItem {
  id: string;
  name: string;
  aisle: string;
  checked: boolean;
}

const SEED_ITEMS: GroceryItem[] = [
  { id: '1', name: 'Bananas', aisle: 'Produce', checked: true },
  { id: '2', name: 'Avocados', aisle: 'Produce', checked: false },
  { id: '3', name: 'Tomatoes', aisle: 'Produce', checked: false },
  { id: '4', name: 'Milk', aisle: 'Dairy', checked: true },
  { id: '5', name: 'Parmesan', aisle: 'Dairy', checked: false },
  { id: '6', name: 'Chicken breast', aisle: 'Meat', checked: false },
  { id: '7', name: 'Pasta', aisle: 'Pantry', checked: true },
  { id: '8', name: 'Olive oil', aisle: 'Pantry', checked: false },
  { id: '9', name: 'Soy sauce', aisle: 'Pantry', checked: false },
  { id: '10', name: 'Bread', aisle: 'Bakery', checked: false },
];

function loadItems(): GroceryItem[] {
  if (typeof window === 'undefined') return SEED_ITEMS;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return SEED_ITEMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
  } catch {
    return SEED_ITEMS;
  }
}

function persistItems(items: GroceryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable — list still works for this session.
  }
}

export default function Grocery() {
  // Start with the persisted (or seed) list on first client render so
  // hydration output matches SSR markup.
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newAisle, setNewAisle] = useState('Produce');

  useEffect(() => {
    setItems(loadItems());
    setHydrated(true);
  }, []);

  const update = (next: GroceryItem[]) => {
    setItems(next);
    persistItems(next);
  };

  const toggle = (id: string) =>
    update(items.map(i => (i.id === id ? { ...i, checked: !i.checked } : i)));
  const remove = (id: string) => update(items.filter(i => i.id !== id));
  const clearChecked = () => update(items.filter(i => !i.checked));
  const add = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    update([...items, { id: `${Date.now()}`, name: trimmed, aisle: newAisle, checked: false }]);
    setNewItem('');
  };

  const grouped = AISLES.reduce((acc, aisle) => {
    const aisleItems = items.filter(i => i.aisle === aisle);
    if (aisleItems.length) acc.push({ aisle, items: aisleItems });
    return acc;
  }, [] as { aisle: string; items: GroceryItem[] }[]);

  const checkedCount = items.filter(i => i.checked).length;

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 8, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Grocery List</h1>
        <p style={{ fontSize: 15, color: 'var(--ios-label3)', marginBottom: 20 }}>{checkedCount}/{items.length} items checked</p>

        <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', marginBottom: 20, display: 'flex', gap: 8 }}>
          <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Add item..." aria-label="New item name" style={{
            flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)', outline: 'none',
          }} />
          <select value={newAisle} onChange={e => setNewAisle(e.target.value)} aria-label="Aisle" style={{ padding: 10, borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 13, background: 'var(--ios-bg)', color: 'var(--ios-label)' }}>
            {AISLES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={add} style={{ padding: '10px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--ios-green)', color: '#fff' }}>Add</button>
        </div>

        <div role="progressbar" aria-valuenow={checkedCount} aria-valuemin={0} aria-valuemax={items.length} aria-label="Grocery progress" style={{ height: 6, borderRadius: 3, background: 'var(--ios-bg2)', marginBottom: 24 }}>
          <div style={{ width: `${items.length ? (checkedCount / items.length * 100) : 0}%`, height: '100%', borderRadius: 3, background: 'var(--ios-green)', transition: 'width 0.3s' }} />
        </div>

        {checkedCount > 0 && (
          <button onClick={clearChecked} style={{
            marginBottom: 16, padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
            border: '1px solid var(--ios-separator)', cursor: 'pointer',
            background: 'var(--ios-bg2)', color: 'var(--ios-red)',
          }}>
            Clear {checkedCount} checked
          </button>
        )}

        {grouped.length === 0 && hydrated && (
          <p style={{ padding: '32px 0', textAlign: 'center', fontSize: 15, color: 'var(--ios-label3)' }}>
            Your list is empty. Add an item above or generate one from your meal plan.
          </p>
        )}

        {grouped.map(group => (
          <div key={group.aisle} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ios-label3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{group.aisle}</div>
            {group.items.map(item => (
              <label key={item.id} style={{
                padding: '12px 14px', borderRadius: 12, background: 'var(--ios-bg2)', marginBottom: 4, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggle(item.id)}
                  aria-label={`Mark ${item.name} ${item.checked ? 'unpurchased' : 'purchased'}`}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                />
                <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: 6, border: item.checked ? 'none' : '2px solid var(--ios-separator)', background: item.checked ? 'var(--ios-green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, flexShrink: 0 }}>
                  {item.checked ? '✓' : ''}
                </span>
                <span style={{ flex: 1, fontSize: 15, color: item.checked ? 'var(--ios-label3)' : 'var(--ios-label)', textDecoration: item.checked ? 'line-through' : 'none' }}>{item.name}</span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${item.name}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(item.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); remove(item.id); } }}
                  style={{ padding: '2px 6px', borderRadius: 6, fontSize: 14, color: 'var(--ios-label4)', cursor: 'pointer' }}
                >
                  ✕
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
