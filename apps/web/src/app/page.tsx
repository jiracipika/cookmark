'use client';
import Link from 'next/link';
import { motion, type Transition, type Variants } from 'motion/react';

const MotionLink = motion.create(Link);

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.3, duration: 0.6 } },
};

const cardTransition: Transition = { type: 'spring', bounce: 0.4, duration: 0.45 };
const cardHover = { y: -4 };
const cardTap = { scale: 0.97 };

const FEATURES = [
  { label: 'My Recipes', href: '/recipes', icon: '📖', desc: 'Browse your saved recipe collection' },
  { label: 'Clip Recipe', href: '/clip', icon: '✂️', desc: 'Paste any recipe URL to save it' },
  { label: 'Meal Planner', href: '/planner', icon: '🗓️', desc: 'Plan your week, meal by meal' },
  { label: 'Grocery List', href: '/grocery', icon: '🛒', desc: 'Check items off aisle by aisle' }
];

export default function Landing() {
  return (
    <div style={{ background: 'var(--ios-bg)', minHeight: '100vh' }}>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{
          background: 'linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)',
          padding: '100px 24px 60px',
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
        <motion.div variants={rise} style={{ fontSize: 56, marginBottom: 16, position: 'relative' }}>🍳</motion.div>
        <motion.h1 variants={rise} style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-1px', position: 'relative', marginBottom: 8 }}>
          Cookmark
        </motion.h1>
        <motion.p variants={rise} style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', position: 'relative', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.5 }}>
          Clip recipes, plan meals
        </motion.p>
        <motion.div variants={rise} style={{ display: 'flex', gap: 12, justifyContent: 'center', position: 'relative' }}>
          <MotionLink href="/recipes" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{
            height: 48, borderRadius: 14, padding: '0 28px',
            background: '#fff', color: '#333', fontSize: 16, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}>
            Get Started
          </MotionLink>
        </motion.div>
      </motion.div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 16px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 20, color: 'var(--ios-label)' }}>Features</h2>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}
        >
          {FEATURES.map(f => (
            <MotionLink key={f.href} href={f.href} variants={rise} transition={cardTransition} whileHover={cardHover} whileTap={cardTap} style={{
              padding: 20, borderRadius: 16, background: 'var(--ios-bg2)',
              boxShadow: 'var(--ios-shadow)',
              textDecoration: 'none',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden="true">{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ios-label)', marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 13, color: 'var(--ios-label3)', lineHeight: 1.4 }}>{f.desc}</div>
            </MotionLink>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
