import { useState, useEffect, useCallback } from 'react';
import { fullLoopCasesById } from '../../data/fullLoopCases.js';
import { saveFullLoopProgress, getFullLoopProgress, clearFullLoopProgress } from '../../utils/fullLoopProgress.js';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
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

function IconExperiment(props) {
  var size = props.size || 20;
  var color = props.color || 'var(--green)';
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M7 2H13V7L16.5 16C16.8 16.8 16.2 17.5 15.3 17.5H4.7C3.8 17.5 3.2 16.8 3.5 16L7 7V2Z' stroke={color} strokeWidth='1.3' fill='none'/>
      <path d='M7 9L3.5 16C3.2 16.8 3.8 17.5 4.7 17.5H15.3C16.2 17.5 16.8 16.8 16.5 16L13 9H7Z' fill={color} fillOpacity='0.12'/>
      <line x1='6' y1='2' x2='14' y2='2' stroke={color} strokeWidth='1.5' strokeLinecap='round'/>
      <circle cx='8' cy='13' r='1' fill={color} fillOpacity='0.6'/>
      <circle cx='11.5' cy='14.5' r='0.8' fill={color} fillOpacity='0.4'/>
      <circle cx='10' cy='11.5' r='0.7' fill={color} fillOpacity='0.5'/>
    </svg>
  );
}

function IconReadout(props) {
  var size = props.size || 20;
  var color = props.color || 'var(--accent)';
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect x='3' y='1' width='14' height='17' rx='2' stroke={color} strokeWidth='1.3' fill='none'/>
      <path d='M3 5H17' stroke={color} strokeWidth='1' strokeOpacity='0.3'/>
      <polyline points='7,10 9,12.5 13,8' stroke={color} strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' fill='none'/>
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

var PHASE_ICON_MAP = {
  alert: IconAlert,
  data: IconData,
  rca: IconRCA,
  sql: IconSQL,
  communicate: IconCommunicate,
  experiment: IconExperiment,
  readout: IconReadout,
};

function PhaseIcon(props) {
  var type = props.type;
  var size = props.size || 20;
  var color = props.color;
  var Comp = PHASE_ICON_MAP[type];
  if (!Comp) return null;
  return <Comp size={size} color={color} />;
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

// ─── Phase Bar ──────────────────────────────────────────────────────────────
function PhaseBar(props) {
  var phases = props.phases;
  var currentIndex = props.currentIndex;
  var completedPhases = props.completedPhases;
  var onSelect = props.onSelect;

  return (
    <div className='pal-card-enter' style={{
      display: 'flex', alignItems: 'center', gap: '0',
      overflowX: 'auto', padding: '16px 0', marginBottom: '28px',
    }}>
      {phases.map(function(phase, i) {
        var isCompleted = completedPhases[i];
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
                  : <PhaseIcon type={phase.type} size={18} />
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
            {i < phases.length - 1 && (
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

  return (
    <div style={{
      overflowX: 'auto', marginBottom: '16px',
      borderRadius: '10px', border: '1px solid var(--border)',
      overflow: 'hidden',
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

// ─── Schema display for SQL phase ───────────────────────────────────────────
function SchemaDisplay(props) {
  var schema = props.schema;

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '16px 20px', marginBottom: '16px',
      fontSize: '13px',
    }}>
      <div style={{
        fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px',
      }}>
        <IconDatabase size={16} />
        Schema
      </div>
      {schema.tables.map(function(t, i) {
        return (
          <div key={i} style={{
            marginBottom: '10px', display: 'flex', alignItems: 'baseline',
            gap: '10px', flexWrap: 'wrap',
          }}>
            <span style={{
              fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent)',
              background: 'rgba(59,130,246,0.08)', padding: '2px 8px',
              borderRadius: '4px', fontSize: '12px',
            }}>
              {t.name}
            </span>
            <span style={{
              color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px',
            }}>
              {t.columns.join(' · ')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Option Buttons (for alert, rca, readout) ───────────────────────────────
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

// ─── Metric Card (for alert phase) ──────────────────────────────────────────
function MetricCard(props) {
  var metricName = props.metricName;
  var metricValue = props.metricValue;
  var metricChange = props.metricChange;
  var isNegative = (metricChange || '').indexOf('-') >= 0;

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
        {metricName}
      </div>
      <div style={{
        fontSize: '42px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px',
        lineHeight: '1.1',
      }}>
        {metricValue}
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
        {metricChange}
      </div>
    </div>
  );
}

// ─── Alert Phase ────────────────────────────────────────────────────────────
function AlertPhase(props) {
  var phase = props.phase;
  var state = props.state;
  var setState = props.setState;
  var onContinue = props.onContinue;
  var selected = state.selected || null;
  var selectedOpt = selected ? phase.options.find(function(o) { return o.id === selected; }) : null;

  function handleSelect(id) {
    if (selected) return;
    setState({ selected: id, correct: phase.options.find(function(o) { return o.id === id; }).correct });
  }

  return (
    <div>
      <MetricCard
        metricName={phase.metricName}
        metricValue={phase.metricValue}
        metricChange={phase.metricChange}
      />
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '8px' }}>
        {phase.prompt}
      </p>
      <OptionButtons
        options={phase.options}
        selected={selected}
        onSelect={handleSelect}
        disabled={!!selected}
      />
      {selectedOpt && <FeedbackBlock text={selectedOpt.feedback} />}
      {selected && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

// ─── Data Phase ─────────────────────────────────────────────────────────────
function DataPhase(props) {
  var phase = props.phase;
  var state = props.state;
  var setState = props.setState;
  var onContinue = props.onContinue;
  var observation = state.observation || '';
  var revealed = state.revealed || false;

  return (
    <div>
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '16px' }}>
        {phase.prompt}
      </p>
      <DataTable headers={phase.dataTable.headers} rows={phase.dataTable.rows} />
      <TealCallout>{phase.guideQuestion}</TealCallout>
      <textarea
        value={observation}
        onChange={function(e) { setState({ observation: e.target.value, revealed: revealed }); }}
        placeholder='Write your observation here...'
        rows={4}
        style={{
          width: '100%', padding: '14px', borderRadius: '10px',
          border: '1px solid var(--border)', background: 'var(--surface)',
          fontSize: '14px', lineHeight: '1.5', color: 'var(--text)',
          resize: 'vertical', fontFamily: 'inherit',
          boxSizing: 'border-box', transition: 'border-color 0.2s ease',
        }}
      />
      {!revealed && (
        <button
          onClick={function() { setState({ observation: observation, revealed: true }); }}
          style={{
            marginTop: '12px', padding: '12px 24px', borderRadius: '8px',
            background: 'var(--teal)', color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}
        >
          Reveal Model Observation
          <IconArrowRight size={14} color='#fff' />
        </button>
      )}
      {revealed && (
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
            Model Observation
          </div>
          {phase.modelObservation}
        </div>
      )}
      {revealed && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

// ─── RCA Phase ──────────────────────────────────────────────────────────────
function RCAPhase(props) {
  var phase = props.phase;
  var state = props.state;
  var setState = props.setState;
  var onContinue = props.onContinue;
  var selected = state.selected || null;
  var selectedOpt = selected ? phase.options.find(function(o) { return o.id === selected; }) : null;

  function handleSelect(id) {
    if (selected) return;
    setState({ selected: id, correct: phase.options.find(function(o) { return o.id === id; }).correct });
  }

  return (
    <div>
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '8px' }}>
        {phase.prompt}
      </p>
      <OptionButtons
        options={phase.options}
        selected={selected}
        onSelect={handleSelect}
        disabled={!!selected}
      />
      {selectedOpt && <FeedbackBlock text={selectedOpt.feedback} />}
      {selected && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

// ─── SQL Phase ──────────────────────────────────────────────────────────────
function SQLPhase(props) {
  var phase = props.phase;
  var state = props.state;
  var setState = props.setState;
  var onContinue = props.onContinue;
  var userSql = state.userSql || '';
  var revealed = state.revealed || false;

  return (
    <div>
      <SchemaDisplay schema={phase.schema} />
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '12px' }}>
        {phase.task}
      </p>
      <textarea
        value={userSql}
        onChange={function(e) { setState({ userSql: e.target.value, revealed: revealed }); }}
        placeholder='-- Write your SQL here'
        rows={6}
        style={{
          width: '100%', padding: '14px', borderRadius: '10px',
          border: '1px solid var(--border)', background: 'var(--surface)',
          fontSize: '13px', lineHeight: '1.5', color: 'var(--text)',
          fontFamily: 'monospace', resize: 'vertical',
          boxSizing: 'border-box', transition: 'border-color 0.2s ease',
        }}
      />
      {!revealed && (
        <button
          onClick={function() { setState({ userSql: userSql, revealed: true }); }}
          style={{
            marginTop: '12px', padding: '12px 24px', borderRadius: '8px',
            background: 'var(--accent)', color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}
        >
          Reveal Correct Query
          <IconArrowRight size={14} color='#fff' />
        </button>
      )}
      {revealed && (
        <div className='pal-reveal-in'>
          <div style={{ marginTop: '16px', marginBottom: '12px' }}>
            <div style={{
              fontWeight: 600, marginBottom: '8px', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <IconCheckmark size={16} color='var(--accent)' />
              Correct Query
            </div>
            <CodeBlock code={phase.correctQuery} />
          </div>
          {phase.expectedOutput && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
                Expected Output
              </div>
              <DataTable headers={phase.expectedOutput.headers} rows={phase.expectedOutput.rows} />
            </div>
          )}
          {phase.hints && phase.hints.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              {phase.hints.map(function(hint, i) {
                return <CollapsibleHint key={i} hint={hint} index={i} />;
              })}
            </div>
          )}
        </div>
      )}
      {revealed && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

// ─── Communicate Phase ──────────────────────────────────────────────────────
function CommunicatePhase(props) {
  var phase = props.phase;
  var state = props.state;
  var setState = props.setState;
  var onContinue = props.onContinue;
  var userText = state.userText || '';
  var revealed = state.revealed || false;
  var checked = state.checked || {};

  return (
    <div>
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '12px' }}>
        {phase.prompt}
      </p>
      <textarea
        value={userText}
        onChange={function(e) { setState({ userText: e.target.value, revealed: revealed, checked: checked }); }}
        placeholder='Write your brief here...'
        rows={5}
        style={{
          width: '100%', padding: '14px', borderRadius: '10px',
          border: '1px solid var(--border)', background: 'var(--surface)',
          fontSize: '14px', lineHeight: '1.5', color: 'var(--text)',
          resize: 'vertical', fontFamily: 'inherit',
          boxSizing: 'border-box', transition: 'border-color 0.2s ease',
        }}
      />
      {!revealed && (
        <button
          onClick={function() { setState({ userText: userText, revealed: true, checked: checked }); }}
          style={{
            marginTop: '12px', padding: '12px 24px', borderRadius: '8px',
            background: 'var(--accent)', color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}
        >
          See Model Answer
          <IconArrowRight size={14} color='#fff' />
        </button>
      )}
      {revealed && (
        <div className='pal-reveal-in'>
          <div style={{
            marginTop: '16px', padding: '18px 20px', borderRadius: '10px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: '3px solid var(--accent)',
            fontSize: '14px', lineHeight: '1.7', color: 'var(--text)',
          }}>
            <div style={{
              fontWeight: 600, marginBottom: '8px', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <IconCommunicate size={16} color='var(--accent)' />
              Model Answer
            </div>
            {phase.modelAnswer}
          </div>
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
                var isChecked = !!checked[i];
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
                        var next = Object.assign({}, checked);
                        next[i] = !isChecked;
                        setState({ userText: userText, revealed: true, checked: next });
                      }}
                      style={{ marginTop: '3px', accentColor: 'var(--green)' }}
                    />
                    {item}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
      {revealed && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

// ─── Experiment Phase ───────────────────────────────────────────────────────
function ExperimentPhase(props) {
  var phase = props.phase;
  var state = props.state;
  var setState = props.setState;
  var onContinue = props.onContinue;
  var fieldValues = state.fieldValues || {};
  var revealed = state.revealed || false;

  function updateField(idx, val) {
    var next = Object.assign({}, fieldValues);
    next[idx] = val;
    setState({ fieldValues: next, revealed: revealed });
  }

  return (
    <div>
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '16px' }}>
        {phase.prompt}
      </p>
      {phase.fields.map(function(field, i) {
        return (
          <div key={i} style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontWeight: 600, fontSize: '14px',
              color: 'var(--text)', marginBottom: '6px',
            }}>
              {field.label}
            </label>
            <textarea
              value={fieldValues[i] || ''}
              onChange={function(e) { updateField(i, e.target.value); }}
              placeholder={'Enter your ' + field.label.toLowerCase() + '...'}
              rows={3}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '14px', lineHeight: '1.5', color: 'var(--text)',
                resize: 'vertical', fontFamily: 'inherit',
                boxSizing: 'border-box', transition: 'border-color 0.2s ease',
              }}
            />
            {revealed && (
              <div className='pal-reveal-in' style={{
                marginTop: '8px', padding: '14px', borderRadius: '8px',
                background: 'rgba(16,185,129,0.06)', border: '1px solid var(--green)',
                borderLeft: '3px solid var(--green)',
                fontSize: '13px', lineHeight: '1.6', color: 'var(--text)',
              }}>
                <span style={{ fontWeight: 600, color: 'var(--green)' }}>Model: </span>
                {field.correctAnswer}
              </div>
            )}
          </div>
        );
      })}
      {!revealed && (
        <button
          onClick={function() { setState({ fieldValues: fieldValues, revealed: true }); }}
          style={{
            padding: '12px 24px', borderRadius: '8px',
            background: 'var(--accent)', color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}
        >
          Reveal Answers
          <IconArrowRight size={14} color='#fff' />
        </button>
      )}
      {revealed && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

// ─── Readout Phase ──────────────────────────────────────────────────────────
function ReadoutPhase(props) {
  var phase = props.phase;
  var state = props.state;
  var setState = props.setState;
  var onComplete = props.onComplete;
  var selected = state.selected || null;
  var selectedOpt = selected ? phase.options.find(function(o) { return o.id === selected; }) : null;

  function handleSelect(id) {
    if (selected) return;
    setState({ selected: id, correct: phase.options.find(function(o) { return o.id === id; }).correct });
  }

  return (
    <div>
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '16px' }}>
        {phase.prompt}
      </p>
      <DataTable headers={phase.resultsTable.headers} rows={phase.resultsTable.rows} />
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', fontWeight: 600, marginBottom: '8px' }}>
        {phase.question}
      </p>
      <OptionButtons
        options={phase.options}
        selected={selected}
        onSelect={handleSelect}
        disabled={!!selected}
      />
      {selectedOpt && <FeedbackBlock text={selectedOpt.feedback} />}
      {selected && phase.debrief && (
        <div className='pal-reveal-in' style={{
          marginTop: '20px', padding: '22px 24px', borderRadius: '12px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent)',
          fontSize: '14px', lineHeight: '1.7', color: 'var(--text)',
        }}>
          <div style={{
            fontWeight: 700, marginBottom: '10px', color: 'var(--accent)', fontSize: '15px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <IconReadout size={18} color='var(--accent)' />
            Full Debrief
          </div>
          {phase.debrief}
        </div>
      )}
      {selected && (
        <ContinueButton label='Complete Case' onClick={onComplete} />
      )}
    </div>
  );
}

// ─── Completion Card ────────────────────────────────────────────────────────
function CompletionCard(props) {
  var flCase = props.flCase;
  var phaseStates = props.phaseStates;
  var onBack = props.onBack;
  var onNext = props.onNext;
  var correct = 0;
  var total = 0;

  flCase.phases.forEach(function(phase, i) {
    if (phase.type === 'alert' || phase.type === 'rca' || phase.type === 'readout') {
      total += 1;
      if (phaseStates[i] && phaseStates[i].correct) {
        correct += 1;
      }
    }
  });

  var isPerfect = correct === total;

  return (
    <div className='pal-page-enter' style={{
      maxWidth: '800px', margin: '0 auto', padding: '24px 16px',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: isPerfect ? '2px solid var(--green)' : '2px solid var(--accent)',
        borderRadius: '16px', padding: '40px 32px', textAlign: 'center',
        marginBottom: '24px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative dots */}
        <div style={{
          position: 'absolute', top: '12px', left: '16px',
          width: '6px', height: '6px', borderRadius: '50%',
          background: isPerfect ? 'var(--green)' : 'var(--accent)', opacity: 0.15,
        }} />
        <div style={{
          position: 'absolute', top: '24px', left: '36px',
          width: '4px', height: '4px', borderRadius: '50%',
          background: isPerfect ? 'var(--green)' : 'var(--accent)', opacity: 0.1,
        }} />
        <div style={{
          position: 'absolute', top: '8px', right: '24px',
          width: '5px', height: '5px', borderRadius: '50%',
          background: isPerfect ? 'var(--green)' : 'var(--accent)', opacity: 0.12,
        }} />
        <div style={{
          position: 'absolute', top: '32px', right: '40px',
          width: '3px', height: '3px', borderRadius: '50%',
          background: isPerfect ? 'var(--green)' : 'var(--accent)', opacity: 0.08,
        }} />
        <div style={{
          position: 'absolute', bottom: '20px', left: '28px',
          width: '4px', height: '4px', borderRadius: '50%',
          background: isPerfect ? 'var(--green)' : 'var(--accent)', opacity: 0.1,
        }} />
        <div style={{
          position: 'absolute', bottom: '14px', right: '20px',
          width: '6px', height: '6px', borderRadius: '50%',
          background: isPerfect ? 'var(--green)' : 'var(--accent)', opacity: 0.12,
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '10px',
          width: '3px', height: '3px', borderRadius: '50%',
          background: isPerfect ? 'var(--green)' : 'var(--accent)', opacity: 0.08,
        }} />
        <div style={{
          position: 'absolute', bottom: '40px', right: '12px',
          width: '4px', height: '4px', borderRadius: '50%',
          background: isPerfect ? 'var(--green)' : 'var(--accent)', opacity: 0.1,
        }} />

        <div style={{ marginBottom: '16px' }}>
          <IconTrophy size={52} color={isPerfect ? '#10b981' : '#f59e0b'} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>
          Case Complete
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: '0 0 24px' }}>
          You completed all 7 phases of this full-loop case.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: isPerfect ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.08)',
          padding: '14px 28px', borderRadius: '12px',
          border: '1px solid ' + (isPerfect ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.15)'),
        }}>
          <span style={{
            fontSize: '28px', fontWeight: 700,
            color: isPerfect ? 'var(--green)' : 'var(--accent)',
          }}>
            {correct}/{total}
          </span>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            decision phases correct on first attempt
          </span>
        </div>
      </div>

      <ForwardPointerCard room='fullLoop' />

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
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
  var phases = flCase ? flCase.phases : [];

  // Load saved progress or draft
  var savedProgress = getFullLoopProgress(caseId);
  var draft = !savedProgress ? loadDraft(caseId) : null;

  var _phaseIndex = useState(draft ? (draft.phaseIndex || 0) : 0);
  var phaseIndex = _phaseIndex[0];
  var setPhaseIndex = _phaseIndex[1];

  var _phaseStates = useState(draft ? (draft.phaseStates || {}) : {});
  var phaseStates = _phaseStates[0];
  var setPhaseStates = _phaseStates[1];

  var _completedPhases = useState(draft ? (draft.completedPhases || {}) : {});
  var completedPhases = _completedPhases[0];
  var setCompletedPhases = _completedPhases[1];

  var _completed = useState(!!savedProgress);
  var completed = _completed[0];
  var setCompleted = _completed[1];

  // Save draft on state changes
  useEffect(function() {
    if (!completed) {
      saveDraft(caseId, {
        phaseIndex: phaseIndex,
        phaseStates: phaseStates,
        completedPhases: completedPhases,
      });
    }
  }, [phaseIndex, phaseStates, completedPhases, completed, caseId]);

  // Track open
  useEffect(function() {
    track('fullloop_case_opened', { caseId: caseId });
  }, [caseId]);

  var setCurrentPhaseState = useCallback(function(newState) {
    setPhaseStates(function(prev) {
      var next = Object.assign({}, prev);
      next[phaseIndex] = newState;
      return next;
    });
  }, [phaseIndex]);

  function handleContinue() {
    var nextCompleted = Object.assign({}, completedPhases);
    nextCompleted[phaseIndex] = true;
    setCompletedPhases(nextCompleted);

    if (phaseIndex < phases.length - 1) {
      setPhaseIndex(phaseIndex + 1);
      window.scrollTo(0, 0);
    }
  }

  function handleComplete() {
    var nextCompleted = Object.assign({}, completedPhases);
    nextCompleted[phaseIndex] = true;
    setCompletedPhases(nextCompleted);

    // Calculate score
    var correct = 0;
    var total = 0;
    phases.forEach(function(phase, i) {
      if (phase.type === 'alert' || phase.type === 'rca' || phase.type === 'readout') {
        total += 1;
        var st = i === phaseIndex ? phaseStates[i] : phaseStates[i];
        if (st && st.correct) correct += 1;
      }
    });

    saveFullLoopProgress(caseId, {
      score: correct,
      maxScore: total,
      phaseStates: phaseStates,
    });

    clearDraft(caseId);
    setCompleted(true);
    window.scrollTo(0, 0);
    track('fullloop_case_completed', { caseId: caseId, score: correct, maxScore: total });
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
        phaseStates={phaseStates}
        onBack={onBack}
        onNext={onNext}
      />
    );
  }

  var currentPhase = phases[phaseIndex];
  var currentState = phaseStates[phaseIndex] || {};

  // Render phase content
  var phaseContent = null;

  if (currentPhase.type === 'alert') {
    phaseContent = (
      <AlertPhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onContinue={handleContinue}
      />
    );
  } else if (currentPhase.type === 'data') {
    phaseContent = (
      <DataPhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onContinue={handleContinue}
      />
    );
  } else if (currentPhase.type === 'rca') {
    phaseContent = (
      <RCAPhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onContinue={handleContinue}
      />
    );
  } else if (currentPhase.type === 'sql') {
    phaseContent = (
      <SQLPhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onContinue={handleContinue}
      />
    );
  } else if (currentPhase.type === 'communicate') {
    phaseContent = (
      <CommunicatePhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onContinue={handleContinue}
      />
    );
  } else if (currentPhase.type === 'experiment') {
    phaseContent = (
      <ExperimentPhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onContinue={handleContinue}
      />
    );
  } else if (currentPhase.type === 'readout') {
    phaseContent = (
      <ReadoutPhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onComplete={handleComplete}
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
              Phase {phaseIndex + 1} of {phases.length}
            </span>
          </div>
        </div>
      </div>

      {/* Phase bar */}
      <PhaseBar
        phases={phases}
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
          <PhaseIcon type={currentPhase.type} size={20} />
        </span>
        {currentPhase.title}
      </h2>

      {/* Phase content */}
      <div className='pal-card-enter'>
        {phaseContent}
      </div>
    </div>
  );
}
