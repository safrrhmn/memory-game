
/**
 * global variables. These keeps track of the state of the application
 */
var MemoryGame = {};
const MATCH = 'match';
const OPEN = 'open';
const SHOW = 'show';
const MOVES = 'moves';
const RESTART = 'restart';
const CARD = 'card';
const DECK = 'deck';
const STAR_HALF_FULL = 'fa-star-half-o';
const STAR_FULL_EMPTY = 'fa fa-star-o';
const FULL_STAR = 'fa-star';
let START_TIME = new Date().getTime();

MemoryGame.PLAY = {
  initializeVariables: function () {
    MemoryGame.pairedArray = [];
    MemoryGame.timeoutInMs = 500;
    MemoryGame.cards = document.querySelectorAll(`.${CARD}`);
    MemoryGame.deck = document.getElementsByClassName(DECK)[0];
  },
  doPlay: function () {
    /*set time in interval and update in every 500 ms. 
    * update user about the time taken
    */

    setInterval(updateTime, 500);

    /*
    * set up the event listener for a card. If a card is clicked:
    *  - display the card's symbol (put this functionality in another function that you call from this one)
    *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
    *  - if the list already has another card, check to see if the two cards match
    *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
    *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
    *    + increment the move pairedElementser and display it on the page (put this functionality in another function that you call from this one)
    *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
    */

    MemoryGame.cards.forEach((currentElement) => {
      currentElement.addEventListener('click', function () {
        if (currentElement.classList.contains(MATCH)) return;
        if (currentElement.classList.contains(OPEN)) return;

        MemoryGame.pairedArray.push(currentElement);

        //step 1: save in an array that can flick and stay in the DOM
        currentElement.classList.add(OPEN, SHOW);
        //step 2: add `match` class to make it visible in UI
        MemoryGame.DISPLAY.doMatch(currentElement);
        MemoryGame.DISPLAY.showModelIfApplicable();
        return;
      });
    });

    function updateTime() {
      document.getElementById('timer').innerHTML = (new Date().getTime() - START_TIME) / 1000 + " S";
    }
  },
  /**
   * Keep trakcs of the moves made by the user and update in UI
   */
  trackMoves: function () {
    if (MemoryGame.pairedArray.length === 2) {
      let moves = document.getElementsByClassName(MOVES)[0].textContent;
      document.getElementsByClassName(MOVES)[0].textContent = String(parseInt(moves) + 1);
    }
  },
  /**
   * Applies the algorithm to reduce the star in regular inerval. In this case every 4 moves the star will reduce
   */
  reduceStar: function () {
    let moves = document.getElementsByClassName(MOVES)[0].textContent;
    let movesToInt = parseInt(moves);
    let fullStars = document.getElementsByClassName(FULL_STAR);
    let halfStar = document.getElementsByClassName(STAR_HALF_FULL);
    if (movesToInt !== 0 && movesToInt % 4 === 0 && (halfStar.length !== 0 || fullStars.length !== 1)) {
      let fullElem = document.getElementsByClassName(FULL_STAR);
      let halfElem = document.getElementsByClassName(STAR_HALF_FULL);
      if (halfElem.length !== 0) {
        halfElem[0].classList.remove(STAR_HALF_FULL);
      } else if (halfElem.length === 0 && fullElem.length !== 1) {
        let targetStarElem = fullElem[0];
        targetStarElem.classList.remove(FULL_STAR);
        targetStarElem.classList.add(STAR_HALF_FULL);
      }
    }
  },

  /**
   * Gives user the ability to restart the game
   * This will recreate the deck and reset start and timer
   */
  doRestartGame: function () {

    document.getElementsByClassName(RESTART)[0].addEventListener('click', function () {
      restart();
      resetMovesToZero();
      resetStarts();
      MemoryGame.DISPLAY.doShuffle();
    });

    function resetMovesToZero() {
      document.getElementsByClassName(MOVES)[0].textContent = '0';
    }
    function restart() {
      document.querySelectorAll('.deck>li').forEach((el) => {
        el.classList.remove(MATCH);
      });
      //reset the time interval
      START_TIME = new Date().getTime();
    }
    function resetStarts() {
      let cls = ["fa", "fa-star", "fa-star-o", "fa-star-half-o"];
      document.querySelectorAll('.stars>li>i').forEach(x => x.classList.remove(...cls));
      document.querySelectorAll('.stars>li>i').forEach(x => x.className = "fa fa-star");
    }
  }
};

/**
 * Show all display related functionlaties
 */
MemoryGame.DISPLAY = {
  doShuffle: function () {
    MemoryGame.deck.innerHTML = '';

    let copyOfCards = [...MemoryGame.cards];
    shuffle(copyOfCards).forEach((e) => MemoryGame.deck.appendChild(e));
		/*
    * Display the cards on the page
    *   - shuffle the list of cards using the provided "shuffle" method below
    *   - loop through each card and create its HTML
    *   - add each card's HTML to the page
    */

    // Shuffle function from http://stackoverflow.com/a/2450976
    function shuffle(array) {
      var currentIndex = array.length,
        temporaryValue,
        randomIndex;

      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }
  },
  /**
   * Applies matching algorithm. if matches then keep the cards open else close them both
   * This function also keeps track of the moves, star
   */
  doMatch: function (currentElement) {
    let pairedElements = MemoryGame.pairedArray.filter(
      (i) => i.firstElementChild.classList.value === currentElement.firstElementChild.classList.value
    );

    //track moves
    MemoryGame.PLAY.trackMoves();
    //track star
    MemoryGame.PLAY.reduceStar();

    //if not the first time and cards do not match remove them from DOM and hide from UI
    if (pairedElements.length === 1 && MemoryGame.pairedArray.length === 2) {
      MemoryGame.pairedArray.forEach((el) => {
        setTimeout(function () {
          el.classList.remove(OPEN, SHOW);
        }, MemoryGame.timeoutInMs);
      });
      MemoryGame.pairedArray = [];
    } else if (MemoryGame.pairedArray.length === 2 && pairedElements.length === 2) {
      MemoryGame.pairedArray.forEach((el) => {
        el.classList.remove(OPEN, SHOW);
        el.classList.add(MATCH);
      });
      MemoryGame.pairedArray = [];
    }
  },
  showModelIfApplicable: function () {
    let matchedCardCount = document.querySelectorAll(`.${CARD}.${MATCH}`).length;
    if (matchedCardCount === 16) MemoryGame.MODAL.displayModal();
  }
};

/**
 * Upon successful completion of the game a modal appears.
 * This shows the moves, time and remaining stars upon completion
 */
MemoryGame.MODAL = {
  displayModal: function () {
    let move = document.getElementsByClassName(MOVES)[0].textContent;
    let stars = document.getElementsByClassName(FULL_STAR).length;
    let timeTaken = document.getElementById('timer').innerHTML;
    //replace with modal
    let modal = document.getElementById('modal');
    modal.style.display = 'block';
    document.getElementById(
      'contentText'
    ).textContent = `You have succesfully completed the game with ${move} moves, ${stars} stars and in ${timeTaken} s`;
  },
  closeModal: function () {
    document.getElementsByClassName('closeBtn')[0].addEventListener('click', function () {
      let modal = document.getElementById('modal');
      modal.classList.add('modal-closed');
      modal.style.display = 'none';
    });
  }
};

/**
 * Create the dom and deck of cards on dom ready state
 */
document.addEventListener('DOMContentLoaded', function () {
  MemoryGame.PLAY.initializeVariables();
  MemoryGame.DISPLAY.doShuffle();
  MemoryGame.PLAY.doPlay();
  MemoryGame.MODAL.closeModal();
  MemoryGame.PLAY.doRestartGame();
});