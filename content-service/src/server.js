import express from "express";
import contentRoute from "./routes/contentRoute.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

const app = express();
app.use(bodyParser.json());
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(mongourl).then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
})

app.use("/api/content", contentRoute);