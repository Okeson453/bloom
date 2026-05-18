import holdingsService from '../services/holdings.js';

export const chartData = {
  '1M': [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 111, 110, 112, 113, 115, 114, 116, 118, 117, 119, 121],
  '3M': [90, 92, 94, 91, 95, 97, 96, 99, 102, 100, 103, 105, 108, 106, 110, 112, 111, 114, 116, 118, 121],
  '1Y': [70, 72, 75, 73, 78, 82, 80, 85, 88, 86, 90, 93, 96, 94, 98, 103, 101, 106, 110, 115, 121],
  'All': [20, 28, 35, 32, 42, 50, 45, 55, 60, 58, 65, 72, 78, 75, 82, 88, 85, 92, 100, 110, 121]
};

export async function drawChart(data, period = '1M') {
  const path = document.getElementById('chartPath');
  if (!path) return;

  // Try to fetch real performance data
  const result = await holdingsService.getPerformance(period);
  let chartPoints = data;

  if (result.success && result.data && result.data.values) {
    chartPoints = result.data.values;
  }

  const w = 600, h = 160, pad = 10;
  const mn = Math.min(...chartPoints) - 5, mx = Math.max(...chartPoints) + 5;
  const pts = chartPoints.map((v, i) => [
    pad + i * (w - 2 * pad) / (chartPoints.length - 1),
    h - pad - (v - mn) / (mx - mn) * (h - 2 * pad)
  ]);
  const line = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const fill = line + ` L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
  path.setAttribute('d', fill);
}

export function switchPerf(el, period) {
  document.querySelectorAll('.perf-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  drawChart(chartData[period], period);
}