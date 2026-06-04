const mongoose = require('mongoose');

const snackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: Number,
  description: String,
  image: String,
  available: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Snack', snackSchema);