const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
router.use(auth);
router.get("/profile", async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (e) { next(e); }
});
router.patch("/profile", async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.currency) updates.currency = req.body.currency;
    if (req.body.monthlyIncome !== undefined) updates.monthlyIncome = Number(req.body.monthlyIncome);
    const user = await User.findByIdAndUpdate(req.userId, { $set: updates }, { new: true, runValidators: true }).select("-password");
    res.json(user);
  } catch (e) { next(e); }
});
module.exports = router;
