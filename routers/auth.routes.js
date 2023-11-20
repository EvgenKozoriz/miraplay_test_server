const Router = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/auth.middleware");

const router = new Router();

router.post(
  "/registration",
  [
    check("email", "wrong email").isEmail(),
    check(
      "password",
      "password must be longer than 6 and shorter than 15"
    ).isLength({ min: 6, max: 15 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Uncorrect email or password (password must be longer than 6 and shorter than 15)", errors });
      }

      const { email, password } = req.body;

      const candidate = await User.findOne({ email });

      if (candidate) {
        return res
          .status(400)
          .json({ message: `User with email ${email} already exist` });
      }

      const hashPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashPassword });
      await user.save();
      return res.json({ message: `User was created` });
    } catch (e) {
      console.log(e);
      res.send({ message: "Error: Failed to register user" });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: `User with email ${email} not found` });
    }
    const isPassValid = bcrypt.compareSync(password, user.password);
    if (!isPassValid) {
      return res.status(401).json({ message: `Invalid password` });
    }
    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "24h",
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Error: Failed to login user" });
  }
});

router.get("/auth", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "24h",
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Error: Failed to authenticate user"  });
  }
});

module.exports = router;