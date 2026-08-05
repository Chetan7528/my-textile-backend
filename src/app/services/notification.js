
const OneSignal = require('@onesignal/node-onesignal');
const mongoose = require("mongoose");
const Device = mongoose.model('Device');
const Notification = mongoose.model('Notification');
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;

const app_key_provider = {
    getToken() {
        return process.env.ONESIGNAL_REST_API_KEY;
    }
};
const configuration = OneSignal.createConfiguration({
    authMethods: {
        app_key: {
            tokenProvider: app_key_provider
        }
    }
});
const client = new OneSignal.DefaultApi(configuration);

const sendPush = async (player_ids, content) => {
    if (!ONESIGNAL_APP_ID || !process.env.ONESIGNAL_REST_API_KEY || !player_ids.length) {
        return;
    }
    const notification = new OneSignal.Notification();
    notification.app_id = ONESIGNAL_APP_ID;
    notification.include_player_ids = player_ids;
    notification.contents = {
        en: content
    };
    notification.name = "STM";
    try {
        return await client.createNotification(notification);
    } catch (error) {
        console.log('OneSignal push failed:', error?.body || error.message);
    }
};

module.exports = {
    // Legacy helper kept for the (currently unwired) /jobs routes in controller/job.js.
    push: async (user, content, job = null) => {
        const devices = await Device.find({ user });
        const player_ids = devices.map(d => d.player_id).filter(Boolean);
        const notObj = { for: user, message: content };
        if (job) notObj.invited_for = job;
        await Notification.create(notObj);
        return sendPush(player_ids, content);
    },

    // Saves an in-app Notification doc (same shape used across the
    // controllers) and fires a matching OneSignal push to every device
    // registered for that user. `extra` may include `type`, `invited_for`,
    // or `worker_request_id` per the Notification schema.
    notify: async (userId, message, extra = {}) => {
        const doc = await Notification.create({ for: userId, message, ...extra });
        const devices = await Device.find({ user: userId });
        const player_ids = devices.map(d => d.player_id).filter(Boolean);
        await sendPush(player_ids, message);
        return doc;
    },
}
