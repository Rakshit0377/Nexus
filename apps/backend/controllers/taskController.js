// this would contain all task functions
import TaskModel from "../models/taskModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Helper: verify token and return userId
const verifyToken = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("No token provided");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

// 📌 Create a new task
export const createTask = async (req, res) => {
  try {
    const userId = verifyToken(req);
    const { title, description, dueDate, reminderAt } = req.body;

    const newTask = await TaskModel.create({
      title,
      description,
      dueDate,
      reminderAt,
      user: userId,
    });

    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 📋 Get all tasks for logged-in user
export const getAllTasks = async (req, res) => {
  try {
    const userId = verifyToken(req);
    const tasks = await TaskModel.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// 🔍 Get single task by ID
export const getTaskById = async (req, res) => {
  try {
    const userId = verifyToken(req);
    const task = await TaskModel.findOne({ _id: req.params.id, user: userId });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✏️ Update a task
export const updateTask = async (req, res) => {
  try {
    const userId = verifyToken(req);
    const task = await TaskModel.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json({ message: "Task updated", task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ❌ Delete a task
export const deleteTask = async (req, res) => {
  try {
    const userId = verifyToken(req);
    const task = await TaskModel.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
