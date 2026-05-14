const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  customerName: String,
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  movieTitle: String,
  seats: [String],
  snacks: { type: Map, of: Number }, // snackId: quantity
  payment: String,
  total: Number,
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);