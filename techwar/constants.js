export const gameStates = Object.freeze({
  quiz: "quiz",
  gameOver: "gameOver",
  idle: "idle",
});

export const stateDurations = Object.freeze({
  quiz: 5*60*1000
})

export const questionStates = Object.freeze({
  attempted: "attempted",
  notAttempted: "notAttempted",
  attempting: "attempting",
});

export const questionToSeed = 250; // for each team

//testing
