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


    //check bet 

    if(bet <= 0){
        message.textContent = "Enter a valid bet.";
        return; 
    }

    //check balance

    if(bet > balance) {
        message.textContent = "Not enough balance.";
        return;
    }

    //remove bet from balance

    balance -= bet;

    //generate random number from 0 to 36

    const number = Math.floor(Math.random() * 37);

    // get nummber color 

    const color = getColor(number);

    //Display result 

    result.textContent = number;
    wheel.className = "wheel " + color;

    //Check if player won

    if (choice === color) {
        let winnings;

        if(choice === "green"){
            winnings = bet * 36;
        }else{
        //red and black pay 1:1
        winnings = bet * 2; 
        }

        balance += winnings;

        message.textContent = `You won + ${winnings - bet} $$$! 🎉`;
        
    } else {
    //player lost
        message.textContent = `You lost + ${bet}  $$$.`;
    }

    //Update balance 

    balanceText.textContent = balance;

    //game over 

    if (balance <= 0 ){
        message.textContent += "Game over!";

        spinButton.disabled = ture;
    }

}

//button event 

spinButton.addEventListener("click", spin);



 