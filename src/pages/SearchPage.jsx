import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { scenarios } from '../data/scenarios.js';
import { designScenarios } from '../data/designScenarios.js';
import { statsModules } from '../data/statsModules.js';
import { metricCases } from '../data/metricCases.js';
import { rcaCases } from '../data/rcaCases.js';
import { businessCases } from '../data/businessCases.js';
import { productDesignScenarios } from '../data/productDesignScenarios.js';
import { codeModules } from '../data/codeModules.js';
import { prioritizationScenarios } from '../data/prioritizationScenarios.js';
import { behavioralQuestions } from '../data/behavioralQuestions.js';
import { estimationProblems } from '../data/estimationProblems.js';
import { statsFoundationsModules } from '../data/statsFoundationsModules.js';
import { growthAnalyticsCases } from '../data/growthAnalyticsCases.js';
import { biCases } from '../data/biCases.js';
import { spotTheFlawCases } from '../data/spotTheFlawCases.js';
import { takehomeCases } from '../data/takehomeCases.js';
import { instrumentationCases } from '../data/instrumentationCases.js';
import { challengesCases } from '../data/challengesCases.js';
import { expFoundationModules } from '../data/expFoundationModules.js';
import { metricsFoundationModules } from '../data/metricsFoundationModules.js';
import { rcaFoundationModules } from '../data/rcaFoundationModules.js';

const ROOMS = [
  { key: 'scenarios',               label: 'Review Scenarios',  page: 'browser',            idField: 'id', titleField: 'title' },
  { key: 'statsModules',            label: 'Stats',             page: 'stats',              idField: 'id', titleField: 'title' },
  { key: 'metricCases',             label: 'Metrics',           page: 'metrics',            idField: 'id', titleField: 'title' },
  { key: 'designScenarios',         label: 'Design',            page: 'design',             idField: 'id', titleField: 'title' },
  { key: 'rcaCases',                label: 'RCA',               page: 'rca',                idField: 'id', titleField: 'title' },
  { key: 'businessCases',           label: 'Cases',             page: 'cases',              idField: 'id', titleField: 'title' },
  { key: 'productDesignScenarios',  label: 'PM Design',         page: 'product-design',     idField: 'id', titleField: 'title' },
  { key: 'codeModules',             label: 'Programming Lab',   page: 'code',               idField: 'id', titleField: 'title' },
  { key: 'prioritizationScenarios', label: 'Prioritization',    page: 'prioritization',     idField: 'id', titleField: 'title' },
  { key: 'behavioralQuestions',     label: 'Behavioral',        page: 'behavioral',         idField: 'id', titleField: 'title' },
  { key: 'estimationProblems',      label: 'Estimation',        page: 'estimation',         idField: 'id', titleField: 'title' },
  { key: 'statsFoundationsModules', label: 'Stat Foundations',  page: 'stat-foundations',   idField: 'id', titleField: 'title' },
  { key: 'growthAnalyticsCases',    label: 'Growth Analytics',  page: 'growth-analytics',   idField: 'id', titleField: 'title' },
  { key: 'biCases',                 label: 'BI',                page: 'bi',                 idField: 'id', titleField: 'title' },
  { key: 'spotTheFlawCases',        label: 'Spot the Flaw',     page: 'spot-the-flaw',      idField: 'id', titleField: 'title' },
  { key: 'takehomeCases',           label: 'Take-Home',         page: 'take-home',          idField: 'id', titleField: 'title' },
  { key: 'instrumentationCases',    label: 'Instrumentation',   page: 'instrumentation',    idField: 'id', titleField: 'title' },
  { key: 'challengesCases',         label: 'Challenges',        page: 'challenges',         idField: 'id', titleField: 'title' },
  { key: 'expFoundationModules',    label: 'Exp Foundations',   page: 'exp-foundations',    idField: 'id', titleField: 'title' },
  { key: 'metricsFoundationModules',label: 'Metrics Foundations',page: 'metrics-foundations',idField: 'id', titleField: 'title' },
  { key: 'rcaFoundationModules',    label: 'RCA Foundations',   page: 'rca-foundations',    idField: 'id', titleField: 'title' },
];

const DIFF_COLORS = {
  analyst:    { color: 'var(--blue-text)',  bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  senior:     { color: 'var(--yellow)',     bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
  staff:      { color: 'var(--teal)',       bg: 'var(--teal-bg)',    border: 'var(--teal-border)' },
  'mid-level':{ color: 'var(--blue-text)',  bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  'senior':   { color: 'var(--yellow)',     bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
  hard:       { color: 'var(--red)',        bg: 'var(--red-bg)',     border: 'var(--red-border)' },
  medium:     { color: 'var(--yellow)',     bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
  easy:       { color: 'var(--green)',      bg: 'var(--green-bg)',   border: 'var(--green-border)' },
};

function getDiffStyle(difficulty) {
  if (!difficulty) return null;
  const key = difficulty.toLowerCase();
  return DIFF_COLORS[key] || { color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)' };
}

// Fields searched across all rooms
const SEARCH_FIELDS = ['title', 'subtitle', 'difficulty', 'concept', 'situation', 'scenario',
  'setup', 'question', 'flawLabel', 'flawType', 'keyInsight', 'domain', 'track'];

function matchesQuery(item, titleField, query) {
  const q = query.toLowerCase();
  // Check all declared string fields
  for (const field of SEARCH_FIELDS) {
    const val = item[field];
    if (typeof val === 'string' && val.toLowerCase().includes(q)) return true;
  }
  // Check tags array
  if (Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q))) return true;
  // Check rooms array (Challenges)
  if (Array.isArray(item.rooms) && item.rooms.some(r => r.toLowerCase().includes(q))) return true;
  return false;
}

function buildResults(allData, query) {
  const groups = [];
  for (const room of ROOMS) {
    const items = allData[room.key];
    if (!Array.isArray(items) || items.length === 0) continue;
    const matches = items.filter(item => matchesQuery(item, room.titleField, query));
    if (matches.length > 0) {
      groups.push({ room, items: matches });
    }
  }
  return groups;
}

function DifficultyBadge({ difficulty }) {
  if (!difficulty) return null;
  const style = getDiffStyle(difficulty);
  return (
    <span style={{
      fontSize: '0.68rem',
      fontWeight: 600,
      padding: '0.15rem 0.45rem',
      borderRadius: '4px',
      color: style.color,
      background: style.bg,
      border: `1px solid ${style.border}`,
      textTransform: 'capitalize',
      flexShrink: 0,
    }}>
      {difficulty}
    </span>
  );
}

function ResultCard({ item, room, isHighlighted, onNavigate, cardRef }) {
  const title = item[room.titleField] || item.title || '';
  const tags = Array.isArray(item.tags) ? item.tags.slice(0, 3) : [];

  return (
    <button
      ref={cardRef}
      onClick={() => onNavigate(room.page, item[room.idField])}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: isHighlighted ? 'var(--purple-bg)' : 'var(--surface)',
        border: `1px solid ${isHighlighted ? 'var(--purple-border)' : 'var(--border)'}`,
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        transition: 'background 0.1s, border-color 0.1s',
        marginBottom: '0.5rem',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--purple-bg)';
        e.currentTarget.style.borderColor = 'var(--purple-border)';
      }}
      onMouseLeave={e => {
        if (!isHighlighted) {
          e.currentTarget.style.background = 'var(--surface)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: tags.length > 0 ? '0.4rem' : 0 }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
          {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          {item.difficulty && <DifficultyBadge difficulty={item.difficulty} />}
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 600,
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
            color: 'var(--purple)',
            background: 'var(--purple-bg)',
            border: '1px solid var(--purple-border)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {room.label}
          </span>
        </div>
      </div>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {tags.map(tag => (
            <span key={tag} style={{
              fontSize: '0.68rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '3px',
              color: 'var(--text-muted)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

export function SearchPage({ onNavigate }) {
  const allData = { scenarios, designScenarios, statsModules, metricCases, rcaCases, businessCases, productDesignScenarios, codeModules, prioritizationScenarios, behavioralQuestions, estimationProblems, statsFoundationsModules, growthAnalyticsCases, biCases, spotTheFlawCases, takehomeCases, instrumentationCases, challengesCases, expFoundationModules, metricsFoundationModules, rcaFoundationModules };
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const inputRef = useRef(null);
  const cardRefs = useRef([]);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [debouncedQuery, selectedRoom]);

  const allResultGroups = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return buildResults(allData, debouncedQuery.trim());
  }, [debouncedQuery, allData]);

  const resultGroups = useMemo(() => {
    if (!selectedRoom) return allResultGroups;
    return allResultGroups.filter(g => g.room.key === selectedRoom);
  }, [allResultGroups, selectedRoom]);

  // Rooms that actually have results — for filter chips
  const activeRoomKeys = useMemo(() => new Set(allResultGroups.map(g => g.room.key)), [allResultGroups]);

  // Flatten all results for keyboard navigation
  const flatResults = useMemo(() => {
    return resultGroups.flatMap(g => g.items.map(item => ({ item, room: g.room })));
  }, [resultGroups]);

  const totalCount = flatResults.length;

  // Scroll highlighted card into view
  useEffect(() => {
    if (cardRefs.current[highlightedIndex]) {
      cardRefs.current[highlightedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightedIndex]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, totalCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && totalCount > 0) {
      e.preventDefault();
      const { item, room } = flatResults[highlightedIndex];
      onNavigate(room.page, item[room.idField]);
    }
  }, [totalCount, flatResults, highlightedIndex, onNavigate]);

  // Build per-group flat index offset for card ref assignment
  let globalIdx = 0;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '780px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            Search
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
          Search across all rooms — cases, modules, and questions.
        </p>
      </div>

      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <span style={{
          position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', fontSize: '0.85rem', pointerEvents: 'none',
          lineHeight: 1, fontWeight: 600,
        }}>
          /
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search cases, modules, topics..."
          autoComplete="off"
          spellCheck={false}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            fontSize: '1.05rem',
            padding: '0.75rem 1rem 0.75rem 2.5rem',
            borderRadius: '10px',
            border: '1.5px solid var(--purple-border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            outline: 'none',
            boxShadow: '0 0 0 3px var(--purple-bg)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--purple)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--purple-bg)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--purple-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            style={{
              position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1, padding: '0.25rem',
              borderRadius: '4px',
            }}
            aria-label="Clear search"
          >
            <Icon name='x' size={16} color='currentColor' />
          </button>
        )}
      </div>

      {/* Keyboard hint */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { keys: ['↑', '↓'], label: 'navigate' },
          { keys: ['↵'], label: 'open' },
          { keys: ['Esc'], label: 'go home' },
        ].map(({ keys, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {keys.map(k => (
              <kbd key={k} style={{
                display: 'inline-block',
                padding: '0.1rem 0.35rem',
                borderRadius: '3px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                fontSize: '0.68rem',
                fontFamily: 'inherit',
                color: 'var(--text-muted)',
              }}>{k}</kbd>
            ))}
            <span>{label}</span>
          </span>
        ))}
      </div>

      {/* Results area */}
      {!debouncedQuery.trim() && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.75rem' }}>/</div>
          Start typing to search across all PAL cases and modules
        </div>
      )}

      {debouncedQuery.trim() && totalCount === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
        }}>
          <div style={{ marginBottom: '0.75rem' }}><Icon name='help-circle' size={32} color='currentColor' /></div>
          No matches for &ldquo;{debouncedQuery}&rdquo; — try a different keyword
        </div>
      )}

      {debouncedQuery.trim() && totalCount > 0 && (
        <div>
          {/* Room filter chips */}
          {allResultGroups.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setSelectedRoom(null)}
                style={{
                  padding: '0.22rem 0.65rem',
                  borderRadius: '20px',
                  border: '1px solid ' + (selectedRoom === null ? 'var(--purple)' : 'var(--border)'),
                  background: selectedRoom === null ? 'var(--purple-bg)' : 'var(--surface-2)',
                  color: selectedRoom === null ? 'var(--purple)' : 'var(--text-muted)',
                  fontSize: '0.72rem', fontWeight: selectedRoom === null ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.1s',
                }}
              >
                All
              </button>
              {ROOMS.filter(r => activeRoomKeys.has(r.key)).map(r => (
                <button
                  key={r.key}
                  onClick={() => setSelectedRoom(selectedRoom === r.key ? null : r.key)}
                  style={{
                    padding: '0.22rem 0.65rem',
                    borderRadius: '20px',
                    border: '1px solid ' + (selectedRoom === r.key ? 'var(--purple)' : 'var(--border)'),
                    background: selectedRoom === r.key ? 'var(--purple-bg)' : 'var(--surface-2)',
                    color: selectedRoom === r.key ? 'var(--purple)' : 'var(--text-muted)',
                    fontSize: '0.72rem', fontWeight: selectedRoom === r.key ? 700 : 400,
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {totalCount} result{totalCount !== 1 ? 's' : ''} across {resultGroups.length} room{resultGroups.length !== 1 ? 's' : ''}
          </div>

          {resultGroups.map(({ room, items }) => {
            return (
              <div key={room.key} style={{ marginBottom: '1.5rem' }}>
                {/* Room group header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  marginBottom: '0.6rem',
                  paddingBottom: '0.4rem',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: 'var(--purple)',
                  }}>
                    {room.label}
                  </span>
                  <span style={{
                    fontSize: '0.68rem', color: 'var(--text-muted)',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '10px', padding: '0.05rem 0.4rem',
                  }}>
                    {items.length}
                  </span>
                </div>

                {/* Result cards */}
                {items.map((item, itemIndex) => {
                  const cardGlobalIdx = globalIdx;
                  globalIdx++;
                  return (
                    <div key={item[room.idField]} className="pal-card-enter pal-card-hover" style={{ animationDelay: (Math.min(itemIndex * 28, 400)) + 'ms' }}>
                      <ResultCard
                        item={item}
                        room={room}
                        isHighlighted={highlightedIndex === cardGlobalIdx}
                        onNavigate={onNavigate}
                        cardRef={el => { cardRefs.current[cardGlobalIdx] = el; }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
