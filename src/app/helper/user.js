"use strict";
const mongoose = require("mongoose");
const User = mongoose.model("User");
const { scrypt, createDecipheriv, createCipheriv } = require("crypto");
module.exports = {
  deleteUser: (condition) => {
    return User.remove(condition);
  },
  find: (condition) => {
    return User.findOne(condition, { password: 0, __v: 0 });
  },
  findAll: (condition) => {
    return User.find(condition, { password: 0, __v: 0 });
  },
  encode: (data) => {
    return new Promise((resolve, reject) => {
      scrypt(process.env.SECRET, "salt", 24, (err, key) => {
        if (err) return reject(err);
        const iv = Buffer.alloc(16, 0);
        const cipher = createCipheriv("aes-192-cbc", key, iv);
        let encrypted = cipher.update("" + data, "utf8", "hex");
        encrypted += cipher.final("hex");
        return resolve(encrypted);
      });
    });
  },
  decode: (hash) => {
    return new Promise((resolve, reject) => {
      scrypt(process.env.SECRET, "salt", 24, (err, key) => {
        if (err) return reject(err);
        const iv = Buffer.alloc(16, 0);
        const decipher = createDecipheriv("aes-192-cbc", key, iv);
        let decrypted = decipher.update(hash, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return resolve(decrypted);
      });
    });
  },
  getDatewithAddedMinutes: (minutes) => {
    return new Date(new Date().getTime() + minutes * 60000);
  },
  generateUniqueId: async (type) => {
    const roleLetter = type === "PROVIDER" ? "J" : type === "CLIENT" ? "C" : "U";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let uniqueId;
    let taken = true;
    while (taken) {
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      uniqueId = `STM${code}${roleLetter}`;
      taken = !!(await User.findOne({ uniqueId }).lean());
    }
    return uniqueId;
  },
};
