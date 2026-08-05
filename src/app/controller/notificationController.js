const Notification = require("../model/notification");
const response = require("../responses");

module.exports = {
  getNotifications: async (req, res) => {
    try {
      const payload = req.body;
      const notifications = await Notification.find({ for: payload.user_id })
        .populate({
          path: "worker_request_id",
          populate: [
            { path: "client_id", select: "fullName uniqueId" },
            { path: "jober_id", select: "fullName uniqueId" },
          ],
        })
        .sort({ createdAt: -1 });
      return response.ok(res, notifications);
    } catch (error) {
      return response.error(res, error);
    }
  },
};
