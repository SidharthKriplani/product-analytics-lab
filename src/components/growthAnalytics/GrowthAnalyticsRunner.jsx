import { useState, useEffect } from 'react';
import { saveGrowthAnalyticsProgress, getGrowthAnalyticsProgress } from '../../utils/growthAnalyticsProgress.js';
import { addBookmark, removeBookmark, isBookmarked, toggleBookmark } from '../../utils/bookmarks.js';
import { track } from '../../utils/analytics.js';
import { growthAnalyticsCases } from '../../data/growthAnalyticsCases.js';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { ShareLinkButton } from '../shared/ShareLinkButton.jsx';
import { Icon } from '../shared/Icon.jsx';
import { NotesBox } from '../shared/NotesBox.jsx';

const ROOM_KEY = 'growth-analytics';
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  Legend,
  LabelList,
} from 'recharts';

// Chart color palette (recharts doesn't read CSS variables directly)
const C = {
  green:  '#4caf82',
  teal:   '#2ec4b6',
  yellow: '#f5c842',
  red:    '#e05c5c',
  blue:   '#4a90d9',
  muted:  '#6b7280',
};

// ── Per-case chart data ──────────────────────────────────────────────────────

const ga01Data = [
  { week: 'W1', retained: 1630000, new: 45000, reactivated: 12000, churned: -750000 },
  { week: 'W2', retained: 1580000, new: 45000, reactivated: 12000, churned: -800000 },
  { week: 'W3', retained: 1490000, new: 45000, reactivated: 12000, churned: -910000 },
  { week: 'W4', retained: 1390000, new: 45000, reactivated: 12000, churned: -1020000 },
];

const ga02Data = [
  { segment: 'Power Users', before: 38, after: 37 },
  { segment: 'Casual Users', before: 8, after: 7 },
  { segment: 'Overall', before: 22, after: 18 },
];

const ga03Data = [
  { month: 'M1', jan: 91, march: 88 },
  { month: 'M2', jan: 82, march: 71 },
  { month: 'M3', jan: 71, march: 41 },
  { month: 'M4', jan: 61, march: 28 },
  { month: 'M5', jan: 50, march: 21 },
  { month: 'M6', jan: 42, march: 17 },
];

const ga04Data = [
  { step: 'Signup', users: 100000, rate: 100 },
  { step: 'Profile', users: 72000, rate: 72 },
  { step: 'Browse', users: 61000, rate: 85 },
  { step: 'Purchase', users: 8000, rate: 13 },
];

const ga05Data = [
  { channel: 'Paid Social', cac: 45, ltv: 38 },
  { channel: 'SEO', cac: 12, ltv: 67 },
  { channel: 'Referral', cac: 8, ltv: 89 },
];

const ga06Data = [
  { type: 'Notification', sessionLength: 1.2, d7Retention: 23 },
  { type: 'Organic', sessionLength: 8.4, d7Retention: 61 },
];

const ga07Data = [
  { month: 'M-6', paid: 58, organic: 42 },
  { month: 'M-5', paid: 63, organic: 37 },
  { month: 'M-4', paid: 68, organic: 32 },
  { month: 'M-3', paid: 74, organic: 26 },
  { month: 'M-2', paid: 79, organic: 21 },
  { month: 'Now', paid: 84, organic: 16 },
];

const ga08Data = [
  { metric: 'First Purchase', us: 31, latam: 8 },
  { metric: 'M1 Retention', us: 72, latam: 41 },
  { metric: 'M6 Retention', us: 44, latam: 17 },
];

const ga09Data = [
  { channel: 'Organic', ltvCac: 13.4, ltv: 121, cac: 9 },
  { channel: 'Referral', ltvCac: 10.7, ltv: 128, cac: 12 },
  { channel: 'Paid Social', ltvCac: 1.3, ltv: 58, cac: 44 },
];

const ga09MixData = [
  { year: 'Last Year', organic: 38, referral: 22, paid: 40 },
  { year: 'This Year', organic: 21, referral: 14, paid: 65 },
];

const ga10Data = [
  { period: '6 Mo Ago', sharingRate: 0.80, convRate: 50, kFactor: 0.40 },
  { period: 'Current',  sharingRate: 0.85, convRate: 24, kFactor: 0.20 },
];

const ga10DeviceData = [
  { device: 'Desktop', convRate: 49, share: 22 },
  { device: 'Mobile',  convRate: 11, share: 78 },
];

const ga11Data = [
  { week: 'Wk 1', conversion: 4.8, activation: 68 },
  { week: 'Wk 2', conversion: 4.6, activation: 64 },
  { week: 'Wk 4', conversion: 4.3, activation: 58 },
  { week: 'Wk 8', conversion: 4.2, activation: 49 },
  { week: 'Wk 12', conversion: 4.1, activation: 41 },
];

const ga12Data = [
  { metric: 'D30 Retention', us: 38, latam: 23, sea: 26 },
  { metric: 'D90 Retention', us: 24, latam: 11, sea: 14 },
  { metric: 'First Purchase', us: 31, latam: 9,  sea: 12 },
];

// ── Shared chart wrapper ─────────────────────────────────────────────────────

function ChartCard({ children, height = 200 }) {
  return (
    <div style={{
      marginBottom: 20,
      padding: '16px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      <div style={{
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12,
      }}>
        Data Visualization
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

// ── Per-case chart components ────────────────────────────────────────────────

function GA01Chart() {
  const fmt = v => v < 0 ? `-${(Math.abs(v) / 1000000).toFixed(1)}M` : `${(v / 1000000).toFixed(2)}M`;
  return (
    <ChartCard height={210}>
      <BarChart data={ga01Data} stackOffset="sign" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
        <YAxis tickFormatter={fmt} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} width={52} />
        <Tooltip formatter={(v, name) => [fmt(v), name.charAt(0).toUpperCase() + name.slice(1)]} />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        <Bar dataKey="retained"    name="Retained"    stackId="a" fill={C.green}  />
        <Bar dataKey="new"         name="New"         stackId="a" fill={C.teal}   />
        <Bar dataKey="reactivated" name="Reactivated" stackId="a" fill={C.yellow} />
        <Bar dataKey="churned"     name="Churned"     stackId="a" fill={C.red}    />
      </BarChart>
    </ChartCard>
  );
}

function GA02Chart() {
  return (
    <ChartCard height={200}>
      <BarChart data={ga02Data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="segment" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
        <YAxis tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} domain={[0, 50]} />
        <Tooltip formatter={v => `${v}%`} />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        <Bar dataKey="before" name="Before Campaign" fill={C.teal}   />
        <Bar dataKey="after"  name="After Campaign"  fill={C.yellow} />
      </BarChart>
    </ChartCard>
  );
}

function GA03Chart() {
  return (
    <ChartCard height={210}>
      <LineChart data={ga03Data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
        <YAxis tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} domain={[0, 100]} />
        <Tooltip formatter={v => `${v}%`} />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        <Line type="monotone" dataKey="jan"   name="Jan Cohort (Enterprise)" stroke={C.yellow} strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="march" name="Mar Cohort (SMB)"        stroke={C.red}    strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ChartCard>
  );
}

function GA04Chart() {
  const fmtUsers = v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v;
  return (
    <ChartCard height={200}>
      <BarChart
        data={ga04Data}
        layout="vertical"
        margin={{ top: 8, right: 48, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tickFormatter={fmtUsers} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} />
        <YAxis type="category" dataKey="step" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} width={60} />
        <Tooltip formatter={(v, name) => [fmtUsers(v), name]} />
        <Bar dataKey="users" name="Users" fill={C.teal} radius={[0, 4, 4, 0]}>
          <LabelList dataKey="rate" position="right" formatter={v => `${v}%`} style={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} />
        </Bar>
      </BarChart>
    </ChartCard>
  );
}

function GA05Chart() {
  return (
    <ChartCard height={200}>
      <BarChart data={ga05Data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="channel" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
        <YAxis tickFormatter={v => `$${v}`} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} />
        <Tooltip formatter={v => `$${v}`} />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        <Bar dataKey="cac" name="CAC" fill={C.red}   />
        <Bar dataKey="ltv" name="LTV" fill={C.green} />
      </BarChart>
    </ChartCard>
  );
}

function GA06Chart() {
  return (
    <ChartCard height={200}>
      <BarChart data={ga06Data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="type" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
        <YAxis yAxisId="left"  tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} label={{ value: 'Session (min)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 10, dx: -2 }} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} label={{ value: 'D7 Retention', angle: 90, position: 'insideRight', fill: 'var(--text-muted)', fontSize: 10, dx: 2 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        <Bar yAxisId="left"  dataKey="sessionLength" name="Avg Session (min)" fill={C.teal}   />
        <Bar yAxisId="right" dataKey="d7Retention"   name="D7 Retention %"   fill={C.yellow} />
      </BarChart>
    </ChartCard>
  );
}

function GA07Chart() {
  return (
    <ChartCard height={200}>
      <AreaChart data={ga07Data} stackOffset="expand" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
        <YAxis tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} />
        <Tooltip formatter={(v, name, props) => {
          const total = props.payload.reduce((s, p) => s + p.value, 0);
          return [`${((v / total) * 100).toFixed(0)}%`, name];
        }} />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        <Area type="monotone" dataKey="organic" name="Organic" stackId="1" stroke={C.green} fill={C.green} fillOpacity={0.6} />
        <Area type="monotone" dataKey="paid"    name="Paid"    stackId="1" stroke={C.red}   fill={C.red}   fillOpacity={0.5} />
      </AreaChart>
    </ChartCard>
  );
}

function GA08Chart() {
  return (
    <ChartCard height={200}>
      <BarChart data={ga08Data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
        <YAxis tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} domain={[0, 80]} />
        <Tooltip formatter={v => `${v}%`} />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        <Bar dataKey="us"    name="US"    fill={C.teal}   />
        <Bar dataKey="latam" name="LatAm" fill={C.yellow} />
      </BarChart>
    </ChartCard>
  );
}

function GA09Chart() {
  return (
    <ChartCard height={200}>
      <BarChart data={ga09Data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="channel" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
        <YAxis yAxisId="left"  tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} label={{ value: 'LTV:CAC', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 10, dx: -2 }} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={v => `$${v}`} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} label={{ value: 'LTV / CAC ($)', angle: 90, position: 'insideRight', fill: 'var(--text-muted)', fontSize: 10, dx: 2 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        <Bar yAxisId="left"  dataKey="ltvCac" name="LTV:CAC Ratio" fill={C.teal}   />
        <Bar yAxisId="right" dataKey="ltv"    name="LTV ($)"       fill={C.green}  />
        <Bar yAxisId="right" dataKey="cac"    name="CAC ($)"       fill={C.red}    />
      </BarChart>
    </ChartCard>
  );
}

function GA10Chart() {
  return (
    <ChartCard height={200}>
      <BarChart data={ga10DeviceData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="device" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
        <YAxis yAxisId="left"  tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} label={{ value: 'Conv Rate %', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 10, dx: -2 }} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} label={{ value: 'Traffic Share %', angle: 90, position: 'insideRight', fill: 'var(--text-muted)', fontSize: 10, dx: 2 }} />
        <Tooltip formatter={v => `${v}%`} />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        <Bar yAxisId="left"  dataKey="convRate" name="Conversion Rate %" fill={C.teal}   />
        <Bar yAxisId="right" dataKey="share"    name="Traffic Share %"  fill={C.yellow} />
      </BarChart>
    </ChartCard>
  );
}

function GA11Chart() {
  return (
    <ChartCard height={210}>
      <LineChart data={ga11Data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
        <YAxis tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} domain={[0, 80]} />
        <Tooltip formatter={v => `${v}%`} />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        <Line type="monotone" dataKey="conversion" name="Paywall Conversion %" stroke={C.yellow} strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="activation"  name="Feature Activation %"  stroke={C.teal}   strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ChartCard>
  );
}

function GA12Chart() {
  return (
    <ChartCard height={200}>
      <BarChart data={ga12Data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
        <YAxis tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} domain={[0, 50]} />
        <Tooltip formatter={v => `${v}%`} />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        <Bar dataKey="us"    name="US (Core)"  fill={C.teal}   />
        <Bar dataKey="latam" name="LatAm"      fill={C.yellow} />
        <Bar dataKey="sea"   name="SEA"        fill={C.blue}   />
      </BarChart>
    </ChartCard>
  );
}

// ── Case chart dispatcher ────────────────────────────────────────────────────

function CaseChart({ caseId }) {
  if (caseId === 'GA01') return <GA01Chart />;
  if (caseId === 'GA02') return <GA02Chart />;
  if (caseId === 'GA03') return <GA03Chart />;
  if (caseId === 'GA04') return <GA04Chart />;
  if (caseId === 'GA05') return <GA05Chart />;
  if (caseId === 'GA06') return <GA06Chart />;
  if (caseId === 'GA07') return <GA07Chart />;
  if (caseId === 'GA08') return <GA08Chart />;
  if (caseId === 'GA09') return <GA09Chart />;
  if (caseId === 'GA10') return <GA10Chart />;
  if (caseId === 'GA11') return <GA11Chart />;
  if (caseId === 'GA12') return <GA12Chart />;
  return null;
}

const DIFF_CFG = {
  analyst: { label: 'Analyst', color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
  senior:  { label: 'Senior',  color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  staff:   { label: 'Staff',   color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
};

const DOMAIN_LABEL = {
  'growth-accounting': 'Growth Accounting',
  'retention':         'Retention',
  'funnel':            'Funnel',
  'ltv':               'LTV',
  'engagement':        'Engagement',
  'acquisition':       'Acquisition',
};

const RATINGS = [
  { id: 'strong',  label: 'Nailed it',          sub: 'Correct diagnosis + showed the calculation' },
  { id: 'partial', label: 'Close',               sub: 'Right direction but missed a key step or number' },
  { id: 'miss',    label: 'Needs more practice', sub: 'Framework or diagnosis was off' },
];

const RATING_STYLE = {
  strong:  { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  partial: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  miss:    { color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)' },
};

const MISSED_KEY = 'pal-missed-v1';

function loadMissed() {
  try { return JSON.parse(localStorage.getItem(MISSED_KEY) || '{}'); } catch { return {}; }
}

function saveMissed(roomId, text) {
  try {
    const d = loadMissed();
    d[roomId] = text;
    localStorage.setItem(MISSED_KEY, JSON.stringify(d));
  } catch {
    // silently fail
  }
}

function buildMarkdown(caseData) {
  const steps = caseData.frameworkSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const takeaways = caseData.keyTakeaways.map(t => `- ${t}`).join('\n');

  return `# ${caseData.title}
*${caseData.subtitle}* | ${caseData.difficulty} | ${caseData.company}

## Situation
${caseData.situation}

## Framework Steps
${steps}

## Model Answer

### Walkthrough
${caseData.modelAnswer.walkthrough}

### Key Diagnosis
${caseData.modelAnswer.keyDiagnosis}

### Recommendation
${caseData.modelAnswer.recommendation}

## Key Takeaways
${takeaways}
`;
}

export function GrowthAnalyticsRunner({ caseId, onBack, onNext, unlocked, onNavigate }) {
  const caseData = growthAnalyticsCases.find(c => c.id === caseId);
  const existing = getGrowthAnalyticsProgress(caseData.id);
  const missedKey = `growth-analytics:${caseData.id}`;

  const [frameworkOpen, setFrameworkOpen] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(!!existing?.rating);
  const [rating, setRating] = useState(existing?.rating || null);

  // Bookmark state
  const [bookmarked, setBookmarked] = useState(() => isBookmarked('growth-analytics', caseData.id));
  useEffect(() => { setBookmarked(isBookmarked('growth-analytics', caseData.id)); }, [caseData.id]);

  // Markdown export toast
  const [copiedToast, setCopiedToast] = useState(false);
  const [revealHovered, setRevealHovered] = useState(false);
  const [exportHovered, setExportHovered] = useState(false);

  // "What did you miss?" state
  const [missedText, setMissedText] = useState(() => loadMissed()[missedKey] || '');
  const [missedSaved, setMissedSaved] = useState(false);
  const [leadershipOpen, setLeadershipOpen] = useState(false);

  const diffCfg = DIFF_CFG[caseData.difficulty] || DIFF_CFG.analyst;

  function handleReveal() {
    setAnswerRevealed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRate(r) {
    setRating(r);
    saveGrowthAnalyticsProgress(caseData.id, r);
    track('case_completed', { room: 'growth-analytics', id: caseData.id, rating: r });
  }

  function handleRetry() {
    setAnswerRevealed(false);
    setRating(null);
    setFrameworkOpen(false);
    setHintsOpen(false);
    setMissedSaved(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBookmarkToggle() {
    toggleBookmark('growth-analytics', caseData.id, caseData.title, caseData.difficulty, caseData.tags);
    setBookmarked(b => !b);
  }

  function handleExportMarkdown() {
    const md = buildMarkdown(caseData);
    navigator.clipboard.writeText(md).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }).catch(() => {
      // fallback: silently ignore clipboard errors
    });
  }

  function handleMissedChange(e) {
    setMissedText(e.target.value);
    setMissedSaved(false);
  }

  function handleMissedSave() {
    saveMissed(missedKey, missedText);
    setMissedSaved(true);
  }

  // Format situation text into paragraphs
  const situationParagraphs = caseData.situation.split('\n\n').filter(Boolean);

  // Show "what did you miss?" for partial or miss ratings only
  const showMissedStep = rating === 'partial' || rating === 'miss';

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Back nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.85rem',
            padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          ← Growth Analytics
        </button>
        <ShareLinkButton room="growth-analytics" />
      </div>

      {/* Case header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex', gap: '0.5rem', marginBottom: '0.5rem',
          flexWrap: 'wrap', alignItems: 'center',
        }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)',
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            {caseData.id}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>·</span>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600,
            color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
            borderRadius: '4px', padding: '0.1rem 0.4rem',
          }}>
            {diffCfg.label}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>·</span>
          <span style={{
            fontSize: '0.72rem', fontWeight: 500,
            color: 'var(--teal)', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
            borderRadius: '4px', padding: '0.1rem 0.4rem',
          }}>
            {DOMAIN_LABEL[caseData.domain] || caseData.domain}
          </span>
          <span style={{
            fontSize: '0.72rem', fontWeight: 500,
            color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
            borderRadius: '4px', padding: '0.1rem 0.4rem',
          }}>
            {caseData.company}
          </span>

          {/* Bookmark toggle button — right side */}
          <button
            onClick={handleBookmarkToggle}
            style={{
              background: bookmarked ? 'var(--purple-bg)' : 'none',
              border: bookmarked ? '1px solid var(--purple-border)' : '1px solid var(--border)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.15rem 0.45rem',
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              color: bookmarked ? 'var(--purple)' : 'var(--text-muted)',
              transition: 'all 0.12s',
            }}
            title={bookmarked ? 'Remove bookmark' : 'Save for later'}
          >
            {bookmarked ? <Icon name="bookmark" size={15} color="var(--purple)" /> : <Icon name="heart" size={15} color="currentColor" />}
            <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>
              {bookmarked ? 'Saved' : 'Save'}
            </span>
          </button>
        </div>

        <h1 style={{
          fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)',
          margin: '0 0 0.3rem', letterSpacing: '-0.02em',
        }}>
          {caseData.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          {caseData.subtitle}
        </p>
      </div>

      {/* Situation */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
        borderRadius: '10px', padding: '1.25rem 1.4rem', marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--teal)', marginBottom: '0.75rem',
        }}>
          The Situation
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {situationParagraphs.map((para, i) => (
            <p key={i} style={{
              color: 'var(--text-secondary)', fontSize: '0.9rem',
              lineHeight: 1.7, margin: 0,
              whiteSpace: 'pre-line',
            }}>
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* Case-specific data visualization */}
      <CaseChart caseId={caseData.id} />

      {/* Framework accordion */}
      <button
        onClick={() => setFrameworkOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: '8px',
          padding: '0.75rem 1rem', cursor: 'pointer', marginBottom: '0.6rem',
          color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 500,
        }}
      >
        {frameworkOpen ? '▾' : '▸'} Framework Steps
        {!frameworkOpen && (
          <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            (scaffolding — expand if you need a starting structure)
          </span>
        )}
      </button>
      {frameworkOpen && (
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '1rem 1.1rem', marginBottom: '0.6rem',
        }}>
          <ol style={{ margin: 0, paddingLeft: '1.3rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
            {caseData.frameworkSteps.map((step, i) => (
              <li key={i} style={{ marginBottom: i < caseData.frameworkSteps.length - 1 ? '0.4rem' : 0 }}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Hints accordion */}
      <button
        onClick={() => setHintsOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: '8px',
          padding: '0.75rem 1rem', cursor: 'pointer', marginBottom: '1.25rem',
          color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 500,
        }}
      >
        {hintsOpen ? '▾' : '▸'} Hints
        {!hintsOpen && (
          <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            (try first, then check)
          </span>
        )}
      </button>
      {hintsOpen && (
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '1rem 1.1rem', marginBottom: '1.25rem',
        }}>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
            {caseData.hints.map((h, i) => (
              <li key={i} style={{ marginBottom: i < caseData.hints.length - 1 ? '0.3rem' : 0 }}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Prompt callout */}
      <div style={{
        background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
        borderRadius: '10px', padding: '1.25rem 1.4rem', marginBottom: '1.5rem',
      }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '0.5rem',
        }}>
          Your Challenge
        </div>
        <p style={{
          color: 'var(--text)', fontSize: '1rem', lineHeight: 1.65,
          margin: 0, fontWeight: 500,
        }}>
          {caseData.prompt}
        </p>
      </div>

      <NotesBox storageKey={`${ROOM_KEY}:${caseData.id}`} />

      {/* Reveal Model Answer button */}
      {!answerRevealed && (
        <button
          onClick={handleReveal}
          onMouseEnter={() => setRevealHovered(true)}
          onMouseLeave={() => setRevealHovered(false)}
          style={{
            width: '100%',
            background: 'var(--yellow)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.85rem 1.5rem',
            fontSize: '0.95rem', fontWeight: 700,
            color: '#1a1400',
            cursor: 'pointer',
            marginBottom: '2rem',
            transition: 'opacity 0.1s',
            opacity: revealHovered ? 0.9 : 1,
          }}
        >
          Reveal Model Answer →
        </button>
      )}

      {/* Answer section */}
      {answerRevealed && (
        <div className="pal-reveal-in">
          {/* Model walkthrough */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem',
          }}>
            <div style={{
              fontWeight: 700, fontSize: '0.82rem', color: 'var(--teal)',
              textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem',
            }}>
              Model Answer — Walkthrough
            </div>
            <p style={{
              color: 'var(--text-secondary)', fontSize: '0.88rem',
              lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap',
            }}>
              {caseData.modelAnswer.walkthrough}
            </p>
          </div>

          {/* Key diagnosis */}
          <div style={{
            background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
            borderRadius: '10px', padding: '1.1rem 1.25rem', marginBottom: '1rem',
          }}>
            <div style={{
              fontWeight: 700, fontSize: '0.78rem', color: 'var(--teal)',
              textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem',
            }}>
              Key Diagnosis
            </div>
            <p style={{ color: 'var(--text)', fontSize: '0.92rem', fontWeight: 600, margin: 0, lineHeight: 1.55 }}>
              {caseData.modelAnswer.keyDiagnosis}
            </p>
          </div>

          {/* Recommendation */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1.1rem 1.25rem', marginBottom: '1rem',
          }}>
            <div style={{
              fontWeight: 700, fontSize: '0.78rem', color: 'var(--green)',
              textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem',
            }}>
              Recommendation
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.65 }}>
              {caseData.modelAnswer.recommendation}
            </p>
          </div>

          {/* Key Takeaways */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem',
          }}>
            <div style={{
              fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-dim)',
              textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem',
            }}>
              Key Takeaways
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
              {caseData.keyTakeaways.map((t, i) => (
                <li key={i} style={{ marginBottom: i < caseData.keyTakeaways.length - 1 ? '0.4rem' : 0 }}>{t}</li>
              ))}
            </ul>
          </div>

          {/* Playbook links */}
          {caseData.playbookLinks && caseData.playbookLinks.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                Related:
              </span>
              {caseData.playbookLinks.map(link => (
                <span
                  key={link.id}
                  style={{
                    fontSize: '0.78rem', fontWeight: 500,
                    color: 'var(--teal)', background: 'var(--teal-bg)',
                    border: '1px solid var(--teal-border)',
                    borderRadius: '20px', padding: '0.2rem 0.65rem',
                  }}
                >
                  {link.label}
                </span>
              ))}
            </div>
          )}

          {/* Markdown export button */}
          <div style={{ marginBottom: '1.5rem', position: 'relative', display: 'inline-block' }}>
            <button
              onClick={handleExportMarkdown}
              onMouseEnter={() => setExportHovered(true)}
              onMouseLeave={() => setExportHovered(false)}
              style={{
                background: 'var(--surface)',
                border: exportHovered ? '1px solid var(--teal-border)' : '1px solid var(--border)',
                borderRadius: '7px', padding: '0.45rem 0.9rem',
                color: exportHovered ? 'var(--teal)' : 'var(--text-muted)',
                fontSize: '0.82rem', fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
                transition: 'border-color 0.1s, color 0.1s',
              }}
            >
              <Icon name="clipboard" size={13} color="currentColor" /> Export as Markdown
            </button>
            {copiedToast && (
              <span style={{
                position: 'absolute', left: '110%', top: '50%', transform: 'translateY(-50%)',
                background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                color: 'var(--green)', borderRadius: '6px',
                padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                Copied!
              </span>
            )}
          </div>

          {/* Self-rating */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem',
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
              How did you do?
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {RATINGS.map(r => {
                const s = RATING_STYLE[r.id];
                const selected = rating === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRate(r.id)}
                    style={{
                      background: selected ? s.bg : 'var(--surface-2)',
                      border: `1px solid ${selected ? s.border : 'var(--border)'}`,
                      borderRadius: '8px', padding: '0.55rem 1rem',
                      color: selected ? s.color : 'var(--text-muted)',
                      fontWeight: selected ? 700 : 500, fontSize: '0.86rem',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {r.label}
                    <div style={{ fontSize: '0.72rem', fontWeight: 400, opacity: 0.8, marginTop: '0.15rem' }}>
                      {r.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leadership Lens toggle */}
          {caseData.leadershipNote && (
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={() => setLeadershipOpen(o => !o)}
                style={{
                  width: '100%', textAlign: 'left',
                  background: leadershipOpen ? 'var(--purple-bg)' : 'var(--surface)',
                  border: leadershipOpen ? '1px solid var(--purple-border)' : '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.65rem 1rem',
                  cursor: 'pointer',
                  color: leadershipOpen ? 'var(--purple)' : 'var(--text-muted)',
                  fontSize: '0.84rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'all 0.12s',
                }}
              >
                <span>{leadershipOpen ? '▾' : '▸'}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Icon name="briefcase" size={14} color="currentColor" /> Leadership Lens</span>
              </button>
              {leadershipOpen && (
                <div style={{
                  borderLeft: '3px solid var(--purple)',
                  background: 'var(--purple-bg)',
                  borderRadius: '0 8px 8px 0',
                  padding: '0.9rem 1.1rem',
                  marginTop: '0.25rem',
                }}>
                  <div style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: 'var(--purple)', marginBottom: '0.45rem',
                  }}>
                    <Icon name="briefcase" size={12} color="var(--purple)" /> How a Staff DS thinks about this
                  </div>
                  <p style={{
                    margin: 0, fontSize: '0.9rem', color: 'var(--text)',
                    lineHeight: 1.7,
                  }}>
                    {caseData.leadershipNote}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Failure Mode */}
          {caseData.failureMode && (
            <div style={{
              background: 'var(--red-bg, #fff5f5)', border: '1px solid var(--border)',
              borderLeft: '3px solid var(--red, #e53e3e)',
              borderRadius: '0 8px 8px 0',
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
            }}>
              <div style={{
                fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.07em', color: 'var(--red, #e53e3e)', marginBottom: '0.75rem',
              }}>
                Failure Mode
              </div>
              <div style={{ marginBottom: '0.6rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Weak answer pattern</div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{caseData.failureMode.weakAnswer}</p>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Interviewer follow-up that exposes it</div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.65, fontStyle: 'italic' }}>{caseData.failureMode.interviewerFollowUp}</p>
              </div>
            </div>
          )}

          {/* "What did you miss?" — only for partial or miss ratings */}
          {showMissedStep && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '1.1rem 1.25rem', marginBottom: '1.5rem',
            }}>
              <label
                style={{
                  display: 'block', fontSize: '0.82rem', fontWeight: 600,
                  color: 'var(--text-muted)', marginBottom: '0.5rem',
                }}
              >
                What concept or detail did you overlook?{' '}
                <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(optional — helps reinforce memory)</span>
              </label>
              <textarea
                rows={3}
                value={missedText}
                onChange={handleMissedChange}
                placeholder="e.g. I forgot to check for seasonality..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: '6px', padding: '0.6rem 0.75rem',
                  color: 'var(--text)', fontSize: '0.87rem', lineHeight: 1.6,
                  resize: 'vertical', fontFamily: 'inherit',
                  outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--teal-border)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={handleMissedSave}
                  style={{
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '0.35rem 0.8rem',
                    color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer',
                  }}
                >
                  Save note
                </button>
                {missedSaved && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>
                    Saved
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleRetry}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '7px', padding: '0.5rem 1rem',
                color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              <Icon name="rotate-ccw" size={14} color="currentColor" /> Try again
            </button>
            <button
              onClick={onBack}
              style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: '7px',
                padding: '0.5rem 1.1rem', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              ← Back to Room
            </button>
            <button
              onClick={() => {
                if (bookmarked) {
                  removeBookmark('growth-analytics', caseData.id);
                  setBookmarked(false);
                } else {
                  addBookmark('growth-analytics', caseData.id, caseData.title, caseData.difficulty, caseData.tags || []);
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
              {bookmarked ? <><Icon name="bookmark" size={14} color="var(--yellow)" /> Saved</> : <><Icon name="bookmark" size={14} color="currentColor" /> Save</>}
            </button>
            {onNext && rating && (
              <button
                onClick={onNext}
                className="pal-glow-pulse"
                style={{
                  background: 'var(--teal)', border: 'none', borderRadius: '7px',
                  padding: '0.5rem 1.2rem', color: '#fff', fontSize: '0.85rem',
                  fontWeight: 600, cursor: 'pointer', marginLeft: 'auto',
                }}
              >
                Next case →
              </button>
            )}
          </div>
          <ForwardPointerCard room='growth-analytics' onNavigate={onNavigate} onNext={onNext} />
        </div>
      )}
    </div>
  );
}
