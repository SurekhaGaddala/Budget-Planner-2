const router = require("express").Router();
const Goal = require("../models/Goal");
const auth = require("../middleware/auth");
router.use(auth);
router.get("/", async (req, res, next) => {
  try { res.json(await Goal.find({ user: req.userId }).sort({ createdAt: -1 })); } catch (e) { next(e); }
});
router.post("/", async (req, res, next) => {
  try {
    const { title, target, saved, deadline } = req.body;
    if (!title || Number(target) <= 0) return res.status(400).json({ message: "Enter a goal title and positive target" });
    res.status(201).json(await Goal.create({ user: req.userId, title, target: Number(target), saved: Number(saved) || 0, deadline: deadline || undefined }));
  } catch (e) { next(e); }
});
router.patch("/:id", async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: { saved: Math.max(0, Number(req.body.saved) || 0) } },
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json(goal);
  } catch (e) { next(e); }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json({ message: "Goal deleted" });
  } catch (e) { next(e); }
});
module.exports = router;
