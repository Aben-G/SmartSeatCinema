const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  poster: String,
  hall: { type: String, required: true },
  genre: { type: String, required: true },
  ageRating: { type: String, required: true },
  language: String,
  duration: { type: Number, required: true },
  director: String,
  cast: String,
  synopsis: String,
  ticketPrice: { type: Number, required: true },
  showtimes: String,
  status: { type: String, default: 'Now Showing' },
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);