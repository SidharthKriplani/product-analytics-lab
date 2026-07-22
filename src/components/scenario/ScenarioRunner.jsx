import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { scenarios } from '../../data/scenarios.js';
import { designScenarios } from '../../data/designScenarios.js';
import { ContextPanel } from './ContextPanel.jsx';
import { ExperimentDesign } from './ExperimentDesign.jsx';
import { MetricTable } from './MetricTable.jsx';
import { WarningFlags } from './WarningFlags.jsx';
import { FlagChecklist } from './FlagChecklist.jsx';
import { DecisionPanel } from './DecisionPanel.jsx';
import { ScoreReveal } from './ScoreReveal.jsx';
import { DebriefPanel } from './DebriefPanel.jsx';
import { DebriefCopyButton } from '../shared/DebriefCopyButton.jsx';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { GateOverlay } from '../shared/GateOverlay.jsx';
import { saveAttempt } from '../../utils/progress.js';
import { track } from '../../utils/analytics.js';
import { getScoreRank } from '../../utils/scoring.js';
import { ShareLinkButton } from '../shared/ShareLinkButton.jsx';

const NOTES_KEY = 'pal-notes-v1';
const SCENARIO_DRAFT_KEY = 'pal-scenario-draft-v1';
function readScenarioDrafts() { try { return JSON.parse(localStorage.getItem(SCENARIO_DRAFT_KEY) || '{}'); } catch { return {}; } }
function saveScenarioDraft(id, state) { try { var d = readScenarioDrafts(); d[id] = state; localStorage.setItem(SCENARIO_DRAFT_KEY, JSON.stringify(d)); } catch {} }
function loadScenarioDraft(id) { return readScenarioDrafts()[id] || null; }
function clearScenarioDraft(id) { try { var d = readScenarioDrafts(); delete d[id]; localStorage.setItem(SCENARIO_DRAFT_KEY, JSON.stringify(d)); } catch {} }

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

function PanelHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '1rem', paddingBottom: '0.7rem', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '0.15rem' }}>
        {subtitle}
      </div>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h3>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1.25rem',
      boxShadow: 'var(--shadow)',
      ...style,
    }}>
      {children}
    </div>
  );
}

const TABS = [
  { id: 'Context', label: 'Context', hint: 'Company & setup' },
  { id: 'Design',  label: 'Design',  hint: 'How it was run' },
  { id: 'Metrics', label: 'Metrics', hint: 'The readout' },
  { id: 'Flags',   label: 'Flags',   hint: 'Warning signs' },
];

export function ScenarioRunner({ caseId, onBack, onNext, hasNext, onGoToDesign, onNavigate, user, onShowAuth }) {
  const scenario = scenarios.find(s => s.id === caseId);
  const pairedDesignId = scenario ? (designScenarios.find(d => d.pairedReviewScenarioId === caseId)?.id || null) : null;
  const _draft = loadScenarioDraft(scenario.id);
  const [leftTab, setLeftTab] = useState('Context');
  const [selectedDecision, setSelectedDecision] = useState(_draft?.selectedDecision || null);
  const [checkedFlags, setCheckedFlags] = useState(_draft?.checkedFlags || []);
  const [submitted, setSubmitted] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState('');
  const [note, setNote] = useState(() => getNotes('review', scenario.id));
  useEffect(() => { setNote(getNotes('review', scenario.id)); }, [scenario.id]);

  useEffect(() => {
    if (!submitted) saveScenarioDraft(scenario.id, { selectedDecision, checkedFlags });
  }, [selectedDecision, checkedFlags]); // eslint-disable-line

  function handleFlagToggle(flagId) {
    setCheckedFlags(prev =>
      prev.includes(flagId) ? prev.filter(f => f !== flagId) : [...prev, flagId]
    );
  }

  function handleSubmit() {
    if (!selectedDecision) return;
    clearScenarioDraft(scenario.id);
    const decision = scenario.decisions.find(d => d.id === selectedDecision);
    const isCorrect = getScoreRank(decision.score) >= 3;
    setAnswerFeedback(isCorrect ? 'pal-success-ring' : 'pal-shake');
    setTimeout(() => setAnswerFeedback(''), isCorrect ? 700 : 420);
    saveAttempt(scenario.id, selectedDecision, decision.score);
    track('case_completed', { room: 'review', id: scenario.id, rating: decision.score });
    setSubmitted(true);
    setShowDebrief(true);
    setTimeout(() => {
      document.getElementById('score-reveal')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function handleReplay() {
    clearScenarioDraft(scenario.id);
    setSelectedDecision(null);
    setCheckedFlags([]);
    setSubmitted(false);
    setShowDebrief(false);
    setLeftTab('Context');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const selectedDecisionObj = scenario.decisions.find(d => d.id === selectedDecision);
  const difficultyLabel = { analyst: 'Analyst', senior: 'Senior', staff: 'Staff' }[scenario.difficulty] || scenario.difficulty;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>

      {/* ── Back + title bar ──────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.875rem', flexWrap: 'wrap' }}>
        {/* Nav bar — renders into the app top bar when its context slot exists
            (PAL top bar, 2026-07-23), else inline as before. */}
        {(function () {
          var slot = typeof document !== 'undefined' ? document.getElementById('pal-topbar-ctx') : null;
          var row = (
            <button
              onClick={onBack}
              style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                padding: '0.3rem 0.65rem', color: 'var(--text-muted)', fontSize: '0.78rem',
                cursor: 'pointer', flexShrink: 0, marginTop: '3px',
              }}
            >
              ← Scenarios
            </button>
          );
          return slot ? createPortal(row, slot) : row;
        })()}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {scenario.title}
            </h1>
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              color: scenario.isFree ? 'var(--accent)' : 'var(--teal)',
              background: scenario.isFree ? 'var(--accent-bg)' : 'var(--teal-bg)',
              border: `1px solid ${scenario.isFree ? 'var(--accent-border)' : 'var(--teal-border)'}`,
              borderRadius: 'var(--radius-sm)', padding: '0.12rem 0.45rem',
            }}>{scenario.isFree ? 'Free' : 'Private Beta'}</span>
            <span style={{
              fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-dim)',
              background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)', padding: '0.12rem 0.45rem',
            }}>{difficultyLabel}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', margin: 0 }}>{scenario.subtitle}</p>
        </div>
        <ShareLinkButton room="review" />
      </div>

      {/* ── Workflow hint (pre-submit) ────────────────────────────────── */}
      {!submitted && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0', marginBottom: '1.25rem',
          background: 'var(--surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius)', padding: '0.5rem 0.875rem',
          fontSize: '0.72rem', color: 'var(--text-dim)', overflowX: 'auto',
        }}>
          {['Context', 'Design', 'Metrics', 'Flags', 'Decision'].map((step, i) => (
            <span key={step} style={{ display: 'flex', alignItems: 'center', gap: '0', flexShrink: 0 }}>
              <span style={{
                color: leftTab === step ? 'var(--accent)' : (i === 4 ? 'var(--text-dim)' : 'var(--text-muted)'),
                fontWeight: leftTab === step ? 700 : 400,
                padding: '0 0.1rem',
                cursor: i < 4 ? 'pointer' : 'default',
              }}
                onClick={() => { if (i < 4) setLeftTab(step); }}
              >{step}</span>
              {i < 4 && <span style={{ margin: '0 0.3rem', color: 'var(--border-strong)' }}>→</span>}
            </span>
          ))}
        </div>
      )}

      {/* ── Main 2-col layout ─────────────────────────────────────────── */}
      <div className="pal-scenario-grid">

        {/* LEFT: Tabbed info */}
        <div>
          {/* Tab nav */}
          <div style={{
            display: 'flex', gap: '2px', marginBottom: '0.875rem',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '3px',
          }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id)}
                title={tab.hint}
                style={{
                  flex: 1,
                  background: leftTab === tab.id ? 'var(--surface)' : 'transparent',
                  border: leftTab === tab.id ? '1px solid var(--border)' : '1px solid transparent',
                  borderRadius: 'calc(var(--radius) - 2px)',
                  padding: '0.38rem 0.4rem',
                  color: leftTab === tab.id ? 'var(--text)' : 'var(--text-muted)',
                  fontWeight: leftTab === tab.id ? 600 : 400,
                  fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.12s',
                  boxShadow: leftTab === tab.id ? 'var(--shadow-sm)' : 'none',
                  position: 'relative',
                }}
              >
                {tab.label}
                {tab.id === 'Flags' && scenario.warningFlags?.length > 0 && (
                  <span style={{
                    marginLeft: '0.25rem',
                    background: 'var(--red-bg)', color: 'var(--red)',
                    border: '1px solid var(--red-border)',
                    borderRadius: '10px', padding: '0 4px',
                    fontSize: '0.68rem', fontWeight: 800, verticalAlign: 'middle',
                  }}>{scenario.warningFlags.length}</span>
                )}
              </button>
            ))}
          </div>

          <Card>
            {leftTab === 'Context' && (
              <>
                <PanelHeader title="Scenario Context" subtitle="The Setup" />
                <ContextPanel scenario={scenario} />
              </>
            )}
            {leftTab === 'Design' && (
              <>
                <PanelHeader title="Experiment Design" subtitle="How It Was Run" />
                <ExperimentDesign design={scenario.experimentDesign} />
              </>
            )}
            {leftTab === 'Metrics' && (
              <>
                <PanelHeader title="Metric Readout" subtitle="The Data" />
                <MetricTable metrics={scenario.metricReadout} />
              </>
            )}
            {leftTab === 'Flags' && (
              <>
                {!submitted
                  ? (
                    <>
                      <PanelHeader title="Warning Flags" subtitle="Self-Check" />
                      <FlagChecklist flags={scenario.warningFlags} checked={checkedFlags} onToggle={handleFlagToggle} />
                    </>
                  ) : (
                    <>
                      <PanelHeader title="Warning Flags" subtitle="All Flags" />
                      <WarningFlags flags={scenario.warningFlags} />
                    </>
                  )
                }
              </>
            )}
          </Card>

          {/* Quick tab links */}
          {!submitted && (
            <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {TABS.filter(t => t.id !== leftTab).map(tab => (
                <button key={tab.id} onClick={() => setLeftTab(tab.id)} style={{
                  background: 'none', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)', padding: '0.22rem 0.55rem',
                  color: 'var(--text-dim)', fontSize: '0.72rem', cursor: 'pointer',
                }}>
                  {tab.label} →
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Decision panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <Card>
            <PanelHeader title="Make Your Call" subtitle="Your Decision" />
            <p style={{ marginBottom: '0.875rem', fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.55 }}>
              Review the context, design, metrics, and flags. Select the recommendation
              you would make to this team.
            </p>
            <DecisionPanel
              decisions={scenario.decisions}
              selected={selectedDecision}
              onSelect={setSelectedDecision}
              submitted={submitted}
              answerFeedback={answerFeedback}
            />
            {!submitted && (
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedDecision}
                  style={{
                    width: '100%',
                    background: selectedDecision ? 'var(--accent)' : 'var(--surface-2)',
                    color: selectedDecision ? '#fff' : 'var(--text-dim)',
                    border: `1px solid ${selectedDecision ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', padding: '0.65rem 1rem',
                    fontWeight: 700, fontSize: '0.9rem',
                    cursor: selectedDecision ? 'pointer' : 'not-allowed',
                    transition: 'all 0.13s',
                    boxShadow: selectedDecision ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  Submit Decision →
                </button>
                {!selectedDecision && (
                  <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                    Select a decision above
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Post-submit actions */}
          {submitted && selectedDecisionObj && (
            <div id="score-reveal" className="pal-reveal-in">
              <ScoreReveal scoreKey={selectedDecisionObj.score} decisionLabel={selectedDecisionObj.label} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.65rem' }}>
                <button
                  onClick={() => document.getElementById('debrief-panel')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '0.5rem',
                    color: 'var(--text)', fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer',
                  }}
                >
                  Read Senior Analyst Debrief ↓
                </button>
                <button onClick={handleReplay} style={{
                  background: 'transparent', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius)', padding: '0.5rem',
                  color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.83rem', cursor: 'pointer',
                }}>
                  Try a Different Decision
                </button>
                {hasNext && (
                  <button onClick={onNext} className="pal-glow-pulse" style={{
                    background: 'var(--accent)', border: '1px solid var(--accent)',
                    borderRadius: 'var(--radius)', padding: '0.5rem',
                    color: '#fff', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    Next Scenario →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Debrief — full width ──────────────────────────────────────── */}
      {showDebrief && selectedDecision && (
        <div id="debrief-panel" className="pal-reveal-in" style={{ marginTop: '2.5rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            borderBottom: '2px solid var(--border)', paddingBottom: '0.875rem', marginBottom: '1.5rem',
          }}>
            <div style={{
              width: '3px', height: '22px',
              background: 'linear-gradient(180deg, var(--accent) 0%, var(--purple) 100%)',
              borderRadius: '2px', flexShrink: 0,
            }} />
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                Senior Analyst Read
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '0.1rem 0 0' }}>
                How a senior analyst would interpret this experiment. Read carefully — this is the learning.
              </p>
            </div>
          </div>
          <DebriefPanel scenario={scenario} selectedDecisionId={selectedDecision} />

          {/* Notes */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                My Notes
              </div>
              <DebriefCopyButton
                title={scenario.title}
                notes={note}
                modelAnswer={scenario.debrief || ''}
                tags={scenario.tags || []}
                difficulty={scenario.difficulty}
                room={'Review Room'}
              />
            </div>
            <textarea
              value={note}
              onChange={e => { setNote(e.target.value); saveNote('review', scenario.id, e.target.value); }}
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

          {/* Paired Design Room CTA */}
          {pairedDesignId && onGoToDesign && (
            <div style={{
              marginTop: '2rem',
              background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
              borderRadius: 'var(--radius)', padding: '1rem 1.1rem',
            }}>
              <div style={{
                fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--teal)', marginBottom: '0.4rem',
              }}>
                Paired Design Room scenario
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 0.75rem' }}>
                You read the result. Want to go back and design this experiment from scratch?
              </p>
              <button
                onClick={() => onGoToDesign(pairedDesignId)}
                style={{
                  padding: '0.5rem 0.95rem',
                  background: 'var(--teal)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'opacity 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Go to Design Room →
              </button>
            </div>
          )}
          <ForwardPointerCard room='review' onNavigate={onNavigate} onNext={onNext} />
        </div>
      )}

      {/* Guest demo gate — after debrief, prompt sign-in */}
      {showDebrief && !user && onShowAuth && (
        <GateOverlay
          title="Sign in to save this and keep practicing"
          body="You just completed a free demo case. Sign in to save your progress, unlock more cases, and track your improvement."
          ctaLabel="Sign in"
          onCTA={onShowAuth}
          secondaryLabel="Back to rooms"
          onSecondary={onBack}
        />
      )}
    </div>
  );
}
