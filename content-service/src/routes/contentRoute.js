import express from "express";
import {
  create,
} from "../controllers/contentController.js";

const contentRoute = express.Router();

contentRoute.post("/create", create);

export default contentRoute;