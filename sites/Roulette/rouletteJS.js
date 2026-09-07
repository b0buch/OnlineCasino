let balance = 100;

// HTML elements 
const wheel = document.getElementById("wheel");
const result = document.getElementById("result");

const balanceText = document.getElementById("balance");

const betAmount = document.getElementById("betAmount");
const betChoice = document.getElementById("betChoice")

const spinButton = document.getElementById("spinButton");

const message = document.getElementById("message");

//Red roulette numbers 
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34 ,36]

//get the color of number 
function getColor(number) {
    if (number == 0) {
        return "green";
    }
    if (redNumbers.includes(number)) {
        return "red";
    }else {
        return "black";
    }
}


//spin the roulette
function spin() {

    const bet = Number(betAmount.value);
    const choice = betChoice.value;

    // Check bet
    if (bet <= 0) {
        message.textContent = "Enter a valid bet.";
        return;
    }

    // Check balance
    if (bet > balance) {
        message.textContent = "Not enough balance.";
        return;
    }

    // Disable button while spinning
    spinButton.disabled = true;

    // Remove bet
    balance -= bet;
    balanceText.textContent = balance;

    // Start animation
    wheel.classList.add("rolling");
    message.textContent = "Spinning... 🎰";

    // Show random numbers for 2 seconds
    const rolling = setInterval(() => {
        const randomNumber = Math.floor(Math.random() * 37);
        result.textContent = randomNumber;

        const randomColor = getColor(randomNumber);
        wheel.className = "wheel rolling " + randomColor;
    }, 100);


    // After 2 seconds
    setTimeout(() => {

        // Stop changing numbers
        clearInterval(rolling);

        // Generate FINAL result
        const number = Math.floor(Math.random() * 37);
        const color = getColor(number);

        // Show final result
        result.textContent = number;
        wheel.className = "wheel " + color;

        // Check win
        if (choice === color) {

            let winnings;

            if (choice === "green") {
                winnings = bet * 36;
            } else {
                winnings = bet * 2;
            }

            balance += winnings;
            message.textContent = `You won ${winnings - bet} $$$! 🎉`;
        } else {
            message.textContent = `You lost ${bet} $$$. 😢`;
        }

        // Update balance
        balanceText.textContent = balance;

        // Game over
        if (balance <= 0) {

            message.textContent += " Game over!";

            spinButton.disabled = true;

        } else {

            // Enable button again
            spinButton.disabled = false;
        }
    }, 2000);
}

//button event 
spinButton.addEventListener("click", spin);



 