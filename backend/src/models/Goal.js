const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  target: { type: Number, required: true, min: 1 },
  saved: { type: Number, default: 0, min: 0 },
  deadline: { type: Date }
}, { timestamps: true });
module.exports = mongoose.model("Goal", schema);
