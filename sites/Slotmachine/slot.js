/* =========================
   EINSTELLUNGEN
========================= */

const symbols = ["🍒", "🍋", "🍊", "🍉", "⭐", "💎", "7️⃣"];

// Gewinnchance pro Spin (0.20 = 20 %)
const winChance = 0.20;

// Gewinn = 4.5 × Einsatz (0.20 × 4.5 = 0.90 → RTP ca. 90 %)
const winMultiplier = 4.5;


/* =========================
   ELEMENTE
========================= */

const machine = document.getElementById("machine");
const balanceElement = document.getElementById("balance");
const betInput = document.getElementById("bet-input");
const spinButton = document.getElementById("spin-btn");
const message = document.getElementById("message");
const currentBetDisplay = document.getElementById("current-bet-display");

// Verhindert, dass balanceUpdate-Events während eines Spins die Steuerung freigeben
let isSpinning = false;

const reels = [
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3")
];


/* =========================
   SPRACHE (DE / EN)
========================= */

const translations = {
    de: {
        pageTitle: "SLOTMACHINE",
        info: "Info",
        home: "Startseite",
        balance: "Guthaben",
        bet: "Einsatz",
        reels: "Walzen",
        selectBet: "Einsatz wählen:",
        reset: "Zurücksetzen",
        spin: "Drehen",
        rulesTitle: "Spielregeln",
        rule1: m => `🎰 Drei gleiche Symbole gewinnen das <strong>${m}-fache</strong> deines Einsatzes.`,
        rule2: "💰 Drei 7️⃣ sind der Jackpot.",
        betPlaceholder: "Einsatz eingeben",
        welcome: "Viel Glück! 🍀",
        invalidBet: "❌ Bitte einen gültigen Einsatz eingeben oder Guthaben prüfen.",
        betPlaced: bet => `🎰 Einsatz: ${bet}$`,
        jackpot: payout => `💰 JACKPOT! 777! +${payout}$!`,
        win: (res, payout) => `🎉 GEWINN! ${res} → +${payout}$!`,
        lose: res => `❌ VERLOREN! ${res}`,
        noBalance: "💸 Kein Guthaben mehr!",
        locale: "de-DE"
    },
    en: {
        pageTitle: "SLOT MACHINE",
        info: "Info",
        home: "Home",
        balance: "Balance",
        bet: "Bet",
        reels: "Reels",
        selectBet: "Choose your bet:",
        reset: "Reset",
        spin: "Spin",
        rulesTitle: "Rules",
        rule1: m => `🎰 Three matching symbols win <strong>${m}×</strong> your bet.`,
        rule2: "💰 Three 7️⃣ are the jackpot.",
        betPlaceholder: "Enter your bet",
        welcome: "Good luck! 🍀",
        invalidBet: "❌ Please enter a valid bet or check your balance.",
        betPlaced: bet => `🎰 Bet: ${bet}$`,
        jackpot: payout => `💰 JACKPOT! 777! +${payout}$!`,
        win: (res, payout) => `🎉 YOU WIN! ${res} → +${payout}$!`,
        lose: res => `❌ YOU LOST! ${res}`,
        noBalance: "💸 No balance left!",
        locale: "en-GB"
    }
};

function t() {
    return translations[CasinoLang.get()] || translations.de;
}

// Aktuelle Nachricht als Funktion speichern, damit sie bei
// Sprachwechsel neu gerendert werden kann
let currentMessage = () => t().welcome;

function setMessage(fn) {
    currentMessage = fn;
    message.textContent = fn();
}

function applyLanguage() {
    const lang = CasinoLang.get();
    const tr = t();
    const $ = id => document.getElementById(id);

    document.documentElement.lang = lang;
    document.title = tr.pageTitle;
    $("title").textContent = tr.pageTitle;
    $("nav-info").textContent = tr.info;
    $("nav-home").textContent = tr.home;
    $("lbl-balance").textContent = tr.balance;
    $("lbl-bet").textContent = tr.bet;
    $("lbl-reels").textContent = tr.reels;
    $("lbl-select-bet").textContent = tr.selectBet;
    $("reset-btn").textContent = tr.reset;
    spinButton.textContent = tr.spin;
    $("lbl-rules").textContent = tr.rulesTitle;
    $("rule-1").innerHTML = tr.rule1(winMultiplier);
    $("rule-2").textContent = tr.rule2;
    betInput.placeholder = tr.betPlaceholder;

    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    message.textContent = currentMessage();

    updateBalance();
    updateBetDisplay();
}

document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        CasinoLang.set(btn.dataset.lang);
        applyLanguage();
    });
});


/* =========================
   ANZEIGEN
========================= */

// balance.js schreibt das Guthaben selbst in #balance (ohne Formatierung),
// deshalb hier keine eigene Formatierung, sonst überschreiben sich beide.
function updateBalance() {
    CasinoBalance.refresh();
}

function updateBetDisplay() {
    currentBetDisplay.textContent =
        Math.floor(Number(betInput.value)) || 0;
}


/* =========================
   EINSATZ-HILFSFUNKTIONEN
   (werden von den Buttons im HTML aufgerufen)
========================= */

function setBet(amount) {
    const balance = CasinoBalance.get();
    const current = Math.floor(Number(betInput.value)) || 0;

    betInput.value = Math.max(1, Math.min(current + amount, balance));
    updateBetDisplay();
}

function resetBet() {
    betInput.value = Math.max(1, Math.min(10, CasinoBalance.get()));
    updateBetDisplay();
}


/* =========================
   ZUFÄLLIGES SYMBOL
========================= */

function randomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}


/* =========================
   EINSATZ AUSLESEN
========================= */

function getBet() {
    // balance.js: getBet liefert 0 bei ungültiger Eingabe.
    // Standard-ID dort ist "bet", unser Feld heißt "bet-input".
    const bet = CasinoBalance.getBet("bet-input");

    // Ungültiger Einsatz
    if (bet < 1) {
        return null;
    }

    // Nicht genug Guthaben
    if (!CasinoBalance.canBet(bet)) {
        return null;
    }

    return bet;
}


/* =========================
   ERGEBNIS ERZEUGEN
   (Gewinnchance = winChance)
========================= */

function generateResult() {

    // Gewinn: alle drei Walzen zeigen dasselbe Symbol
    if (Math.random() < winChance) {
        const s = randomSymbol();
        return [s, s, s];
    }

    // Verlust: so lange würfeln, bis nicht alle drei gleich sind
    let result;

    do {
        result = [randomSymbol(), randomSymbol(), randomSymbol()];
    } while (result[0] === result[1] && result[1] === result[2]);

    return result;
}


/* =========================
   WALZEN
========================= */

function prepareReel(reel) {
    const strip = reel.querySelector(".symbol-strip");

    reel.classList.remove("spinning");
    reel.classList.remove("stop");

    strip.style.transform = "translateY(0)";
}

function startAllReels() {
    reels.forEach(reel => reel.classList.add("spinning"));
}

function stopReel(reel, finalSymbol) {
    return new Promise(resolve => {

        const strip = reel.querySelector(".symbol-strip");
        const symbolElements = strip.querySelectorAll(".symbol");

        // Endsymbol setzen
        symbolElements[0].textContent = finalSymbol;

        // Animation stoppen
        reel.classList.remove("spinning");
        strip.style.transform = "translateY(0)";

        // Stop-Effekt
        reel.classList.add("stop");

        setTimeout(() => {
            reel.classList.remove("stop");
            resolve();
        }, 300);
    });
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/* =========================
   SPIN
========================= */

async function spin() {

    // Einsatz holen
    const bet = getBet();

    if (bet === null) {
        setMessage(() => t().invalidBet);
        return;
    }

    // Einsatz abziehen
    isSpinning = true;
    CasinoBalance.subtract(bet);
    updateBalance();

    // Oberfläche sperren
    spinButton.disabled = true;
    betInput.disabled = true;

    machine.classList.remove("jackpot");
    message.classList.remove("win");

    setMessage(() => t().betPlaced(bet));

    // Ergebnis bestimmen
    const result = generateResult();

    // Walzen vorbereiten und starten
    reels.forEach(prepareReel);
    startAllReels();

    await wait(1800);

    // Walzen nacheinander stoppen
    await stopReel(reels[0], result[0]);
    await wait(180);

    await stopReel(reels[1], result[1]);
    await wait(180);

    await stopReel(reels[2], result[2]);

    // Gewinn prüfen
    const isWin =
        result[0] === result[1] &&
        result[1] === result[2];

    if (isWin) {

        // Abrunden, damit das Guthaben ganzzahlig bleibt
        const payout = Math.floor(bet * winMultiplier);

        CasinoBalance.add(payout);
        updateBalance();

        message.classList.add("win");

        // Jackpot-Effekt für 777
        if (result[0] === "7️⃣") {
            machine.classList.add("jackpot");
            setMessage(() => t().jackpot(payout));
        } else {
            setMessage(() => t().win(result.join(""), payout));
        }

    } else {
        setMessage(() => t().lose(result.join("")));
    }

    // Aktuelles Guthaben
    const currentBalance = CasinoBalance.get();

    // Kein Guthaben mehr
    if (currentBalance <= 0) {
        isSpinning = false;
        spinButton.disabled = true;
        betInput.disabled = false;

        setMessage(() => t().noBalance);
        updateBetDisplay();
        return;
    }

    // Einsatz anpassen
    let currentBet = Math.floor(Number(betInput.value));

    if (!Number.isFinite(currentBet) || currentBet < 1) {
        currentBet = 1;
    }

    if (currentBet > currentBalance) {
        currentBet = currentBalance;
    }

    betInput.value = currentBet;
    updateBetDisplay();

    // Wieder freigeben
    isSpinning = false;
    spinButton.disabled = false;
    betInput.disabled = false;
}


/* =========================
   EVENTS
========================= */

spinButton.addEventListener("click", spin);

// Enter = Spin
betInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && !spinButton.disabled) {
        spin();
    }
});

// Eingabekontrolle (Feld darf leer sein, damit man neu tippen kann)
betInput.addEventListener("input", () => {

    if (betInput.value === "") {
        updateBetDisplay();
        return;
    }

    let value = Math.floor(Number(betInput.value));

    if (!Number.isFinite(value)) {
        return;
    }

    value = Math.max(1, Math.min(value, CasinoBalance.get()));

    betInput.value = value;
    updateBetDisplay();
});


/* =========================
   SYNC MIT balance.js
========================= */

// Guthaben von außen geändert (z. B. /give money in der Konsole)
window.addEventListener("balanceUpdate", () => {
    if (isSpinning) return;

    const balance = CasinoBalance.get();
    const wasEmpty = spinButton.disabled;

    spinButton.disabled = balance <= 0;

    if (balance > 0) {
        const current = Math.floor(Number(betInput.value)) || 1;
        betInput.value = Math.max(1, Math.min(current, balance));

        if (wasEmpty) {
            setMessage(() => t().welcome);
        }
    }

    updateBetDisplay();
});

// Sprache in einem anderen Tab geändert
window.addEventListener("storage", event => {
    if (event.key === "casino_lang") {
        applyLanguage();
    }
});


/* =========================
   START
========================= */

applyLanguage();