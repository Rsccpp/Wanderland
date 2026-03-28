const Listing = require("../models/listing");
const Review = require("../models/review");

// Create review
module.exports.createReview = async (req, res) => {
    let listingId = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listingId.reviews.push(newReview);
    await newReview.save();
    await listingId.save();
    req.flash("success", "New review created!");

    res.redirect(`/listings/${listingId._id}`);
  };

// deleteReview
module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");

    res.redirect(`/listings/${id}`);
  };