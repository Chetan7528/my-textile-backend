const clients = require("../model/clientModel");
const response = require("../responses");

module.exports = {
  addClints: async (req, res) => {
    const payload = req.body;
    console.log(payload);
    let client = new clients({
      name: payload.name.toLowerCase(),
      firm: payload.firm,
      contact: payload.contact,
      email: payload.email.toLowerCase(),
      address: payload.address,
      textile: payload.textile,
      user_id: payload.user_id,
    });

    await client.save();
    return response.created(res, { client });
  },

  getAllClients: async (req, res) => {
    const payload = req.body;
    const client = await clients.find({ user_id: payload.user_id });
    return response.ok(res, client);
  },

  getClientById: async (req, res) => {
    const payload = req.body;
    const client = await clients.find({
      _id: payload.client_id,
    });
    return response.ok(res, client);
  },

  updateClient: async (req, res) => {
    const payload = req.body;
    const client = await clients.findByIdAndUpdate(payload._id, payload, {
      new: true,
      upsert: true,
    });
    return response.ok(res, client);
  },

  deleteClient: async (req, res) => {
    const payload = req.body;
    const client = await clients.findByIdAndRemove(payload.client_id);
    return response.ok(res, { message: "Client deleted successfully!" });
  },
};
