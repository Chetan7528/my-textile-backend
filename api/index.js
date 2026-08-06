// Vercel serverless entrypoint. Exports a plain request-handler function
// (not the Express app itself) so @vercel/node invokes it directly per
// request instead of detecting a `.listen` method and trying to spin up
// its own internal HTTP server bridge around it.
const app = require("../express").app;

module.exports = (req, res) => app(req, res);
