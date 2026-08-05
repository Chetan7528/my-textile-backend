const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WorkerRequestSchema = new Schema(
  {
    client_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    jober_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    workerUniqueId: {
      type: String,
    },
    role: {
      type: String,
    },
    status: {
      type: String,
      default: "Pending",
    },
    // Who initiated this connection - determines which side sees the
    // "Accept" action for a Pending request, and who gets notified when
    // the other side accepts. Missing on requests created before this
    // field existed, which were all client-initiated.
    requestedBy: {
      type: String,
      enum: ["CLIENT", "JOBER"],
      default: "CLIENT",
    },
  },
  {
    timestamps: true,
  }
);

const WorkerRequest = mongoose.model("WorkerRequest", WorkerRequestSchema);
module.exports = WorkerRequest;
