const listing = require("./models/listing");
const Review = require("./models/review.js")
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema} = require("./schema.js");
const review = require("./models/review.js");

// middleware for isLoggedIn
module.exports.isLoggedIn = (req, res, next) => {
  console.log(req.path, "..", req.originalUrl);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to perform operations!");
    return res.redirect("/login");
  }
  next(); // if user authenticated
};

// middleware for session
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }

  next();
};

// middleware for isOwner
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  let Listing = await listing.findById(id);
  if (!Listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const {id, reviewId} = req.params;

  let review = await Review.findById(reviewId);

  if(!review){
    req.flash("error", "Review not found");
    return res.redirect(`/listings${id}`)
  }

  if(!review.author){
    req.flash("error", "Review has no author");
    return res.redirect(`/listings${id}`)
  }

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// For validating listingSchema
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//middleware for validateReview
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};