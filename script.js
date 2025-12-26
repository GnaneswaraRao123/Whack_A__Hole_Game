const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

let holes = [];
let lastHole = null;
let score = 0;
let timeUp = true;
let countdown = 30;
let gameTimer = null;
let popTimeout = null;
let audioCtx = null;

/* ---------- Board Setup ---------- */
function createBoard(size = 9) {
  board.innerHTML = "";
  holes = [];

  for (let i = 0; i < size; i++) {
    const hole = document.createElement("div");
    hole.className = "hole";

    const mole = document.createElement("div");
    mole.className = "mole";
    mole.innerHTML = '<div class="eye"></div>';

    hole.appendChild(mole);
    board.appendChild(hole);
    holes.push(hole);

    hole.addEventListener("click", () => {
      if (!mole.classList.contains("up")) return;
      whack(mole);
    });
  }
}

/* ---------- Helpers ---------- */
function randTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole() {
  let hole;
  do {
    hole = holes[Math.floor(Math.random() * holes.length)];
  } while (hole === lastHole);
  lastHole = hole;
  return hole;
}

/* ---------- Game Logic ---------- */
function peep() {
  if (timeUp) return;

  const time = randTime(800, 1500);
  const hole = randomHole();
  const mole = hole.querySelector(".mole");

  mole.classList.add("up");
  playPop();

  popTimeout = setTimeout(() => {
    mole.classList.remove("up");
    peep();
  }, time);
}

function startGame(duration = 30) {
  if (!timeUp) return;

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  score = 0;
  countdown = duration;
  timeUp = false;

  scoreEl.textContent = score;
  timeEl.textContent = countdown;

  startBtn.disabled = true;
  resetBtn.disabled = false;

  peep();

  gameTimer = setInterval(() => {
    countdown--;
    timeEl.textContent = countdown;
    if (countdown <= 0) endGame();
  }, 1000);
}

function endGame() {
  timeUp = true;
  clearInterval(gameTimer);
  clearTimeout(popTimeout);

  startBtn.disabled = false;

  holes.forEach(h => h.querySelector(".mole").classList.remove("up"));

  setTimeout(() => {
    alert("Time up! Your score: " + score);
  }, 100);
}

function resetGame() {
  timeUp = true;
  clearInterval(gameTimer);
  clearTimeout(popTimeout);

  score = 0;
  countdown = 30;

  scoreEl.textContent = score;
  timeEl.textContent = countdown;

  startBtn.disabled = false;
  resetBtn.disabled = true;

  holes.forEach(h => h.querySelector(".mole").classList.remove("up"));
}

function whack(mole) {
  if (!mole.classList.contains("up")) return;

  mole.classList.remove("up");
  mole.classList.add("hit");
  setTimeout(() => mole.classList.remove("hit"), 300);

  score++;
  scoreEl.textContent = score;
  playWhack();
}

/* ---------- Sound ---------- */
function playPop() {
  if (!audioCtx) return;

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.frequency.value = 520;
  g.gain.value = 0.12;

  o.connect(g);
  g.connect(audioCtx.destination);

  o.start();
  o.stop(audioCtx.currentTime + 0.15);
}

function playWhack() {
  if (!audioCtx) return;

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "square";
  o.frequency.value = 150;
  g.gain.value = 0.12;

  o.connect(g);
  g.connect(audioCtx.destination);

  o.start();
  o.stop(audioCtx.currentTime + 0.12);
}

/* ---------- Init ---------- */
createBoard();
resetBtn.disabled = true;

startBtn.addEventListener("click", () => startGame(30));
resetBtn.addEventListener("click", resetGame);

document.addEventListener("keydown", (e) => {
  if (e.key === "1") startGame(40);
  if (e.key === "2") startGame(30);
  if (e.key === "3") startGame(20);
});

