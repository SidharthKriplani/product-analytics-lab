import { useState, useEffect, useRef, useCallback } from 'react';
import { statsModules } from '../../data/statsModules.js';
import { StatsDecisionCard } from './StatsDecisionCard.jsx';
import { StatsScoreReveal } from './StatsScoreReveal.jsx';
import { StatsConceptPanel } from './StatsConceptPanel.jsx';
import { ConceptDrawer } from '../concepts/ConceptDrawer.jsx';
import { saveStatsAttempt, clearStatsProgress } from '../../utils/statsProgress.js';
import { track } from '../../utils/analytics.js';
import { Icon } from '../shared/Icon.jsx';
import { TimerButton } from '../shared/TimerButton.jsx';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { LeadershipLens } from '../shared/LeadershipLens.jsx';
import { Breadcrumb } from '../shared/Breadcrumb.jsx';
import { ShareLinkButton } from '../shared/ShareLinkButton.jsx';

// views: 'question' | 'reveal' | 'debrief'

const ROOM_KEY = 'stats';

function loadNote(room, id) {
  try {
    const notes = JSON.parse(localStorage.getItem('pal-notes-v1') || '{}');
    return notes[`${room}:${id}`] || '';
  } catch { return ''; }
}
function saveNote(room, id, text) {
  try {
    const notes = JSON.parse(localStorage.getItem('pal-notes-v1') || '{}');
    notes[`${room}:${id}`] = text;
    localStorage.setItem('pal-notes-v1', JSON.stringify(notes));
  } catch {}
}

const DIFFICULTY_CFG = {
  foundational: { label: 'Foundational', color: 'var(--blue-text)', bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  analyst:      { label: 'Analyst',      color: 'var(--accent)',    bg: 'var(--accent-bg)',  border: 'var(--accent-border)' },
  intermediate: { label: 'Intermediate', color: 'var(--yellow)',    bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
  senior:       { label: 'Senior',       color: 'var(--teal)',      bg: 'var(--teal-bg)',    border: 'var(--teal-border)' },
  advanced:     { label: 'Advanced',     color: 'var(--purple)',    bg: 'var(--purple-bg)',  border: 'var(--purple-border)' },
  staff:        { label: 'Staff',        color: 'var(--red)',       bg: 'var(--red-bg)',     border: 'var(--red-border)' },
};

export function StatsRunner({ caseId, savedProgress, onBack, onGoToReview, onGoToDesign, onNext, onNavigate }) {
  const module = statsModules.find(m => m.id === caseId);
  const [view, setView] = useState(savedProgress?.selectedOptionId ? 'debrief' : 'question');
  const [selectedId, setSelectedId] = useState(savedProgress?.selectedOptionId || null);
  const [submitted, setSubmitted] = useState(!!savedProgress?.selectedOptionId);
  const [openConceptId, setOpenConceptId] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const [userNote, setUserNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState('');

  useEffect(() => {
    setUserNote(loadNote(ROOM_KEY, module.id));
    setNoteSaved(false);
  }, [module.id]);

  useEffect(() => {
    setElapsed(0);
    setPaused(false);
  }, [module.id]);

  useEffect(() => {
    if (paused) {
      clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [paused, module.id]);

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const selectedOption = module.options.find(o => o.id === selectedId);
  const diffCfg = DIFFICULTY_CFG[module.difficulty] || DIFFICULTY_CFG.foundational;

  function handleSubmit() {
    if (!selectedId) return;
    const opt = module.options.find(o => o.id === selectedId);
    const isCorrect = opt.level === 'correct' || opt.level === 'strong';
    setAnswerFeedback(isCorrect ? 'pal-success-ring' : 'pal-shake');
    setTimeout(() => setAnswerFeedback(''), isCorrect ? 700 : 420);
    saveStatsAttempt(module.id, selectedId, opt.level);
    track('case_completed', { room: 'stats', id: module.id, rating: opt.level });
    setSubmitted(true);
    setView('reveal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRetry() {
    clearStatsProgress(module.id);
    setSelectedId(null);
    setSubmitted(false);
    setView('question');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleOpenConcept = useCallback(id => setOpenConceptId(id), []);
  const handleCloseConcept = useCallback(() => setOpenConceptId(null), []);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* Back + header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <button
            onClick={onBack}
            className="pal-back-btn"
          >
            <Icon name="arrow-left" size={14} color="currentColor" />Stats Room
          </button>
          <ShareLinkButton room="stats" />
        </div>

        <Breadcrumb crumbs={[
          { label: 'PAL', onClick: onBack },
          { label: 'Stats Room', onClick: onBack },
          { label: caseId },
        ]} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
            borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
          }}>{diffCfg.label}</span>
          {!module.isFree && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              color: 'var(--teal)', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
              borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
            }}>Beta</span>
          )}
          <span style={{
            fontSize: '0.68rem', fontWeight: 600,
            color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>{module.concept}</span>
          <TimerButton elapsed={elapsed} paused={paused} onToggle={() => setPaused(p => !p)} warning={elapsed > 600} />
        </div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.015em' }}>
          {module.title}
        </h1>
        {module.sfPrerequisites?.length > 0 && (
          <div style={{ marginTop: 10, marginBottom: 2 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: 6, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Icon name="book-open" size={11} color="currentColor" />Review first:</span>
            {module.sfPrerequisites.map(p => (
              <span key={p.id} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', marginRight: 4, color: 'var(--accent)' }}>{p.title}</span>
            ))}
          </div>
        )}
      </div>

      {/* Question view */}
      {view === 'question' && (
        <div style={{
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          background: 'var(--surface)', overflow: 'hidden',
        }}>
          <div style={{ padding: '1.5rem' }}>
            <StatsDecisionCard
              module={module}
              selectedId={selectedId}
              onSelect={setSelectedId}
              submitted={false}
              answerFeedback={answerFeedback}
            />
          </div>
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--surface-2)',
          }}>
            <div className="pal-textarea-wrap" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Icon name="pen-line" size={12} color="currentColor" />Write your thinking first <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
              </div>
              <textarea
                value={userNote}
                onChange={e => { setUserNote(e.target.value); setNoteSaved(false); }}
                placeholder="What's your read? Jot down your diagnosis before revealing the answer..."
                style={{
                  width: '100%', minHeight: 80, padding: '10px 12px', background: 'var(--bg)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                  fontSize: '0.88rem', lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={() => { saveNote(ROOM_KEY, module.id, userNote); setNoteSaved(true); }}
                style={{
                  marginTop: 8, padding: '5px 14px', background: noteSaved ? 'var(--green-bg)' : 'var(--surface)',
                  border: `1px solid ${noteSaved ? 'var(--green-border)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem',
                  color: noteSaved ? 'var(--green)' : 'var(--text-muted)',
                }}
              >
                {noteSaved
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name='check' size={12} color='currentColor' /> Saved</span>
                  : 'Save note'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSubmit}
                disabled={!selectedId}
                className="pal-cta"
              >
                Submit answer →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reveal view */}
      {view === 'reveal' && selectedOption && (
        <div className="pal-reveal-in" style={{
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          background: 'var(--surface)', padding: '1.5rem',
        }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1rem',
          }}>
            Your answer
          </div>
          <StatsScoreReveal
            option={selectedOption}
            onContinue={() => { setView('debrief'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </div>
      )}

      {/* Debrief view */}
      {view === 'debrief' && selectedOption && (
        <div className="pal-reveal-in" style={{
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          background: 'var(--surface)', padding: '1.5rem',
        }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '1rem',
          }}>
            Stats Room debrief
          </div>
          <StatsConceptPanel
            module={module}
            selectedOption={selectedOption}
            onOpenConcept={handleOpenConcept}
            onGoToReview={onGoToReview}
            onGoToDesign={onGoToDesign}
            onRetry={handleRetry}
          />
          <LeadershipLens note={module.leadershipNote} />
          {userNote && (
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>Your notes</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{userNote}</div>
            </div>
          )}
          {onNext && (
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={onNext}
                className="pal-glow-pulse"
                style={{
                  background: 'var(--accent)', border: 'none', borderRadius: '7px',
                  padding: '0.5rem 1.2rem', color: '#fff', fontSize: '0.85rem',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                Next module →
              </button>
            </div>
          )}
          <ForwardPointerCard room='stats' onNavigate={onNavigate} onNext={onNext} />
        </div>
      )}

      <ConceptDrawer conceptId={openConceptId} onClose={handleCloseConcept} />
    </div>
  );
}
