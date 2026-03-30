'use client';
import { useState } from 'react';
import Link from 'next/link';

const AISLES = ['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Bakery', 'Other'];
const MOCK_ITEMS = [
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

export default function Grocery() {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [newItem, setNewItem] = useState('');
  const [newAisle, setNewAisle] = useState('Produce');

  const toggle = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const add = () => {
    if (!newItem.trim()) return;
    setItems(prev => [...prev, { id: `${Date.now()}`, name: newItem, aisle: newAisle, checked: false }]);
    setNewItem('');
  };

  const grouped = AISLES.reduce((acc, aisle) => {
    const aisleItems = items.filter(i => i.aisle === aisle);
    if (aisleItems.length) acc.push({ aisle, items: aisleItems });
    return acc;
  }, [] as { aisle: string; items: typeof items }[]);

  const checkedCount = items.filter(i => i.checked).length;

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 8, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Grocery List</h1>
        <p style={{ fontSize: 15, color: 'var(--ios-label3)', marginBottom: 20 }}>{checkedCount}/{items.length} items checked</p>

        <div style={{ padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', marginBottom: 20, display: 'flex', gap: 8 }}>
          <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add item..." onKeyDown={e => e.key === 'Enter' && add()} style={{
            flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)', outline: 'none',
          }} />
          <select value={newAisle} onChange={e => setNewAisle(e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid var(--ios-separator)', fontSize: 13, background: 'var(--ios-bg)', color: 'var(--ios-label)' }}>
            {AISLES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={add} style={{ padding: '10px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'var(--ios-green)', color: '#fff' }}>Add</button>
        </div>

        <div style={{ height: 6, borderRadius: 3, background: 'var(--ios-bg2)', marginBottom: 24 }}>
          <div style={{ width: `${items.length ? (checkedCount / items.length * 100) : 0}%`, height: '100%', borderRadius: 3, background: 'var(--ios-green)', transition: 'width 0.3s' }} />
        </div>

        {grouped.map(group => (
          <div key={group.aisle} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ios-label3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{group.aisle}</div>
            {group.items.map(item => (
              <div key={item.id} onClick={() => toggle(item.id)} style={{
                padding: '12px 14px', borderRadius: 12, background: 'var(--ios-bg2)', marginBottom: 4, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: item.checked ? 'none' : '2px solid var(--ios-separator)', background: item.checked ? 'var(--ios-green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>
                  {item.checked ? '✓' : ''}
                </div>
                <span style={{ fontSize: 15, color: item.checked ? 'var(--ios-label3)' : 'var(--ios-label)', textDecoration: item.checked ? 'line-through' : 'none' }}>{item.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
