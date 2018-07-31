//will display 3 stars on the screen and describes all the propities of the stars (will decrease one by one, start on 3 and they will disapear one by one as the player makes moves)
class Stars{
	constructor(initialStarsNumber, starsElement) {
		this.starsElement=starsElement;
		this.totalStars=initialStarsNumber;
		this.updateStarsDisplay();

	}

	decrementStars (){
		this.totalStars=this.totalStars -1;
		this.updateStarsDisplay();

	}
	setStars(newTotalStars){
		this.totalStars=newTotalStars;
		this.updateStarsDisplay();

	}
	updateStarsDisplay(){
		let starsCounterArray = [...this.starsElement.children];
		let totalStars = this.totalStars;
		starsCounterArray.forEach(function(starElement,index){
			if(index < totalStars) {
				starElement.style.visibility = "visible";
			} else {
				starElement.style.visibility = "collapse";
			}

		});
	}
}

//the counter is displayed on the screen, the number of moves is set to 0, and as the player make moves, the counter stars adding them one by one, displaying the total on the screen
class MovesCounter{
	constructor(counterElement){
		this.totalMovesCounter= 0;
		this.counterElement=counterElement;
		this.updateCounterDisplay();
	}
	increaseMoves(){
		this.totalMovesCounter=this.totalMovesCounter +1;
		this.updateCounterDisplay();

	}
	setMovesCounter(newTotalMoves){
		this.totalMovesCounter=newTotalMoves;
		this.updateCounterDisplay();

	}
	updateCounterDisplay(){
		this.counterElement.innerHTML=this.totalMovesCounter;
	}
}

//controls the cards: this code controls how the cards are reset, revealed, matched or unmatched and how they act in each of these cases.
class Card {
	constructor(cardElement){
		this.cardElement=cardElement;
		this.cardState = '';
		this.resetCard();
	}
	resetCard(){
		this.cardElement.classList.remove("show", "open", "match", "disabled");
		this.cardState = 'hidden';
	}
	revealCard(){
		this.cardElement.classList.add("show","open","disabled");	
		this.cardState = 'revealed';
	}
	cardMatch(){
		this.cardElement.classList.add("match","disabled");
		this.cardElement.classList.remove("show","open");
		this.cardState = 'matched';
	}
	cardUnmatch(){
		this.cardElement.classList.add("unmatched","disabled");
		this.cardElement.classList.remove("show","open");
		this.cardState = 'unmatched';
	}
}

//this class contains all the cards in a single deck, as children of the parent element, and describes how the deck works (how and when it reset and how to shuffle).
class Deck {
	constructor(deckElement) {
		this.deckElement = deckElement;
		let deckCards = [];
		let domCards = [...deckElement.children];
		let That = this;
		this.deckDisabled = false;
		this.clickedCards = [];
		this.processingCards = false;
		domCards.forEach(function(domCard){
			let deckCard = new Card(domCard);
			deckCards.push(deckCard);
			domCard.addEventListener('click',function(event){
				if (!That.deckDisabled && !this.classList.contains("disabled")) {
					That.deckDisabled = true;
					deckCard.revealCard();
					That.clickedCards.push(deckCard);
				}
			})
		});
		this.deckCards = deckCards;
	}

	resetDeck(){
		this.deckCards.forEach(function(deckCard){
			deckCard.resetCard();	
		})
		this.deckCards = this.shuffle(this.deckCards);
		let deckElement = this.deckElement;
		deckElement.innerHTML = "";
		this.deckCards.forEach(function(deckCard){
			deckElement.append(deckCard.cardElement);
		})
	}

	shuffle(array) {
	    var currentIndex = array.length, temporaryValue, randomIndex;

	    while (currentIndex !== 0) {
	        randomIndex = Math.floor(Math.random() * currentIndex);
	        currentIndex -= 1;
	        temporaryValue = array[currentIndex];
	        array[currentIndex] = array[randomIndex];
	        array[randomIndex] = temporaryValue;
	    }

	    return array;
	}

	//explains that when two cards are selected they can either be a match or a mismatched. In the second case, the cards are disabled for 1 second, after that, the player can keep playing. In the first case, cards will keep disabled through the game

	areTwoCardsSelected(){
		return (this.clickedCards.length === 2) ? true : false;
	}
	selectedCardsMatch(){
		return this.clickedCards[0].cardElement.children[0].className===this.clickedCards[1].cardElement.children[0].className;
	}
	setCardsAsMatch(){
		this.processingCards = true;
		this.clickedCards[0].cardMatch();
		this.clickedCards[1].cardMatch();
		this.clickedCards=[];
		this.deckDisabled = false;
		this.processingCards = false;
	}
	cardsMismatched(){
		this.processingCards = true;
		setTimeout(() => {
			this.clickedCards[0].resetCard();
			this.clickedCards[1].resetCard();
			this.clickedCards=[];
			this.deckDisabled = false;
			this.processingCards = false;
		},1000);
	}
}

//this code controls the game and how it works. It includes an event listener for a click that adds a move to the counter everytime a card is clicked and updates the stars if neccesary.
//Also, the event listener explains what when the game finishes, a congrats popup must appear and the timer should stop
class Game{
	constructor(){
		let numberOfMoves = document.querySelector(".moves");
		this.movesCounter = new MovesCounter(numberOfMoves);
		let numberOfStars = document.querySelector(".stars");
		this.starsCounter= new Stars(3, numberOfStars);
		let deck = document.querySelector(".deck");
		this.deck = new Deck(deck);
		this.addResetListener();
		this.addClickListener();
		this.addCloseModalListener();
		this.maxMatches = 8;
		this.currentMatches = 0;
	}

	addClickListener(){
		let movesCounter = this.movesCounter;
		let deck = this.deck;
		let That = this;
		this.deck.deckElement.addEventListener("click", function(event) {
			if(deck.areTwoCardsSelected()) {
				if(!deck.processingCards){
				if (deck.selectedCardsMatch()) {
					deck.setCardsAsMatch();
					movesCounter.increaseMoves();
					That.updateStars();
					That.currentMatches++;
					if(That.currentMatches	>= That.maxMatches) {
						That.showCongratsModal();
						That.stopTimer();
					}
				} else {
					deck.cardsMismatched();
					movesCounter.increaseMoves();
					That.updateStars();
				}
				
				}
			} else {
				if(That.movesCounter.totalMovesCounter === 0) {
					That.resetTimer();
					That.startTimer();
				}
				deck.deckDisabled = false;
			}
		});
	}

	//when restart is clicked, the game is reset, as well as the moves counter, the stards and the timer. 

	addResetListener(){
		let resetDomButton = document.querySelector(".restart");
		let That = this;
		resetDomButton.addEventListener("click",function(event){
			That.resetGame();
		});
	}

	addCloseModalListener() {
		let closeModal = document.querySelector(".closeModal");
		let That = this;
		closeModal.addEventListener("click",function(event){
			That.closeCongratsModal();
			That.resetGame();
		});
	}
//resets game
	resetGame(){
		this.movesCounter.setMovesCounter(0);
		this.starsCounter.setStars(3);
		this.deck.resetDeck();
		this.currentMatches = 0;
		this.resetTimer();
	}
//updates stars
	updateStars() {
		if(this.movesCounter.totalMovesCounter === 9 || this.movesCounter.totalMovesCounter === 18) {
			this.starsCounter.decrementStars();
		}
	}
//shows congrats modal
	showCongratsModal() {
		let modal = document.querySelector('.modal');
		let modalStars = document.querySelector('.starsModal');
		let modalMoves = document.querySelector('.movesModal');
		modalStars.innerHTML = document.querySelector('.stars').innerHTML;
		modalMoves.innerHTML = document.querySelector('.moves').innerHTML;
		modal.classList.remove('hidden');
	}
//closes congrats modal
	closeCongratsModal() {
		let modal = document.querySelector('.modal');
		modal.classList.add('hidden');
	}

//stards timer
	startTimer(){
		this.timer = setInterval(function(){
			let minutes = document.querySelector('.minutes');
			let seconds = document.querySelector('.seconds');
			if(parseInt(seconds.innerHTML) === 59) {
				seconds.innerHTML = '0';
				minutes.innerHTML = parseInt(minutes.innerHTML) + 1;
			} else {
				seconds.innerHTML = parseInt(seconds.innerHTML) + 1;
			}
		},1000);
	}
// stops timer and resets timer
	resetTimer(){
		this.stopTimer();
		let minutes = document.querySelector('.minutes');
		let seconds = document.querySelector('.seconds');	
		
		minutes.innerHTML = 0;
		seconds.innerHTML = 0;	
	}

	stopTimer(){
		clearInterval(this.timer);
	}


}

const game = new Game();

