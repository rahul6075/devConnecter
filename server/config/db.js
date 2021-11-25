const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongoDB connected..");
  } catch (error) {
    console.log(error.message);
    //exit the process with failure
    process.exit();
  }
};

module.exports = connectDB;