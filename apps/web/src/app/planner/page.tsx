'use client';
import { useState } from 'react';
import Link from 'next/link';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

const MOCK_PLAN: Record<string, Record<string, string>> = {
  Mon: { Breakfast: '🥞 Banana Pancakes', Lunch: '🥗 Greek Salad', Dinner: '🍝 Garlic Pasta' },
  Tue: { Breakfast: '🥑 Avocado Toast', Lunch: '🍜 Tom Yum Soup', Dinner: '🍳 Chicken Stir Fry' },
  Wed: { Breakfast: '☕ Coffee + Toast', Lunch: '🥗 Caesar Salad', Dinner: '🍚 Mushroom Risotto' },
  Thu: { Breakfast: '🥞 Pancakes', Lunch: '🍝 Leftover Pasta', Dinner: '🍔 Burgers' },
  Fri: { Breakfast: '🥑 Toast', Lunch: '🍲 Soup', Dinner: '🍕 Pizza Night' },
  Sat: { Breakfast: '🍳 Eggs Benedict', Lunch: '🥗 Salad', Dinner: '🍜 Ramen' },
  Sun: { Breakfast: '☕ Brunch', Lunch: '🧪 Leftovers', Dinner: '🍫 Mug Cake + Movie' },
};

export default function Planner() {
  const [plan, setPlan] = useState(MOCK_PLAN);

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 8, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Meal Planner</h1>
        <p style={{ fontSize: 15, color: 'var(--ios-label3)', marginBottom: 24 }}>This week's meal plan.</p>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)`, gap: 1, background: 'var(--ios-separator)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: 12, background: 'var(--ios-bg2)', fontWeight: 600, fontSize: 12, color: 'var(--ios-label3)' }} />
            {DAYS.map(d => (
              <div key={d} style={{ padding: 12, background: 'var(--ios-bg2)', fontWeight: 600, fontSize: 13, color: 'var(--ios-label)', textAlign: 'center' }}>{d}</div>
            ))}
            {MEALS.map(meal => (
              <>
                <div key={meal} style={{ padding: 12, background: 'var(--ios-bg2)', fontWeight: 600, fontSize: 12, color: 'var(--ios-label3)', display: 'flex', alignItems: 'center' }}>{meal}</div>
                {DAYS.map(d => (
                  <div key={`${d}-${meal}`} style={{ padding: 10, background: 'var(--ios-bg2)', fontSize: 12, color: 'var(--ios-label2)', minHeight: 60, cursor: 'pointer' }}>
                    {plan[d]?.[meal] || <span style={{ color: 'var(--ios-label3)' }}>+</span>}
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Generate Shopping List</h3>
          <p style={{ fontSize: 13, color: 'var(--ios-label3)', marginBottom: 12 }}>Creates a grocery list from your meal plan.</p>
          <Link href="/grocery" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, background: 'var(--ios-green)', color: '#fff', textDecoration: 'none' }}>View Grocery List →</Link>
        </div>
      </div>
    </div>
  );
}
