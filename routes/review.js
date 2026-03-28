const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing");
const Review = require("../models/review.js");
const { isLoggedIn, isAuthor, validateReview } = require("../middleware.js");
const review = require("../models/review.js");
const reviewController = require("../controllers/review.js");

router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview),
);

// Review Delete Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isAuthor,
  wrapAsync(reviewController.destroyReview),
);

module.exports = router;
