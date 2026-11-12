const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: Date, default: Date.now },
  note: { type: String, default: "" }
}, { timestamps: true });
module.exports = mongoose.model("Transaction", schema);
