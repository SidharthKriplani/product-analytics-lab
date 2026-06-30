// RCA Room — Metric anomaly chart data (fabricated, realistic)
// Each entry: { metric, unit, direction ('up'|'down' = which direction is BAD), data[], anomalyIndex }
// 'unit' appended to y-axis labels. 'direction' controls teal/red coloring.

export const RCA_CHART_DATA = {
  RCA01: {
    metric: 'Checkout Conversion Rate',
    unit: '%',
    direction: 'down',
    anomalyIndex: 6,
    data: [
      { label: 'Mon 8am',  v: 62.3 },
      { label: 'Mon 2pm',  v: 62.6 },
      { label: 'Mon 8pm',  v: 62.1 },
      { label: 'Tue 8am',  v: 62.5 },
      { label: 'Tue 2pm',  v: 62.4 },
      { label: 'Tue 8pm',  v: 62.3 },
      { label: 'Tue 11pm', v: 57.4 },
      { label: 'Wed 8am',  v: 57.1 },
    ],
  },

  RCA02: {
    metric: 'Zero-Result Rate',
    unit: '%',
    direction: 'up',
    anomalyIndex: 5,
    data: [
      { label: 'Thu', v: 4.1 },
      { label: 'Fri', v: 4.3 },
      { label: 'Sat', v: 4.0 },
      { label: 'Sun', v: 4.2 },
      { label: 'Mon', v: 4.1 },
      { label: 'Tue', v: 4.3 },
      { label: 'Wed', v: 11.8 },
    ],
  },

  RCA03: {
    metric: 'Buyer Cancellation Rate',
    unit: '%',
    direction: 'up',
    anomalyIndex: 3,
    data: [
      { label: 'D1',  v: 3.1 },
      { label: 'D2',  v: 3.0 },
      { label: 'D3',  v: 3.1 },
      { label: 'D4',  v: 3.3 },
      { label: 'D5',  v: 3.5 },
      { label: 'D6',  v: 3.7 },
      { label: 'D7',  v: 3.9 },
      { label: 'D8',  v: 4.1 },
      { label: 'D9',  v: 4.2 },
      { label: 'D10', v: 4.3 },
    ],
  },

  RCA04: {
    metric: 'D7 Retention (Push Cohorts)',
    unit: '%',
    direction: 'down',
    anomalyIndex: 5,
    data: [
      { label: 'W−8', v: 41.2 },
      { label: 'W−7', v: 40.8 },
      { label: 'W−6', v: 41.5 },
      { label: 'W−5', v: 40.9 },
      { label: 'W−4', v: 41.1 },
      { label: 'W−3', v: 38.4 },
      { label: 'W−2', v: 37.1 },
      { label: 'W−1', v: 36.0 },
    ],
  },

  RCA05: {
    metric: 'Gross Margin',
    unit: '%',
    direction: 'down',
    anomalyIndex: 2,
    data: [
      { label: 'W1', v: 71.0 },
      { label: 'W2', v: 70.8 },
      { label: 'W3', v: 70.1 },
      { label: 'W4', v: 69.3 },
      { label: 'W5', v: 68.2 },
      { label: 'W6', v: 67.0 },
      { label: 'W7', v: 65.6 },
      { label: 'W8', v: 64.0 },
    ],
  },

  RCA06: {
    metric: 'Repeat Contact Rate',
    unit: '%',
    direction: 'up',
    anomalyIndex: 2,
    data: [
      { label: 'W−2',  v: 8.1 },
      { label: 'W−1',  v: 8.0 },
      { label: 'W1',   v: 9.4 },
      { label: 'W2',   v: 11.8 },
      { label: 'W3',   v: 14.2 },
      { label: 'W4',   v: 16.4 },
      { label: 'W5',   v: 18.1 },
      { label: 'W6',   v: 19.0 },
    ],
  },

  RCA07: {
    metric: 'Seller Fraud Rate',
    unit: '%',
    direction: 'up',
    anomalyIndex: 3,
    data: [
      { label: 'D−3', v: 0.78 },
      { label: 'D−2', v: 0.81 },
      { label: 'D−1', v: 0.79 },
      { label: 'D0',  v: 1.24 },
      { label: 'D+1', v: 2.11 },
      { label: 'D+2', v: 2.78 },
      { label: 'D+3', v: 3.10 },
    ],
  },

  RCA08: {
    metric: 'DAU',
    unit: 'M',
    direction: 'down',
    anomalyIndex: 3,
    data: [
      { label: 'D−3', v: 4.08 },
      { label: 'D−2', v: 4.12 },
      { label: 'D−1', v: 4.10 },
      { label: 'D0',  v: 4.01 },
      { label: 'D+1', v: 3.95 },
      { label: 'D+2', v: 3.87 },
      { label: 'D+3', v: 3.82 },
      { label: 'D+4', v: 3.79 },
      { label: 'D+5', v: 3.77 },
    ],
  },

  RCA09: {
    metric: 'MRR Growth Rate',
    unit: '% MoM',
    direction: 'down',
    anomalyIndex: 2,
    data: [
      { label: 'M−5', v: 4.1 },
      { label: 'M−4', v: 4.2 },
      { label: 'M−3', v: 3.4 },
      { label: 'M−2', v: 2.2 },
      { label: 'M−1', v: 1.3 },
      { label: 'M0',  v: 0.8 },
    ],
  },

  RCA10: {
    metric: 'Monthly Account Churn',
    unit: '%',
    direction: 'up',
    anomalyIndex: 5,
    data: [
      { label: 'M−5', v: 1.7 },
      { label: 'M−4', v: 1.8 },
      { label: 'M−3', v: 1.9 },
      { label: 'M−2', v: 1.8 },
      { label: 'M−1', v: 1.8 },
      { label: 'M0',  v: 4.1 },
    ],
  },

  RCA11: {
    metric: 'Ad Revenue per DAU',
    unit: '$',
    direction: 'down',
    anomalyIndex: 2,
    data: [
      { label: 'D1',  v: 0.180 },
      { label: 'D4',  v: 0.178 },
      { label: 'D7',  v: 0.175 },
      { label: 'D10', v: 0.170 },
      { label: 'D13', v: 0.163 },
      { label: 'D16', v: 0.156 },
      { label: 'D19', v: 0.149 },
      { label: 'D21', v: 0.143 },
    ],
  },

  RCA12: {
    metric: 'New Creator 7-Day Retention',
    unit: '%',
    direction: 'down',
    anomalyIndex: 2,
    data: [
      { label: 'W−1', v: 38.2 },
      { label: 'W1',  v: 37.8 },
      { label: 'W2',  v: 36.2 },
      { label: 'W3',  v: 34.6 },
      { label: 'W4',  v: 32.0 },
      { label: 'W5',  v: 30.3 },
      { label: 'W6',  v: 28.8 },
      { label: 'W7',  v: 27.2 },
    ],
  },

  RCA13: {
    metric: 'Push Notification CTR',
    unit: '%',
    direction: 'down',
    anomalyIndex: 1,
    data: [
      { label: 'D0', v: 8.2 },
      { label: 'D1', v: 7.8 },
      { label: 'D2', v: 7.2 },
      { label: 'D3', v: 6.6 },
      { label: 'D4', v: 6.1 },
      { label: 'D5', v: 5.6 },
      { label: 'D6', v: 5.2 },
      { label: 'D7', v: 4.9 },
    ],
  },

  RCA14: {
    metric: 'API Error Rate (5xx)',
    unit: '%',
    direction: 'up',
    anomalyIndex: 4,
    data: [
      { label: '10:00', v: 0.29 },
      { label: '11:00', v: 0.31 },
      { label: '12:00', v: 0.30 },
      { label: '13:00', v: 0.28 },
      { label: '14:00', v: 0.90 },
      { label: '15:00', v: 0.91 },
      { label: '15:30', v: 0.89 },
    ],
  },

  RCA15: {
    metric: 'MRR Growth Rate',
    unit: '% MoM',
    direction: 'down',
    anomalyIndex: 1,
    data: [
      { label: 'M−3', v: 8.1 },
      { label: 'M−2', v: 5.9 },
      { label: 'M−1', v: 3.8 },
      { label: 'M0',  v: 2.1 },
    ],
  },

  RCA16: {
    metric: 'Search-to-Purchase CVR',
    unit: ' idx',
    direction: 'down',
    anomalyIndex: 3,
    data: [
      { label: 'D−4', v: 100.0 },
      { label: 'D−3', v: 99.8  },
      { label: 'D−2', v: 99.5  },
      { label: 'D−1', v: 99.2  },
      { label: 'D0',  v: 95.3  },
      { label: 'D+1', v: 93.1  },
      { label: 'D+2', v: 91.4  },
      { label: 'D+3', v: 89.0  },
    ],
  },

  RCA17: {
    metric: 'D7 Retention (Post-Redesign Cohorts)',
    unit: '%',
    direction: 'down',
    anomalyIndex: 4,
    data: [
      { label: 'Pre W4', v: 38.2 },
      { label: 'Pre W3', v: 37.9 },
      { label: 'Pre W2', v: 38.4 },
      { label: 'Pre W1', v: 37.8 },
      { label: 'Post W1', v: 32.4 },
      { label: 'Post W2', v: 30.9 },
      { label: 'Post W3', v: 30.2 },
    ],
  },

  RCA18: {
    metric: 'Ad Revenue',
    unit: ' idx',
    direction: 'down',
    anomalyIndex: 4,
    data: [
      { label: 'Dec 28', v: 100  },
      { label: 'Dec 29', v: 98   },
      { label: 'Dec 30', v: 96   },
      { label: 'Dec 31', v: 102  },
      { label: 'Jan 1',  v: 78   },
      { label: 'Jan 2',  v: 79   },
      { label: 'Jan 3',  v: 80   },
    ],
  },

  RCA19: {
    metric: 'New User Activation Rate',
    unit: '%',
    direction: 'down',
    anomalyIndex: 1,
    data: [
      { label: 'Global', v: 24.0 },
      { label: 'W1',     v: 13.2 },
      { label: 'W2',     v: 12.8 },
      { label: 'W3',     v: 12.4 },
      { label: 'W4',     v: 12.1 },
      { label: 'W5',     v: 11.8 },
      { label: 'W6',     v: 12.0 },
    ],
  },

  RCA20: {
    metric: 'Gross Margin',
    unit: '%',
    direction: 'down',
    anomalyIndex: 1,
    data: [
      { label: 'M1', v: 74.1 },
      { label: 'M2', v: 73.3 },
      { label: 'M3', v: 71.6 },
      { label: 'M4', v: 70.0 },
      { label: 'M5', v: 68.0 },
      { label: 'M6', v: 66.0 },
    ],
  },

  RCA21: {
    metric: 'Audio Rooms Engagement Rate',
    unit: '%',
    direction: 'down',
    anomalyIndex: 1,
    data: [
      { label: 'W1', v: 62 },
      { label: 'W2', v: 48 },
      { label: 'W3', v: 34 },
      { label: 'W4', v: 21 },
      { label: 'W5', v: 13 },
      { label: 'W6', v: 8  },
    ],
  },

  RCA22: {
    metric: 'Payment Success Rate (Brazil)',
    unit: '%',
    direction: 'down',
    anomalyIndex: 4,
    data: [
      { label: '22:00', v: 88.2 },
      { label: '23:00', v: 88.4 },
      { label: '00:00', v: 88.1 },
      { label: '01:00', v: 88.3 },
      { label: '02:00', v: 47.2 },
      { label: '03:00', v: 47.4 },
      { label: '04:00', v: 47.1 },
    ],
  },

  RCA23: {
    metric: 'NPS Score',
    unit: '',
    direction: 'down',
    anomalyIndex: 1,
    data: [
      { label: 'M1', v: 42 },
      { label: 'M2', v: 40 },
      { label: 'M3', v: 38 },
      { label: 'M4', v: 36 },
      { label: 'M5', v: 33 },
      { label: 'M6', v: 30 },
    ],
  },

  RCA24: {
    metric: 'Recommendation Engine CTR',
    unit: '%',
    direction: 'down',
    anomalyIndex: 2,
    data: [
      { label: 'D−2',    v: 8.42 },
      { label: 'D−1',    v: 8.38 },
      { label: 'Deploy', v: 6.79 },
      { label: 'D+1',    v: 6.82 },
      { label: 'D+2',    v: 6.78 },
    ],
  },

  RCA25: {
    metric: 'Seller Active Rate',
    unit: ' idx',
    direction: 'down',
    anomalyIndex: 3,
    data: [
      { label: 'M−3', v: 100 },
      { label: 'M−2', v: 101 },
      { label: 'M−1', v: 99  },
      { label: 'M0',  v: 86  },
    ],
  },

  RCA26: {
    metric: 'Net Revenue',
    unit: ' idx',
    direction: 'down',
    anomalyIndex: 3,
    data: [
      { label: 'M−3', v: 100 },
      { label: 'M−2', v: 103 },
      { label: 'M−1', v: 101 },
      { label: 'M0',  v: 82  },
    ],
  },

  RCA27: {
    metric: 'Daily Orders',
    unit: ' idx',
    direction: 'down',
    anomalyIndex: 3,
    data: [
      { label: 'W−3', v: 100 },
      { label: 'W−2', v: 99  },
      { label: 'W−1', v: 101 },
      { label: 'W0',  v: 86  },
    ],
  },

  RCA28: {
    metric: 'Return-to-Origin Rate (Tier 2/3)',
    unit: '%',
    direction: 'up',
    anomalyIndex: 3,
    data: [
      { label: 'W−4', v: 18.1 },
      { label: 'W−3', v: 17.9 },
      { label: 'W−2', v: 18.2 },
      { label: 'W−1', v: 20.4 },
      { label: 'W0',  v: 23.8 },
      { label: 'W+1', v: 26.4 },
      { label: 'W+2', v: 27.1 },
    ],
  },
};
