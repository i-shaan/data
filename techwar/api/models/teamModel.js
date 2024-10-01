import mongoose from "mongoose";
import { gameStates, questionStates } from "../../constants.js";
const  teamSchema = new mongoose.Schema({
  territories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "territory"
  }],

  password:{
    type:String,
    required:true
  },

  lobby_id:{
    type:String,
    required:true
  },

  name:{
    type:String,
    unique: true,
    required:true
  },

  state: {
    type: String,
    enum: Object.values(gameStates),
    default: gameStates.idle,
    required: true
  },

  areQuestionsSeeded: {
    type: Boolean,
    default: false
  },

  questions: [{
    id: String,
    question: String,
    options: [String],
    answer: String,
    state: {
      type: String,
      enum: Object.values(questionStates),
      default: questionStates.notAttempted,
    },
    points: Number,
  }],

  score:{
    type: Number,
    default: 0
  },

});

const teamModel = mongoose.model("team",teamSchema);

export default teamModel;