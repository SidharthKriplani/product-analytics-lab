import React, { useState, useEffect } from 'react';
import { HowTo } from '../shared/HowTo.jsx';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { statsFoundationsModules } from '../../data/statsFoundationsModules.js';

class ModuleErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Module failed to load</div>
          <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>{String(this.state.error)}</div>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: '8px 20px', background: 'var(--yellow)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { saveStatFoundationsProgress, getStatFoundationsProgress, getAllStatFoundationsProgress } from '../../utils/statsFoundationsProgress.js';
import { addBookmark, removeBookmark, isBookmarked, toggleBookmark } from '../../utils/bookmarks.js';
import { Module01_WhatIsData } from './modules/Module01_WhatIsData.jsx';
import { Module02_CentralTendency } from './modules/Module02_CentralTendency.jsx';
import { Module03_Spread } from './modules/Module03_Spread.jsx';
import { Module04_NormalDist } from './modules/Module04_NormalDist.jsx';
import { Module05_ZScores } from './modules/Module05_ZScores.jsx';
import { Module06_Areas } from './modules/Module06_Areas.jsx';
import { Module07_Sampling } from './modules/Module07_Sampling.jsx';
import { Module08_StandardError } from './modules/Module08_StandardError.jsx';
import { Module09_CLT } from './modules/Module09_CLT.jsx';
import { Module10_CI } from './modules/Module10_CI.jsx';
import { Module11_HypothesisTesting } from './modules/Module11_HypothesisTesting.jsx';
import { Module12_Power } from './modules/Module12_Power.jsx';
import { Module13_ExperimentDesigner } from './modules/Module13_ExperimentDesigner.jsx';
import { Module14_Correlation } from './modules/Module14_Correlation.jsx';
import { Module15_SimpsonsParadox } from './modules/Module15_SimpsonsParadox.jsx';
import { Module16_Skewness } from './modules/Module16_Skewness.jsx';
import { Module17_MultipleTesting } from './modules/Module17_MultipleTesting.jsx';
import { Module18_RegressionToMean } from './modules/Module18_RegressionToMean.jsx';
import { Module19_SelectionBias } from './modules/Module19_SelectionBias.jsx';
import { Module20_PracticalSignificance } from './modules/Module20_PracticalSignificance.jsx';
import { Module21_Counterfactuals } from './modules/Module21_Counterfactuals.jsx';
import { Module22_DiD } from './modules/Module22_DiD.jsx';
import { Module23_RD } from './modules/Module23_RD.jsx';
import { Module24_SyntheticControl } from './modules/Module24_SyntheticControl.jsx';
import { Module25_IV } from './modules/Module25_IV.jsx';
import { Module26_BayesianThinking } from './modules/Module26_BayesianThinking.jsx';
import { Module27_EffectSize } from './modules/Module27_EffectSize.jsx';
import { Module28_Bootstrap } from './modules/Module28_Bootstrap.jsx';
import { Module29_ChiSquare } from './modules/Module29_ChiSquare.jsx';
import { Module30_SUTVA } from './modules/Module30_SUTVA.jsx';
import { Module31_ANOVA } from './modules/Module31_ANOVA.jsx';
import { Module32_NonParametric } from './modules/Module32_NonParametric.jsx';
import { track } from '../../utils/analytics.js';

const NOTES_KEY = 'pal-notes-v1';

function getNotes(room, caseId) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    return all[room + ':' + caseId] || '';
  } catch { return ''; }
}

function saveNote(room, caseId, text) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    all[room + ':' + caseId] = text;
    localStorage.setItem(NOTES_KEY, JSON.stringify(all));
  } catch {}
}

const MODULE_COMPONENTS = {
  sf01: Module01_WhatIsData,
  sf02: Module02_CentralTendency,
  sf03: Module03_Spread,
  sf04: Module04_NormalDist,
  sf05: Module05_ZScores,
  sf06: Module06_Areas,
  sf07: Module07_Sampling,
  sf08: Module08_StandardError,
  sf09: Module09_CLT,
  sf10: Module10_CI,
  sf11: Module11_HypothesisTesting,
  sf12: Module12_Power,
  sf13: Module13_ExperimentDesigner,
  sf14: Module14_Correlation,
  sf15: Module15_SimpsonsParadox,
  sf16: Module16_Skewness,
  sf17: Module17_MultipleTesting,
  sf18: Module18_RegressionToMean,
  sf19: Module19_SelectionBias,
  sf20: Module20_PracticalSignificance,
  sf21: Module21_Counterfactuals,
  sf22: Module22_DiD,
  sf23: Module23_RD,
  sf24: Module24_SyntheticControl,
  sf25: Module25_IV,
  sf26: Module26_BayesianThinking,
  sf27: Module27_EffectSize,
  sf28: Module28_Bootstrap,
  sf29: Module29_ChiSquare,
  sf30: Module30_SUTVA,
  sf31: Module31_ANOVA,
  sf32: Module32_NonParametric,
};

const TOTAL = statsFoundationsModules.length;

const DIFFICULTY_STYLE = {
  Beginner:     { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  Intermediate: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  Advanced:     { color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)' },
};

export function StatsFoundationsRunner({ moduleId, onBack, onNext, unlocked, onNavigate, onSelectModule }) {
  const module = statsFoundationsModules.find(m => m.id === moduleId);
  const ModuleComponent = MODULE_COMPONENTS[moduleId];

  const [bookmarked, setBookmarked] = useState(() => {
    try { return isBookmarked('stat-foundations', moduleId); } catch { return false; }
  });
  useEffect(() => { setBookmarked(isBookmarked('stat-foundations', moduleId)); }, [moduleId]);
  const [toastVisible, setToastVisible] = useState(false);
  const [note, setNote] = useState(() => getNotes('stat-foundations', moduleId));
  useEffect(() => { setNote(getNotes('stat-foundations', moduleId)); }, [moduleId]);

  if (!module || !ModuleComponent) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', width: '100%', boxSizing: 'border-box', color: 'var(--text-muted)' }}>
        Module not found.
      </div>
    );
  }

  const isLocked = !module.isFree && !unlocked;
  const diffStyle = DIFFICULTY_STYLE[module.difficulty] || DIFFICULTY_STYLE.Beginner;

  function handleNext() {
    saveStatFoundationsProgress(moduleId);
    track('case_completed', { room: 'stat-foundations', id: moduleId, rating: null });
    onNext();
  }

  function handleBookmarkToggle() {
    try {
      toggleBookmark('stat-foundations', module.id, module.title, module.difficulty, module.tags || []);
      setBookmarked(prev => !prev);
    } catch (e) {
      console.warn('Bookmark toggle failed', e);
    }
  }

  function handleCopyNotes() {
    const playbookSection = module.playbookLinks?.length
      ? `\n## Playbook Links\n- ${module.playbookLinks.map(l => l.label).join('\n- ')}`
      : '';

    const md = `# ${module.title}
Difficulty: ${module.difficulty} | Est. ${module.estimatedMin} min

## Key Insight
${module.keyInsight}

## Connection
${module.connection}

## Tags
${(module.tags || []).join(', ')}${playbookSection}`;

    navigator.clipboard.writeText(md).then(() => {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    }).catch(() => {
      // clipboard not available — silently ignore
    });
  }

  const completedMap = getAllStatFoundationsProgress();

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '1.5rem 1rem', width: '100%', boxSizing: 'border-box', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

      {/* ── Right nav sidebar ── */}
      <div className="pal-foundation-nav" style={{
        width: '190px', flexShrink: 0, order: 2,
        position: 'sticky', top: '1rem',
        maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '0.75rem 0.5rem',
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 0.4rem', marginBottom: '0.5rem' }}>
          Stat Foundations
        </div>
        {statsFoundationsModules.map((m) => {
          const isCurrent = m.id === moduleId;
          const isDone = !!completedMap[m.id];
          const isStub = !!m.isStub;
          const isLocked = !m.isFree && !unlocked;
          const isBlocked = isStub || isLocked;
          return (
            <button
              key={m.id}
              onClick={() => !isBlocked && onSelectModule && onSelectModule(m.id)}
              style={{
                display: 'flex', alignItems: 'baseline', gap: '0.35rem',
                width: '100%', textAlign: 'left',
                padding: '0.28rem 0.4rem', borderRadius: '5px', border: 'none',
                background: isCurrent ? 'var(--yellow-bg)' : 'transparent',
                color: isCurrent ? 'var(--yellow-text)' : (isStub || isLocked) ? 'var(--text-muted)' : isDone ? 'var(--teal)' : 'var(--text)',
                fontSize: '0.75rem', lineHeight: 1.4,
                cursor: isBlocked ? 'default' : 'pointer',
                opacity: isStub ? 0.4 : isLocked ? 0.55 : 1,
                marginBottom: '0.1rem',
                fontWeight: isCurrent ? 700 : 400,
              }}
              title={isStub ? 'Coming soon' : isLocked ? 'Unlock to access' : m.title}
            >
              <span style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontSize: '0.68rem', color: isCurrent ? 'var(--yellow)' : 'var(--text-muted)', minWidth: '1.4rem' }}>{m.index}.</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isStub ? '' : isLocked ? '🔒 ' : isDone && !isCurrent ? '✓ ' : ''}{m.title}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main content column ── */}
      <div style={{ flex: 1, minWidth: 0, order: 1, position: 'relative' }}>

      {/* ── Toast notification ── */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '0.55rem 1.1rem',
          fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 9999, pointerEvents: 'none',
          animation: 'fadeIn 0.15s ease',
        }}>
          ✓ Copied to clipboard
        </div>
      )}

      {/* ── Top navigation bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        gap: '0.75rem',
      }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '0.4rem 0.75rem',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ← Foundations
        </button>

        {/* Module title */}
        <div style={{
          flex: 1,
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '0.9rem',
          color: 'var(--text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}>
          {module.title}
        </div>

        {/* Right-side action buttons + progress badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          {/* Copy Notes button */}
          <button
            onClick={handleCopyNotes}
            title="Copy module notes as Markdown"
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '0.35rem 0.6rem',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              lineHeight: 1,
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            📋
          </button>

          {/* Bookmark button */}
          <button
            onClick={handleBookmarkToggle}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark this module'}
            style={{
              background: bookmarked ? 'var(--purple-bg)' : 'none',
              border: `1px solid ${bookmarked ? 'var(--purple-border)' : 'var(--border)'}`,
              borderRadius: '6px',
              padding: '0.35rem 0.6rem',
              color: bookmarked ? 'var(--purple)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              lineHeight: 1,
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { if (!bookmarked) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; } }}
            onMouseLeave={e => { if (!bookmarked) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; } }}
          >
            {bookmarked ? '🔖' : '🔖'}
          </button>

          {/* Progress badge */}
          <div style={{
            background: 'var(--yellow-bg)',
            border: '1px solid var(--yellow-border)',
            borderRadius: '20px',
            padding: '0.3rem 0.7rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--yellow-text)',
            whiteSpace: 'nowrap',
          }}>
            {module.index} / {TOTAL}
          </div>
        </div>
      </div>

      {/* ── Module header card ── */}
      <div style={{
        background: 'var(--yellow-bg)',
        border: '1px solid var(--yellow-border)',
        borderRadius: '10px',
        padding: '1.1rem 1.25rem',
        marginBottom: '1.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{
            background: 'var(--yellow)',
            color: '#fff',
            borderRadius: '4px',
            padding: '0.15rem 0.55rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
          }}>
            MODULE {module.index}
          </span>
          <span style={{
            background: diffStyle.bg,
            border: `1px solid ${diffStyle.border}`,
            borderRadius: '4px',
            padding: '0.15rem 0.55rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: diffStyle.color,
          }}>
            {module.difficulty}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ~{module.estimatedMin} min
          </span>
        </div>

        <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: 'var(--yellow-text)', fontStyle: 'italic' }}>
          {module.subtitle}
        </div>
      </div>

      {/* ── Locked state ── */}
      {isLocked && (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          background: 'var(--surface)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔒</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
            This module is locked
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '360px', margin: '0 auto 1.5rem' }}>
            Unlock full access to all 25 Stat Foundations modules, plus every other room in Product Analytics Lab.
          </div>
          <button
            onClick={onBack}
            style={{
              background: 'var(--yellow)',
              border: 'none',
              borderRadius: '7px',
              padding: '0.65rem 1.5rem',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Back to Foundations
          </button>
        </div>
      )}

      {/* ── Unlocked: render module ── */}
      {!isLocked && (
        <>
          <HowTo skill={module.subtitle} steps={['Read the situation — understand the real-world context this concept solves', 'Interact with the demo — adjust sliders, make selections, observe what changes', 'Answer the question — test your understanding before moving on']} color="var(--teal)" />
          <ModuleErrorBoundary><ModuleComponent module={module} onNext={handleNext} /></ModuleErrorBoundary>
          <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
            <ForwardPointerCard room='stats' onNavigate={onNavigate} onNext={onNext} />
          </div>
          {/* Debrief bookmark button */}
          <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px 32px', boxSizing: 'border-box' }}>
            <button
              onClick={() => {
                if (bookmarked) {
                  removeBookmark('stat-foundations', module.id);
                  setBookmarked(false);
                } else {
                  addBookmark('stat-foundations', module.id, module.title, module.difficulty, module.tags || []);
                  setBookmarked(true);
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: bookmarked ? '1px solid var(--yellow-border)' : '1px solid var(--border)',
                background: bookmarked ? 'var(--yellow-bg)' : 'var(--surface)',
                color: bookmarked ? 'var(--yellow)' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
              }}
            >
              {bookmarked ? '🔖 Saved' : '🔖 Save'}
            </button>
          </div>

          {/* Notes */}
          <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px 32px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              My Notes
            </div>
            <textarea
              value={note}
              onChange={e => { setNote(e.target.value); saveNote('stat-foundations', moduleId, e.target.value); }}
              placeholder="Add your own notes, reminders, or follow-up questions..."
              rows={4}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '0.65rem 0.85rem',
                color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.55,
                resize: 'vertical', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </>
      )}
      </div>{/* end main content column */}
    </div>
  );
}
