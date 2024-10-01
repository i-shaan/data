import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema({
  name: {
    type: String,
    required: true
  },
})

export default mongoose.model("Admin", adminSchema);