const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerCards = [];
let dealerCards = [];
let gameOver = true;
let currentLang = 'de';

let balance = 100;
let currentBet = 10;

const balanceEl = document.getElementById('balance');
const currentBetDisplayEl = document.getElementById('current-bet-display');
const betInputEl = document.getElementById('bet-input');
const startBtn = document.getElementById('start-btn');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const messageEl = document.getElementById('message');

// Sprachübersetzungen
const translations = {
  de: {
    title: "BLACKJACK",
    balance: "Geld",
    bet: "Einsatz",
    dealer: "Dealer",
    player: "Spieler",
    selectBet: "Einsatz wählen:",
    reset: "Zurücksetzen",
    startRound: "Runde Starten",
    hit: "Karte Ziehen",
    stand: "Halten",
    msgNoBet: "Bitte platziere einen Einsatz!",
    msgNoBalance: "Nicht genügend Guthaben!",
    msgBlackjack: "Blackjack! Du gewinnst 1.5x deinen Einsatz!",
    msgBust: "Überkauft! Du hast deinen Einsatz verloren.",
    msgDealerBust: "Dealer hat sich überkauft! Du gewinnst!",
    msgWin: "Höhere Punktzahl! Du gewinnst!",
    msgDealerWin: "Der Dealer gewinnt.",
    msgDraw: "Unentschieden! Einsatz zurück.",
    msgBroke: "Pleite! Du hast 100€ Gratis-Guthaben erhalten."
  },
  en: {
    title: "BLACKJACK",
    balance: "Money",
    bet: "Bet",
    dealer: "Dealer",
    player: "Player",
    selectBet: "Choose bet:",
    reset: "Reset",
    startRound: "Start Round",
    hit: "Hit",
    stand: "Stand",
    msgNoBet: "Please place a bet!",
    msgNoBalance: "Not enough funds!",
    msgBlackjack: "Blackjack! You win 1.5x your bet!",
    msgBust: "Bust! You lost your bet.",
    msgDealerBust: "Dealer busted! You win!",
    msgWin: "Higher score! You win!",
    msgDealerWin: "Dealer wins.",
    msgDraw: "Tie! Bet returned.",
    msgBroke: "Broke! You received 100€ free balance."
  }
};

function setLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];

  document.getElementById("title").textContent = t.title;
  document.getElementById("lbl-balance").textContent = t.balance;
  document.getElementById("lbl-bet").textContent = t.bet;
  document.getElementById("dealer-title").textContent = t.dealer;
  document.getElementById("player-title").textContent = t.player;
  document.getElementById("lbl-select-bet").textContent = t.selectBet;
  document.getElementById("reset-btn").textContent = t.reset;
  startBtn.textContent = t.startRound;
  hitBtn.textContent = t.hit;
  standBtn.textContent = t.stand;
}

betInputEl.addEventListener('input', (e) => {
  let val = parseInt(e.target.value) || 0;
  currentBet = val;
  currentBetDisplayEl.innerText = currentBet;
});

function setBet(amount) {
  if (!gameOver) return;
  currentBet += amount;
  if (currentBet > balance) currentBet = balance;
  betInputEl.value = currentBet;
  currentBetDisplayEl.innerText = currentBet;
}

function resetBet() {
  if (!gameOver) return;
  currentBet = 0;
  betInputEl.value = 0;
  currentBetDisplayEl.innerText = 0;
}

function createDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function getCardValue(card) {
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
}

function calculateScore(cards) {
  let score = 0;
  let aces = 0;
  for (let card of cards) {
    score += getCardValue(card);
    if (card.value === 'A') aces++;
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

function renderCard(card, targetEl) {
  const cardEl = document.createElement('div');
  const isRed = card.suit === '♥' || card.suit === '♦';
  cardEl.className = `card ${isRed ? 'red' : ''}`;
  cardEl.innerHTML = `<div>${card.value}</div><div>${card.suit}</div>`;
  targetEl.appendChild(cardEl);
}

function updateUI() {
  const pCardsEl = document.getElementById('player-cards');
  const dCardsEl = document.getElementById('dealer-cards');
  pCardsEl.innerHTML = '';
  dCardsEl.innerHTML = '';

  playerCards.forEach(c => renderCard(c, pCardsEl));
  dealerCards.forEach(c => renderCard(c, dCardsEl));

  document.getElementById('player-score').innerText = calculateScore(playerCards);
  document.getElementById('dealer-score').innerText = calculateScore(dealerCards);
  balanceEl.innerText = balance;
}

function startGame() {
  currentBet = parseInt(betInputEl.value) || 0;
  const t = translations[currentLang];

  if (currentBet <= 0) {
    messageEl.innerText = t.msgNoBet;
    return;
  }
  if (currentBet > balance) {
    messageEl.innerText = t.msgNoBalance;
    return;
  }

  balance -= currentBet;
  gameOver = false;

  createDeck();
  playerCards = [deck.pop(), deck.pop()];
  dealerCards = [deck.pop()];
  
  hitBtn.disabled = false;
  standBtn.disabled = false;
  startBtn.disabled = true;
  betInputEl.disabled = true;
  messageEl.innerText = '';

  updateUI();

  if (calculateScore(playerCards) === 21) {
    endGame(t.msgBlackjack, balance + currentBet * 2.5);
  }
}

function hit() {
  if (gameOver) return;
  playerCards.push(deck.pop());
  updateUI();

  if (calculateScore(playerCards) > 21) {
    endGame(translations[currentLang].msgBust, balance);
  }
}

function stand() {
  if (gameOver) return;

  while (calculateScore(dealerCards) < 17) {
    dealerCards.push(deck.pop());
  }
  updateUI();

  const pScore = calculateScore(playerCards);
  const dScore = calculateScore(dealerCards);
  const t = translations[currentLang];

  if (dScore > 21) {
    endGame(t.msgDealerBust, balance + (currentBet * 2));
  } else if (pScore > dScore) {
    endGame(t.msgWin, balance + (currentBet * 2));
  } else if (dScore > pScore) {
    endGame(t.msgDealerWin, balance);
  } else {
    endGame(t.msgDraw, balance + currentBet);
  }
}

function endGame(msg, newBalance) {
  gameOver = true;
  balance = newBalance;
  
  messageEl.innerText = msg;
  hitBtn.disabled = true;
  standBtn.disabled = true;
  startBtn.disabled = false;
  betInputEl.disabled = false;

  if (balance <= 0) {
    messageEl.innerText = translations[currentLang].msgBroke;
    balance = 100;
  }

  updateUI();
}





// sprache

const translations = {
    de: {
        title: "Online Casino",
        balance-box: "Money:",
        blackjack: "Blackjack",
        info: "Info",
    },

    en: {
        title: "Online Casino",
        money: "Money: xxx$",
        blackjack: "Blackjack",
        info: "Info"
    }
};

function setLanguage(language) {
    document.getElementById("title").textContent =
        translations[language].title;

    document.getElementById("money").textContent =
        translations[language].money;

    document.getElementById("blackjack").textContent =
        translations[language].blackjack;
}