import express from "express";
import dotenv from "dotenv";
import { dbConnect } from "./utils/dbConnect.js";
import { authUser } from "./utils/userAuth.js";
const app=express();
dotenv.config();
const port=process.env.PORT;
app.listen(port,()=>{
  console.log(`server is listening on port ${port}`);
})

authUser({username:"shantanu",email:"aryashantanu106@gmail.com",password:"12345678"});








