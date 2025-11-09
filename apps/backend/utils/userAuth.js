// this will be used to authenticate the user on basis of their id password

import UserModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { dbConnect } from "./dbConnect.js";
export const authUser = async ({ username, email, password }) => {
  const conn=await dbConnect();
  if(conn.connection.readyState!=1){
    return {
      error:"Database is not connected"
    };
  }
  if (!username || !password) {
    return { error: "Username and password are required." };
  }
  try {
    // Check if user exists
    const existingUser = await UserModel.findOne({
      username: username.toLowerCase(),
    });

    if (existingUser) {
      //USER EXISTS (LOGIN ATTEMPT)
      const isPasswordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!isPasswordMatch) {
        return { error: "Invalid credentials." };
      }

      // Passwords match! Return the user.
      console.log(`User ${username} logged in successfully.`);
      existingUser.password = undefined;
      return { user: existingUser };
    } else {
      // USER NOT FOUND (REGISTER ATTEMPT) 

      // Email is required to create a new user
      if (!email) {
        return { error: "Email is required to register a new user." };
      }

      // Check if the email is already taken
      const emailInUse = await UserModel.findOne({
        email: email.toLowerCase(),
      });
      if (emailInUse) {
        return { error: "This email is already registered." };
      }

      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user with default values
      const newUser = new UserModel({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      await newUser.save();
      console.log(`New user ${username} created successfully.`);

      newUser.password = undefined;
      return { user: newUser };
    }
  } catch (err) {
    console.error("❌ Authentication error:", err.message);
    return { error: err.message };
  }
};