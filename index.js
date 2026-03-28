const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const engineMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
// For routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
// For cookies
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
// for authorization and authentication
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}
const dbUrl = process.env.MONGO_URI;


// Session options
const sessionOptions = {
  secret: "supersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});
app.use(flash());

// Connect to MongoDB
// const MONGO_URI = "mongodb://localhost:27017/Wanderland";
const MONGO_URI = dbUrl;


main()
  .then(() => {
    console.log("Connected to MongoDB", "http://localhost:3000");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URI);
}

// use ejs-locals for all ejs templates:
app.engine("ejs", engineMate);

// Middleware to parse JSON bodies
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cookieParser("passth"));


// For authentication and authorization
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for flash messages
app.use((req, res, next) => {
   res.locals.successMsg = req.flash("success");
   res.locals.errorMsg = req.flash("error");
   res.locals.currUser = req.user;
   next();
})

// Root route
app.get("/", async (req, res) => {
  const listings = await listing.find({});
  
  res.render("listings/index.ejs", { listings });
});

app.get("/listings", async(req, res) => {
  const listings = await listing.find({});
  
  res.render("listings/index.ejs", { listings });
})

// Creating demo user
app.get("/demouser", async(req, res) => {
    let fakeUser = new User({
      email: "rohitsingh@gmail.com",
      username: "rohitsingh",
    });

    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
});

// for routing

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
  throw new ExpressError(404, "Page not found");
});

// Custom error handling
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!" } = err;
  res.status(status).render("error.ejs", { message });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
