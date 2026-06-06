// benchmarkCases.js
// Product Analytics Judgment Benchmark — 5 mini-cases, one per core area.
// Used by BenchmarkPage.jsx. No auth required.
// Rules: single quotes only, apostrophes escaped as \', no template literals.

export const BENCHMARK_CASES = [
  {
    id: 'b01',
    area: 'Metric Design',
    areaId: 'metric-design',
    skillTag: 'Metric Selection',
    difficulty: 'analyst',
    prompt: 'A ride-hailing company tracks "average driver rating given by riders" as their primary driver satisfaction metric. What is the fundamental flaw with this metric?',
    options: [
      'It should use median instead of average — rating distributions are skewed by outliers.',
      'It measures rider perception of drivers, not driver satisfaction with the platform.',
      'Courtesy bias inflates ratings over time, making the trend line unreliable.',
      'It ignores trip volume — a driver with 1 five-star trip outranks one with 100 four-star trips.',
    ],
    correctIdx: 1,
    explanation: 'Rider ratings measure how riders perceive individual trips — not how satisfied drivers are with their earnings, flexibility, support, or working conditions. These are different constructs entirely. Using a rider-facing signal as a proxy for driver experience is the core flaw. The right driver satisfaction signals are driver-reported NPS, driver churn rate, trip decline rate, or inbound support volume from drivers. The other options describe real weaknesses in the metric but none identifies the wrong construct problem, which is the root issue.',
    nextRoom: 'metrics',
    nextRoomLabel: 'Metrics Room',
  },
  {
    id: 'b02',
    area: 'A/B Test Design',
    areaId: 'ab-design',
    skillTag: 'Experiment Design',
    difficulty: 'analyst',
    prompt: 'You plan to test a new checkout flow for 1 week and call success if treatment CVR is 5 percentage points higher than control. What is the most critical flaw in this design?',
    options: [
      '5pp is too aggressive — checkout CVR rarely shifts by more than 1–2pp in a single test.',
      '1 week is insufficient: you need a full weekly cycle and must verify you have the sample size to detect a 5pp lift at 80% power.',
      'Revenue per session should be the primary metric, not CVR.',
      'You need a holdout group in addition to the control.',
    ],
    correctIdx: 1,
    explanation: 'A test starting mid-week does not capture a full Mon–Sun behavioral cycle. Checkout rates differ significantly between weekdays and weekends, so early results are biased by day-of-week composition. Beyond seasonality: for a 5pp absolute lift at 80% power on a typical checkout CVR, many products cannot reach the required sample size in 7 days. Both problems compound — the data is biased by timing and may be insufficient to draw a valid conclusion. Always pre-calculate minimum sample size and align the test window with your product\'s natural weekly cycle.',
    nextRoom: 'stat-foundations',
    nextRoomLabel: 'Stat Foundations',
  },
  {
    id: 'b03',
    area: 'A/B Readout',
    areaId: 'ab-readout',
    skillTag: 'Ship / No-Ship Decision',
    difficulty: 'analyst',
    prompt: 'Test results: Treatment CVR 12.4% vs Control 11.8%, p=0.03. Support ticket rate is 2.1% higher in treatment (p=0.08). Do you ship?',
    options: [
      'Yes — the primary metric is significant. Ship immediately.',
      'No — any guardrail movement is a block. Wait for more data before making any decision.',
      'Ship to 20% traffic and monitor support tickets for 2 more weeks before full rollout.',
      'Rerun the experiment at 2x sample size to get the support ticket metric to significance.',
    ],
    correctIdx: 2,
    explanation: 'p=0.08 on a guardrail does not mean "definitely safe" — it means underpowered, not zero effect. A 2.1% increase in support ticket rate at full scale is a real operational cost. The right call is a staged rollout: ship to 20%, accumulate more observations on the support signal, and make the final call with more data. Option A ignores a real tail risk. Option B over-interprets a non-significant result as a block. Option D wastes time and experiment budget when you already have directional signal. A controlled ramp captures the CVR benefit while managing the downside.',
    nextRoom: 'review',
    nextRoomLabel: 'A/B Review Room',
  },
  {
    id: 'b04',
    area: 'Metrics-Drop RCA',
    areaId: 'rca',
    skillTag: 'Root Cause Analysis',
    difficulty: 'analyst',
    prompt: 'Daily orders dropped 15% week-over-week starting Tuesday. Sessions are flat. What is your first diagnostic move?',
    options: [
      'Check marketing spend and channel data — traffic sources may have shifted even if total sessions look flat.',
      'Decompose: orders = sessions x CVR. Confirm CVR dropped, then segment by platform, device, and category.',
      'Pull the deployment log — a backend change may have broken checkout silently.',
      'Check competitor pricing and promotions launched this week.',
    ],
    correctIdx: 1,
    explanation: 'The problem tells you sessions are flat — this eliminates the traffic acquisition layer. That means conversion dropped. The first move is to confirm the decomposition (orders = sessions x CVR), verify CVR is the driver, then segment CVR by platform (iOS/Android/web), device type, and product category to locate the drop. A sharp single-platform drop suggests a bug. A broad gradual drop suggests a pricing or product change. A category-specific drop points to demand or inventory. You cannot form a valid hypothesis before knowing where the drop is concentrated. Start with the decomposition.',
    nextRoom: 'rca',
    nextRoomLabel: 'RCA Room',
  },
  {
    id: 'b05',
    area: 'SQL Reasoning',
    areaId: 'sql-reasoning',
    skillTag: 'Business Logic',
    difficulty: 'analyst',
    prompt: 'You write: SELECT user_id, AVG(order_value) as avg_order FROM orders GROUP BY user_id. A colleague flags a silent business logic flaw. What is it?',
    options: [
      'AVG() should be written as SUM(order_value) / COUNT(*) for transparency and auditability.',
      'The query includes cancelled and returned orders in the average, distorting the true AOV per user.',
      'GROUP BY user_id needs a matching ORDER BY user_id for consistent result ordering across runs.',
      'COUNT(*) would be more appropriate here — you want volume, not average value.',
    ],
    correctIdx: 1,
    explanation: 'The query runs without error and returns numbers — that is what makes it a silent flaw. Without a WHERE status = \'completed\' filter (or equivalent), cancelled, returned, and refunded orders are included in the AOV calculation. Depending on how the warehouse models these rows (some record cancelled orders at full value, others at $0), the distortion can be significant in either direction. Any financial aggregation must filter on transaction status before computing averages. The other options are either style preferences or incorrect — ordering does not affect GROUP BY aggregation results.',
    nextRoom: 'sql-lab',
    nextRoomLabel: 'SQL Lab',
  },
];

export const AREA_META = {
  'metric-design': { label: 'Metric Design',      color: 'var(--green)',  icon: 'bar-chart'    },
  'ab-design':     { label: 'A/B Test Design',     color: 'var(--accent)', icon: 'flask'        },
  'ab-readout':    { label: 'A/B Readout',         color: 'var(--teal)',   icon: 'check-circle' },
  'rca':           { label: 'Metrics-Drop RCA',    color: 'var(--purple)', icon: 'search'       },
  'sql-reasoning': { label: 'SQL Reasoning',       color: 'var(--yellow)', icon: 'code'         },
};

export const RECOMMENDED_PATH = {
  'metric-design': { room: 'metrics',          label: 'Metrics Room',       why: 'Practice defining and choosing metrics for real product scenarios.' },
  'ab-design':     { room: 'stat-foundations', label: 'Stat Foundations',   why: 'Build the statistical reasoning behind experiment design and power.' },
  'ab-readout':    { room: 'review',           label: 'A/B Review Room',    why: 'Practice reading test results and making ship / no-ship calls.' },
  'rca':           { room: 'rca',              label: 'RCA Room',           why: 'Work through structured root cause cases with layered diagnostics.' },
  'sql-reasoning': { room: 'sql-lab',          label: 'SQL Lab',            why: 'Practice SQL problems with real business logic traps and debriefs.' },
};
