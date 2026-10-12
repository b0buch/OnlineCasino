// Sprache der Startseite

const translations = {
    de: {
        info: "Info",
        eyebrow: "Online Casino",
        title: "Willkommen bei Purple Panda",
        subtitle: "Wähle ein Spiel – dein Guthaben gilt in allen Spielen.",
        money: "Geld",
        play: "Spielen",
        blackjack: "Blackjack",
        roulette: "Roulette",
        slot: "Slotmachine",
        dice: "Würfelspiel",
        descBlackjack: "Komm so nah wie möglich an 21.",
        descRoulette: "Setze auf Rot, Schwarz oder Grün.",
        descSlot: "Drei gleiche Symbole gewinnen.",
        descDice: "Summe 7 oder Pasch gewinnt.",
        disclaimer: "Nur Spielgeld – kein echtes Geld, keine Auszahlungen."
    },

    en: {
        info: "Info",
        eyebrow: "Online Casino",
        title: "Welcome to Purple Panda",
        subtitle: "Pick a game – your balance is shared across all games.",
        money: "Money",
        play: "Play",
        blackjack: "Blackjack",
        roulette: "Roulette",
        slot: "Slot Machine",
        dice: "Dice Game",
        descBlackjack: "Get as close to 21 as you can.",
        descRoulette: "Bet on red, black or green.",
        descSlot: "Three matching symbols win.",
        descDice: "A total of 7 or a double wins.",
        disclaimer: "Play money only – no real money, no payouts."
    }
};

// Text in ein Element schreiben, aber nur wenn es existiert
// (so stürzt die Seite nicht ab, wenn jemand ein Element entfernt)
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// Nur Beschriftungen übersetzen – NIE #money selbst
function setLanguage(language) {
    const t = translations[language];
    if (!t) return;

    CasinoLang.set(language);
    document.documentElement.lang = language;

    setText("nav-info", t.info);
    setText("eyebrow", t.eyebrow);
    setText("title", t.title);
    setText("subtitle", t.subtitle);
    setText("lbl-money", t.money);
    setText("game-blackjack", t.blackjack);
    setText("game-roulette", t.roulette);
    setText("game-slot", t.slot);
    setText("game-dice", t.dice);
    setText("desc-blackjack", t.descBlackjack);
    setText("desc-roulette", t.descRoulette);
    setText("desc-slot", t.descSlot);
    setText("desc-dice", t.descDice);
    setText("disclaimer", t.disclaimer);

    document.querySelectorAll("[data-play]").forEach(el => {
        el.textContent = t.play;
    });

    CasinoBalance.refresh();
}

setLanguage(CasinoLang.get());