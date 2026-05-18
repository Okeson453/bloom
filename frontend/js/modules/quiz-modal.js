import onboardingService from '../services/onboarding.js';
import authService from '../services/auth.js';

const quizSteps = [
  { q: 'What is your main investment goal?', opts: ['Build long-term wealth', 'Save for a major purchase', 'Generate passive income', 'Protect my savings'] },
  { q: 'How long can you leave your money invested?', opts: ['Less than 2 years', '2–5 years', '5–10 years', '10+ years'] },
  { q: 'How would you react to a 20% portfolio drop?', opts: ['Sell everything immediately', 'Feel anxious but hold', 'Stay calm and hold', 'Buy more at the dip'] },
  { q: 'What best describes your investing experience?', opts: ['Complete beginner', 'Some knowledge', 'Experienced investor', 'Professional / advisor'] },
];

let quizStep = 0;
let quizAnswers = [];

export function openModal() {
  quizStep = 0;
  quizAnswers = [];
  renderQuizStep();
  const modal = document.getElementById('modal');
  if (modal) modal.classList.add('open');
}

export function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('open');
}

export function closeModalOutside(e) {
  if (e.target.id === 'modal') closeModal();
}

export function renderQuizStep() {
  const pct = ((quizStep + 1) / quizSteps.length) * 100;
  const progress = document.getElementById('quizProgress');
  const content = document.getElementById('quizContent');
  if (progress) progress.style.width = pct + '%';
  if (!content) return;

  if (quizStep >= quizSteps.length) {
    content.innerHTML = `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:3rem;margin-bottom:16px">🎉</div>
        <h3 style="color:var(--text);margin-bottom:8px">Your Match: Balanced Growth</h3>
        <p style="color:var(--text2);font-size:.9rem;margin-bottom:24px">Based on your goals and risk tolerance, we recommend the Balanced Growth portfolio with an expected 12.8% annual return.</p>
        <button class="btn btn-primary btn-lg" onclick="completeQuiz()">Start Investing →</button>
      </div>`;
    return;
  }

  const step = quizSteps[quizStep];
  content.innerHTML = `
    <div class="quiz-q">${step.q}</div>
    <div class="quiz-opts">${step.opts.map((o, i) => `<button class="quiz-opt" onclick="selectQuizOpt(this, ${i})">${o}</button>`).join('')}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px">
      <span style="font-size:.8rem;color:var(--text3)">Step ${quizStep + 1} of ${quizSteps.length}</span>
      ${quizStep > 0 ? `<button class="btn btn-ghost" style="padding:6px 14px;font-size:.8rem" onclick="quizBack()">← Back</button>` : '<span></span>'}
    </div>`;
}

export function selectQuizOpt(el, optionIndex) {
  document.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');

  // Store the answer
  quizAnswers[quizStep] = {
    question: quizSteps[quizStep].q,
    answer: quizSteps[quizStep].opts[optionIndex],
    answerIndex: optionIndex
  };

  setTimeout(() => {
    quizStep++;
    renderQuizStep();
  }, 400);
}

export function quizBack() {
  if (quizStep > 0) {
    quizStep--;
    renderQuizStep();
  }
}

export async function completeQuiz() {
  if (!authService.isLoggedIn()) {
    alert('Please log in to complete onboarding');
    closeModal();
    window.showPage('login', document.querySelector('.nav-links a'));
    return;
  }

  try {
    // Submit quiz answers
    const quizResult = await onboardingService.submitQuiz(quizAnswers);
    if (!quizResult.success) {
      alert(`Quiz submission failed: ${quizResult.error}`);
      return;
    }

    // Complete onboarding with portfolio choice
    const completeResult = await onboardingService.complete({
      portfolioId: 'balanced-growth',
      riskProfile: calculateRiskProfile(quizAnswers)
    });

    if (completeResult.success) {
      alert('Onboarding completed! You can now start investing.');
      closeModal();
      window.showPage('dashboard', document.querySelector('.nav-links a:nth-child(5)'));
    } else {
      alert(`Onboarding completion failed: ${completeResult.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

function calculateRiskProfile(answers) {
  if (!answers || answers.length < 3) return 'balanced';

  const riskScores = [
    answers[0]?.answerIndex || 0,  // Investment goal
    answers[1]?.answerIndex || 0,  // Time horizon
    answers[2]?.answerIndex || 0,  // Risk tolerance
  ];

  const avgRisk = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;

  if (avgRisk < 1) return 'conservative';
  if (avgRisk < 2) return 'moderate';
  if (avgRisk < 3) return 'balanced';
  return 'aggressive';
}