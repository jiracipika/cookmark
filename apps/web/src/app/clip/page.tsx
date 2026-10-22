'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { parseRecipeText, saveCustomRecipe } from '../../lib/recipes';

type ClipMode = 'text' | 'link';

export default function Clip() {
  const [mode, setMode] = useState<ClipMode>('text');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<{
    id: string;
    title: string;
    emoji: string;
    ingredients: string[];
    steps: string[];
    time: string;
    servings: number;
    tags: string[];
    isDraft: boolean;
  } | null>(null);

  const extractFromText = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setError(null);
    setSaved(false);
    setLoading(true);
    const parsed = parseRecipeText(trimmed);
    if (parsed.ingredients.length === 0 && parsed.steps.length === 0) {
      setError('Couldn\'t find any ingredients or steps in that text. Make sure the recipe lists them.');
      setLoading(false);
      setResult(null);
      return;
    }
    setResult({
      id: `clip-${Date.now()}`,
      title: parsed.title ?? 'Pasted Recipe',
      emoji: '🍽️',
      ingredients: parsed.ingredients,
      steps: parsed.steps,
      time: parsed.time ?? '—',
      servings: parsed.servings ?? 2,
      tags: ['Clipped', 'Pasted'],
      isDraft: false,
    });
    setLoading(false);
  };

  const extractFromLink = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+\..+/i.test(trimmed)) {
      setError('That does not look like a valid URL. It should start with http:// or https://');
      return;
    }
    setError(null);
    setSaved(false);
    setLoading(true);
    // Browsers can't fetch other sites' pages, so a link alone can't give us
    // the real recipe. Save a labeled placeholder draft from the URL so the
    // clip is distinct per source, and steer the user to paste the text.
    setTimeout(() => {
      let host = trimmed;
      try {
        host = new URL(trimmed).hostname.replace(/^www\./, '');
      } catch { /* keep raw text */ }
      setResult({
        id: `clip-${Date.now()}`,
        title: `Recipe from ${host}`,
        emoji: '🍽️',
        ingredients: [],
        steps: [],
        time: '—',
        servings: 2,
        tags: ['Clipped', 'Draft'],
        isDraft: true,
      });
      setLoading(false);
    }, 400);
  };

  const extract = () => (mode === 'text' ? extractFromText() : extractFromLink());

  const save = () => {
    if (!result || saved) return;
    if (result.isDraft) {
      saveCustomRecipe({
        id: result.id,
        title: result.title,
        time: result.time,
        servings: result.servings,
        tags: result.tags,
        emoji: result.emoji,
        ingredients: ['(draft — paste the recipe text to fill this in)'],
        steps: ['(draft — paste the recipe text to fill this in)'],
      });
    } else {
      saveCustomRecipe({
        id: result.id,
        title: result.title,
        time: result.time,
        servings: result.servings,
        tags: result.tags,
        emoji: result.emoji,
        ingredients: result.ingredients,
        steps: result.steps,
      });
    }
    setSaved(true);
  };

  const canExtract = mode === 'text' ? text.trim().length > 0 : url.trim().length > 0;

  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 16px 40px' }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--ios-blue)', marginBottom: 8, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>Clip Recipe</h1>
        <p style={{ fontSize: 15, color: 'var(--ios-label3)', marginBottom: 16 }}>
          Paste the recipe text to save it. Links save as a draft placeholder.
        </p>

        <div role="radiogroup" aria-label="Clip mode" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['text', 'link'] as const).map(m => (
            <button
              key={m}
              role="radio"
              aria-checked={mode === m}
              onClick={() => { setMode(m); setError(null); }}
              style={{
                flex: 1, padding: 10, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                border: mode === m ? '2px solid var(--ios-blue)' : '1px solid var(--ios-separator)',
                background: mode === m ? 'var(--ios-bg)' : 'var(--ios-bg2)',
                color: mode === m ? 'var(--ios-blue)' : 'var(--ios-label2)',
              }}
            >
              {m === 'text' ? 'Paste recipe text' : 'From a link (draft)'}
            </button>
          ))}
        </div>

        <div style={{ padding: 20, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)', marginBottom: 24 }}>
          {mode === 'text' ? (
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={'Paste the full recipe here, e.g.\n\nServes 4 · 25 minutes\n\nIngredients\n- 200g pasta\n- 3 cloves garlic\n\nInstructions\n1. Boil the pasta.\n2. Sauté the garlic.'}
              aria-label="Recipe text"
              rows={10}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--ios-separator)',
                fontSize: 14, background: 'var(--ios-bg)', color: 'var(--ios-label)', marginBottom: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5,
              }}
            />
          ) : (
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
          )}
          <motion.button onClick={extract} disabled={loading || !canExtract} whileTap={canExtract && !loading ? { scale: 0.98 } : undefined} style={{
            width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 600, border: 'none', cursor: canExtract && !loading ? 'pointer' : 'default',
            background: loading ? 'var(--ios-separator)' : 'var(--ios-blue)', color: '#fff',
          }}>{loading ? 'Extracting...' : mode === 'text' ? 'Parse Recipe' : 'Create Draft'}</motion.button>
          <AnimatePresence>
            {error && (
              <motion.p
                key="clip-error"
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                style={{ marginTop: 10, fontSize: 13, color: 'var(--ios-red)' }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              key="clip-result"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
              style={{ padding: 20, borderRadius: 16, background: 'var(--ios-bg2)', boxShadow: 'var(--ios-shadow)' }}
            >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{result.title}</h2>
            <p style={{ fontSize: 12, color: 'var(--ios-label3)', marginBottom: 16 }}>
              {[result.time !== '—' ? result.time : null, result.servings ? `serves ${result.servings}` : null].filter(Boolean).join(' · ') || ' '}
              {result.isDraft && ' · placeholder draft'}
            </p>
            {result.isDraft ? (
              <p style={{ fontSize: 14, color: 'var(--ios-label2)', marginBottom: 8 }}>
                Cookmark cannot read other websites from your browser. This draft is a bookmark — switch to
                <strong> Paste recipe text</strong> to save the real ingredients and steps.
              </p>
            ) : (
              <>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Ingredients</h3>
                {result.ingredients.map((ing) => (
                  <div key={ing} style={{ padding: '6px 0', fontSize: 14, color: 'var(--ios-label2)', borderBottom: '0.5px solid var(--ios-bg)' }}>{ing}</div>
                ))}
                {result.ingredients.length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--ios-label3)' }}>No ingredients found.</p>
                )}
                <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Steps</h3>
                {result.steps.map((step, i) => (
                  <div key={`${i}-${step}`} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <div aria-hidden="true" style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--ios-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontSize: 14, color: 'var(--ios-label2)', paddingTop: 2 }}>{step}</div>
                  </div>
                ))}
                {result.steps.length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--ios-label3)' }}>No steps found.</p>
                )}
              </>
            )}
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
              {saved ? '✓ Saved to My Recipes' : result.isDraft ? 'Save Draft to My Recipes' : 'Save to My Recipes'}
            </button>
            {saved && (
              <Link href="/recipes" style={{ marginLeft: 12, fontSize: 14, color: 'var(--ios-blue)' }}>
                View recipes →
              </Link>
            )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
