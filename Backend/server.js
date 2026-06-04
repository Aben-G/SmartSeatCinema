const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Movie = require('./models/Movie');
const Snack = require('./models/Snack');
const Ticket = require('./models/Ticket');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartseatcinema'|| 'mongodb://hamid_user:hamid_atlas@ac-vxrgfce-shard-00-00.dj5cedo.mongodb.net:27017,ac-vxrgfce-shard-00-01.dj5cedo.mongodb.net:27017,ac-vxrgfce-shard-00-02.dj5cedo.mongodb.net:27017/?ssl=true&replicaSet=atlas-oidezz-shard-0&authSource=admin&appName=smartcinema', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Force update/create admin user for development
  try {
    const adminUser = await User.findOneAndUpdate(
      { username: 'admin' },
      { username: 'admin', password: 'admin' },
      { upsert: true, new: true }
    );
    console.log('✅ Admin user is ready (Username: admin, Password: admin)');
  } catch (err) {
    console.error('❌ Error seeding admin user:', err);
  }
})
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Movies
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/movies', async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Users/Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[Login] Attempt for username: "${username}"`);
    
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username.trim()}$`, 'i') }, 
      password: password
    });

    if (user) {
      console.log(`[Login] SUCCESS: Found user "${user.username}"`);
      res.json({ success: true, user });
    } else {
      console.log(`[Login] FAILED: No user found matching "${username}" with that password.`);
      const exists = await User.findOne({ username: { $regex: new RegExp(`^${username.trim()}$`, 'i') } });
      if (exists) {
        console.log(`[Login] NOTE: User "${username}" exists but the password was wrong.`);
      } else {
        console.log(`[Login] NOTE: No user named "${username}" exists in the database.`);
      }
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('[Login] ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// User management
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username role createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body;
    const cleanUsername = username?.trim();

    if (!cleanUsername || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const existing = await User.findOne({ username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } });
    if (existing) {
      return res.status(409).json({ error: 'This username is already taken.' });
    }

    const user = new User({ username: cleanUsername, password, role });
    await user.save();
    res.status(201).json({ user: { username: user.username, role: user.role, createdAt: user.createdAt } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('movieId');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Snacks
app.get('/api/snacks', async (req, res) => {
  try {
    const snacks = await Snack.find();
    res.json(snacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/snacks', async (req, res) => {
  try {
    const snack = new Snack(req.body);
    await snack.save();
    res.status(201).json(snack);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/snacks/:id', async (req, res) => {
  try {
    const snack = await Snack.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!snack) return res.status(404).json({ error: 'Snack not found' });
    res.json(snack);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/snacks/:id', async (req, res) => {
  try {
    const snack = await Snack.findByIdAndDelete(req.params.id);
    if (!snack) return res.status(404).json({ error: 'Snack not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// History (assuming tickets history)
app.get('/api/history', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});