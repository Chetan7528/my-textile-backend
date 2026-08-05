"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const wwmUserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
    },
    gender: {
      type: String,
    },
    height: {
      type: String,
    },
    weight: {
      type: String,
    },
    desireWeight: {
      type: String,
    },
    bornYear: {
      type: String,
    },
    goal: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
wwmUserSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

// userSchema.methods.encryptPassword = (password) => {
//   return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
// };
// userSchema.methods.isValidPassword = function isValidPassword(password) {
//   return bcrypt.compareSync(password, this.password);
// };
module.exports = mongoose.model("wwmUser", wwmUserSchema);
