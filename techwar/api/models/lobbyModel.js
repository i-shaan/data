import mongoose from "mongoose";
import { gameStates } from "../../constants.js";

const lobbySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  // allTeams: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "team"
  // }],

  // // teams that have logged in
  // activeTeams: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "team"
  // }],

  //////////////////////////////////////////////////
  // max number of teams that can be accepted into a lobby
  limit: {
    type: Number,
    default: 6
  },

  activeCount: {
    type: Number,
    default: 0,
  },
  
  teams: [{
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team"
    },
    active: {
      type: Boolean,
      default: false      
    }, 
    score: {
      type: Number,
      default: 0
    } 
  }],
  ///////////////////////////////////////////////////

  state: {
    type: String,
    enum: Object.values(gameStates), // ["idle", "quiz", "gameOver"]
    default: gameStates.idle,
  },

  // quizStartedAt: {
  //   type: Date
  // },

  // quizEndedAt: {
  //   type: Date
  // },

  ///////////////////////////////////
  quiz: {
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    }
  }
  ///////////////////////////////////
});

const lobbyModel = mongoose.model("lobby", lobbySchema);

export default lobbyModel;
