import express from "express";
import {
  create,
} from "../controllers/contentController.js";

const contentRoute = express.Router();

contentRoute.post("/create", create);
contentRoute.get("/getAllContent", fetch);
contentRoute.get("/getContent/:id", fetchById);
contentRoute.put("/update/:id", update);
contentRoute.delete("/delete/:id", deleteContent);
export default contentRoute;