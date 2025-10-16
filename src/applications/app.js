const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const errorMiddleware = require("../middleware/error-middleware");
const mainRoutes = require("../routes/route");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/apinya", mainRoutes);
app.use(errorMiddleware);

module.exports = app;
