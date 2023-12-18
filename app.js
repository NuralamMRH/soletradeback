const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

require("dotenv/config");

// Enable CORS for all routes
app.use(cors());

//middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

//Routes
const appContentRoutes = require("./routes/appContents");
const blogRoutes = require("./routes/blogPosts");
const categoriesRoutes = require("./routes/categories");
const brandRoutes = require("./routes/brands");
const productsRoutes = require("./routes/products");
const productPriceSRoutes = require("./routes/productPrices");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const payoutsRoutes = require("./routes/payouts");
const biddingOfferRoutes = require("./routes/biddingOffers");
const sellingRoutes = require("./routes/sellingItems");
const attributeRoutes = require("./routes/attributes");
const attributeOptionsRoutes = require("./routes/attributeOptions");

const api = process.env.API_URL;

app.use(`${api}/appcontents`, appContentRoutes);
app.use(`${api}/blogs`, blogRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/brands`, brandRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/product-price`, productPriceSRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/payouts`, payoutsRoutes);
app.use(`${api}/bidding`, biddingOfferRoutes);
app.use(`${api}/selling`, sellingRoutes);
app.use(`${api}/attributes`, attributeRoutes);
app.use(`${api}/attribute-options`, attributeOptionsRoutes);
// const blogSchema = new Schema({
//   title: String, // String is shorthand for {type: String}
//   author: String,
//   body: String,

//   date: { type: Date, default: Date.now },
//   hidden: Boolean,
// });

// const Blog = mongoose.model("Blog", blogSchema);

// app.post(`${api}/blog`, (req, res) => {
//   const blog = new Blog({
//     title: req.body.title,
//     author: req.body.author,
//     body: req.body.body,

//     date: req.body.date,
//     hidden: req.body.hidden,
//   });
//   blog
//     .save()
//     .then((createdBlog) => {
//       res.status(201).json(createdBlog);
//     })
//     .catch((err) => {
//       res.status(500).json({
//         error: err,
//         success: false,
//       });
//     });
// });

// app.get(`${api}/`, (req, res) => {
//   const product = {
//     id: 1,
//     name: "dsfgytushf",
//     image: "defgdfghb",
//   };
//   res.send(product);
// });

// app.post(`${api}/products`, (req, res) => {
//   const newProduct = req.body;
//   console.log(newProduct);
//   res.send(newProduct);
// });

//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    dbName: "test-db",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

//Server
app.listen(8000, () => {
  console.log("server is running http://localhost:8000");
});
