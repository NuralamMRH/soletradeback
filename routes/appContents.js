const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

//image upload
const multer = require("multer");

const { AppContent } = require("../models/appcontent");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

let uploadCount = 1; // Initialize the upload count

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const extension = FILE_TYPE_MAP[file.mimetype];
    const newFileName = `soletrade-${Date.now()}-${uploadCount}.${extension}`;
    uploadCount++; // Increment the upload count for the next file
    cb(null, newFileName);
  },
});

const uploadOptions = multer({ storage: storage });

router.post(
  `/`,
  uploadOptions.fields([
    { name: "appLogo", maxCount: 1 },
    { name: "homeSlider", maxCount: 100 },
  ]),
  async (req, res) => {
    try {
      const imageFile = req.files["appLogo"];
      const fileName = imageFile ? imageFile[0].filename : null;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      const imagesFiles = req.files["homeSlider"];
      let imagesPaths = [];
      if (imagesFiles) {
        imagesPaths = imagesFiles.map((file) => {
          return `${basePath}${file.filename}`;
        });
      }

      const appContent = new AppContent({
        appLogo: `${basePath}${fileName}`,
        homeSlider: imagesPaths,
      });

      const savedAppContent = await appContent.save();

      if (!savedAppContent) {
        return res.status(500).send("The content cannot be created");
      }

      res.send(savedAppContent);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get(`/`, async (req, res) => {
  const appContentList = await AppContent.find();

  if (!appContentList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(appContentList);
});

router.get("/:id", async (req, res) => {
  try {
    const appContent = await AppContent.findById(req.params.id);

    if (!appContent) {
      return res
        .status(404)
        .json({ message: "The category with the given ID was not found." });
    }

    return res.status(200).send(appContent);
  } catch (error) {
    // console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put(
  "/:id",
  uploadOptions.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 100 },
  ]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid Product Id");
      }

      const appContent = await AppContent.findById(req.params.id);
      if (!appContent) {
        return res.status(400).send("Invalid appContent!");
      }

      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      let imagepath = product.image;

      // Handle single file upload
      const imageFile = req.files && req.files["image"];
      if (imageFile) {
        const fileName = imageFile[0].filename;
        imagepath = `${basePath}${fileName}`;
      }

      // Handle multiple file upload
      const imagesFiles = req.files && req.files["images"];
      let imagesPaths = product.images;
      if (imagesFiles) {
        imagesPaths = imagesFiles.map((file) => `${basePath}${file.filename}`);
      }

      const updatedAppContent = await Product.findByIdAndUpdate(
        req.params.id,
        {
          appLogo: imagepath,
          homeSlider: imagesPaths,
        },
        { new: true }
      );

      if (!updatedAppContent) {
        return res.status(500).send("The appContent cannot be updated!");
      }

      res.send(updatedAppContent);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
