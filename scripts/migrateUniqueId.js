"use strict";
// One-off migration: backfill `uniqueId` on every User document that
// doesn't have one yet (accounts created before the STM<code><J|C> id was
// introduced). Safe to re-run - it only touches users missing the field.
//
// Usage: node scripts/migrateUniqueId.js

require("dotenv").config();
const path = require("path");

// Registers all mongoose models (User, Designs, Jobs, ...) as a side effect.
require(path.join(__dirname, "../express/bootstrap"));
// Opens the mongoose connection as a side effect (same DB the app server uses).
require(path.join(__dirname, "../express/db"));

const mongoose = require("mongoose");
const userHelper = require(path.join(__dirname, "../src/app/helper/user"));

const waitForConnection = () =>
  new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) {
      return resolve();
    }
    mongoose.connection.once("connected", resolve);
    mongoose.connection.once("error", reject);
  });

const migrate = async () => {
  await waitForConnection();
  const User = mongoose.model("User");

  const users = await User.find({
    $or: [{ uniqueId: { $exists: false } }, { uniqueId: null }, { uniqueId: "" }],
  });

  console.log(`Found ${users.length} user(s) without a uniqueId.`);

  let migrated = 0;
  for (const user of users) {
    user.uniqueId = await userHelper.generateUniqueId(user.type);
    await user.save();
    console.log(`  ${user.email || user.username} (${user.type}) -> ${user.uniqueId}`);
    migrated++;
  }

  console.log(`Done. Migrated ${migrated} user(s).`);
  process.exit(0);
};

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
