const path = require("path");
const { JSDOM } = require("jsdom");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Product = require("../models/product");
const Category = require("../models/category");
const mongoose = require("mongoose");
const faker = require("faker");
const destinations = require("./data.js");
const connectDB = require("./../config/db");

connectDB();

async function seedDB() {
  faker.seed(0);

  async function seedProducts(title, img, desc, price, manufacturer, categStr) {
    try {
      const categ = await Category.findOne({ title: categStr });
      let prod = new Product({
        productCode: faker.helpers.replaceSymbolWithNumber("####-##########"),
        title: title,
        imagePath: img,
        description: desc,
        price: price,
        manufacturer: manufacturer,
        available: true,
        category: categ._id,
      });
      await prod.save();
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async function closeDB() {
    console.log("CLOSING CONNECTION");
    await mongoose.disconnect();
  }

  async function fetchProducts(html) {
    let products = [];
    const doc = new JSDOM(html).window.document;
    doc.querySelectorAll(".listproduct li.__cate_42").forEach((product) => {
      const name = product.querySelector("a h3");
      const img =
        product.querySelector(".item-img_42 img").getAttribute("src") ||
        product.querySelector(".item-img_42 img").getAttribute("data-src");
      let desc = "";
      product.querySelectorAll(".utility p").forEach((element) => {
        desc += element.textContent + "\n";
      });
      const price = product.querySelector("strong.price");
      products.push({
        name: name ? name.textContent.trim() : "default",
        img: img
          ? img
          : "https://th.bing.com/th/id/OIP.nvdM5sEm4DqG8oZb8nNStQHaHa?rs=1&pid=ImgDetMain",
        desc: desc ? desc : "default",
        price: price ? price.textContent.trim() : "0d",
      });
    });

    return products;
  }

  for (const dest of destinations) {
    const products = await fetchProducts(dest.doc);
    for (const product of products) {
      await seedProducts(
        // Make sure this awaits if it's an async operation
        product.name,
        product.img,
        product.desc,
        product.price.slice(0, -1).replace(/\./g, ""),
        dest.category,
        dest.category
      );
    }
  }

  await closeDB();
}

seedDB();
