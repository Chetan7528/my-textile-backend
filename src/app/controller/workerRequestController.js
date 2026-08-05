const mongoose = require("mongoose");
const User = mongoose.model("User");
const WorkerRequest = require("../model/workerRequestModel");
const notification = require("../services/notification");
const response = require("../responses");

module.exports = {
  sendRequest: async (req, res) => {
    try {
      const payload = req.body;
      // Any account that isn't a CLIENT is treated as a Jober elsewhere in the
      // app (see MainRoutes/SignIn role routing), including legacy accounts
      // still stamped `type: "USER"` from before the Jober/Client split.
      const jober = await User.findOne({
        uniqueId: payload.workerUniqueId,
        type: { $ne: "CLIENT" },
      });
      if (!jober) {
        return res
          .status(200)
          .send({ status: false, message: "No Jober found with this unique id." });
      }

      const existing = await WorkerRequest.findOne({
        client_id: payload.client_id,
        jober_id: jober._id,
      });
      if (existing) {
        return res
          .status(200)
          .send({ status: false, message: "You already sent a request to this Jober." });
      }

      const client = await User.findById(payload.client_id);

      // Scanning the jober's own QR code (from their Profile page) is
      // treated as an in-person mutual confirmation, so the connection is
      // Accepted immediately instead of going through the normal
      // Pending -> acceptRequest approval step.
      const request = new WorkerRequest({
        client_id: payload.client_id,
        jober_id: jober._id,
        workerUniqueId: payload.workerUniqueId,
        role: payload.role,
        status: payload.viaQr ? "Accepted" : "Pending",
        requestedBy: "CLIENT",
      });
      await request.save();

      await notification.notify(
        jober._id,
        payload.viaQr
          ? `${client?.fullName || "A client"} connected with you via QR code${
              payload.role ? ` for ${payload.role}` : ""
            }.`
          : `${client?.fullName || "A client"} sent you a worker request${
              payload.role ? ` for ${payload.role}` : ""
            }.`,
        {
          type: payload.viaQr ? "WORKER_ACCEPTED" : "WORKER_REQUEST",
          worker_request_id: request._id,
        }
      );

      return response.created(res, { request });
    } catch (error) {
      return response.error(res, error);
    }
  },

  // The Jober-initiated mirror of sendRequest - a jober enters/scans a
  // client's own unique id to send that client a connection request.
  sendClientRequest: async (req, res) => {
    try {
      const payload = req.body;
      const client = await User.findOne({
        uniqueId: payload.clientUniqueId,
        type: "CLIENT",
      });
      if (!client) {
        return res
          .status(200)
          .send({ status: false, message: "No Client found with this unique id." });
      }

      const existing = await WorkerRequest.findOne({
        client_id: client._id,
        jober_id: payload.jober_id,
      });
      if (existing) {
        return res
          .status(200)
          .send({ status: false, message: "You already sent a request to this Client." });
      }

      const jober = await User.findById(payload.jober_id);

      const request = new WorkerRequest({
        client_id: client._id,
        jober_id: payload.jober_id,
        workerUniqueId: payload.clientUniqueId,
        role: payload.role,
        status: payload.viaQr ? "Accepted" : "Pending",
        requestedBy: "JOBER",
      });
      await request.save();

      await notification.notify(
        client._id,
        payload.viaQr
          ? `${jober?.fullName || "A worker"} connected with you via QR code${
              payload.role ? ` as ${payload.role}` : ""
            }.`
          : `${jober?.fullName || "A worker"} sent you a connection request${
              payload.role ? ` as ${payload.role}` : ""
            }.`,
        {
          type: payload.viaQr ? "WORKER_ACCEPTED" : "WORKER_REQUEST",
          worker_request_id: request._id,
        }
      );

      return response.created(res, { request });
    } catch (error) {
      return response.error(res, error);
    }
  },

  acceptRequest: async (req, res) => {
    try {
      const payload = req.body;
      const request = await WorkerRequest.findById(payload.request_id);
      if (!request) {
        return res.status(200).send({ status: false, message: "Request not found." });
      }

      request.status = "Accepted";
      await request.save();

      // Notify whoever originally sent the request (not whoever is
      // accepting it). Requests saved before `requestedBy` existed were
      // all client-initiated.
      const requestedByJober = request.requestedBy === "JOBER";
      const accepterId = requestedByJober ? request.client_id : request.jober_id;
      const requesterId = requestedByJober ? request.jober_id : request.client_id;
      const accepter = await User.findById(accepterId);

      await notification.notify(
        requesterId,
        `${accepter?.fullName || "Someone"} accepted your connection request.`,
        { type: "WORKER_ACCEPTED", worker_request_id: request._id }
      );

      return response.ok(res, request);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getClientWorkerRequests: async (req, res) => {
    try {
      const payload = req.body;
      const requests = await WorkerRequest.find({ client_id: payload.user_id })
        .populate("jober_id", "fullName uniqueId")
        .sort({ createdAt: -1 });
      return response.ok(res, requests);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getJoberWorkerRequests: async (req, res) => {
    try {
      const payload = req.body;
      const requests = await WorkerRequest.find({ jober_id: payload.user_id })
        .populate("client_id", "fullName uniqueId")
        .sort({ createdAt: -1 });
      return response.ok(res, requests);
    } catch (error) {
      return response.error(res, error);
    }
  },
};
