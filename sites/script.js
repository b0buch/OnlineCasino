


// sprache

const translations = {
    de: {
        title: "Online Casino",
        money: "Geld: xxx$",
        blackjack: "Blackjack",
        info: "Info"
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