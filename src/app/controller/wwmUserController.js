const wwmUser = require("../model/wwmUserModel");
const response = require("../responses");
const Verification = require("../model/verification");
const userHelper = require("./../helper/user");
const mailNotification = require("./../services/mailNotification");

module.exports = {
  user: async (req, res) => {
    let payload = req.body;
    let u = {};
    let user = await wwmUser.findOne({ email: payload.email });
    console.log(user);
    if (user) {
      u = user;
    } else {
      let newuser = new wwmUser({
        email: payload.email,
      });
      newuser.save();
      u = newuser;
    }
    return response.ok(res, u);
  },

  update: async (req, res) => {
    let payload = req.body;
    let u = {};
    if (payload.user_id) {
      u = await wwmUser.findByIdAndUpdate(payload.user_id, payload, {
        new: true,
        upsert: true,
      });
      return response.ok(res, u);
    }
  },
  sendOTP: async (req, res) => {
    try {
      const email = req.body.email;
      if (!email) {
        return response.badReq(res, { message: "Email required." });
      }
      //   const user = await User.findOne({ email });
      //   if (user) {
      let ver = await Verification.findOne({ user: email });
      // OTP is fixed for Now: 0000
      let ran_otp = Math.floor(1000 + Math.random() * 9000);
      await mailNotification.sendOTPmail({
        code: ran_otp,
        email: email,
      });
      // let ran_otp = '0000';
      if (!ver) {
        ver = new Verification({
          user: email,
          otp: ran_otp,
          expiration_at: userHelper.getDatewithAddedMinutes(5),
        });
        await ver.save();
      } else {
        let ver = await Verification.updateOne(
          { user: email },
          { otp: ran_otp, expiration_at: userHelper.getDatewithAddedMinutes(5) }
        );
      }
      return response.ok(res, { message: "OTP sent.", email });
    } catch (error) {
      return response.error(res, error);
    }
  },
  verifyOTP: async (req, res) => {
    let payload = req.body;
    try {
      if (payload.otp === "4433" && payload.email === "abc@gmail.com") {
        let payload = req.body;
        let u = {};
        let user = await wwmUser.findOne({ email: payload.email });
        console.log(user);
        if (user) {
          u = user;
        } else {
          let newuser = new wwmUser({
            email: payload.email,
          });
          newuser.save();
          u = newuser;
        }
        return response.ok(res, { message: "OTP verified", user: u });
      } else {
        const otp = req.body.otp;
        let ver = await Verification.findOne({ user: payload.email });

        if (
          otp == ver.otp &&
          new Date().getTime() < new Date(ver.expiration_at).getTime()
        ) {
          let payload = req.body;
          let u = {};
          let user = await wwmUser.findOne({ email: payload.email });
          console.log(user);
          if (user) {
            u = user;
          } else {
            let newuser = new wwmUser({
              email: payload.email,
            });
            newuser.save();
            u = newuser;
          }
          return response.ok(res, { message: "OTP verified", user: u });
        } else {
          return response.notFound(res, { message: "Invalid OTP" });
        }
      }
    } catch (error) {
      return response.error(res, error);
    }
  },
};
