// balance.js - Zentrales Guthaben-Management für alle Casino-Spiele
// Einbinden mit: <script src="balance.js"></script> VOR deinen anderen Scripts

(function() {
    'use strict';

    // Konfiguration
    const STORAGE_KEY = 'casino_balance';
    const DEFAULT_BALANCE = 100;
    const CURRENCY_SYMBOL = '€'; // Anpassen: €, $, CHF, etc.

    // Initiales Guthaben laden oder setzen
    function getBalance() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored !== null ? parseInt(stored, 10) : DEFAULT_BALANCE;
    }

    // Guthaben speichern
    function saveBalance(balance) {
        localStorage.setItem(STORAGE_KEY, balance.toString());
    }

    // Guthaben aktualisieren (mit Validierung)
    function updateBalance(newBalance) {
        const validBalance = Math.max(0, Math.floor(newBalance));
        saveBalance(validBalance);
        dispatchBalanceUpdate(validBalance);
        return validBalance;
    }

    // Guthaben ändern (addieren/subtrahieren)
    function changeBalance(amount) {
        const current = getBalance();
        return updateBalance(current + amount);
    }

    // Balance-Update Event für andere Seiten/Tabs
    function dispatchBalanceUpdate(balance) {
        window.dispatchEvent(new CustomEvent('balanceUpdate', {
            detail: { balance, currency: CURRENCY_SYMBOL }
        }));
    }

    // HTML-Elemente aktualisieren
    function updateBalanceDisplay() {
        const balance = getBalance();

        // Unterstützte IDs für Balance-Anzeigen
        const balanceIds = ['balance', 'money'];

        balanceIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Nur den Zahlenwert aktualisieren, wenn Parent-Text schon W currency enthält
                const parentText = element.parentElement?.textContent || '';
                if (parentText.includes('Geld:') || parentText.includes('Guthaben:') || parentText.includes('Balance:')) {
                    element.textContent = `${balance}${CURRENCY_SYMBOL}`;
                } else {
                    element.textContent = balance;
                }
            }
        });

        // Alternative: Alle Elemente mit Klasse 'balance' oder 'money' finden
        document.querySelectorAll('.balance, .moneten, [data-balance]').forEach(el => {
            if (!el.id) {
                el.textContent = `Guthaben: ${balance}${CURRENCY_SYMBOL}`;
            }
        });
    }

    // Event-Listener für Cross-Tab Synchronisation
    function setupStorageListener() {
        window.addEventListener('storage', (event) => {
            if (event.key === STORAGE_KEY) {
                updateBalanceDisplay();
            }
        });
    }

    // Custom Event Listener für direkte Updates
    function setupCustomEventListener() {
        window.addEventListener('balanceUpdate', () => {
            updateBalanceDisplay();
        });
    }

    // Hilfsfunktion: Einsatz aus Input holen
    function getBetFromInput(inputId = 'bet') {
        const input = document.getElementById(inputId);
        if (!input) return 0;
        return Math.max(1, parseInt(input.value, 10) || 0);
    }

    // Hilfsfunktion: Einsatz validieren
    function canPlaceBet(betAmount) {
        return betAmount > 0 && betAmount <= getBalance();
    }

    // Öffentliche API
    window.CasinoBalance = {
        get: getBalance,
        set: updateBalance,
        add: changeBalance,
        subtract: (amount) => changeBalance(-amount),
        canBet: canPlaceBet,
        getBet: getBetFromInput,
        refresh: updateBalanceDisplay,
        currency: CURRENCY_SYMBOL,
        storageKey: STORAGE_KEY
    };

    // Auto-Initialisierung beim DOM-Ready
    function init() {
        // Initiales Guthaben setzen falls nicht vorhanden
        if (!localStorage.getItem(STORAGE_KEY)) {
            saveBalance(DEFAULT_BALANCE);
        }

        // Display aktualisieren
        updateBalanceDisplay();

        // Listener setup
        setupStorageListener();
        setupCustomEventListener();

        console.log('💰 Casino Balance System initialized');
    }

    // Starten wenn DOM geladen
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
