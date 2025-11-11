import UserModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbConnect } from "./dbConnect.js";
import dotenv from "dotenv";

dotenv.config();

export const authUser = async ({ username, email, password }) => {
  const conn = await dbConnect();
  if (conn.connection.readyState !== 1) {
    return { error: "Database is not connected" };
  }

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  try {
    const existingUser = await UserModel.findOne({
      username: username.toLowerCase(),
    });

    if (existingUser) {
      const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
      if (!isPasswordMatch) return { error: "Invalid credentials." };

      const token = jwt.sign(
        { id: existingUser._id, username: existingUser.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      existingUser.password = undefined;
      return { message: "Login successful", user: existingUser, token };
    }

    if (!email) return { error: "Email is required to register a new user." };

    const emailInUse = await UserModel.findOne({ email: email.toLowerCase() });
    if (emailInUse) return { error: "This email is already registered." };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    newUser.password = undefined;
    return { message: "User registered successfully", user: newUser, token };
  } catch (err) {
    return { error: err.message };
  }
};
