"use strict";

// Würfelspiel – nutzt das zentrale Guthaben aus ../balance.js (window.CasinoBalance)

// ==========================================
// ELEMENTE
// ==========================================
const die1 = document.getElementById("die1");
const die2 = document.getElementById("die2");
const diceTotalEl = document.getElementById("dice-total");

const balanceEl = document.getElementById("balance");
const currentBetDisplayEl = document.getElementById("current-bet-display");
const betInputEl = document.getElementById("bet-input");
const rollBtn = document.getElementById("roll-btn");
const messageEl = document.getElementById("message");

const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");
const streakEl = document.getElementById("streak");

// ==========================================
// SPIELDATEN
// ==========================================
const diceSymbols = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const ROLL_TIME = 900;

let currentLang = "de";
let currentBet = 10;
let rolling = false;
let wins = 0;
let losses = 0;
let streak = 0;

// Letzte Nachricht merken, damit sie beim Sprachwechsel mitübersetzt wird
let lastMessage = null; // { key: "...", params: {...} }

// ==========================================
// ÜBERSETZUNGEN
// ==========================================
const translations = {
  de: {
    title: "WÜRFELSPIEL",
    home: "Home",
    balance: "Geld",
    bet: "Einsatz",
    dice: "Würfel",
    selectBet: "Einsatz wählen:",
    reset: "Zurücksetzen",
    roll: "Würfeln",
    wins: "Gewonnen",
    losses: "Verloren",
    streak: "Gewinnserie",
    rules: "Spielregeln",
    rule1: "🎲 Würfle mit zwei Würfeln.",
    rule2: "⭐ Eine Summe von <strong>7</strong> gibt das <strong>2-fache</strong>.",
    rule3: "🔥 Ein Pasch gibt das <strong>3-fache</strong>.",
    rule4: "💀 Bei allen anderen Ergebnissen verlierst du deinen Einsatz.",
    msgNoBet: () => "Bitte platziere einen gültigen Einsatz!",
    msgNoBalance: () => "Nicht genügend Guthaben!",
    msgRolling: () => "🎲 Die Würfel rollen...",
    msgDouble: p => `🔥 Pasch! ${p.a} + ${p.b} = ${p.total} – Du gewinnst ${p.profit}$!`,
    msgSeven: p => `⭐ ${p.a} + ${p.b} = 7 – Du gewinnst ${p.profit}$!`,
    msgLose: p => `💀 ${p.a} + ${p.b} = ${p.total} – Du hast ${p.bet}$ verloren.`,
  },
  en: {
    title: "DICE GAME",
    home: "Home",
    balance: "Money",
    bet: "Bet",
    dice: "Dice",
    selectBet: "Choose bet:",
    reset: "Reset",
    roll: "Roll",
    wins: "Wins",
    losses: "Losses",
    streak: "Win streak",
    rules: "Rules",
    rule1: "🎲 Roll two dice.",
    rule2: "⭐ A total of <strong>7</strong> pays <strong>2x</strong>.",
    rule3: "🔥 A double pays <strong>3x</strong>.",
    rule4: "💀 Any other result loses your bet.",
    msgNoBet: () => "Please place a valid bet!",
    msgNoBalance: () => "Not enough funds!",
    msgRolling: () => "🎲 Rolling the dice...",
    msgDouble: p => `🔥 Double! ${p.a} + ${p.b} = ${p.total} – You win ${p.profit}$!`,
    msgSeven: p => `⭐ ${p.a} + ${p.b} = 7 – You win ${p.profit}$!`,
    msgLose: p => `💀 ${p.a} + ${p.b} = ${p.total} – You lost ${p.bet}$.`,
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
  document.getElementById("lbl-dice").textContent = t.dice;
  document.getElementById("lbl-select-bet").textContent = t.selectBet;
  document.getElementById("reset-btn").textContent = t.reset;
  document.getElementById("lbl-wins").textContent = t.wins;
  document.getElementById("lbl-losses").textContent = t.losses;
  document.getElementById("lbl-streak").textContent = t.streak;
  document.getElementById("lbl-rules").textContent = t.rules;
  // Regeln enthalten <strong>, deshalb innerHTML (Text kommt nur aus unserem Code)
  document.getElementById("rule-1").innerHTML = t.rule1;
  document.getElementById("rule-2").innerHTML = t.rule2;
  document.getElementById("rule-3").innerHTML = t.rule3;
  document.getElementById("rule-4").innerHTML = t.rule4;
  rollBtn.textContent = t.roll;

  renderMessage();
  updateUI();
}

// ==========================================
// HILFSFUNKTIONEN
// ==========================================
function randomDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function updateUI() {
  balanceEl.textContent = CasinoBalance.get();
  winsEl.textContent = wins;
  lossesEl.textContent = losses;
  streakEl.textContent = streak;
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
  rollBtn.disabled = disabled;
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
  if (rolling) return;
  currentBet = readBetInput() + amount;
  const balance = CasinoBalance.get();
  if (currentBet > balance) currentBet = balance;
  betInputEl.value = currentBet;
  currentBetDisplayEl.textContent = currentBet;
}

function resetBet() {
  if (rolling) return;
  currentBet = 0;
  betInputEl.value = 0;
  currentBetDisplayEl.textContent = 0;
}

// ==========================================
// SPIEL
// ==========================================
function rollDice() {
  if (rolling) return;

  const bet = readBetInput();

  if (bet <= 0) {
    showMessage("msgNoBet");
    return;
  }
  if (!CasinoBalance.canBet(bet)) {
    showMessage("msgNoBalance");
    return;
  }

  rolling = true;
  setControlsDisabled(true);

  // Einsatz sofort vom zentralen Guthaben abziehen
  CasinoBalance.subtract(bet);
  updateUI();

  showMessage("msgRolling");
  die1.classList.remove("result-pop");
  die2.classList.remove("result-pop");
  die1.classList.add("rolling");
  die2.classList.add("rolling");

  // Zufällige Würfel während der Animation
  const interval = setInterval(() => {
    die1.textContent = diceSymbols[randomDice() - 1];
    die2.textContent = diceSymbols[randomDice() - 1];
  }, 80);

  setTimeout(() => {
    clearInterval(interval);

    // Endergebnis
    const a = randomDice();
    const b = randomDice();
    const total = a + b;

    die1.textContent = diceSymbols[a - 1];
    die2.textContent = diceSymbols[b - 1];
    die1.className = "die result-pop";
    die2.className = "die result-pop";
    diceTotalEl.textContent = total;

    if (a === b) {
      // Pasch → 3-fach
      const winnings = bet * 3;
      CasinoBalance.add(winnings);
      wins++;
      streak++;
      showMessage("msgDouble", { a, b, total, profit: winnings - bet });
    } else if (total === 7) {
      // Summe 7 → 2-fach
      const winnings = bet * 2;
      CasinoBalance.add(winnings);
      wins++;
      streak++;
      showMessage("msgSeven", { a, b, total, profit: winnings - bet });
    } else {
      losses++;
      streak = 0;
      showMessage("msgLose", { a, b, total, bet });
    }

    // Einsatz darf nicht größer als das Guthaben bleiben
    if (readBetInput() > CasinoBalance.get()) {
      currentBet = CasinoBalance.get();
      betInputEl.value = currentBet;
      currentBetDisplayEl.textContent = currentBet;
    }

    updateUI();
    rolling = false;
    setControlsDisabled(false);
  }, ROLL_TIME);
}

rollBtn.addEventListener("click", rollDice);
betInputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") rollDice();
});

// ==========================================
// START
// ==========================================
currentBetDisplayEl.textContent = readBetInput();
setLanguage(CasinoLang.get());