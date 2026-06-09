import { useState, useEffect, useCallback, useRef } from 'react';
import { fullLoopCasesById } from '../../data/fullLoopCases.js';
import { fullLoopSeedData } from '../../data/fullLoopSeedData.js';
import { saveFullLoopProgress, getFullLoopProgress, clearFullLoopProgress } from '../../utils/fullLoopProgress.js';
import { track } from '../../utils/analytics.js';

// ─── SVG Phase Icons ───────────────────────────────────────────────────────
function IconAlert(props) {
  var size = props.size || 20;
  var color = props.color || '#f59e0b';
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M10 2L18.66 17H1.34L10 2Z' fill={color} fillOpacity='0.15' stroke={color} strokeWidth='1.5' strokeLinejoin='round'/>
      <line x1='10' y1='8' x2='10' y2='12' stroke={color} strokeWidth='1.8' strokeLinecap='round'/>
      <circle cx='10' cy='14.5' r='1' fill={color}/>
    </svg>
  );
}

function IconData(props) {
  var size = props.size || 20;
  var color = props.color || 'var(--teal)';
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect x='3' y='11' width='3.5' height='6' rx='1' fill={color} fillOpacity='0.7'/>
      <rect x='8.25' y='7' width='3.5' height='10' rx='1' fill={color} fillOpacity='0.85'/>
      <rect x='13.5' y='3' width='3.5' height='14' rx='1' fill={color}/>
    </svg>
  );
}

function IconRCA(props) {
  var size = props.size || 20;
  var color = props.color || 'var(--accent)';
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='8.5' cy='8.5' r='5' stroke={color} strokeWidth='1.5' fill='none'/>
      <line x1='12.5' y1='12.5' x2='17' y2='17' stroke={color} strokeWidth='2' strokeLinecap='round'/>
      <circle cx='8.5' cy='8.5' r='1.5' fill={color} fillOpacity='0.4'/>
      <line x1='8.5' y1='5.5' x2='8.5' y2='11.5' stroke={color} strokeWidth='0.8' strokeOpacity='0.5'/>
      <line x1='5.5' y1='8.5' x2='11.5' y2='8.5' stroke={color} strokeWidth='0.8' strokeOpacity='0.5'/>
    </svg>
  );
}

function IconSQL(props) {
  var size = props.size || 20;
  var color = props.color || 'var(--accent)';
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect x='2' y='3' width='16' height='14' rx='3' stroke={color} strokeWidth='1.5' fill='none'/>
      <path d='M6 10L8.5 12.5L6 15' stroke={color} strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/>
      <line x1='10.5' y1='15' x2='14' y2='15' stroke={color} strokeWidth='1.8' strokeLinecap='round'/>
    </svg>
  );
}

function IconCommunicate(props) {
  var size = props.size || 20;
  var color = props.color || 'var(--purple)';
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect x='3' y='2' width='11' height='14' rx='2' stroke={color} strokeWidth='1.3' fill='none'/>
      <line x1='6' y1='6' x2='11' y2='6' stroke={color} strokeWidth='1.2' strokeLinecap='round' strokeOpacity='0.5'/>
      <line x1='6' y1='9' x2='11' y2='9' stroke={color} strokeWidth='1.2' strokeLinecap='round' strokeOpacity='0.5'/>
      <line x1='6' y1='12' x2='9' y2='12' stroke={color} strokeWidth='1.2' strokeLinecap='round' strokeOpacity='0.5'/>
      <path d='M13 14L17 5L14.5 13.5L13 14Z' fill={color} fillOpacity='0.8'/>
      <line x1='17' y1='5' x2='15' y2='11' stroke={color} strokeWidth='1.3' strokeLinecap='round'/>
    </svg>
  );
}

function IconTree(props) {
  var size = props.size || 20;
  var color = props.color || 'var(--teal)';
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='10' cy='3.5' r='2' stroke={color} strokeWidth='1.3' fill={color} fillOpacity='0.15'/>
      <line x1='10' y1='5.5' x2='10' y2='8' stroke={color} strokeWidth='1.2'/>
      <line x1='5' y1='8' x2='15' y2='8' stroke={color} strokeWidth='1.2'/>
      <line x1='5' y1='8' x2='5' y2='10.5' stroke={color} strokeWidth='1.2'/>
      <line x1='10' y1='8' x2='10' y2='10.5' stroke={color} strokeWidth='1.2'/>
      <line x1='15' y1='8' x2='15' y2='10.5' stroke={color} strokeWidth='1.2'/>
      <circle cx='5' cy='12' r='1.5' stroke={color} strokeWidth='1.2' fill={color} fillOpacity='0.15'/>
      <circle cx='10' cy='12' r='1.5' stroke={color} strokeWidth='1.2' fill={color} fillOpacity='0.15'/>
      <circle cx='15' cy='12' r='1.5' stroke={color} strokeWidth='1.2' fill={color} fillOpacity='0.15'/>
    </svg>
  );
}

function IconCheckmark(props) {
  var size = props.size || 20;
  var color = props.color || 'var(--green)';
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='10' cy='10' r='8' fill={color} fillOpacity='0.15' stroke={color} strokeWidth='1.5'/>
      <polyline points='6.5,10 9,12.5 13.5,7.5' stroke={color} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' fill='none'/>
    </svg>
  );
}

function IconTrophy(props) {
  var size = props.size || 48;
  var color = props.color || '#f59e0b';
  return (
    <svg width={size} height={size} viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M14 8H34V20C34 25.52 29.52 30 24 30C18.48 30 14 25.52 14 20V8Z' fill={color} fillOpacity='0.15' stroke={color} strokeWidth='2'/>
      <path d='M14 12H8C8 16.42 11.58 20 16 20' stroke={color} strokeWidth='2' strokeLinecap='round'/>
      <path d='M34 12H40C40 16.42 36.42 20 32 20' stroke={color} strokeWidth='2' strokeLinecap='round'/>
      <line x1='24' y1='30' x2='24' y2='36' stroke={color} strokeWidth='2'/>
      <rect x='17' y='36' width='14' height='4' rx='2' fill={color} fillOpacity='0.3' stroke={color} strokeWidth='1.5'/>
      <polyline points='20,17 23,20 28,14' stroke={color} strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' fill='none'/>
    </svg>
  );
}

function IconArrowRight(props) {
  var size = props.size || 16;
  var color = props.color || 'currentColor';
  return (
    <svg width={size} height={size} viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M3 8H12M12 8L8 4M12 8L8 12' stroke={color} strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/>
    </svg>
  );
}

function IconArrowLeft(props) {
  var size = props.size || 16;
  var color = props.color || 'currentColor';
  return (
    <svg width={size} height={size} viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M13 8H4M4 8L8 4M4 8L8 12' stroke={color} strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/>
    </svg>
  );
}

function IconArrowUp(props) {
  var size = props.size || 12;
  var color = props.color || 'var(--green)';
  return (
    <svg width={size} height={size} viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M6 10V3M6 3L3 6M6 3L9 6' stroke={color} strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
    </svg>
  );
}

function IconArrowDown(props) {
  var size = props.size || 12;
  var color = props.color || 'var(--red)';
  return (
    <svg width={size} height={size} viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M6 2V9M6 9L3 6M6 9L9 6' stroke={color} strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
    </svg>
  );
}

function IconLightbulb(props) {
  var size = props.size || 18;
  var color = props.color || 'var(--teal)';
  return (
    <svg width={size} height={size} viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M9 2C6.24 2 4 4.24 4 7C4 8.93 5.18 10.59 6.85 11.35C7.23 11.52 7.5 11.91 7.5 12.33V13.5H10.5V12.33C10.5 11.91 10.77 11.52 11.15 11.35C12.82 10.59 14 8.93 14 7C14 4.24 11.76 2 9 2Z' fill={color} fillOpacity='0.15' stroke={color} strokeWidth='1.2'/>
      <line x1='7.5' y1='15' x2='10.5' y2='15' stroke={color} strokeWidth='1.2' strokeLinecap='round'/>
      <line x1='8' y1='16.5' x2='10' y2='16.5' stroke={color} strokeWidth='1.2' strokeLinecap='round'/>
    </svg>
  );
}

function IconDatabase(props) {
  var size = props.size || 16;
  var color = props.color || 'var(--accent)';
  return (
    <svg width={size} height={size} viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <ellipse cx='8' cy='4' rx='5.5' ry='2.5' stroke={color} strokeWidth='1.2' fill='none'/>
      <path d='M2.5 4V8C2.5 9.38 4.96 10.5 8 10.5C11.04 10.5 13.5 9.38 13.5 8V4' stroke={color} strokeWidth='1.2'/>
      <path d='M2.5 8V12C2.5 13.38 4.96 14.5 8 14.5C11.04 14.5 13.5 13.38 13.5 12V8' stroke={color} strokeWidth='1.2'/>
    </svg>
  );
}

function IconCorrect(props) {
  var size = props.size || 18;
  return (
    <svg width={size} height={size} viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='9' cy='9' r='7' fill='var(--green)' fillOpacity='0.15' stroke='var(--green)' strokeWidth='1.5'/>
      <polyline points='5.5,9 8,11.5 12.5,6.5' stroke='var(--green)' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' fill='none'/>
    </svg>
  );
}

function IconWrong(props) {
  var size = props.size || 18;
  return (
    <svg width={size} height={size} viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='9' cy='9' r='7' fill='var(--red)' fillOpacity='0.15' stroke='var(--red)' strokeWidth='1.5'/>
      <line x1='6.5' y1='6.5' x2='11.5' y2='11.5' stroke='var(--red)' strokeWidth='2' strokeLinecap='round'/>
      <line x1='11.5' y1='6.5' x2='6.5' y2='11.5' stroke='var(--red)' strokeWidth='2' strokeLinecap='round'/>
    </svg>
  );
}

function IconPlay(props) {
  var size = props.size || 16;
  var color = props.color || '#fff';
  return (
    <svg width={size} height={size} viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M5 3L13 8L5 13V3Z' fill={color}/>
    </svg>
  );
}

var PHASE_ICON_MAP = {
  problem: IconAlert,
  decomposition: IconTree,
  schemaDesign: IconDatabase,
  queryChain: IconSQL,
  synthesis: IconCommunicate,
};

function PhaseIcon(props) {
  var type = props.type;
  var size = props.size || 20;
  var color = props.color;
  var Comp = PHASE_ICON_MAP[type];
  if (!Comp) return null;
  return <Comp size={size} color={color} />;
}

// ─── Key element / phrase matching ─────────────────────────────────────────
function matchKeyElements(userText, keyElements) {
  var results = [];
  for (var i = 0; i < keyElements.length; i++) {
    var escaped = keyElements[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var pattern = new RegExp(escaped, 'i');
    results.push({ element: keyElements[i], found: pattern.test(userText) });
  }
  return results;
}

function countMatched(results) {
  var count = 0;
  for (var i = 0; i < results.length; i++) {
    if (results[i].found) count += 1;
  }
  return count;
}

// ─── Match Report Pills ───────────────────────────────────────────────────
function MatchReport(props) {
  var results = props.results;
  var label = props.label || 'key elements';
  var matched = countMatched(results);

  return (
    <div className='pal-reveal-in' style={{
      marginTop: '16px', padding: '16px 18px', borderRadius: '10px',
      background: 'var(--surface)', border: '1px solid var(--border)',
    }}>
      <div style={{
        fontWeight: 600, fontSize: '14px', color: 'var(--text)',
        marginBottom: '12px',
      }}>
        Your response covers {matched}/{results.length} {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {results.map(function(r, i) {
          return (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', padding: '4px 10px', borderRadius: '20px',
              fontWeight: 500, lineHeight: '1.3',
              background: r.found ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.04)',
              color: r.found ? 'var(--green)' : 'var(--text-muted)',
              border: '1px solid ' + (r.found ? 'rgba(16,185,129,0.2)' : 'var(--border)'),
            }}>
              {r.found
                ? <IconCorrect size={12} />
                : <IconWrong size={12} />
              }
              {r.element}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Draft persistence ──────────────────────────────────────────────────────
var DRAFT_KEY = 'pal-fullloop-draft-v1';

function saveDraft(caseId, draft) {
  try {
    var store = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
    store[caseId] = draft;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(store));
  } catch (e) { /* silent */ }
}

function loadDraft(caseId) {
  try {
    var store = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
    return store[caseId] || null;
  } catch (e) { return null; }
}

function clearDraft(caseId) {
  try {
    var store = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
    delete store[caseId];
    localStorage.setItem(DRAFT_KEY, JSON.stringify(store));
  } catch (e) { /* silent */ }
}

// ─── Phase definitions ─────────────────────────────────────────────────────
var PHASES = ['problem', 'decomposition', 'schemaDesign', 'queryChain', 'synthesis'];

var PHASE_META = [
  { key: 'problem', title: 'Problem', color: '#f59e0b' },
  { key: 'decomposition', title: 'Decompose', color: 'var(--teal)' },
  { key: 'schemaDesign', title: 'Schema', color: 'var(--accent)' },
  { key: 'queryChain', title: 'SQL Chain', color: 'var(--accent)' },
  { key: 'synthesis', title: 'Synthesis', color: 'var(--purple)' },
];

// ─── Phase Bar ──────────────────────────────────────────────────────────────
function PhaseBar(props) {
  var currentIndex = props.currentIndex;
  var completedPhases = props.completedPhases;
  var onSelect = props.onSelect;

  return (
    <div className='pal-card-enter' style={{
      display: 'flex', alignItems: 'center', gap: '0',
      overflowX: 'auto', padding: '16px 0', marginBottom: '28px',
    }}>
      {PHASE_META.map(function(phase, i) {
        var isCompleted = !!completedPhases[i];
        var isCurrent = i === currentIndex;
        var isClickable = isCompleted && !isCurrent;
        var isFuture = !isCompleted && !isCurrent;

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: '1 1 0' }}>
            <button
              onClick={isClickable ? function() { onSelect(i); } : undefined}
              disabled={!isClickable && !isCurrent}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '6px', padding: '8px 4px',
                background: 'transparent', border: 'none',
                cursor: isClickable ? 'pointer' : 'default',
                opacity: 1, transition: 'all 0.2s ease', width: '100%',
                minWidth: '60px',
              }}
            >
              {/* Icon circle */}
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isCompleted
                  ? 'rgba(16,185,129,0.1)'
                  : (isCurrent ? 'var(--surface)' : 'transparent'),
                border: isFuture
                  ? '2px dashed var(--border)'
                  : (isCurrent
                    ? '2px solid var(--accent)'
                    : '2px solid var(--green)'),
                boxShadow: isCurrent
                  ? '0 0 0 4px rgba(59,130,246,0.15), 0 2px 8px rgba(59,130,246,0.1)'
                  : 'none',
                transition: 'all 0.2s ease',
                opacity: isFuture ? 0.45 : 1,
              }}>
                {isCompleted
                  ? <IconCheckmark size={18} />
                  : <PhaseIcon type={phase.key} size={18} />
                }
              </div>
              <span style={{
                fontSize: '11px', fontWeight: isCurrent ? 600 : 400,
                color: isCurrent ? 'var(--accent)' : (isCompleted ? 'var(--green)' : 'var(--text-muted)'),
                textAlign: 'center', lineHeight: '1.2',
                opacity: isFuture ? 0.5 : 1,
              }}>
                {phase.title}
              </span>
            </button>
            {/* Connector line */}
            {i < PHASE_META.length - 1 && (
              <div style={{
                flex: '0 0 auto', width: '20px', height: '2px',
                background: isCompleted ? 'var(--green)' : 'transparent',
                borderTop: isCompleted ? 'none' : '2px dashed var(--border)',
                marginTop: '-20px',
                transition: 'all 0.2s ease',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Data Table renderer ────────────────────────────────────────────────────
function DataTable(props) {
  var headers = props.headers;
  var rows = props.rows;
  var maxHeight = props.maxHeight || null;

  return (
    <div style={{
      overflowX: 'auto', marginBottom: '16px',
      borderRadius: '10px', border: '1px solid var(--border)',
      overflow: maxHeight ? 'auto' : 'hidden',
      maxHeight: maxHeight || 'none',
    }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        fontSize: '14px', background: 'var(--surface)',
      }}>
        <thead>
          <tr>
            {headers.map(function(h, i) {
              return (
                <th key={i} style={{
                  padding: '12px 14px', textAlign: 'left',
                  background: 'var(--accent)', color: '#fff',
                  fontWeight: 600, fontSize: '13px',
                  whiteSpace: 'nowrap',
                  borderBottom: '2px solid rgba(0,0,0,0.1)',
                  position: maxHeight ? 'sticky' : 'static',
                  top: 0, zIndex: 1,
                }}>{h}</th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map(function(row, ri) {
            return (
              <tr key={ri} style={{
                background: ri % 2 === 0 ? 'var(--surface)' : 'rgba(0,0,0,0.015)',
                transition: 'background 0.15s ease',
              }}>
                {row.map(function(cell, ci) {
                  return (
                    <td key={ci} style={{
                      padding: '10px 14px',
                      borderBottom: ri < rows.length - 1 ? '1px solid var(--border)' : 'none',
                      whiteSpace: 'nowrap', fontSize: '13px',
                    }}>{cell}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Option Buttons (for MCQ) ──────────────────────────────────────────────
function OptionButtons(props) {
  var options = props.options;
  var selected = props.selected;
  var onSelect = props.onSelect;
  var disabled = props.disabled;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
      {options.map(function(opt) {
        var isSelected = selected === opt.id;
        var isCorrect = isSelected && opt.correct;
        var isWrong = isSelected && !opt.correct;
        var isUnselected = disabled && !isSelected;

        var borderLeftColor = 'transparent';
        var bgColor = 'var(--surface)';
        var borderColor = 'var(--border)';

        if (isCorrect) {
          borderLeftColor = 'var(--green)';
          bgColor = 'rgba(16,185,129,0.06)';
          borderColor = 'var(--green)';
        } else if (isWrong) {
          borderLeftColor = 'var(--red)';
          bgColor = 'rgba(239,68,68,0.06)';
          borderColor = 'var(--red)';
        }

        return (
          <button
            key={opt.id}
            onClick={disabled ? undefined : function() { onSelect(opt.id); }}
            disabled={disabled}
            className={isWrong ? 'pal-shake' : (isCorrect ? 'pal-success-ring' : '')}
            style={{
              padding: '14px 18px', borderRadius: '10px', textAlign: 'left',
              fontSize: '14px', lineHeight: '1.5',
              cursor: disabled ? 'default' : 'pointer',
              border: '1px solid ' + borderColor,
              borderLeft: '3px solid ' + borderLeftColor,
              background: bgColor,
              color: 'var(--text)', transition: 'all 0.2s ease',
              opacity: isUnselected ? 0.4 : 1,
              transform: 'translateY(0)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '12px',
            }}
            onMouseEnter={!disabled ? function(e) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              if (!isCorrect && !isWrong) {
                e.currentTarget.style.borderLeft = '3px solid var(--accent)';
              }
            } : undefined}
            onMouseLeave={!disabled ? function(e) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              if (!isCorrect && !isWrong) {
                e.currentTarget.style.borderLeft = '3px solid transparent';
              }
            } : undefined}
          >
            <span>{opt.text}</span>
            {isCorrect && <IconCorrect size={18} />}
            {isWrong && <IconWrong size={18} />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Continue Button ────────────────────────────────────────────────────────
function ContinueButton(props) {
  var label = props.label || 'Continue';
  var onClick = props.onClick;

  return (
    <button
      className='pal-glow-pulse'
      onClick={onClick}
      style={{
        marginTop: '24px', padding: '14px 32px', borderRadius: '10px',
        background: 'var(--accent)', color: '#fff', fontWeight: 600,
        fontSize: '15px', border: 'none', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        boxShadow: '0 2px 8px rgba(59,130,246,0.2)',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
      <IconArrowRight size={16} color='#fff' />
    </button>
  );
}

// ─── Feedback Block ─────────────────────────────────────────────────────────
function FeedbackBlock(props) {
  var text = props.text;

  return (
    <div className='pal-reveal-in' style={{
      marginTop: '16px', padding: '18px 20px', borderRadius: '10px',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderLeft: '3px solid var(--teal)',
      fontSize: '14.5px', lineHeight: '1.7', color: 'var(--text)',
      display: 'flex', gap: '12px', alignItems: 'flex-start',
    }}>
      <span style={{ flexShrink: 0, marginTop: '1px' }}>
        <IconLightbulb size={18} color='var(--teal)' />
      </span>
      <span>{text}</span>
    </div>
  );
}

// ─── Teal callout ───────────────────────────────────────────────────────────
function TealCallout(props) {
  return (
    <div style={{
      padding: '16px 18px', borderRadius: '12px',
      background: 'rgba(20,184,166,0.06)', border: '1px solid var(--teal)',
      fontSize: '14px', lineHeight: '1.6', color: 'var(--text)',
      marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start',
    }}>
      <span style={{ flexShrink: 0, marginTop: '1px' }}>
        <IconLightbulb size={16} color='var(--teal)' />
      </span>
      <span>{props.children}</span>
    </div>
  );
}

// ─── Collapsible hint ───────────────────────────────────────────────────────
function CollapsibleHint(props) {
  var hint = props.hint;
  var index = props.index;
  var _open = useState(false);
  var open = _open[0];
  var setOpen = _open[1];

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: '8px',
      marginBottom: '6px', overflow: 'hidden',
    }}>
      <button
        onClick={function() { setOpen(!open); }}
        style={{
          width: '100%', padding: '10px 14px', background: 'var(--surface)',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        <span style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          {'▶'}
        </span>
        Hint {index + 1}
      </button>
      {open && (
        <div style={{
          padding: '10px 14px', fontSize: '13px', lineHeight: '1.5',
          color: 'var(--text)', borderTop: '1px solid var(--border)',
        }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ─── Code Block ─────────────────────────────────────────────────────────────
function CodeBlock(props) {
  var code = props.code;

  return (
    <div style={{ position: 'relative', marginBottom: '4px' }}>
      <div style={{
        position: 'absolute', top: '0', right: '0',
        padding: '4px 10px', fontSize: '10px', fontWeight: 600,
        color: 'rgba(205,214,244,0.5)', textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        SQL
      </div>
      <pre style={{
        background: '#1e1e2e', color: '#cdd6f4', padding: '20px 16px 16px',
        borderRadius: '10px', fontSize: '13px', lineHeight: '1.6',
        overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        borderTop: '3px solid var(--accent)',
        margin: 0,
      }}>
        {code}
      </pre>
    </div>
  );
}

// ─── Formatted Code Block (line-numbered) ──────────────────────────────────
function FormattedCodeBlock(props) {
  var lines = props.lines;

  return (
    <div style={{ position: 'relative', marginBottom: '4px' }}>
      <div style={{
        position: 'absolute', top: '0', right: '0',
        padding: '4px 10px', fontSize: '10px', fontWeight: 600,
        color: 'rgba(205,214,244,0.5)', textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        SQL
      </div>
      <div style={{
        background: '#1e1e2e', padding: '20px 16px 16px',
        borderRadius: '10px', borderTop: '3px solid var(--accent)',
        overflowX: 'auto',
      }}>
        {lines.map(function(line, i) {
          return (
            <div key={i} style={{
              display: 'flex', gap: '16px', fontSize: '13px',
              lineHeight: '1.7', fontFamily: 'monospace',
            }}>
              <span style={{
                color: 'rgba(205,214,244,0.3)', userSelect: 'none',
                minWidth: '24px', textAlign: 'right', flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <span style={{ color: '#cdd6f4', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Metric Card ────────────────────────────────────────────────────────────
function MetricCard(props) {
  var metric = props.metric;
  var isNegative = metric.direction === 'down';

  return (
    <div className='pal-card-enter' style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderTop: '3px solid ' + (isNegative ? 'var(--red)' : 'var(--green)'),
      borderRadius: '12px', padding: '28px 24px', textAlign: 'center',
      marginBottom: '24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px',
        fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        {metric.name}
      </div>
      <div style={{
        fontSize: '42px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px',
        lineHeight: '1.1',
      }}>
        {metric.current}
      </div>
      <div style={{
        fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px',
      }}>
        Previous: {metric.previous} ({metric.period})
      </div>
      <div style={{
        fontSize: '15px', fontWeight: 600,
        color: isNegative ? 'var(--red)' : 'var(--green)',
        display: 'inline-flex', alignItems: 'center', gap: '4px',
      }}>
        {isNegative
          ? <IconArrowDown size={14} color='var(--red)' />
          : <IconArrowUp size={14} color='var(--green)' />
        }
        {metric.change}
      </div>
    </div>
  );
}

// ─── Textarea style (shared) ────────────────────────────────────────────────
var TEXTAREA_STYLE = {
  width: '100%',
  minHeight: '120px',
  padding: '12px',
  borderRadius: 'var(--radius-sm, 8px)',
  border: '1.5px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  resize: 'vertical',
  boxSizing: 'border-box',
  lineHeight: '1.6',
  transition: 'border-color 0.2s ease',
};

var SQL_TEXTAREA_STYLE = {
  width: '100%',
  minHeight: '120px',
  padding: '12px',
  borderRadius: 'var(--radius-sm, 8px)',
  border: '1.5px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  fontFamily: 'monospace',
  fontSize: '13px',
  resize: 'vertical',
  boxSizing: 'border-box',
  lineHeight: '1.6',
  transition: 'border-color 0.2s ease',
};

// ─── Problem Phase ──────────────────────────────────────────────────────────
function ProblemPhase(props) {
  var phase = props.phase;
  var onComplete = props.onComplete;

  var _selected = useState(null);
  var selectedId = _selected[0];
  var setSelectedId = _selected[1];

  var _revealed = useState(false);
  var revealed = _revealed[0];
  var setRevealed = _revealed[1];

  var selectedOpt = selectedId ? phase.options.find(function(o) { return o.id === selectedId; }) : null;
  var isCorrect = selectedOpt ? selectedOpt.correct : false;

  function handleSelect(id) {
    if (selectedId) return;
    setSelectedId(id);
    var opt = phase.options.find(function(o) { return o.id === id; });
    if (opt) {
      setRevealed(true);
    }
  }

  function handleContinue() {
    onComplete(isCorrect ? 1 : 0);
  }

  return (
    <div className='pal-reveal-in'>
      <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--text)', marginBottom: '20px' }}>
        {phase.context}
      </p>

      <MetricCard metric={phase.metric} />

      <div style={{
        fontWeight: 600, fontSize: '15px', color: 'var(--text)',
        marginBottom: '4px',
      }}>
        {phase.question}
      </div>

      <OptionButtons
        options={phase.options}
        selected={selectedId}
        onSelect={handleSelect}
        disabled={!!selectedId}
      />

      {revealed && (
        <FeedbackBlock text={phase.explanation} />
      )}

      {revealed && (
        <ContinueButton onClick={handleContinue} />
      )}
    </div>
  );
}

// ─── Decomposition Phase ────────────────────────────────────────────────────
function DecompositionPhase(props) {
  var phase = props.phase;
  var onComplete = props.onComplete;
  var initialText = props.initialText || '';

  var _userText = useState(initialText);
  var userText = _userText[0];
  var setUserText = _userText[1];

  var _submitted = useState(false);
  var submitted = _submitted[0];
  var setSubmitted = _submitted[1];

  var _matchResults = useState([]);
  var matchResults = _matchResults[0];
  var setMatchResults = _matchResults[1];

  var _modelRevealed = useState(false);
  var modelRevealed = _modelRevealed[0];
  var setModelRevealed = _modelRevealed[1];

  function handleSubmit() {
    var results = matchKeyElements(userText, phase.keyElements);
    setMatchResults(results);
    setSubmitted(true);
  }

  function handleReveal() {
    setModelRevealed(true);
  }

  function handleContinue() {
    var matched = countMatched(matchResults);
    onComplete(matched);
  }

  return (
    <div className='pal-reveal-in'>
      <TealCallout>{phase.prompt}</TealCallout>

      <textarea
        value={userText}
        onChange={function(e) {
          setUserText(e.target.value);
          if (submitted) {
            setSubmitted(false);
            setMatchResults([]);
            setModelRevealed(false);
          }
        }}
        placeholder='Write your MECE breakdown here...'
        style={TEXTAREA_STYLE}
      />

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!userText.trim()}
          style={{
            marginTop: '12px', padding: '12px 24px', borderRadius: '8px',
            background: userText.trim() ? 'var(--teal)' : 'var(--border)',
            color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none',
            cursor: userText.trim() ? 'pointer' : 'default',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            opacity: userText.trim() ? 1 : 0.5,
          }}
        >
          Check Breakdown
          <IconArrowRight size={14} color='#fff' />
        </button>
      )}

      {submitted && !modelRevealed && (
        <div>
          <MatchReport results={matchResults} label='key elements' />
          <button
            onClick={handleReveal}
            style={{
              marginTop: '16px', padding: '12px 24px', borderRadius: '8px',
              background: 'var(--teal)', color: '#fff', fontWeight: 600,
              fontSize: '14px', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}
          >
            See Model Answer
            <IconArrowRight size={14} color='#fff' />
          </button>
        </div>
      )}

      {modelRevealed && (
        <div>
          <MatchReport results={matchResults} label='key elements' />
          <div className='pal-reveal-in' style={{
            marginTop: '16px', padding: '18px 20px', borderRadius: '10px',
            background: 'rgba(20,184,166,0.06)', border: '1px solid var(--teal)',
            borderLeft: '3px solid var(--teal)',
            fontSize: '14px', lineHeight: '1.7', color: 'var(--text)',
          }}>
            <div style={{
              fontWeight: 600, marginBottom: '8px', color: 'var(--teal)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <IconLightbulb size={16} color='var(--teal)' />
              Model Answer
            </div>
            {phase.modelAnswer}
          </div>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}

// ─── Schema Design Phase ────────────────────────────────────────────────────
function SchemaDesignPhase(props) {
  var phase = props.phase;
  var onComplete = props.onComplete;
  var initialText = props.initialText || '';

  var _userText = useState(initialText);
  var userText = _userText[0];
  var setUserText = _userText[1];

  var _submitted = useState(false);
  var submitted = _submitted[0];
  var setSubmitted = _submitted[1];

  var _matchResults = useState([]);
  var matchResults = _matchResults[0];
  var setMatchResults = _matchResults[1];

  var _modelRevealed = useState(false);
  var modelRevealed = _modelRevealed[0];
  var setModelRevealed = _modelRevealed[1];

  function handleSubmit() {
    var results = matchKeyElements(userText, phase.keyElements);
    setMatchResults(results);
    setSubmitted(true);
  }

  function handleReveal() {
    setModelRevealed(true);
  }

  function handleContinue() {
    var matched = countMatched(matchResults);
    onComplete(matched);
  }

  return (
    <div className='pal-reveal-in'>
      <TealCallout>{phase.prompt}</TealCallout>

      <textarea
        value={userText}
        onChange={function(e) {
          setUserText(e.target.value);
          if (submitted) {
            setSubmitted(false);
            setMatchResults([]);
            setModelRevealed(false);
          }
        }}
        placeholder='Describe the tables and columns you would need...'
        style={TEXTAREA_STYLE}
      />

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!userText.trim()}
          style={{
            marginTop: '12px', padding: '12px 24px', borderRadius: '8px',
            background: userText.trim() ? 'var(--accent)' : 'var(--border)',
            color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none',
            cursor: userText.trim() ? 'pointer' : 'default',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            opacity: userText.trim() ? 1 : 0.5,
          }}
        >
          Check Schema
          <IconArrowRight size={14} color='#fff' />
        </button>
      )}

      {submitted && !modelRevealed && (
        <div>
          <MatchReport results={matchResults} label='key elements' />
          <button
            onClick={handleReveal}
            style={{
              marginTop: '16px', padding: '12px 24px', borderRadius: '8px',
              background: 'var(--accent)', color: '#fff', fontWeight: 600,
              fontSize: '14px', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}
          >
            See Model Answer
            <IconArrowRight size={14} color='#fff' />
          </button>
        </div>
      )}

      {modelRevealed && (
        <div>
          <MatchReport results={matchResults} label='key elements' />
          <div className='pal-reveal-in' style={{
            marginTop: '16px', padding: '18px 20px', borderRadius: '10px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: '3px solid var(--accent)',
            fontSize: '14px', lineHeight: '1.7', color: 'var(--text)',
          }}>
            <div style={{
              fontWeight: 600, marginBottom: '8px', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <IconDatabase size={16} color='var(--accent)' />
              Model Answer
            </div>
            {phase.modelAnswer}
          </div>
          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}

// ─── Query Chain Phase ──────────────────────────────────────────────────────
function QueryChainPhase(props) {
  var caseId = props.caseId;
  var queries = props.queries;
  var onComplete = props.onComplete;

  var totalQueries = queries ? queries.length : 0;

  var _currentIdx = useState(0);
  var currentIdx = _currentIdx[0];
  var setCurrentIdx = _currentIdx[1];

  var _userQueries = useState(function() {
    var arr = [];
    for (var i = 0; i < totalQueries; i++) arr.push('');
    return arr;
  });
  var userQueries = _userQueries[0];
  var setUserQueries = _userQueries[1];

  var _results = useState(function() {
    var arr = [];
    for (var i = 0; i < totalQueries; i++) arr.push(null);
    return arr;
  });
  var results = _results[0];
  var setResults = _results[1];

  var _errors = useState(function() {
    var arr = [];
    for (var i = 0; i < totalQueries; i++) arr.push('');
    return arr;
  });
  var errors = _errors[0];
  var setErrors = _errors[1];

  var _revealed = useState(function() {
    var arr = [];
    for (var i = 0; i < totalQueries; i++) arr.push(false);
    return arr;
  });
  var revealedArr = _revealed[0];
  var setRevealed = _revealed[1];

  var _dbReady = useState(false);
  var dbReady = _dbReady[0];
  var setDbReady = _dbReady[1];

  var _dbError = useState('');
  var dbError = _dbError[0];
  var setDbError = _dbError[1];

  var dbRef = useRef(null);

  // Initialize sql.js database
  useEffect(function() {
    var seedData = fullLoopSeedData[caseId];
    if (!seedData) {
      setDbError('No seed data found for case ' + caseId);
      return;
    }
    var cancelled = false;

    function loadAndInit() {
      var initSqlJs = window.initSqlJs;
      if (!initSqlJs) {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js';
        script.onload = function() {
          if (cancelled) return;
          window.initSqlJs({ locateFile: function(file) { return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + file; } }).then(function(SQL) {
            if (cancelled) return;
            var db = new SQL.Database();
            seedData.seedSql.forEach(function(stmt) { db.run(stmt); });
            dbRef.current = db;
            setDbReady(true);
          }).catch(function(e) {
            if (!cancelled) setDbError('Failed to initialize SQL engine: ' + e.message);
          });
        };
        script.onerror = function() {
          if (!cancelled) setDbError('Failed to load SQL engine script');
        };
        document.head.appendChild(script);
      } else {
        initSqlJs({ locateFile: function(file) { return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + file; } }).then(function(SQL) {
          if (cancelled) return;
          var db = new SQL.Database();
          seedData.seedSql.forEach(function(stmt) { db.run(stmt); });
          dbRef.current = db;
          setDbReady(true);
        }).catch(function(e) {
          if (!cancelled) setDbError('Failed to initialize SQL engine: ' + e.message);
        });
      }
    }

    loadAndInit();

    return function() {
      cancelled = true;
      if (dbRef.current) {
        try { dbRef.current.close(); } catch (ex) { /* ignore */ }
        dbRef.current = null;
      }
    };
  }, [caseId]);

  function handleRunQuery() {
    if (!dbRef.current) return;
    var userQuery = userQueries[currentIdx];
    if (!userQuery.trim()) return;

    try {
      var stmt = dbRef.current.exec(userQuery);
      if (stmt.length > 0) {
        var newResults = results.slice();
        newResults[currentIdx] = {
          columns: stmt[0].columns,
          values: stmt[0].values.map(function(r) { return r.map(function(v) { return String(v); }); }),
        };
        setResults(newResults);
        var newErrors = errors.slice();
        newErrors[currentIdx] = '';
        setErrors(newErrors);
      } else {
        var newResults2 = results.slice();
        newResults2[currentIdx] = { columns: [], values: [] };
        setResults(newResults2);
        var newErrors2 = errors.slice();
        newErrors2[currentIdx] = '';
        setErrors(newErrors2);
      }
    } catch (e) {
      var newErrors3 = errors.slice();
      newErrors3[currentIdx] = e.message;
      setErrors(newErrors3);
      var newResults3 = results.slice();
      newResults3[currentIdx] = null;
      setResults(newResults3);
    }
  }

  function handleRevealQuery() {
    var copy = revealedArr.slice();
    copy[currentIdx] = true;
    setRevealed(copy);
  }

  function handleNextQuery() {
    if (currentIdx < totalQueries - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  }

  function handleFinish() {
    // Score: count how many queries the user ran successfully
    var successCount = 0;
    for (var i = 0; i < totalQueries; i++) {
      if (results[i] && results[i].columns && results[i].columns.length > 0) {
        successCount += 1;
      }
    }
    onComplete(successCount);
  }

  var query = queries[currentIdx];
  var userSql = userQueries[currentIdx];
  var queryResult = results[currentIdx];
  var queryError = errors[currentIdx];
  var isRevealed = revealedArr[currentIdx];
  var hasResults = queryResult && queryResult.columns && queryResult.columns.length > 0;
  var isLastQuery = currentIdx === totalQueries - 1;

  return (
    <div className='pal-reveal-in'>
      {/* Query chain progress bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '20px', padding: '12px 16px', borderRadius: '10px',
        background: 'var(--surface)', border: '1px solid var(--border)',
      }}>
        <IconSQL size={16} color='var(--accent)' />
        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
          {'Query ' + (currentIdx + 1) + ' of ' + totalQueries}
        </span>
        <div style={{
          flex: 1, height: '6px', borderRadius: '3px',
          background: 'var(--border)', marginLeft: '8px',
        }}>
          <div style={{
            height: '100%', borderRadius: '3px',
            background: 'var(--accent)',
            width: (((currentIdx + 1) / totalQueries) * 100) + '%',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* DB loading state */}
      {!dbReady && !dbError && (
        <div style={{
          fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <div className='pal-shimmer-box' style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
          Loading SQL engine...
        </div>
      )}
      {dbError && (
        <div style={{ fontSize: '13px', color: 'var(--red)', marginBottom: '12px' }}>
          {dbError}
        </div>
      )}

      {/* Query prompt */}
      <TealCallout>{query.prompt}</TealCallout>

      {/* SQL textarea */}
      <textarea
        value={userSql}
        onChange={function(e) {
          var copy = userQueries.slice();
          copy[currentIdx] = e.target.value;
          setUserQueries(copy);
        }}
        placeholder='-- Write your SQL here'
        style={SQL_TEXTAREA_STYLE}
      />

      {/* Run Query button */}
      {dbReady && !isRevealed && (
        <button
          onClick={handleRunQuery}
          disabled={!userSql.trim()}
          style={{
            marginTop: '12px', padding: '12px 24px', borderRadius: '8px',
            background: userSql.trim() ? 'var(--green)' : 'var(--border)',
            color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none',
            cursor: userSql.trim() ? 'pointer' : 'default',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            boxShadow: userSql.trim() ? '0 2px 8px rgba(16,185,129,0.2)' : 'none',
            opacity: userSql.trim() ? 1 : 0.5,
          }}
        >
          <IconPlay size={14} color='#fff' />
          Run Query
        </button>
      )}

      {/* Query error */}
      {queryError && (
        <div style={{
          marginTop: '12px', padding: '12px 16px', borderRadius: '8px',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          fontSize: '13px', color: 'var(--red)', fontFamily: 'monospace',
        }}>
          {'Error: ' + queryError}
        </div>
      )}

      {/* Query results table */}
      {hasResults && (
        <div style={{ marginTop: '16px' }}>
          <div style={{
            fontWeight: 600, marginBottom: '8px', fontSize: '13px',
            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {'Your Results (' + queryResult.values.length + ' row' + (queryResult.values.length !== 1 ? 's' : '') + ')'}
          </div>
          <DataTable headers={queryResult.columns} rows={queryResult.values} maxHeight='320px' />
        </div>
      )}

      {/* Empty result notice */}
      {queryResult && queryResult.columns && queryResult.columns.length === 0 && !queryError && (
        <div style={{
          marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)',
          padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '8px',
        }}>
          Query returned no results. Check your table names and column references.
        </div>
      )}

      {/* Hints */}
      {!isRevealed && query.hints && query.hints.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          {query.hints.map(function(hint, i) {
            return <CollapsibleHint key={i} hint={hint} index={i} />;
          })}
        </div>
      )}

      {/* Show Model Answer button */}
      {(hasResults || queryError) && !isRevealed && (
        <button
          onClick={handleRevealQuery}
          style={{
            marginTop: '16px', padding: '12px 24px', borderRadius: '8px',
            background: 'var(--accent)', color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}
        >
          Show Model Answer
          <IconArrowRight size={14} color='#fff' />
        </button>
      )}

      {/* Revealed: reference query + insight */}
      {isRevealed && (
        <div className='pal-reveal-in'>
          <div style={{ marginTop: '16px', marginBottom: '12px' }}>
            <div style={{
              fontWeight: 600, marginBottom: '8px', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <IconCheckmark size={16} color='var(--accent)' />
              Reference Query
            </div>
            <CodeBlock code={query.referenceQuery} />
          </div>

          {/* Insight */}
          <FeedbackBlock text={query.insight} />

          {/* Next Query or Continue */}
          {isLastQuery ? (
            <ContinueButton label='Continue' onClick={handleFinish} />
          ) : (
            <ContinueButton label='Next Query' onClick={handleNextQuery} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Synthesis Phase ────────────────────────────────────────────────────────
function SynthesisPhase(props) {
  var phase = props.phase;
  var onComplete = props.onComplete;
  var initialText = props.initialText || '';

  var _userText = useState(initialText);
  var userText = _userText[0];
  var setUserText = _userText[1];

  var _submitted = useState(false);
  var submitted = _submitted[0];
  var setSubmitted = _submitted[1];

  var _matchResults = useState([]);
  var matchResults = _matchResults[0];
  var setMatchResults = _matchResults[1];

  var _modelRevealed = useState(false);
  var modelRevealed = _modelRevealed[0];
  var setModelRevealed = _modelRevealed[1];

  var _rubricChecked = useState({});
  var rubricChecked = _rubricChecked[0];
  var setRubricChecked = _rubricChecked[1];

  function handleSubmit() {
    var results = matchKeyElements(userText, phase.keyElements);
    setMatchResults(results);
    setSubmitted(true);
  }

  function handleReveal() {
    setModelRevealed(true);
  }

  function handleContinue() {
    var matched = countMatched(matchResults);
    onComplete(matched);
  }

  return (
    <div className='pal-reveal-in'>
      <TealCallout>{phase.prompt}</TealCallout>

      <textarea
        value={userText}
        onChange={function(e) {
          setUserText(e.target.value);
          if (submitted) {
            setSubmitted(false);
            setMatchResults([]);
            setModelRevealed(false);
          }
        }}
        placeholder='Write your stakeholder summary and recommendations here...'
        style={TEXTAREA_STYLE}
      />

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!userText.trim()}
          style={{
            marginTop: '12px', padding: '12px 24px', borderRadius: '8px',
            background: userText.trim() ? 'var(--purple)' : 'var(--border)',
            color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none',
            cursor: userText.trim() ? 'pointer' : 'default',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            opacity: userText.trim() ? 1 : 0.5,
          }}
        >
          Check Summary
          <IconArrowRight size={14} color='#fff' />
        </button>
      )}

      {submitted && !modelRevealed && (
        <div>
          <MatchReport results={matchResults} label='key elements' />
          <button
            onClick={handleReveal}
            style={{
              marginTop: '16px', padding: '12px 24px', borderRadius: '8px',
              background: 'var(--purple)', color: '#fff', fontWeight: 600,
              fontSize: '14px', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}
          >
            See Model Answer
            <IconArrowRight size={14} color='#fff' />
          </button>
        </div>
      )}

      {modelRevealed && (
        <div>
          <MatchReport results={matchResults} label='key elements' />

          {/* Model answer */}
          <div className='pal-reveal-in' style={{
            marginTop: '16px', padding: '18px 20px', borderRadius: '10px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: '3px solid var(--purple)',
            fontSize: '14px', lineHeight: '1.7', color: 'var(--text)',
          }}>
            <div style={{
              fontWeight: 600, marginBottom: '8px', color: 'var(--purple)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <IconCommunicate size={16} color='var(--purple)' />
              Model Answer
            </div>
            {phase.modelAnswer}
          </div>

          {/* Rubric checklist */}
          {phase.rubric && phase.rubric.length > 0 && (
            <div style={{
              marginTop: '16px', padding: '18px 20px', borderRadius: '10px',
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
              <div style={{
                fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)', fontSize: '13px',
                textTransform: 'uppercase', letterSpacing: '0.3px',
              }}>
                Self-Assessment Rubric
              </div>
              {phase.rubric.map(function(item, i) {
                var isChecked = !!rubricChecked[i];
                return (
                  <label key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                    marginBottom: '8px', cursor: 'pointer', fontSize: '14px',
                    lineHeight: '1.5', color: 'var(--text)',
                  }}>
                    <input
                      type='checkbox'
                      checked={isChecked}
                      onChange={function() {
                        var next = Object.assign({}, rubricChecked);
                        next[i] = !isChecked;
                        setRubricChecked(next);
                      }}
                      style={{ marginTop: '3px', accentColor: 'var(--green)' }}
                    />
                    {item}
                  </label>
                );
              })}
            </div>
          )}

          <ContinueButton onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}

// ─── Score Ring ──────────────────────────────────────────────────────────────
function ScoreRing(props) {
  var score = props.score;
  var maxScore = props.maxScore;
  var pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  var radius = 54;
  var circumference = 2 * Math.PI * radius;
  var offset = circumference - (pct / 100) * circumference;

  var ringColor = 'var(--red)';
  if (pct > 75) ringColor = 'var(--green)';
  else if (pct > 50) ringColor = 'var(--yellow)';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width='130' height='130' viewBox='0 0 130 130'>
        {/* Background track */}
        <circle cx='65' cy='65' r={radius} fill='none' stroke='var(--border)' strokeWidth='8'/>
        {/* Progress arc */}
        <circle
          cx='65' cy='65' r={radius} fill='none'
          stroke={ringColor} strokeWidth='8'
          strokeLinecap='round'
          strokeDasharray={String(circumference)}
          strokeDashoffset={String(offset)}
          transform='rotate(-90 65 65)'
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        {/* Center text */}
        <text x='65' y='62' textAnchor='middle' dominantBaseline='central' fontSize='28' fontWeight='700' fill='var(--text)'>
          {score}/{maxScore}
        </text>
      </svg>
    </div>
  );
}

// ─── Completion Card ────────────────────────────────────────────────────────
function CompletionCard(props) {
  var flCase = props.flCase;
  var phaseScores = props.phaseScores;
  var onBack = props.onBack;
  var onNext = props.onNext;

  var totalScore = 0;
  var totalMax = 0;

  var phaseEntries = PHASE_META.map(function(meta, i) {
    var score = phaseScores[meta.key];
    var phaseData = flCase[meta.key];
    var maxVal = 0;
    var scoreVal = score !== null && score !== undefined ? score : 0;

    if (meta.key === 'problem') {
      maxVal = 1;
    } else if (meta.key === 'decomposition' || meta.key === 'schemaDesign') {
      maxVal = phaseData && phaseData.keyElements ? phaseData.keyElements.length : 1;
    } else if (meta.key === 'queryChain') {
      maxVal = flCase.queryChain ? flCase.queryChain.length : 3;
    } else if (meta.key === 'synthesis') {
      maxVal = phaseData && phaseData.keyElements ? phaseData.keyElements.length : 1;
    }

    totalScore += scoreVal;
    totalMax += maxVal;

    return {
      title: meta.title,
      color: meta.color,
      score: scoreVal,
      max: maxVal,
      perfect: scoreVal >= maxVal,
    };
  });

  return (
    <div className='pal-page-enter' style={{
      maxWidth: '800px', margin: '0 auto', padding: '24px 16px',
    }}>
      {/* Summary header */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '28px 24px', marginBottom: '16px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          marginBottom: '16px',
        }}>
          <ScoreRing score={totalScore} maxScore={totalMax} />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
              {flCase.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
                background: 'var(--border)', borderRadius: '4px', padding: '2px 8px',
              }}>
                {flCase.domain}
              </span>
              <span style={{
                fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
                background: 'var(--border)', borderRadius: '4px', padding: '2px 8px',
              }}>
                {flCase.difficulty}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                5 phases completed
              </span>
            </div>
          </div>
        </div>

        {/* Phase pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {phaseEntries.map(function(pe, i) {
            return (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                background: pe.perfect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)',
                color: pe.perfect ? 'var(--green)' : 'var(--red)',
                border: '1px solid ' + (pe.perfect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'),
              }}>
                <PhaseIcon type={PHASES[i]} size={12} />
                {pe.title + ' ' + pe.score + '/' + pe.max}
              </div>
            );
          })}
        </div>
      </div>

      {/* Case takeaway */}
      {flCase.takeaway && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '20px 24px', marginBottom: '16px',
        }}>
          <div style={{
            fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px',
          }}>
            Case Takeaway
          </div>
          <p style={{
            fontSize: '14px', lineHeight: '1.7', color: 'var(--text)', margin: 0,
          }}>
            {flCase.takeaway}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '12px 22px', borderRadius: '10px', border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text)', fontSize: '14px',
            fontWeight: 500, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}
        >
          <IconArrowLeft size={14} />
          Back to Cases
        </button>
        {onNext && (
          <button
            className='pal-glow-pulse'
            onClick={onNext}
            style={{
              padding: '12px 22px', borderRadius: '10px', border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 2px 8px rgba(59,130,246,0.2)',
            }}
          >
            Next Case
            <IconArrowRight size={14} color='#fff' />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Runner ────────────────────────────────────────────────────────────
export function FullLoopRunner(props) {
  var caseId = props.caseId;
  var onBack = props.onBack;
  var onNext = props.onNext;
  var unlocked = props.unlocked;
  var flCase = fullLoopCasesById[caseId];

  // Load saved progress or draft
  var savedProgress = getFullLoopProgress(caseId);
  var draft = !savedProgress ? loadDraft(caseId) : null;

  var _phaseIndex = useState(draft ? (draft.phaseIndex || 0) : 0);
  var phaseIndex = _phaseIndex[0];
  var setPhaseIndex = _phaseIndex[1];

  var _phaseScores = useState(draft ? (draft.phaseScores || { problem: null, decomposition: null, schemaDesign: null, queryChain: null, synthesis: null }) : { problem: null, decomposition: null, schemaDesign: null, queryChain: null, synthesis: null });
  var phaseScores = _phaseScores[0];
  var setPhaseScores = _phaseScores[1];

  var _completedPhases = useState(draft ? (draft.completedPhases || {}) : {});
  var completedPhases = _completedPhases[0];
  var setCompletedPhases = _completedPhases[1];

  var _completed = useState(!!savedProgress);
  var completed = _completed[0];
  var setCompleted = _completed[1];

  var _drafts = useState(draft ? (draft.drafts || {}) : {});
  var drafts = _drafts[0];
  var setDrafts = _drafts[1];

  // Save draft on state changes
  useEffect(function() {
    if (!completed) {
      saveDraft(caseId, {
        phaseIndex: phaseIndex,
        phaseScores: phaseScores,
        completedPhases: completedPhases,
        drafts: drafts,
      });
    }
  }, [phaseIndex, phaseScores, completedPhases, drafts, completed, caseId]);

  // Track open
  useEffect(function() {
    track('case_started', { room: 'full-loop', id: caseId });
  }, [caseId]);

  function handlePhaseComplete(score) {
    var currentKey = PHASES[phaseIndex];

    // Save score
    var nextScores = Object.assign({}, phaseScores);
    nextScores[currentKey] = score;
    setPhaseScores(nextScores);

    // Mark completed
    var nextCompleted = Object.assign({}, completedPhases);
    nextCompleted[phaseIndex] = true;
    setCompletedPhases(nextCompleted);

    // Check if last phase
    if (phaseIndex >= PHASES.length - 1) {
      // Calculate total for progress save
      var totalScore = 0;
      var totalMax = 0;
      for (var i = 0; i < PHASES.length; i++) {
        var key = PHASES[i];
        var s = key === currentKey ? score : (nextScores[key] || 0);
        var phaseData = flCase[key];
        var maxVal = 0;
        if (key === 'problem') {
          maxVal = 1;
        } else if (key === 'decomposition' || key === 'schemaDesign') {
          maxVal = phaseData && phaseData.keyElements ? phaseData.keyElements.length : 1;
        } else if (key === 'queryChain') {
          maxVal = flCase.queryChain ? flCase.queryChain.length : 3;
        } else if (key === 'synthesis') {
          maxVal = phaseData && phaseData.keyElements ? phaseData.keyElements.length : 1;
        }
        totalScore += s;
        totalMax += maxVal;
      }

      saveFullLoopProgress(caseId, {
        score: totalScore,
        maxScore: totalMax,
        phaseScores: nextScores,
      });

      clearDraft(caseId);
      setCompleted(true);
      window.scrollTo(0, 0);
      track('case_completed', { room: 'full-loop', id: caseId, score: totalScore, maxScore: totalMax });
    } else {
      setPhaseIndex(phaseIndex + 1);
      window.scrollTo(0, 0);
    }
  }

  function handlePhaseSelect(i) {
    setPhaseIndex(i);
    window.scrollTo(0, 0);
  }

  // Guard
  if (!flCase) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Case not found.</p>
        <button onClick={onBack} style={{
          marginTop: '12px', padding: '10px 20px', borderRadius: '8px',
          border: '1px solid var(--border)', background: 'var(--surface)',
          color: 'var(--text)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: '6px',
        }}>
          <IconArrowLeft size={14} />
          Back
        </button>
      </div>
    );
  }

  // Completion view
  if (completed) {
    return (
      <CompletionCard
        flCase={flCase}
        phaseScores={phaseScores}
        onBack={onBack}
        onNext={onNext}
      />
    );
  }

  var currentPhaseKey = PHASES[phaseIndex];
  var currentMeta = PHASE_META[phaseIndex];

  // Render phase content
  var phaseContent = null;

  if (currentPhaseKey === 'problem') {
    phaseContent = (
      <ProblemPhase
        phase={flCase.problem}
        onComplete={handlePhaseComplete}
      />
    );
  } else if (currentPhaseKey === 'decomposition') {
    phaseContent = (
      <DecompositionPhase
        phase={flCase.decomposition}
        onComplete={handlePhaseComplete}
        initialText={drafts.decomposition || ''}
      />
    );
  } else if (currentPhaseKey === 'schemaDesign') {
    phaseContent = (
      <SchemaDesignPhase
        phase={flCase.schemaDesign}
        onComplete={handlePhaseComplete}
        initialText={drafts.schemaDesign || ''}
      />
    );
  } else if (currentPhaseKey === 'queryChain') {
    phaseContent = (
      <QueryChainPhase
        caseId={flCase.id}
        queries={flCase.queryChain}
        onComplete={handlePhaseComplete}
      />
    );
  } else if (currentPhaseKey === 'synthesis') {
    phaseContent = (
      <SynthesisPhase
        phase={flCase.synthesis}
        onComplete={handlePhaseComplete}
        initialText={drafts.synthesis || ''}
      />
    );
  }

  return (
    <div className='pal-page-enter' style={{
      maxWidth: '800px', margin: '0 auto', padding: '24px 16px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px',
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text-muted)', fontSize: '13px',
            cursor: 'pointer', flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            transition: 'all 0.15s ease',
          }}
        >
          <IconArrowLeft size={13} />
          Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px',
            lineHeight: '1.2',
          }}>
            {flCase.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '12px', color: 'var(--text-muted)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              padding: '2px 10px', borderRadius: '20px', fontWeight: 500,
            }}>
              {flCase.domain}
            </span>
            <span style={{
              fontSize: '12px', color: 'var(--accent)',
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
              padding: '2px 10px', borderRadius: '20px', fontWeight: 600,
            }}>
              {'Phase ' + (phaseIndex + 1) + ' of ' + PHASES.length}
            </span>
          </div>
        </div>
      </div>

      {/* Phase bar */}
      <PhaseBar
        currentIndex={phaseIndex}
        completedPhases={completedPhases}
        onSelect={handlePhaseSelect}
      />

      {/* Phase title */}
      <h2 style={{
        fontSize: '18px', fontWeight: 700, color: 'var(--accent)',
        margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'rgba(59,130,246,0.08)',
        }}>
          <PhaseIcon type={currentPhaseKey} size={20} />
        </span>
        {currentMeta.title}
      </h2>

      {/* Phase content */}
      <div className='pal-card-enter'>
        {phaseContent}
      </div>
    </div>
  );
}
