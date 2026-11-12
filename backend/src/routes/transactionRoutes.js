const router = require("express").Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");
router.use(auth);
router.get("/", async (req, res, next) => {
  try { res.json(await Transaction.find({ user: req.userId }).sort({ date: -1 })); } catch (e) { next(e); }
});
router.post("/", async (req, res, next) => {
  try {
    const { type, title, category, amount, date, note } = req.body;
    if (!["income", "expense"].includes(type) || !title || !category || Number(amount) <= 0) return res.status(400).json({ message: "Enter valid transaction details" });
    res.status(201).json(await Transaction.create({ user: req.userId, type, title, category, amount: Number(amount), date: date || new Date(), note }));
  } catch (e) { next(e); }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const item = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted" });
  } catch (e) { next(e); }
});
module.exports = router;
