"use strict";

// ==========================================
// SPIELDATEN
// ==========================================

let balance = 1000;
let wins = 0;
let losses = 0;
let streak = 0;
let rolling = false;

// Unicode-Symbole für die Würfel
const diceSymbols = [
    "⚀",
    "⚁",
    "⚂",
    "⚃",
    "⚄",
    "⚅"
];

// ==========================================
// ELEMENTE
// ==========================================

const balanceElement = document.getElementById("balance");
const betInput = document.getElementById("bet");

const die1 = document.getElementById("die1");
const die2 = document.getElementById("die2");

const resultElement = document.getElementById("result");

const rollButton = document.getElementById("rollButton");

const winsElement = document.getElementById("wins");
const lossesElement = document.getElementById("losses");
const streakElement = document.getElementById("streak");

const minusBet = document.getElementById("minusBet");
const plusBet = document.getElementById("plusBet");

const quickBetButtons = document.querySelectorAll("[data-bet]");


// ==========================================
// HILFSFUNKTIONEN
// ==========================================

function randomDice() {
    return Math.floor(Math.random() * 6) + 1;
}


function updateUI() {

    balanceElement.textContent = balance;

    winsElement.textContent = wins;
    lossesElement.textContent = losses;
    streakElement.textContent = streak;

    // Einsatz darf niemals größer als das Guthaben sein
    betInput.max = Math.max(balance, 1);

    if (Number(betInput.value) > balance) {
        betInput.value = balance;
    }
}


// ==========================================
// EINSATZ
// ==========================================

minusBet.addEventListener("click", () => {

    let bet = Number(betInput.value);

    bet -= 10;

    if (bet < 1) {
        bet = 1;
    }

    betInput.value = bet;
});


plusBet.addEventListener("click", () => {

    let bet = Number(betInput.value);

    bet += 10;

    if (bet > balance) {
        bet = balance;
    }

    betInput.value = bet;
});


quickBetButtons.forEach(button => {

    button.addEventListener("click", () => {

        const amount = Number(button.dataset.bet);

        if (amount <= balance) {
            betInput.value = amount;
        } else {
            betInput.value = balance;
        }

    });

});


// ==========================================
// EINSATZ VALIDIEREN
// ==========================================

function getValidBet() {

    let bet = Number(betInput.value);

    if (!Number.isFinite(bet)) {
        return null;
    }

    bet = Math.floor(bet);

    if (bet < 1) {
        return null;
    }

    if (bet > balance) {
        return null;
    }

    return bet;
}


// ==========================================
// WÜRFEL-ANIMATION
// ==========================================

function animateDice() {

    return new Promise(resolve => {

        let animationTime = 900;
        let intervalTime = 80;

        const interval = setInterval(() => {

            const temp1 = randomDice();
            const temp2 = randomDice();

            die1.textContent = diceSymbols[temp1 - 1];
            die2.textContent = diceSymbols[temp2 - 1];

        }, intervalTime);

        setTimeout(() => {

            clearInterval(interval);

            resolve();

        }, animationTime);

    });

}


// ==========================================
// SPIEL
// ==========================================

async function rollDice() {

    if (rolling) {
        return;
    }

    const bet = getValidBet();

    if (bet === null) {

        resultElement.textContent =
            "❌ Ungültiger Einsatz!";

        return;
    }

    if (balance <= 0) {

        resultElement.textContent =
            "💀 Dein Guthaben ist aufgebraucht!";

        return;
    }

    rolling = true;

    rollButton.disabled = true;

    resultElement.textContent =
        "🎲 Die Würfel rollen...";

    // Einsatz zunächst abziehen
    balance -= bet;

    updateUI();

    // Animation
    await animateDice();

    // Endgültige Würfel
    const value1 = randomDice();
    const value2 = randomDice();

    die1.textContent = diceSymbols[value1 - 1];
    die2.textContent = diceSymbols[value2 - 1];

    const total = value1 + value2;

    const isDouble = value1 === value2;
    const isSeven = total === 7;

    // ======================================
    // GEWINN
    // ======================================

    if (isDouble) {

        const multiplier = 3;
        const winnings = bet * multiplier;

        balance += winnings;

        wins++;
        streak++;

        resultElement.textContent =
            `🔥 PASCH! ${value1} + ${value2} = ${total} → +${winnings} Coins`;

    }

    else if (isSeven) {

        const multiplier = 2;
        const winnings = bet * multiplier;

        balance += winnings;

        wins++;
        streak++;

        resultElement.textContent =
            `⭐ GEWINN! ${value1} + ${value2} = 7 → +${winnings} Coins`;

    }

    // ======================================
    // VERLUST
    // ======================================

    else {

        losses++;
        streak = 0;

        resultElement.textContent =
            `💀 Verloren! ${value1} + ${value2} = ${total}`;

    }

    updateUI();

    // Button kurz sperren
    setTimeout(() => {

        rolling = false;
        rollButton.disabled = false;

    }, 300);

}


// ==========================================
// BUTTON
// ==========================================

rollButton.addEventListener("click", rollDice);


// ==========================================
// ENTER-TASTE
// ==========================================

betInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        rollDice();
    }

});


// ==========================================
// START
// ==========================================

updateUI();