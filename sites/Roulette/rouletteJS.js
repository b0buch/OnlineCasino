// Roulette – nutzt das zentrale Guthaben aus ../balance.js (window.CasinoBalance)

// ------------------------------------------------------------
// HTML-Elemente
// ------------------------------------------------------------
const wheel = document.getElementById("wheel");
const resultEl = document.getElementById("result");
const historyEl = document.getElementById("history");

const balanceEl = document.getElementById("balance");
const currentBetDisplayEl = document.getElementById("current-bet-display");
const betInputEl = document.getElementById("bet-input");
const spinBtn = document.getElementById("spin-btn");
const messageEl = document.getElementById("message");
const choiceButtons = document.querySelectorAll(".choice");

// ------------------------------------------------------------
// Spielzustand
// ------------------------------------------------------------
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const PAYOUT = { red: 2, black: 2, green: 36 };   // Auszahlung inkl. Einsatz
const FREE_BALANCE = 100;
const SPIN_TIME = 2000;

let currentLang = "de";
let currentBet = 10;
let currentChoice = "red";
let spinning = false;
let history = [];

// Letzte Nachricht merken, damit sie beim Sprachwechsel mitübersetzt wird
let lastMessage = null; // { key: "...", params: {...} }

// ------------------------------------------------------------
// Übersetzungen
// ------------------------------------------------------------
const translations = {
  de: {
    title: "ROULETTE",
    home: "Home",
    balance: "Geld",
    bet: "Einsatz",
    result: "Ergebnis",
    history: "Letzte Zahlen:",
    selectBet: "Einsatz wählen:",
    betOn: "Setzen auf:",
    reset: "Zurücksetzen",
    red: "Rot ×2",
    black: "Schwarz ×2",
    green: "Grün (0) ×36",
    spin: "Drehen",
    colorNames: { red: "Rot", black: "Schwarz", green: "Grün" },
    msgNoBet: () => "Bitte platziere einen gültigen Einsatz!",
    msgNoBalance: () => "Nicht genügend Guthaben!",
    msgSpinning: () => "Das Rad dreht sich... 🎰",
    msgWin: p => `${p.number} ${p.color} – Du gewinnst ${p.profit}$! 🎉`,
    msgLose: p => `${p.number} ${p.color} – Du hast ${p.bet}$ verloren. 😢`,
    msgBroke: () => `Pleite! Du hast ${FREE_BALANCE}$ Gratis-Guthaben erhalten.`
  },
  en: {
    title: "ROULETTE",
    home: "Home",
    balance: "Money",
    bet: "Bet",
    result: "Result",
    history: "Last numbers:",
    selectBet: "Choose bet:",
    betOn: "Bet on:",
    reset: "Reset",
    red: "Red ×2",
    black: "Black ×2",
    green: "Green (0) ×36",
    spin: "Spin",
    colorNames: { red: "Red", black: "Black", green: "Green" },
    msgNoBet: () => "Please place a valid bet!",
    msgNoBalance: () => "Not enough funds!",
    msgSpinning: () => "The wheel is spinning... 🎰",
    msgWin: p => `${p.number} ${p.color} – You win ${p.profit}$! 🎉`,
    msgLose: p => `${p.number} ${p.color} – You lost ${p.bet}$. 😢`,
    msgBroke: () => `Broke! You received ${FREE_BALANCE}$ free balance.`
  }
};

// Wichtig: Nur Beschriftungen (<span id="lbl-...">) ändern,
// nie #balance selbst – sonst geht der Kontostand verloren.
function setLanguage(lang) {
  if (!translations[lang]) return;

  currentLang = lang;
  CasinoLang.set(lang);
  document.documentElement.lang = lang;

  const t = translations[lang];
  document.getElementById("title").textContent = t.title;
  document.getElementById("nav-home").textContent = t.home;
  document.getElementById("lbl-balance").textContent = t.balance;
  document.getElementById("lbl-bet").textContent = t.bet;
  document.getElementById("lbl-result").textContent = t.result;
  document.getElementById("lbl-history").textContent = t.history;
  document.getElementById("lbl-select-bet").textContent = t.selectBet;
  document.getElementById("lbl-bet-on").textContent = t.betOn;
  document.getElementById("reset-btn").textContent = t.reset;
  document.getElementById("choice-red").textContent = t.red;
  document.getElementById("choice-black").textContent = t.black;
  document.getElementById("choice-green").textContent = t.green;
  spinBtn.textContent = t.spin;

  renderMessage();
  updateBalanceDisplay();
}

// ------------------------------------------------------------
// Hilfsfunktionen
// ------------------------------------------------------------
function getColor(number) {
  if (number === 0) return "green";
  return redNumbers.includes(number) ? "red" : "black";
}

function updateBalanceDisplay() {
  balanceEl.textContent = CasinoBalance.get();
}

function showMessage(key, params = {}) {
  lastMessage = key ? { key, params } : null;
  renderMessage();
}

function renderMessage() {
  if (!lastMessage) {
    messageEl.textContent = "";
    return;
  }
  const t = translations[currentLang];
  const params = { ...lastMessage.params };
  if (params.colorKey) params.color = t.colorNames[params.colorKey];
  messageEl.textContent = t[lastMessage.key](params);
}

function setControlsDisabled(disabled) {
  spinBtn.disabled = disabled;
  betInputEl.disabled = disabled;
  document.querySelectorAll(".bet-buttons button, .choice").forEach(b => (b.disabled = disabled));
}

function renderHistory() {
  historyEl.innerHTML = "";
  history.forEach(n => {
    const chip = document.createElement("div");
    chip.className = "chip " + getColor(n);
    chip.textContent = n;
    historyEl.appendChild(chip);
  });
}

// ------------------------------------------------------------
// Einsatz
// ------------------------------------------------------------
function readBetInput() {
  const val = parseInt(betInputEl.value, 10);
  return Number.isFinite(val) && val > 0 ? val : 0;
}

betInputEl.addEventListener("input", () => {
  currentBet = readBetInput();
  currentBetDisplayEl.textContent = currentBet;
});

function setBet(amount) {
  if (spinning) return;
  currentBet = readBetInput() + amount;
  const balance = CasinoBalance.get();
  if (currentBet > balance) currentBet = balance;
  betInputEl.value = currentBet;
  currentBetDisplayEl.textContent = currentBet;
}

function resetBet() {
  if (spinning) return;
  currentBet = 0;
  betInputEl.value = 0;
  currentBetDisplayEl.textContent = 0;
}

choiceButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (spinning) return;
    currentChoice = btn.dataset.choice;
    choiceButtons.forEach(b => b.classList.toggle("active", b === btn));
  });
});

// ------------------------------------------------------------
// Drehen
// ------------------------------------------------------------
function spin() {
  if (spinning) return;

  const bet = readBetInput();
  const choice = currentChoice;

  if (bet <= 0) {
    showMessage("msgNoBet");
    return;
  }
  if (!CasinoBalance.canBet(bet)) {
    showMessage("msgNoBalance");
    return;
  }

  spinning = true;
  setControlsDisabled(true);

  // Einsatz sofort vom zentralen Guthaben abziehen
  CasinoBalance.subtract(bet);
  updateBalanceDisplay();

  showMessage("msgSpinning");
  wheel.classList.remove("result-pop");
  wheel.classList.add("rolling");

  // Zufallszahlen während der Animation
  const rolling = setInterval(() => {
    const n = Math.floor(Math.random() * 37);
    resultEl.textContent = n;
    wheel.className = "wheel rolling " + getColor(n);
  }, 100);

  setTimeout(() => {
    clearInterval(rolling);

    // Endergebnis
    const number = Math.floor(Math.random() * 37);
    const color = getColor(number);

    resultEl.textContent = number;
    wheel.className = "wheel result-pop " + color;

    history.unshift(number);
    history = history.slice(0, 8);
    renderHistory();

    if (choice === color) {
      const winnings = bet * PAYOUT[choice];
      CasinoBalance.add(winnings);
      showMessage("msgWin", { number, colorKey: color, profit: winnings - bet });
    } else {
      showMessage("msgLose", { number, colorKey: color, bet });
    }

    // Pleite → wie bei Blackjack Gratis-Guthaben geben
    if (CasinoBalance.get() <= 0) {
      CasinoBalance.set(FREE_BALANCE);
      showMessage("msgBroke");
    }

    // Einsatz darf nicht größer als das Guthaben bleiben
    if (readBetInput() > CasinoBalance.get()) {
      betInputEl.value = CasinoBalance.get();
      currentBet = CasinoBalance.get();
      currentBetDisplayEl.textContent = currentBet;
    }

    updateBalanceDisplay();
    spinning = false;
    setControlsDisabled(false);
  }, SPIN_TIME);
}

spinBtn.addEventListener("click", spin);
betInputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") spin();
});

// ------------------------------------------------------------
// Start
// ------------------------------------------------------------
currentBetDisplayEl.textContent = readBetInput();
setLanguage(CasinoLang.get());