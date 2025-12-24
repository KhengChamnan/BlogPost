import contentModel from "../models/contentModel.js";

export const create = async (req, res) => {
  try {
    const contentData = new contentModel(req.body);
    const savedContent = await contentData.save();
    res.status(200).json({ message: "Content created successfully", data: savedContent });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}
export const fetchById = async (req, res) => {
  try {
    const id = req.params.id;
    const content = await contentModel.findById(id);
    if (!content) {
      return res.status(404).json({ message: "Content Not found" });
    }
    res.status(200).json({ message: "Content fetched successfully", data: content });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}

export const fetch = async (req, res) => {
  try {
    const contents = await contentModel.find();
    if (contents.length === 0) {
      return res.status(404).json({ message: "Content Not found" });
    }
    res.status(200).json({ message: "Contents fetched successfully", data: contents });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const contentExist = await contentModel.findById({ _id: id });
    if (!contentExist) {
      return res.status(404).json({ message: "Content Not found" });
    }
    const updatedContent = await contentModel.findByIdAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true }
    );
    res.status(201).json({ message: "Content updated successfully", data: updatedContent });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}

export const deleteContent = async (req, res) => {
  try {
    const id = req.params.id;
    const contentExist = await contentModel.findById({ _id: id });
    if (!contentExist) {
      return res.status(404).json({ message: "Content Not found" });
    }

    await contentModel.findByIdAndDelete({ _id: id });
    res.status(201).json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}