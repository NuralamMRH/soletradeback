const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const { BlogPost } = require("../models/blogPost");

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

router.get(`/`, async (req, res) => {
  // localhost:3000/api/v1/products?categories=2342342,234234

  const blogList = await BlogPost.find().populate("brand");

  if (!blogList) {
    res.status(500).json({ success: false });
  }
  res.send(blogList);
});

router.get(`/:id`, async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id).populate("brand");

    if (!blogPost) {
      return res
        .status(404)
        .json({ message: "The blogPost with the given ID was not found." });
    }

    return res.status(200).send(blogPost);
  } catch (error) {
    // console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post(
  `/`,
  uploadOptions.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 100 },
  ]),
  async (req, res) => {
    try {
      const imageFile = req.files["image"];
      const fileName = imageFile ? imageFile[0].filename : null;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      const imagesFiles = req.files["images"];
      let imagesPaths = [];
      if (imagesFiles) {
        imagesPaths = imagesFiles.map((file) => {
          return `${basePath}${file.filename}`;
        });
      }

      const blogPost = new BlogPost({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        images: imagesPaths,
        brand: req.body.brand,
        isFeatured: req.body.isFeatured,
      });

      const savedBlogPost = await blogPost.save();

      if (!savedBlogPost) {
        return res.status(500).send("The blog post cannot be created");
      }

      res.send(blogPost);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.put(
  "/:id",
  uploadOptions.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 100 },
  ]),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid blog Id");
      }

      const blogPost = await BlogPost.findById(req.params.id);
      if (!blogPost) {
        return res.status(400).send("Invalid blogPost!");
      }

      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      let imagepath = blogPost.image;

      // Handle single file upload
      const imageFile = req.files && req.files["image"];
      if (imageFile) {
        const fileName = imageFile[0].filename;
        imagepath = `${basePath}${fileName}`;
      }

      // Handle multiple file upload
      const imagesFiles = req.files && req.files["images"];
      let imagesPaths = blogPost.images;
      if (imagesFiles) {
        imagesPaths = imagesFiles.map((file) => `${basePath}${file.filename}`);
      }

      const updatedBlogPost = await BlogPost.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          description: req.body.description,
          richDescription: req.body.richDescription,
          image: imagepath,
          images: imagesPaths,
          brand: req.body.brand,
          isFeatured: req.body.isFeatured,
        },
        { new: true }
      );

      if (!updatedBlogPost) {
        return res.status(500).send("The blog cannot be updated!");
      }

      res.send(updatedBlogPost);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.delete("/:id", (req, res) => {
  BlogPost.findByIdAndDelete(req.params.id)
    .then((blog) => {
      if (blog) {
        return res
          .status(200)
          .json({ success: true, message: "the blog is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "blog not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get(`/get/count`, async (req, res) => {
  try {
    const blogCount = await BlogPost.countDocuments();

    if (!blogCount) {
      return res.status(500).json({ success: false });
    }

    res.send({
      blogCount: blogCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const blogPost = await BlogPost.find({ isFeatured: true }).limit(+count);

  if (!blogPost) {
    res.status(500).json({ success: false });
  }
  res.send(blogPost);
});

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid blogPost Id");
    }

    const blogPost = await BlogPost.findById(req.params.id);
    if (!blogPost) return res.status(400).send("Invalid blogPost!");

    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    // Handle multiple file upload
    const imagesFiles = req.files && req.files["images"];
    let imagesPaths = blogPost.images;
    if (imagesFiles) {
      imagesPaths = imagesFiles.map((file) => `${basePath}${file.filename}`);
    }

    const blogPostGal = await BlogPost.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!blogPostGal)
      return res.status(500).send("the gallery cannot be updated!");

    res.send(blogPostGal);
  }
);

module.exports = router;
