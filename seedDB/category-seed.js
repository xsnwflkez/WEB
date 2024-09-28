const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Category = require("../models/category");
const mongoose = require("mongoose");
const connectDB = require("./../config/db");
connectDB();

async function seedDB() {
  async function seedCateg(titleStr) {
    try {
      const categ = await new Category({ title: titleStr });
      await categ.save();
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async function closeDB() {
    console.log("CLOSING CONNECTION");
    await seedCateg("Iphone");
    await seedCateg("Samsung");
    await seedCateg("Oppo");
    await seedCateg("Xiaomi");
    await seedCateg("VIVO");
    await seedCateg("Realme");
    await mongoose.disconnect();
  }

  await closeDB();
}

seedDB();
