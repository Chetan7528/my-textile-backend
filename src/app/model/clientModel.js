const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: "string",
    },
    firm: {
      type: "string",
    },
    contact: {
      type: "string",
    },
    email: {
      type: "string",
      trim: true,
    },
    address: {
      type: "string",
    },
    textile: {
      type: "string",
    },
    percentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Clients = mongoose.model("Clients", clientSchema);
module.exports = Clients;
