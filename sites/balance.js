// balance.js
// Zentrales Guthaben-Management für alle Casino-Spiele

(function () {
    'use strict';

    const STORAGE_KEY = 'casino_balance';
    const DEFAULT_BALANCE = 100;
    const CURRENCY_SYMBOL = '$';

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

    function init() {
        if (localStorage.getItem(STORAGE_KEY) === null) {
            saveBalance(DEFAULT_BALANCE);
        }

        updateBalanceDisplay();

        setupStorageListener();
        setupCustomEventListener();

        console.log('💰 Casino Balance System initialized');
        console.log('💰 Aktuelles Guthaben:', getBalance());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();