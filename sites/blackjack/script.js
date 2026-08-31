const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerCards = [];
let dealerCards = [];
let gameOver = true;

// Geld-System Variablen
let balance = 100;
let currentBet = 10;

const balanceEl = document.getElementById('balance');
const currentBetDisplayEl = document.getElementById('current-bet-display');
const betInputEl = document.getElementById('bet-input');
const startBtn = document.getElementById('start-btn');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const messageEl = document.getElementById('message');

// Synchronisiere Eingabefeld mit Klicks
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

  if (currentBet <= 0) {
    messageEl.innerText = 'Bitte platziere einen Einsatz!';
    return;
  }
  if (currentBet > balance) {
    messageEl.innerText = 'Nicht genügend Guthaben!';
    return;
  }

  // Einsatz wird zu Spielbeginn abgezogen
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

  // Sofortiger Blackjack-Check
  if (calculateScore(playerCards) === 21) {
    endGame('Blackjack! Du gewinnst 1.5x deinen Einsatz!', balance + currentBet * 2.5);
  }
}

function hit() {
  if (gameOver) return;
  playerCards.push(deck.pop());
  updateUI();

  if (calculateScore(playerCards) > 21) {
    endGame('Überkauft! Du hast deinen Einsatz verloren.', balance); // Einsatz verloren
  }
}

function stand() {
  if (gameOver) return;

  // Dealer zieht bis 17
  while (calculateScore(dealerCards) < 17) {
    dealerCards.push(deck.pop());
  }
  updateUI();

  const pScore = calculateScore(playerCards);
  const dScore = calculateScore(dealerCards);

  // GELD-AUSGABE LOGIK
  if (dScore > 21) {
    // Dealer überkauft -> Gewonnen (Einsatz verdoppeln)
    endGame('Dealer hat sich überkauft! Du gewinnst!', balance + (currentBet * 2));
  } else if (pScore > dScore) {
    // Spieler gewinnt -> Einsatz verdoppeln
    endGame('Höhere Punktzahl! Du gewinnst!', balance + (currentBet * 2));
  } else if (dScore > pScore) {
    // Dealer gewinnt -> Einsatz weg (Guthaben bleibt wie es ist)
    endGame('Der Dealer gewinnt.', balance);
  } else {
    // Unentschieden -> Einsatz zurück
    endGame('Unentschieden! Einsatz zurück.', balance + currentBet);
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

  // Prüfen ob pleite
  if (balance <= 0) {
    messageEl.innerText = 'Pleite! Du hast 100€ Gratis-Guthaben erhalten.';
    balance = 100;
  }

  updateUI();
}