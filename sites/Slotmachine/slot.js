/* =========================
   EINSTELLUNGEN
========================= */

const symbols = [
    "🍒",
    "🍋",
    "🍊",
    "🍉",
    "⭐",
    "💎",
    "7️⃣"
];

/*
    Gewinn = 2 × Einsatz
*/
const winMultiplier = 2;


/* =========================
   ELEMENTE
========================= */

const machine = document.getElementById("machine");

const balanceElement =
    document.getElementById("balance");

const betInput =
    document.getElementById("bet");

const spinButton =
    document.getElementById("spinButton");

const message =
    document.getElementById("message");

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
        pageTitle: "🎰 Slot Machine",
        info: "Info",
        home: "Startseite",
        balance: "Guthaben:",
        bet: "Einsatz",
        betPlaceholder: "Einsatz eingeben",
        welcome: "Viel Glück! 🍀",
        invalidBet: "❌ Bitte einen gültigen Einsatz eingeben oder Guthaben prüfen.",
        betPlaced: bet => `🎰 Einsatz: ${bet} Credits`,
        jackpot: payout => `💰 JACKPOT! 777! +${payout} Credits!`,
        win: (res, payout) => `🎉 GEWINN! ${res} → +${payout} Credits!`,
        lose: res => `❌ VERLOREN! ${res}`,
        noBalance: "💸 Kein Guthaben mehr!",
        locale: "de-DE"
    },
    en: {
        pageTitle: "🎰 Slot Machine",
        info: "Info",
        home: "Home",
        balance: "Balance:",
        bet: "Bet",
        betPlaceholder: "Enter your bet",
        welcome: "Good luck! 🍀",
        invalidBet: "❌ Please enter a valid bet or check your balance.",
        betPlaced: bet => `🎰 Bet: ${bet} Credits`,
        jackpot: payout => `💰 JACKPOT! 777! +${payout} Credits!`,
        win: (res, payout) => `🎉 YOU WIN! ${res} → +${payout} Credits!`,
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

    document.documentElement.lang = lang;
    document.getElementById("page-title").textContent = tr.pageTitle;
    document.title = tr.pageTitle;
    document.getElementById("nav-info").textContent = tr.info;
    document.getElementById("nav-home").textContent = tr.home;
    document.getElementById("lbl-balance").textContent = tr.balance;
    document.getElementById("lbl-bet").textContent = tr.bet;
    betInput.placeholder = tr.betPlaceholder;

    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    message.textContent = currentMessage();

    updateBalance();
}

document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        CasinoLang.set(btn.dataset.lang);
        applyLanguage();
    });
});


/* =========================
   GUTHABEN ANZEIGE
========================= */

function updateBalance() {
    balanceElement.textContent =
        CasinoBalance.get().toLocaleString(t().locale);
}


/* =========================
   ZUFÄLLIGES SYMBOL
========================= */

function randomSymbol() {
    return symbols[
        Math.floor(Math.random() * symbols.length)
    ];
}


/* =========================
   EINSATZ AUSLESEN
========================= */

function getBet() {

    let bet = Number(betInput.value);

    bet = Math.floor(bet);

    // Ungültiger Einsatz
    if (
        !Number.isFinite(bet) ||
        bet < 1
    ) {
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
========================= */

function generateResult() {

    return [
        randomSymbol(),
        randomSymbol(),
        randomSymbol()
    ];

}


/* =========================
   WALZE VORBEREITEN
========================= */

function prepareReel(reel) {

    const strip =
        reel.querySelector(".symbol-strip");

    reel.classList.remove("spinning");
    reel.classList.remove("stop");

    strip.style.transform =
        "translateY(0)";

}


/* =========================
   ALLE WALZEN STARTEN
========================= */

function startAllReels() {

    reels.forEach(reel => {
        reel.classList.add("spinning");
    });

}


/* =========================
   WALZE STOPPEN
========================= */

function stopReel(reel, finalSymbol) {

    return new Promise(resolve => {

        const strip =
            reel.querySelector(".symbol-strip");

        const symbolElements =
            strip.querySelectorAll(".symbol");

        // Endsymbol setzen
        symbolElements[0].textContent =
            finalSymbol;

        // Animation stoppen
        reel.classList.remove("spinning");

        strip.style.transform =
            "translateY(0)";

        // Stop-Effekt
        reel.classList.add("stop");

        setTimeout(() => {

            reel.classList.remove("stop");

            resolve();

        }, 300);

    });

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


    /* =========================
       EINSATZ ABZIEHEN
    ========================= */

    CasinoBalance.subtract(bet);

    updateBalance();


    /* =========================
       OBERFLÄCHE SPERREN
    ========================= */

    spinButton.disabled = true;
    betInput.disabled = true;

    machine.classList.remove("jackpot");
    message.classList.remove("win");

    setMessage(() => t().betPlaced(bet));


    /* =========================
       ERGEBNIS BESTIMMEN
    ========================= */

    const result = generateResult();


    /* =========================
       WALZEN VORBEREITEN
    ========================= */

    reels.forEach(prepareReel);


    /* =========================
       ALLE WALZEN STARTEN
    ========================= */

    startAllReels();


    // Alle Walzen drehen
    await new Promise(resolve => {

        setTimeout(resolve, 1800);

    });


    /* =========================
       WALZE 1 STOPPT
    ========================= */

    await stopReel(
        reels[0],
        result[0]
    );


    await new Promise(resolve => {

        setTimeout(resolve, 180);

    });


    /* =========================
       WALZE 2 STOPPT
    ========================= */

    await stopReel(
        reels[1],
        result[1]
    );


    await new Promise(resolve => {

        setTimeout(resolve, 180);

    });


    /* =========================
       WALZE 3 STOPPT
    ========================= */

    await stopReel(
        reels[2],
        result[2]
    );


    /* =========================
       GEWINN PRÜFEN
    ========================= */

    const isWin =
        result[0] === result[1] &&
        result[1] === result[2];


    /* =========================
       GEWINN
    ========================= */

    if (isWin){

        const payout =
            bet * winMultiplier;


        // Gewinn zum zentralen Guthaben hinzufügen
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

    }


    /* =========================
       VERLUST
    ========================= */

    else {

        setMessage(() => t().lose(result.join("")));

    }


    /* =========================
       AKTUELLES GUTHABEN
    ========================= */

    const currentBalance =
        CasinoBalance.get();


    /* =========================
       EINSATZ ANPASSEN
    ========================= */

    if (currentBalance > 0) {

        let currentBet =
            Number(betInput.value);

        if (
            !Number.isFinite(currentBet) ||
            currentBet < 1
        ) {
            currentBet = 1;
        }

        if (currentBet > currentBalance) {
            currentBet = currentBalance;
        }

        betInput.value = currentBet;

    }


    /* =========================
       KEIN GUTHABEN
    ========================= */

    if (currentBalance <= 0) {

        spinButton.disabled = true;
        betInput.disabled = false;

        setMessage(() => t().noBalance);

        return;
    }


    /* =========================
       WIEDER FREIGEBEN
    ========================= */

    spinButton.disabled = false;
    betInput.disabled = false;

}


/* =========================
   SPIN BUTTON
========================= */

spinButton.addEventListener(
    "click",
    spin
);


/* =========================
   ENTER = SPIN
========================= */

betInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !spinButton.disabled
        ) {
            spin();
        }

    }
);


/* =========================
   EINGABE KONTROLLE
========================= */

betInput.addEventListener(
    "input",
    () => {

        const currentBalance =
            CasinoBalance.get();

        let value =
            Number(betInput.value);

        if (!Number.isFinite(value)) {
            return;
        }

        value = Math.floor(value);

        if (value < 1) {
            value = 1;
        }

        if (value > currentBalance) {
            value = currentBalance;
        }

        betInput.value = value;

    }
);


/* =========================
   START
========================= */

applyLanguage();