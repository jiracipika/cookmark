'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  generateGroceryFromPlan,
  getAllRecipes,
  loadWeekPlan,
  saveWeekPlan,
  type Recipe,
} from '../../lib/recipes';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

type WeekPlan = Record<string, Record<string, string>>;

function loadGrocery(): { id: string; name: string; aisle: string; checked: boolean }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('cookmark-grocery-items');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Planner() {
  const [plan, setPlan] = useState<WeekPlan>({});
  const [catalog, setCatalog] = useState<Recipe[]>([]);
  const [editing, setEditing] = useState<{ day: string; meal: string } | null>(null);
  const [addedNote, setAddedNote] = useState(false);
  const noteTimer = useRef<number | null>(null);

  useEffect(() => {
    setPlan(loadWeekPlan());
    setCatalog(getAllRecipes());
    return () => {
      if (noteTimer.current !== null) window.clearTimeout(noteTimer.current);
    };
  }, []);

  const assign = (day: string, meal: string, recipeId: string) => {
    const dayMeals = { ...(plan[day] ?? {}) };
    if (recipeId) dayMeals[meal] = recipeId;
    else delete dayMeals[meal];
    const next = { ...plan, [day]: dayMeals };
    setPlan(next);
    saveWeekPlan(next);
    setEditing(null);
  };

  const addToGrocery = () => {
    const generated = generateGroceryFromPlan(plan, catalog);
    if (generated.length === 0) return;
    const existing = loadGrocery();
    const known = new Set(existing.map((i) => i.name.trim().toLowerCase()));
    const merged = [
      ...existing,
      ...generated
        .filter((g) => !known.has(g.name.trim().toLowerCase()))
        .map((g) => ({ ...g, checked: false })),
    ];
    try {
      window.localStorage.setItem('cookmark-grocery-items', JSON.stringify(merged));
    } catch {
      // Storage unavailable — nothing we can do; keep UI responsive.
    }
    setAddedNote(true);
    if (noteTimer.current !== null) window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setAddedNote(false), 2500);
  };

  const plannedCount = Object.values(plan).reduce(
    (sum, meals) => sum + Object.values(meals).filter(Boolean).length,
    0,
  );

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 8, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Meal Planner</h1>
        <p style={{ fontSize: 15, color: 'var(--ios-label3)', marginBottom: 24 }}>
          Tap any slot to assign a recipe.{' '}
          {plannedCount > 0 ? `${plannedCount} meal${plannedCount === 1 ? '' : 's'} planned.` : 'Your week is empty.'}
        </p>

        <div style={{ overflowX: 'auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `80px repeat(${DAYS.length}, minmax(92px, 1fr))`,
              gap: 1,
              background: 'var(--ios-separator)',
              borderRadius: 16,
              overflow: 'hidden',
              minWidth: 740,
            }}
          >
            <div style={{ padding: 12, background: 'var(--ios-bg2)', fontWeight: 600, fontSize: 12, color: 'var(--ios-label3)' }} />
            {DAYS.map((d) => (
              <div key={d} style={{ padding: 12, background: 'var(--ios-bg2)', fontWeight: 600, fontSize: 13, color: 'var(--ios-label)', textAlign: 'center' }}>
                {d}
              </div>
            ))}
            {MEALS.map((meal) => (
              <WeeklyRow
                key={meal}
                meal={meal}
                days={DAYS}
                plan={plan}
                catalog={catalog}
                editingMeal={editing?.meal === meal ? editing.day : null}
                onEdit={(day) => setEditing(day ? { day, meal } : null)}
                onAssign={(day, id) => assign(day, meal, id)}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 14,
            background: 'var(--ios-bg2)',
            boxShadow: 'var(--ios-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Generate Shopping List</h3>
            <p style={{ fontSize: 13, color: 'var(--ios-label3)' }}>
              Adds ingredients from all planned meals to your grocery list.
            </p>
          </div>
          <button
            onClick={addToGrocery}
            disabled={plannedCount === 0}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: plannedCount === 0 ? 'default' : 'pointer',
              background: plannedCount === 0 ? 'var(--ios-fill2)' : 'var(--ios-green)',
              color: plannedCount === 0 ? 'var(--ios-label3)' : '#fff',
            }}
          >
            {addedNote ? '✓ Added to Grocery List' : 'Add to Grocery List →'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── One meal row across the week ───────────────────────────────────── */

interface WeeklyRowProps {
  meal: string;
  days: string[];
  plan: WeekPlan;
  catalog: Recipe[];
  /** Day currently showing its editor for this meal, or null. */
  editingMeal: string | null;
  onEdit: (day: string | null) => void;
  onAssign: (day: string, recipeId: string) => void;
}

function WeeklyRow({ meal, days, plan, catalog, editingMeal, onEdit, onAssign }: WeeklyRowProps) {
  return (
    <>
      <div style={{ padding: 12, background: 'var(--ios-bg2)', fontWeight: 600, fontSize: 12, color: 'var(--ios-label3)', display: 'flex', alignItems: 'center' }}>
        {meal}
      </div>
      {days.map((day) => {
        const isEditing = editingMeal === day;
        const recipeId = plan[day]?.[meal];
        const recipe = catalog.find((r) => r.id === recipeId);
        return (
          <div key={`${day}-${meal}`} style={{ position: 'relative', minHeight: 64 }}>
            <button
              onClick={() => onEdit(isEditing ? null : day)}
              aria-expanded={isEditing}
              aria-label={`${meal} on ${day}: ${recipe ? recipe.title : 'empty'}. Tap to change.`}
              style={{
                width: '100%',
                minHeight: 64,
                height: '100%',
                padding: 8,
                background: isEditing ? 'rgba(0,122,255,0.10)' : 'var(--ios-bg2)',
                fontSize: 11.5,
                color: recipe ? 'var(--ios-label)' : 'var(--ios-label4)',
                border: 'none',
                textAlign: 'center',
                cursor: 'pointer',
                lineHeight: 1.35,
              }}
            >
              {recipe ? `${recipe.emoji} ${recipe.title}` : '+'}
            </button>
            {isEditing && (
              <SlotEditor
                catalog={catalog}
                currentId={recipeId ?? ''}
                onPick={(id) => onAssign(day, id)}
                onClose={() => onEdit(null)}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

/* ── Recipe picker popover for one slot ─────────────────────────────── */

function SlotEditor({
  catalog,
  currentId,
  onPick,
  onClose,
}: {
  catalog: Recipe[];
  currentId: string;
  onPick: (recipeId: string) => void;
  onClose: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [onClose]);

  return (
    <div
      ref={boxRef}
      role="dialog"
      aria-label="Choose a recipe"
      style={{
        position: 'absolute',
        zIndex: 20,
        top: 'calc(100% + 4px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 220,
        maxHeight: 240,
        overflowY: 'auto',
        background: 'var(--ios-bg2)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
        border: '1px solid var(--ios-separator)',
        padding: 6,
      }}
    >
      <button
        onClick={() => onPick('')}
        style={{
          width: '100%', padding: '8px 10px', border: 'none', background: !currentId ? 'var(--ios-fill)' : 'transparent',
          borderRadius: 8, fontSize: 13, color: 'var(--ios-label3)', textAlign: 'left', cursor: 'pointer',
        }}
      >
        Empty slot
      </button>
      {catalog.map((r) => (
        <button
          key={r.id}
          onClick={() => onPick(r.id)}
          style={{
            width: '100%', padding: '8px 10px', border: 'none', textAlign: 'left', cursor: 'pointer',
            background: r.id === currentId ? 'var(--ios-fill)' : 'transparent',
            borderRadius: 8, fontSize: 13, color: 'var(--ios-label)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {r.emoji} {r.title}
        </button>
      ))}
    </div>
  );
}
