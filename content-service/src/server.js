import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import contentRoute from './routes/contentRoute.js';

const app = express();

app.use(bodyParser.json());
dotenv.config();

// Specify the port to listen on
const port = process.env.PORT || 3001;

// Connect to MongoDB
const mongourl = process.env.MONGO_URL;

mongoose.connect(mongourl).then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
})

app.use("/api/content", contentRoute);