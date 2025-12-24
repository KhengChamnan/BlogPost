import express from "express";
import {
  create,
  fetchByContentId,
  deleteComment,
} from "../controllers/commentController.js";

const commentRoute = express.Router();

commentRoute.post("/create", create);
commentRoute.get("/getByContentId/:contentId", fetchByContentId);
commentRoute.delete("/delete/:id", deleteComment);

export default commentRoute;