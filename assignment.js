// You are to create a card game for 4 players. The players each draw a card from the deck each round. The player who draws the highest card will win the round and score a point. When there are no more cards left in the deck, the game should end with a scoreboard that displays the players ranked in order of the total number of points they have scored.

// 4players
// deck -> 1 card / rnd
// highest card per round = win, per 4 players drawn
// deck no more cards -> end game with scoreboard of total points of player ranked from highest to lowest

let players = [
  {
    name: "bob",
    cardHeld: null,
    score: 0,
    //maybe order?
  },
  {
    name: "asd",
    cardHeld: null,
    score: 0,
  },
  {
    name: "dsa",
    cardHeld: null,
    score: 0,
  },
  {
    name: "bocxzb",
    cardHeld: null,
    score: 0,
  },
];
// const cardsPossible = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// const cardsDrawnPerRound = 1
const deckOfCards = 40;
const pointsPerScore = 1;

//gameloop
for (let startOfDraw = 0; startOfDraw < deckOfCards; startOfDraw++) {
  //game logic update
  for (const player in players) {
    players[player].cardHeld = Math.floor(Math.random() * 12) + 1;
  }

  let biggestCardOfRound = 0;
  //winConditionForFullDrawRound
  if (startOfDraw % players.length === 0) {
    players.forEach((player) => {
      const { cardHeld } = player;
      if (cardHeld > biggestCardOfRound) biggestCardOfRound = cardHeld;
    });
    //checkWhoWinsTheRound
    for (const player in players) {
      const { cardHeld } = players[player];
      if (biggestCardOfRound === cardHeld) {
        players[player].score += pointsPerScore;
      }
    }
  }
  for (const player in players) {
    players[player].cardHeld = null;
  }
}
const winRound = () => {
  displayHighestRank();
};
const displayHighestRank = () => {
  let ranking = [];
  players.forEach((player, index) => {
    const { score } = players[index];
    ranking.push(score);
  });
  let sortable = [];
  for (const player in players) {
    const { score, name } = players[player];

    sortable.push([name, score]);
  }
  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });
  
  for (let item=0; item < sortable.length; item++) {
    const [name, score] = sortable[item];
    const indexify = ["st","nd","rd","th"]
    console.log(
      `${name} has scored ${score} points in ${item + 1}${item < 4 ? indexify[item] : indexify[4]} place`
    );
  }
};
winRound();
