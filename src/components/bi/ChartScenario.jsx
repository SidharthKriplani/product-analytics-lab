import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DebriefCopyButton } from '../shared/DebriefCopyButton.jsx';

const DIFF_CFG = {
  analyst: { label: 'Analyst', color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
  senior: { label: 'Senior', color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  staff: { label: 'Staff', color: 'var(--teal)', bg: 'var(--teal-bg)', border: 'var(--teal-border)' },
};

const DOMAIN_LABEL = {
  'data-storytelling': 'Data Storytelling',
  'dashboard-audit': 'Dashboard Audit',
  'kpi-framework': 'KPI Framework',
  'metric-definition': 'Metric Definition',
  'seasonality': 'Seasonality',
};

function renderChart(config) {
  const { type, data, yAxisDomain, yAxisLeft, yAxisRight, title, yLabel, series, highlightWindow, highlightWeek } = config;

  const containerProps = {
    width: '100%',
    height: 300,
    margin: { top: 10, right: 30, left: 0, bottom: 20 },
  };

  if (type === 'LineChart') {
    return (
      <ResponsiveContainer {...containerProps}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={data[0] && Object.keys(data[0])[0]} />
          <YAxis domain={yAxisDomain} label={{ value: yLabel || 'Value', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="conversionRate" stroke="var(--accent)" dot={{ r: 4 }} name={yLabel || 'Value'} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'BarChart') {
    return (
      <ResponsiveContainer {...containerProps}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="plan" />
          <YAxis domain={yAxisDomain} label={{ value: 'Accounts', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="accounts" fill="var(--accent)" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'AreaChart') {
    return (
      <ResponsiveContainer {...containerProps}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis label={{ value: yLabel || 'Value', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="subs" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} name="Subscribers (M)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'ComposedChart') {
    return (
      <ResponsiveContainer {...containerProps}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={series && series[0] ? Object.keys(data[0])[0] : 'week'} />
          <YAxis yAxisId="left" label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
          {series && series.some(s => s.yAxisId === 'right') && <YAxis yAxisId="right" orientation="right" />}
          <Tooltip />
          <Legend />
          {series && series.map((s, i) => {
            if (s.type === 'Line') return <Line key={i} yAxisId={s.yAxisId || 'left'} type="monotone" dataKey={s.key} stroke={s.stroke || 'var(--accent)'} name={s.name} dot={{ r: 3 }} />;
            if (s.type === 'Bar') return <Bar key={i} yAxisId={s.yAxisId || 'left'} dataKey={s.key} fill="var(--yellow)" name={s.name} />;
            return null;
          })}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  return <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chart type "{type}" not supported</div>;
}

export function ChartScenario({ caseData, onBack, onNext, onRate }) {
  const [revealed, setRevealed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [rating, setRating] = useState(null);
  const diffCfg = DIFF_CFG[caseData.difficulty] || DIFF_CFG.analyst;

  const handleSubmit = (answerId) => {
    setSelectedAnswer(answerId);
    setRevealed(true);
  };

  const handleRating = (ratingId) => {
    setRating(ratingId);
    if (onRate) onRate(ratingId);
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header badges */}
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {caseData.id}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>·</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`, borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
          {diffCfg.label}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>·</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--yellow)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
          {DOMAIN_LABEL[caseData.domain] || caseData.domain}
        </span>
        <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
          {caseData.company}
        </span>
      </div>

      {/* Title */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.4rem', color: 'var(--text)' }}>
        {caseData.title}
      </h2>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        {caseData.subtitle}
      </p>

      {/* Chart */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
        {renderChart(caseData.chartConfig)}
      </div>

      {/* Question */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text)', marginBottom: '1rem' }}>
          {caseData.question}
        </p>

        {/* Answer options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {caseData.answers.map((ans) => {
            const isSelected = selectedAnswer === ans.id;
            const isCorrect = ans.id === caseData.correctAnswer;
            let answerStyle = {
              padding: '0.75rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              cursor: revealed ? 'default' : 'pointer',
              background: 'var(--surface)',
              transition: 'all 200ms ease',
              fontSize: '0.95rem',
            };

            if (revealed) {
              if (isCorrect) {
                answerStyle.borderColor = 'var(--green)';
                answerStyle.background = 'var(--green-bg)';
                answerStyle.color = 'var(--green)';
              } else if (isSelected && !isCorrect) {
                answerStyle.borderColor = 'var(--red)';
                answerStyle.background = 'var(--red-bg)';
                answerStyle.color = 'var(--red)';
              } else {
                answerStyle.opacity = 0.6;
              }
            } else if (isSelected) {
              answerStyle.borderColor = 'var(--accent)';
              answerStyle.background = 'var(--accent-bg)';
            }

            return (
              <button
                key={ans.id}
                onClick={() => !revealed && handleSubmit(ans.id)}
                style={answerStyle}
              >
                <span style={{ display: 'block', textAlign: 'left' }}>
                  {ans.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reveal section */}
      {revealed && (
        <div className="pal-reveal-in" style={{ background: 'var(--discovery)', border: '2px solid var(--discovery)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', opacity: 0.95 }}>
          <div style={{ borderLeft: '4px solid var(--discovery)', paddingLeft: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
              Model Answer
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
              {caseData.modelAnswer.approach}
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              {caseData.modelAnswer.answer}
            </p>

            {caseData.modelAnswer.keyInsights && (
              <div style={{ marginTop: '1rem' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                  Key Insights
                </h5>
                <ul style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '1.5rem', gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                  {caseData.modelAnswer.keyInsights.map((insight, i) => (
                    <li key={i}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Rating */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.75rem' }}>
              How confident are you?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['clear', 'partial', 'unclear'].map((confidence) => (
                <button
                  key={confidence}
                  onClick={() => handleRating(confidence)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: rating === confidence ? 'var(--accent)' : 'var(--surface)',
                    color: rating === confidence ? 'white' : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {confidence === 'clear' && '✓ Clear'}
                  {confidence === 'partial' && '~ Partial'}
                  {confidence === 'unclear' && '✗ Unclear'}
                </button>
              ))}
            </div>
          </div>

          {/* Copy debrief */}
          <div style={{ marginTop: '1.25rem' }}>
            <DebriefCopyButton
              content={`${caseData.id}: ${caseData.title}\n\n${caseData.modelAnswer.answer}`}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
        <button onClick={onBack} style={{ flex: 1, padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!revealed}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: revealed ? 'var(--accent)' : 'var(--surface-2)',
            color: revealed ? 'white' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '6px',
            cursor: revealed ? 'pointer' : 'not-allowed',
            fontWeight: 500,
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
