const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DesignSchema = new Schema(
  {
    name: {
      type: String,
    },
    designNumber: {
      type: String,
    },
    description: {
      type: String,
    },
    images: [{ type: String }],
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Designs = mongoose.model("Designs", DesignSchema);
module.exports = Designs;
