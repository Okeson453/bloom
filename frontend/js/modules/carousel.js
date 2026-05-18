let testiIdx = 0;
let intervalId = null;

export function initCarousel() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => goTesti((testiIdx + 1) % 3), 4200);
}

export function goTesti(i) {
  testiIdx = i;
  const track = document.getElementById('testiTrack');
  const dots = document.querySelectorAll('.testi-dot');
  if (track) track.style.transform = `translateX(-${i * 100}%)`;
  dots.forEach((d, j) => d.classList.toggle('active', j === i));
}