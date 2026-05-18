export function initCalculator() {
  updateCalc();
}

export function updateCalc() {
  const amtEl = document.getElementById('calcAmt');
  const yrsEl = document.getElementById('calcYrs');
  if (!amtEl || !yrsEl) return;

  const amt = +amtEl.value;
  const yrs = +yrsEl.value;

  const displayAmt = document.getElementById('calcAmtDisplay');
  const displayYrs = document.getElementById('calcYrsDisplay');
  const result = document.getElementById('calcResult');

  if (displayAmt) displayAmt.textContent = amt.toLocaleString();
  if (displayYrs) displayYrs.textContent = yrs;

  const rate = 0.08;
  const months = yrs * 12;
  const val = amt * ((Math.pow(1 + rate / 12, months) - 1) / (rate / 12));

  if (result) result.textContent = '$' + Math.round(val).toLocaleString();
}