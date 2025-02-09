const express = require("express");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const session = require("express-session");
require("dotenv").config();
const path = require("path");

const app = express();

// Setup Passport with Discord Strategy
passport.use(new DiscordStrategy({  
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/discord/callback",
    scope: ["identify"]
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Middleware for session and passport
app.use(session({ secret: "secret", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Discord Authentication Routes
app.get("/auth/discord", passport.authenticate("discord"));

app.get("/auth/discord/callback",
    passport.authenticate("discord", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/profile");
    }
);

// Profile Page Route
app.get("/profile", (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/");

    // Send an HTML response instead of raw JSON
    res.send(`
        <html>
            <head>
                <title>Welcome ${req.user.username}</title>
                <style>
                    body { text-align: center; font-family: Arial, sans-serif; margin-top: 50px; }
                    img { border-radius: 50%; width: 100px; height: 100px; }
                    .container { padding: 20px; border: 1px solid #ccc; display: inline-block; border-radius: 10px; background-color: #f4f4f4; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Welcome, ${req.user.global_name || req.user.username}!</h1>
                    <img src="https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png" alt="Avatar">
                    <p>Discord ID: ${req.user.id}</p>
                    <p>Locale: ${req.user.locale}</p>
                    <p>Premium Type: ${req.user.premium_type}</p>
                    <a href="/game">Go back to game</a>
                </div>
            </body>
        </html>
    `);
});

// Serve the Snake Game (index.html) from the correct folder
app.get("/game", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start the server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
