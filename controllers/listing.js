const listing = require("../models/listing");
const { populate } = require("../models/review");

module.exports.index = async (req, res) => {
  const listings = await listing.find({});
  res.render("listings/index.ejs", { listings });
};

module.exports.renderNewForm = async(req, res) => {
  const categories = await listing.schema.path("category").enumValues;
  res.render("listings/new.ejs", { categories });
};

module.exports.showListings = async (req, res) => {
  const { id } = req.params;
  const listDetail = await listing
    .findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
    

  if (!listDetail) {
    req.flash("error", "Listing you requested for doesn't exists!");
    return res.redirect("/listings");
  }
  res.cookie("visited", `${listDetail.title}`);
  res.render("listings/show.ejs", { listDetail });
};

module.exports.editListing = async (req, res, next) => {
  const { id } = req.params;
  const listings = await listing.findById(id);
  if (!listings) {
    req.flash("error", "Listing you requested for doesn't exists!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listings.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listings, originalImageUrl });
};

module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const listings = new listing(req.body.Listing);
  listings.owner = req.user._id;
  listings.image = { url, filename };
  await listings.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let Listing = await listing.findByIdAndUpdate(id, { ...req.body.Listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    Listing.image = { url, filename };
    await Listing.save();
  }
  const listDetail = await listing.findById(id);

  req.flash("success", "Listing updated!");
  res.render("listings/show.ejs", {
    listDetail,
    successMsg: req.flash("success"),
  });
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await listing.findByIdAndDelete(id, req.body.Listing);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};
