const Designs = require("../model/designModel");
const response = require("../responses");

module.exports = {
  addDesign: async (req, res) => {
    const payload = req.body;
    let design = new Designs({
      name: payload.name,
      designNumber: payload.designNumber,
      description: payload.description,
      images: payload.images || [],
      user_id: payload.user_id,
    });

    await design.save();
    return response.created(res, { design });
  },

  getAllDesigns: async (req, res) => {
    const payload = req.body;
    const designs = await Designs.find({ user_id: payload.user_id });
    return response.ok(res, designs);
  },

  getDesignById: async (req, res) => {
    const payload = req.body;
    const design = await Designs.find({
      _id: payload.design_id,
    });
    return response.ok(res, design);
  },

  updateDesign: async (req, res) => {
    const payload = req.body;
    const design = await Designs.findByIdAndUpdate(payload._id, payload, {
      new: true,
      upsert: true,
    });
    return response.ok(res, design);
  },

  deleteDesign: async (req, res) => {
    const payload = req.body;
    await Designs.findByIdAndRemove(payload.design_id);
    return response.ok(res, { message: "Design deleted successfully!" });
  },
};
