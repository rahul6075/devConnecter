//dotnev for securing envoirment variable
require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const path = require("path");

//Connect Database
connectDB();

// Init Middileware
app.use(morgan("dev"));
app.use(express.json({ extended: false }));
if (process.env.NODE_ENV == "development") {
  app.use(cors({ origin: "http://localhost:3000" }));
}
const PORT = process.env.PORT;

//Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

// Serve static assests in production

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
//   });
// }

app.listen(PORT, () => console.log("server is running on port", { PORT }));
