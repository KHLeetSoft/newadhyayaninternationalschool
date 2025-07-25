const mongoose = require("mongoose");

const logoSchema = new mongoose.Schema({
  logoUrl: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Logo", logoSchema);
