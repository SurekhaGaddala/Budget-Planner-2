const router = require("express").Router();
const Budget = require("../models/Budget");
const auth = require("../middleware/auth");
router.use(auth);
router.get("/", async (req, res, next) => {
  try { res.json(await Budget.find({ user: req.userId }).sort({ month: -1 })); } catch (e) { next(e); }
});
router.post("/", async (req, res, next) => {
  try {
    const { month, category, limit } = req.body;
    if (!month || !category || Number(limit) <= 0) return res.status(400).json({ message: "Enter a month, category and positive limit" });
    const item = await Budget.findOneAndUpdate(
      { user: req.userId, month, category },
      { $set: { limit: Number(limit) } },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(item);
  } catch (e) { next(e); }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const item = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ message: "Budget not found" });
    res.json({ message: "Budget deleted" });
  } catch (e) { next(e); }
});
module.exports = router;
