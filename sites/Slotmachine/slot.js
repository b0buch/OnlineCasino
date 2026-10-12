"use strict";

// Slotmachine – nutzt das zentrale Guthaben aus ../balance.js (window.CasinoBalance)

// ==========================================
// EINSTELLUNGEN
// ==========================================
const symbols = ["🍒", "🍋", "🍊", "🍉", "⭐", "💎", "7️⃣"];
const WIN_MULTIPLIER = 2;   // Auszahlung inkl. Einsatz bei 3 gleichen
const FREE_BALANCE = 100;
const SPIN_TIME = 1800;     // so lange drehen alle Walzen
const STOP_DELAY = 180;     // Pause zwischen den Walzen

// ==========================================
// ELEMENTE
// ==========================================
const machine = document.getElementById("machine");
const balanceEl = document.getElementById("balance");
const currentBetDisplayEl = document.getElementById("current-bet-display");
const betInputEl = document.getElementById("bet-input");
const spinBtn = document.getElementById("spin-btn");
const messageEl = document.getElementById("message");

const reels = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3")
];

// ==========================================
// SPIELZUSTAND
// ==========================================
let currentLang = "de";
let currentBet = 10;
let spinning = false;

// Letzte Nachricht merken, damit sie beim Sprachwechsel mitübersetzt wird
let lastMessage = null; // { key: "...", params: {...} }

// ==========================================
// ÜBERSETZUNGEN
// ==========================================
const translations = {
  de: {
    title: "SLOTMACHINE",
    home: "Home",
    balance: "Geld",
    bet: "Einsatz",
    reels: "Walzen",
    selectBet: "Einsatz wählen:",
    reset: "Zurücksetzen",
    spin: "Drehen",
    rules: "Spielregeln",
    rule1: "🎰 Drei gleiche Symbole gewinnen das <strong>2-fache</strong> deines Einsatzes.",
    rule2: "💰 Drei 7️⃣ sind der Jackpot.",
    msgNoBet: () => "Bitte platziere einen gültigen Einsatz!",
    msgNoBalance: () => "Nicht genügend Guthaben!",
    msgSpinning: () => "Die Walzen drehen sich... 🎰",
    msgJackpot: p => `💰 JACKPOT! 7️⃣7️⃣7️⃣ – Du gewinnst ${p.profit}$!`,
    msgWin: p => `🎉 ${p.result} – Du gewinnst ${p.profit}$!`,
    msgLose: p => `${p.result} – Du hast ${p.bet}$ verloren. 😢`,
  },
  en: {
    title: "SLOT MACHINE",
    home: "Home",
    balance: "Money",
    bet: "Bet",
    reels: "Reels",
    selectBet: "Choose bet:",
    reset: "Reset",
    spin: "Spin",
    rules: "Rules",
    rule1: "🎰 Three matching symbols pay <strong>2x</strong> your bet.",
    rule2: "💰 Three 7️⃣ is the jackpot.",
    msgNoBet: () => "Please place a valid bet!",
    msgNoBalance: () => "Not enough funds!",
    msgSpinning: () => "The reels are spinning... 🎰",
    msgJackpot: p => `💰 JACKPOT! 7️⃣7️⃣7️⃣ – You win ${p.profit}$!`,
    msgWin: p => `🎉 ${p.result} – You win ${p.profit}$!`,
    msgLose: p => `${p.result} – You lost ${p.bet}$. 😢`,
  }
};

// Nur Beschriftungen ändern – nie #balance selbst
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
  document.getElementById("lbl-reels").textContent = t.reels;
  document.getElementById("lbl-select-bet").textContent = t.selectBet;
  document.getElementById("reset-btn").textContent = t.reset;
  document.getElementById("lbl-rules").textContent = t.rules;
  // Regeln enthalten <strong>, deshalb innerHTML (Text kommt nur aus unserem Code)
  document.getElementById("rule-1").innerHTML = t.rule1;
  document.getElementById("rule-2").innerHTML = t.rule2;
  spinBtn.textContent = t.spin;

  renderMessage();
  updateBalanceDisplay();
}

// ==========================================
// HILFSFUNKTIONEN
// ==========================================
function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  messageEl.textContent = translations[currentLang][lastMessage.key](lastMessage.params);
}

function setControlsDisabled(disabled) {
  spinBtn.disabled = disabled;
  betInputEl.disabled = disabled;
  document.querySelectorAll(".bet-buttons button").forEach(b => (b.disabled = disabled));
}

// ==========================================
// EINSATZ
// ==========================================
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

// ==========================================
// WALZEN
// ==========================================
function startReel(reel) {
  reel.classList.remove("stop");
  reel.classList.add("spinning");
}

async function stopReel(reel, finalSymbol) {
  const strip = reel.querySelector(".symbol-strip");
  strip.querySelector(".symbol").textContent = finalSymbol; // oberstes Feld = Ergebnis

  reel.classList.remove("spinning");
  reel.classList.add("stop");
  await wait(300);
  reel.classList.remove("stop");
}

// ==========================================
// DREHEN
// ==========================================
async function spin() {
  if (spinning) return;

  const bet = readBetInput();

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
  machine.classList.remove("jackpot");
  messageEl.classList.remove("win");

  // Einsatz sofort vom zentralen Guthaben abziehen
  CasinoBalance.subtract(bet);
  updateBalanceDisplay();
  showMessage("msgSpinning");

  // Ergebnis festlegen, dann Walzen nacheinander stoppen
  const result = [randomSymbol(), randomSymbol(), randomSymbol()];

  reels.forEach(startReel);
  await wait(SPIN_TIME);

  for (let i = 0; i < reels.length; i++) {
    await stopReel(reels[i], result[i]);
    if (i < reels.length - 1) await wait(STOP_DELAY);
  }

  // Gewinn prüfen: drei gleiche Symbole
  const isWin = result[0] === result[1] && result[1] === result[2];

  if (isWin) {
    const payout = bet * WIN_MULTIPLIER;
    CasinoBalance.add(payout);
    messageEl.classList.add("win");

    if (result[0] === "7️⃣") {
      machine.classList.add("jackpot");
      showMessage("msgJackpot", { profit: payout - bet });
    } else {
      showMessage("msgWin", { result: result.join(""), profit: payout - bet });
    }
  } else {
    showMessage("msgLose", { result: result.join(""), bet });
  }

  // Einsatz darf nicht größer als das Guthaben bleiben
  if (readBetInput() > CasinoBalance.get()) {
    currentBet = CasinoBalance.get();
    betInputEl.value = currentBet;
    currentBetDisplayEl.textContent = currentBet;
  }

  updateBalanceDisplay();
  spinning = false;
  setControlsDisabled(false);
}

spinBtn.addEventListener("click", spin);
betInputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") spin();
});

// ==========================================
// START
// ==========================================
currentBetDisplayEl.textContent = readBetInput();
setLanguage(CasinoLang.get());