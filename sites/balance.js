// balance.js
// Zentrales Guthaben-Management für alle Casino-Spiele

(function () {
    'use strict';

    const STORAGE_KEY = 'casino_balance';
    const DEFAULT_BALANCE = 100;
    const CURRENCY_SYMBOL = '$';
    const CHEAT_PASSWORD = 'sigma123';

    function getBalance() {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored === null) {
            return DEFAULT_BALANCE;
        }

        const balance = parseInt(stored, 10);

        return Number.isFinite(balance) && balance >= 0
            ? balance
            : DEFAULT_BALANCE;
    }

    function saveBalance(balance) {
        localStorage.setItem(STORAGE_KEY, String(balance));
    }

    function updateBalance(newBalance) {
        const validBalance = Math.max(0, Math.floor(Number(newBalance)));

        saveBalance(validBalance);

        dispatchBalanceUpdate(validBalance);

        return validBalance;
    }

    function changeBalance(amount) {
        const current = getBalance();
        return updateBalance(current + Number(amount));
    }

    function dispatchBalanceUpdate(balance) {
        window.dispatchEvent(
            new CustomEvent('balanceUpdate', {
                detail: {
                    balance: balance,
                    currency: CURRENCY_SYMBOL
                }
            })
        );
    }

    function updateBalanceDisplay() {
        const balance = getBalance();

        // #balance
        const balanceElement = document.getElementById('balance');

        if (balanceElement) {
            balanceElement.textContent = balance;
        }

        // #money
        const moneyElement = document.getElementById('money');

        if (moneyElement) {
            moneyElement.textContent = balance;
        }

        // Nur spezielle Elemente mit data-balance aktualisieren
        document.querySelectorAll('[data-balance]').forEach(element => {
            element.textContent = balance;
        });
    }

    function setupStorageListener() {
        window.addEventListener('storage', function (event) {
            if (event.key === STORAGE_KEY) {
                updateBalanceDisplay();
            }
        });
    }

    function setupCustomEventListener() {
        window.addEventListener('balanceUpdate', function () {
            updateBalanceDisplay();
        });
    }

    function getBetFromInput(inputId = 'bet') {
        const input = document.getElementById(inputId);

        if (!input) {
            return 0;
        }

        const bet = parseInt(input.value, 10);

        if (!Number.isFinite(bet) || bet < 1) {
            return 0;
        }

        return bet;
    }

    function canPlaceBet(betAmount) {
        const bet = Number(betAmount);

        return (
            Number.isFinite(bet) &&
            bet > 0 &&
            bet <= getBalance()
        );
    }

    // Command-Handler für Cheat-Commands (/give money ... & /take money ...)
    function handleCheatCommand(commandStr) {
        const giveMatch = commandStr.match(/^\/give\s+money\s+(\d+)\s+password:\s*(.+)$/i);
        const takeMatch = commandStr.match(/^\/take\s+money\s+(\d+)\s+password:\s*(.+)$/i);

        if (giveMatch) {
            const amount = parseInt(giveMatch[1], 10);
            const pass = giveMatch[2].trim();
            if (pass !== CHEAT_PASSWORD) {
                console.error('❌ Falsches Passwort!');
                return;
            }
            changeBalance(amount);
            console.log(`✅ ${amount}${CURRENCY_SYMBOL} hinzugefügt! Neues Guthaben: ${getBalance()}${CURRENCY_SYMBOL}`);
        } else if (takeMatch) {
            const amount = parseInt(takeMatch[1], 10);
            const pass = takeMatch[2].trim();
            if (pass !== CHEAT_PASSWORD) {
                console.error('❌ Falsches Passwort!');
                return;
            }
            changeBalance(-amount);
            console.log(`✅ ${amount}${CURRENCY_SYMBOL} abgezogen! Neues Guthaben: ${getBalance()}${CURRENCY_SYMBOL}`);
        } else {
            console.warn('⚠️ Unbekannter Befehl oder falsches Format.');
            console.log('Nutzung:');
            console.log('/give money <amount> password: <password>');
            console.log('/take money <amount> password: <password>');
        }
    }

    // Globale Funktionen bereitstellen
    window.giveMoney = function (amount, password) {
        handleCheatCommand(`/give money ${amount} password: ${password}`);
    };

    window.takeMoney = function (amount, password) {
        handleCheatCommand(`/take money ${amount} password: ${password}`);
    };

    // Ermöglicht die direkte Eingabe von Strings in der Konsole
    window.cmd = handleCheatCommand;

    window.CasinoBalance = {
        get: getBalance,
        set: updateBalance,
        add: changeBalance,
        subtract: function (amount) {
            return changeBalance(-Number(amount));
        },
        canBet: canPlaceBet,
        getBet: getBetFromInput,
        refresh: updateBalanceDisplay,
        currency: CURRENCY_SYMBOL,
        storageKey: STORAGE_KEY
    };

    // Gemeinsame Sprache für alle Seiten (de / en)
    const LANG_KEY = 'casino_lang';
    const SUPPORTED_LANGS = ['de', 'en'];

    window.CasinoLang = {
        get: function () {
            const lang = localStorage.getItem(LANG_KEY);
            return SUPPORTED_LANGS.includes(lang) ? lang : 'de';
        },
        set: function (lang) {
            if (SUPPORTED_LANGS.includes(lang)) {
                localStorage.setItem(LANG_KEY, lang);
            }
        }
    };

    function init() {
        if (localStorage.getItem(STORAGE_KEY) === null) {
            saveBalance(DEFAULT_BALANCE);
        }

        updateBalanceDisplay();

        setupStorageListener();
        setupCustomEventListener();

        console.log('💰 Casino Balance System initialized');
        console.log('💰 Aktuelles Guthaben:', getBalance());
        console.log('🛠️ Cheat Commands:');
        console.log('   cmd("/give money 100 password: sigma123")');
        console.log('   cmd("/take money 50 password: sigma123")');
        console.log('   oder direkt: giveMoney(100, "sigma123") / takeMoney(50, "sigma123")');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

