import { useState } from 'react';
import { COMPANIES } from '../../data/companyList.js';

// ─── ReadinessWidget ─────────────────────────────────────────────────────────
// PAL is a cram-tool-to-a-date, not a forever-streak app (PD-L3). This widget
// surfaces a single headline "are you ready for your interview" metric: an
// estimated readiness % toward an optional target interview date + company, so
// prep feels goal-directed rather than open-ended.
//
// READINESS FORMULA (heuristic — labelled "estimated readiness" in the UI):
//   readiness = mean over KEY_ROOMS of  min(roomSolved / roomTarget, 1)  × 100
// Each room's contribution is capped at 1 (100%) so over-grinding one room can't
// mask gaps elsewhere. KEY_ROOMS is the set of core judgment + foundation rooms
// that show up most in product-analytics / PM interviews. A flat per-room cap of
// 8 solved is used as the "enough to be interview-credible in this room" target —
// rooms with fewer total cases than the cap use their own length as the target.
//
// localStorage keys:
//   pal-target-date-v1     — ISO date string (yyyy-mm-dd) of target interview
//   pal-target-company-v1  — company name (from COMPANIES) or 'Other / Not listed'

const TARGET_DATE_KEY = 'pal-target-date-v1';
const TARGET_COMPANY_KEY = 'pal-target-company-v1';

// "Enough to be credible in this room" — capped contribution target per room.
const ROOM_CAP = 8;

// Core judgment + foundation rooms that feed the readiness score. Each entry maps
// a Progress-page room label to the nav id used by onNavigate for the deep-link.
// Labels MUST match the `label` fields in Progress.jsx allRoomProgress.
const KEY_ROOMS = [
  { label: 'Metrics', nav: 'metrics' },
  { label: 'RCA', nav: 'rca' },
  { label: 'Cases', nav: 'cases' },
  { label: 'Stats', nav: 'stats' },
  { label: 'SQL Lab', nav: 'sql-lab' },
  { label: 'Growth Analytics', nav: 'growth-analytics' },
  { label: 'BI', nav: 'bi' },
  { label: 'Spot the Flaw', nav: 'spot-the-flaw' },
  { label: 'Instrumentation', nav: 'instrumentation' },
  { label: 'Behavioral', nav: 'behavioral' },
  { label: 'Estimation', nav: 'estimation' },
  { label: 'Metrics Foundations', nav: 'metrics-foundations' },
  { label: 'RCA Foundations', nav: 'rca-foundations' },
  { label: 'Exp Foundations', nav: 'exp-foundations' },
  { label: 'Stat Foundations', nav: 'stat-foundations' },
];

// Compute readiness from the same per-room {label, completed, total} data the
// Progress page already builds. Returns { score, weakest } where weakest is the
// KEY_ROOM with the lowest coverage (and >0 remaining), for the deep-link.
export function computeReadiness(allRoomProgress) {
  const byLabel = {};
  (allRoomProgress || []).forEach(r => { byLabel[r.label] = r; });

  let sum = 0;
  let counted = 0;
  let weakest = null;
  let weakestCov = Infinity;

  KEY_ROOMS.forEach(({ label, nav }) => {
    const room = byLabel[label];
    if (!room) return;
    const target = Math.min(ROOM_CAP, room.total || ROOM_CAP);
    if (target <= 0) return;
    const cov = Math.min((room.completed || 0) / target, 1);
    sum += cov;
    counted += 1;
    // Weakest = lowest coverage that still has headroom to improve.
    if (cov < 1 && cov < weakestCov) {
      weakestCov = cov;
      weakest = { label, nav };
    }
  });

  const score = counted > 0 ? Math.round((sum / counted) * 100) : 0;
  // If everything is maxed, fall back to first key room so the CTA still works.
  if (!weakest) weakest = KEY_ROOMS[0];
  return { score, weakest };
}

function bandFor(score) {
  if (score >= 90) return { label: 'Sharp', color: 'var(--green)' };
  if (score >= 70) return { label: 'Interview-ready soon', color: 'var(--teal)' };
  if (score >= 40) return { label: 'Building', color: 'var(--yellow)' };
  return { label: 'Just starting', color: 'var(--text-muted)' };
}

function daysUntil(isoDate) {
  if (!isoDate) return null;
  const target = new Date(isoDate + 'T00:00:00');
  if (isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function ReadinessWidget({ allProgress, onNavigate }) {
  // allProgress here is the per-room array (allRoomProgress) from Progress.jsx.
  const { score, weakest } = computeReadiness(allProgress);
  const band = bandFor(score);

  const [targetDate, setTargetDate] = useState(() => {
    try { return localStorage.getItem(TARGET_DATE_KEY) || ''; } catch { return ''; }
  });
  const [targetCompany, setTargetCompany] = useState(() => {
    try { return localStorage.getItem(TARGET_COMPANY_KEY) || ''; } catch { return ''; }
  });
  const [editing, setEditing] = useState(false);

  function saveTargetDate(v) {
    setTargetDate(v);
    try { if (v) localStorage.setItem(TARGET_DATE_KEY, v); else localStorage.removeItem(TARGET_DATE_KEY); } catch {}
  }
  function saveTargetCompany(v) {
    setTargetCompany(v);
    try { if (v) localStorage.setItem(TARGET_COMPANY_KEY, v); else localStorage.removeItem(TARGET_COMPANY_KEY); } catch {}
  }

  const days = daysUntil(targetDate);
  const companyLabel = targetCompany && targetCompany !== 'Other / Not listed' ? targetCompany : null;

  // Ring geometry
  const R = 46;
  const C = 2 * Math.PI * R;
  const dash = (score / 100) * C;

  // Countdown text
  let countdownText;
  if (days == null) {
    countdownText = 'Set a target date';
  } else if (days < 0) {
    countdownText = companyLabel ? 'Interview date passed · ' + companyLabel : 'Interview date passed';
  } else if (days === 0) {
    countdownText = companyLabel ? 'Today · ' + companyLabel : 'Interview is today';
  } else {
    countdownText = days + ' day' + (days === 1 ? '' : 's') + (companyLabel ? ' to ' + companyLabel : ' to go');
  }

  return (
    <div className="pal-card-enter" style={{
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      borderRadius: '14px',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        {/* Readiness ring */}
        <div style={{ position: 'relative', width: 116, height: 116, flexShrink: 0 }}>
          <svg width="116" height="116" viewBox="0 0 116 116" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="58" cy="58" r={R} fill="none" stroke="var(--border)" strokeWidth="9" />
            <circle
              cx="58" cy="58" r={R} fill="none"
              stroke={band.color} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={`${dash} ${C}`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em' }}>{score}%</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginTop: 2 }}>ready</span>
          </div>
        </div>

        {/* Center: band + countdown */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
            Estimated readiness
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: band.color, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.45rem' }}>
            {band.label}
          </div>
          <button
            onClick={() => setEditing(e => !e)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: days != null ? 'var(--surface-2)' : 'var(--accent-bg)',
              border: '1px solid ' + (days != null ? 'var(--border)' : 'var(--accent-border)'),
              borderRadius: '20px', padding: '0.3rem 0.75rem',
              fontSize: '0.78rem', fontWeight: 700,
              color: days != null ? 'var(--text-secondary)' : 'var(--accent)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <span>{countdownText}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{editing ? 'Close' : 'Edit'}</span>
          </button>
        </div>

        {/* Right: next weakest-room CTA */}
        {weakest && (
          <button
            onClick={() => onNavigate && onNavigate(weakest.nav)}
            className="pal-card-hover"
            style={{
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: '10px',
              padding: '0.65rem 1.1rem', fontSize: '0.85rem',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            Next: practice {weakest.label} →
          </button>
        )}
      </div>

      {/* Target date / company editor (collapsible) */}
      {editing && (
        <div className="pal-reveal-in" style={{
          marginTop: '1.1rem', paddingTop: '1.1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
          gap: '0.9rem', alignItems: 'flex-end',
        }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Target interview date</span>
            <input
              type="date"
              value={targetDate}
              onChange={e => saveTargetDate(e.target.value)}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '0.45rem 0.6rem',
                fontSize: '0.85rem', color: 'var(--text)', fontFamily: 'inherit',
              }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Target company (optional)</span>
            <select
              value={targetCompany}
              onChange={e => saveTargetCompany(e.target.value)}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '0.45rem 0.6rem',
                fontSize: '0.85rem', color: 'var(--text)', fontFamily: 'inherit',
              }}
            >
              <option value="">No company set</option>
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          {targetDate && (
            <button
              onClick={() => { saveTargetDate(''); saveTargetCompany(''); }}
              style={{
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '0.45rem 0.75rem',
                fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'inherit', justifySelf: 'flex-start',
              }}
            >
              Clear target
            </button>
          )}
        </div>
      )}

      {/* Gentle CTA when no date set and not editing */}
      {days == null && !editing && (
        <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
          Set a target interview date to turn your prep into a countdown — PAL works best as a cram-to-a-date plan, not an endless streak.
        </div>
      )}
    </div>
  );
}
