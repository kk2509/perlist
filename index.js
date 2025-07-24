// Imports and Setup
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import axios from "axios";
import { getGeminiResponse } from "./chatbot.js";

dotenv.config();

const app = express();
const port = 3000;

// PostgreSQL DB connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "postgres",
  port: 5432,
});
db.connect();

// Middleware Setup

app.use(session({
  secret: "yourSecretKey",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Google OAuth Setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE google_id = $1", [profile.id]);
    if (result.rows.length === 0) {
      await db.query("INSERT INTO users (google_id, name) VALUES ($1, $2)", [profile.id, profile.displayName]);
    }
    return done(null, { id: profile.id, name: profile.displayName });
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE google_id = $1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

// Daily Challenge Generator

const dailyChallenges = [
  "Do not use social media for 1 hour",
  "Complete your hardest task first",
  "Write 3 things you're grateful for",
  "Take a 10-minute mindfulness break",
  "Plan tomorrow before going to bed"
];

function getRandomChallenge() {
  const index = new Date().getDate() % dailyChallenges.length;
  return dailyChallenges[index];
}

// Home Route: with Motivation + Challenge

app.get("/", async (req, res) => {
  try {
    const quoteRes = await axios.get("https://zenquotes.io/api/today");
    const quote = quoteRes.data[0]?.q || "Be your best self.";
    const author = quoteRes.data[0]?.a || "Unknown";

    const itemsResult = await db.query(`
      SELECT items.id, items.title, items.due_date, members.name as member 
      FROM items 
      JOIN members ON items.member_id = members.id 
      ORDER BY items.due_date ASC NULLS LAST, members.name ASC;
    `);
    const membersResult = await db.query("SELECT * FROM members ORDER BY name ASC");

    res.render("index", {
      listItems: itemsResult.rows,
      members: membersResult.rows,
      quote,
      author,
      challenge: getRandomChallenge()
    });

  } catch (err) {
    console.error("Error on home route:", err);
    res.render("index", {
      listItems: [],
      members: [],
      quote: "Push yourself, because no one else will.",
      author: "Unknown",
      challenge: getRandomChallenge()
    });
  }
});


// Authentication Routes

app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);
app.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) return console.log(err);
    res.redirect("/");
  });
});


// CRUD Routes for To-Do Items

app.post("/add", async (req, res) => {
  const { newItem, memberId, dueDate } = req.body;
  try {
    await db.query("INSERT INTO items (title, member_id, due_date) VALUES ($1, $2, $3)", [newItem, memberId, dueDate || null]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const { updatedItemTitle, updatedItemId } = req.body;
  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [updatedItemTitle, updatedItemId]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});


// Alarm, Calendar, About, Contact Pages

app.get("/alarm", (req, res) => {
  res.render("alarm");
});

app.get("/calendar", (req, res) => {
  res.render("calendar");
});

app.get("/about", async (req, res) => {
  const result = await db.query("SELECT * FROM reflections ORDER BY date DESC");
  res.render("about", { reflections: result.rows });
});

app.post("/introspect", async (req, res) => {
  const { introspection, entryDate } = req.body;
  await db.query("INSERT INTO reflections (content, date) VALUES ($1, $2)", [introspection, entryDate]);
  res.redirect("/about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await db.query("INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)", [name, email, message]);
    res.redirect("/contact");
  } catch (err) {
    console.error("Error saving contact message:", err);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//chatbot

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const response = await getGeminiResponse(userMessage);
  res.send({ reply: response });
});


// Start Server

app.listen(port, () => {
  console.log(` Permalist server running at http://localhost:${port}`);
});
