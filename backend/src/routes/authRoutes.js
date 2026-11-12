const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must contain at least 6 characters" });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: "Email is already registered" });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, currency: user.currency } });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) return res.status(401).json({ message: "Invalid email or password" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, currency: user.currency } });
  } catch (e) { next(e); }
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (e) { next(e); }
});
module.exports = router;
