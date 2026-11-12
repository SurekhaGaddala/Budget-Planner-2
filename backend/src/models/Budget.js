const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true, min: 0 }
}, { timestamps: true });
schema.index({ user: 1, month: 1, category: 1 }, { unique: true });
module.exports = mongoose.model("Budget", schema);
