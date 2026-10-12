const translations = {
    de: { title: "Online Casino", money: "Geld",  info: "Info",
          blackjack: "Blackjack", roulette: "Roulette", slot: "Slotmachine",  dice: "Würfelspiel" },
    en: { title: "Online Casino", money: "Money", info: "Info",
          blackjack: "Blackjack", roulette: "Roulette", slot: "Slot Machine", dice: "Dice Game" }
};

// Nur Beschriftungen übersetzen – NIE #money selbst
function setLanguage(language) {
    const t = translations[language];
    if (!t) return;

    CasinoLang.set(language);
    document.documentElement.lang = language;

    document.getElementById("title").textContent = t.title;
    document.getElementById("lbl-money").textContent = t.money;
    document.getElementById("nav-info").textContent = t.info;
    document.getElementById("game-blackjack").textContent = t.blackjack;
    document.getElementById("game-roulette").textContent = t.roulette;
    document.getElementById("game-slot").textContent = t.slot;
    document.getElementById("game-dice").textContent = t.dice;

    CasinoBalance.refresh();
}

setLanguage(CasinoLang.get());