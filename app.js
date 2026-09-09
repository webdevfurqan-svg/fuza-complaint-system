require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");

const User = require("./models/user");
const Complaint = require("./models/Complaint");
const { sendComplaintEmail, sendWelcomeEmail } = require("./mail");

const app = express();


let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB connection error: " + err);
  }
};
connectDB();

app.set("view engine", "ejs");
app.set("trust proxy", 1); // required behind Vercel's proxy for secure cookies

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_SECRET || "fuza_complaints_secret_key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 14 * 24 * 60 * 60 * 1000
  }
}));

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.adminLoggedIn) {
    return res.redirect("/admin/login");
  }
  next();
}

app.get("/", async (req, res) => {
  if (req.session.userId) {
    res.render("index", { loggedIn: true, name: req.session.name });
  } else {
    res.render("index", { loggedIn: false, name: null });
  }
});

app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.render("register", { error: "All fields are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.render("register", { error: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name,
      email: normalizedEmail,
      password: hashedPassword
    });

    await newUser.save();

    try {
      await sendWelcomeEmail(newUser);
    } catch (emailErr) {
      console.log("Welcome email failed: " + emailErr);
    }

    req.session.userId = newUser._id;
    req.session.name = newUser.name;

    res.redirect("/");
  } catch (err) {
    console.log("Register error: " + err);
    res.render("register", { error: "Something went wrong. Please try again." });
  }
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.render("login", { error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid email or password." });
    }

    req.session.userId = user._id;
    req.session.name = user.name;

    res.redirect("/");
  } catch (err) {
    console.log("Login error: " + err);
    res.render("login", { error: "Something went wrong. Please try again." });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.post("/complaints", requireLogin, async (req, res) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.redirect("/");
    }

    const user = await User.findById(req.session.userId);

    const newComplaint = new Complaint({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      subject: subject,
      description: description
    });

    await newComplaint.save();

    try {
      await sendComplaintEmail(newComplaint);
    } catch (emailErr) {
      console.log("Complaint email failed: " + emailErr);
    }

    res.render("index", {
      loggedIn: true,
      name: user.name,
      success: "Your complaint has been submitted successfully."
    });
  } catch (err) {
    console.log("Complaint submission error: " + err);
    res.redirect("/");
  }
});

app.get("/admin/login", (req, res) => {
  res.render("admin", { showLogin: true, error: null, complaints: null });
});

app.post("/admin/login", (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    req.session.adminLoggedIn = true;
    res.redirect("/admin");
  } else {
    res.render("admin", { showLogin: true, error: "Wrong admin password.", complaints: null });
  }
});

app.get("/admin", requireAdmin, async (req, res) => {
  const complaints = await Complaint.find().sort({ createdAt: -1 });
  res.render("admin", { showLogin: false, error: null, complaints: complaints });
});

app.get("/admin/logout", (req, res) => {
  req.session.adminLoggedIn = false;
  res.redirect("/admin/login");
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
  });
}

module.exports = app;