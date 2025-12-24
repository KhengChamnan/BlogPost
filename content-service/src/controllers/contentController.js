import contentModel from "../models/contentModel.js";

export const create = async (req, res) => {
  try {
    const contentData = new Content(req.body);
    const savedContent = await contentData.save();
    res.status(200).json({ message: "Content created successfully", data: savedContent });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}