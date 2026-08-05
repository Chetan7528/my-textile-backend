// const { default: fetch } = require("node-fetch");
// const axios = require('axios');
// let app = require("./express");
// const http = require("http");
// app = http.createServer(app);
// const server = app.listen(process.env.PORT || 3001, () => {
//   console.log("process listening ON", process.env.PORT || 3000);
// });
// setInterval(() => {
//   axios.get("https://ljw-backend.onrender.com")
//     .then(() => console.log("Pinged server"))
//     .catch(() => console.log("Ping failed"));
// }, 5 * 60 * 1000); // Every 5 minutes
// module.exports = server;


let app = require("./express");


const server = app.listen(process.env.PORT || 3001, () => {
  console.log("process listening ON", process.env.PORT || 3000);
});
module.exports = server;

