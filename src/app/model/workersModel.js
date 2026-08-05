const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workerSchema = new Schema(
  {
    fullName: {
      type: "string",
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Workers = mongoose.model("Workers", workerSchema);
module.exports = Workers;
