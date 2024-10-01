import mongoose, { Mongoose } from "mongoose";

/**
 * Territory
 * id
 * name
 * currentMaxScore
 * isCaptured
 * capturedBy
 */

const territorySchema = new mongoose.Schema({
  name: { // fully qualified name of the territory
    type: String,
    unique: true,
    required: true
  },
  alias: {  // could be string or int // for easier requests
    type: String,
    unique: true,
  },
  requiredScore: {
    type: Number,
    default: 0,  //Minimum Score require to acquire the territory, then updated to current max
  },
  subterritories: {
    type: [String],
    default: [],  
  },
  isCaptured: {
    type: Boolean,
    default: false
  },
  capturedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "team"
  },
  ownerName: {
    type: String
  }
})

const territoryModel = mongoose.model("territory", territorySchema);

export default territoryModel;