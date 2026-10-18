const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/data', (req, res) => {
    const jsonData = {
        success: true,
        message: "Data retrieved successfully!",
        data: {
            id: 1,
            name: "John Doe",
            role: "Developer"
        }
    };

    // Automatically sets Content-Type to application/json and sends data
    res.json(jsonData);
});
const users = [];

// Create a demo user with a hashed password
(async () => {
  users.push({
    id: 1,
    username: 'admin',
    passwordHash: await bcrypt.hash('password123', 10),
  });
})();

const categories = [
  { id: 'head', name: 'Head Protection', icon: 'helmet', count: 48 },
  { id: 'hand', name: 'Hand Protection', icon: 'glove', count: 112 },
  { id: 'eye', name: 'Eye & Face', icon: 'goggles', count: 65 },
  { id: 'foot', name: 'Safety Footwear', icon: 'boot', count: 90 },
  { id: 'body', name: 'High-Visibility', icon: 'vest', count: 57 },
  { id: 'resp', name: 'Respiratory', icon: 'mask', count: 34 },
  { id: 'hear', name: 'Hearing Protection', icon: 'ear', count: 22 },
  { id: 'fall', name: 'Fall Protection', icon: 'harness', count: 29 },
  { id: 'aid', name: 'First Aid', icon: 'kit', count: 41 },
  { id: 'fire', name: 'Fire Safety', icon: 'extinguisher', count: 19 }
];

const products = [
  { id: 1, name: 'ABS Hard Hat with Ratchet Suspension', category: 'head', price: 39.0, oldPrice: 49.0, rating: 4.8, reviews: 214, badge: 'Best Seller', image: '' },
  { id: 2, name: 'Cut-Level 5 Nitrile-Coated Gloves (Pair)', category: 'hand', price: 14.5, oldPrice: null, rating: 4.7, reviews: 388, badge: 'Best Seller', image: '' },
  { id: 3, name: 'Anti-Fog Safety Goggles, Clear Lens', category: 'eye', price: 18.0, oldPrice: 22.0, rating: 4.6, reviews: 97, badge: 'Sale', image: '' },
  { id: 4, name: 'Steel-Toe Safety Boots, S3 Rated', category: 'foot', price: 189.0, oldPrice: 229.0, rating: 4.9, reviews: 156, badge: 'Best Seller', image: '' },
  { id: 5, name: 'Hi-Vis Reflective Vest, Class 2', category: 'body', price: 22.0, oldPrice: null, rating: 4.5, reviews: 73, badge: '', image: '' },
  { id: 6, name: 'FFP2 Disposable Respirator (Box of 20)', category: 'resp', price: 45.0, oldPrice: 55.0, rating: 4.4, reviews: 61, badge: 'Sale', image: '' },
  { id: 7, name: 'Ear Muffs, SNR 30 dB', category: 'hear', price: 29.5, oldPrice: null, rating: 4.6, reviews: 45, badge: '', image: '' },
  { id: 8, name: 'Full-Body Fall Arrest Harness', category: 'fall', price: 265.0, oldPrice: 310.0, rating: 4.7, reviews: 38, badge: '', image: '' }
];

const promos = [
  { id: 'p1', title: 'Free Delivery Over SAR 300', text: 'Free shipping across Jeddah, Riyadh and Dammam.', cta: 'Shop now', tone: 'navy' },
  { id: 'p2', title: 'Bulk & Site Orders', text: 'Request a quotation for multi-site and project supply.', cta: 'Request quote', tone: 'amber' },
  { id: 'p3', title: 'Safety Starter Kits', text: 'Pre-packed kits for new hires and site inductions.', cta: 'View kits', tone: 'slate' }
];

// ---- API ----

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/products', (req, res) => {
  let result = products;
  if (req.query.category) {
    result = result.filter(p => p.category === req.query.category);
  }
  if (req.query.bestSellers === 'true') {
    result = result.filter(p => p.badge === 'Best Seller');
  }
  const limit = Math.min(parseInt(req.query.limit, 10) || result.length, 50);
  res.json(result.slice(0, limit));
});

app.get('/api/promos', (req, res) => {
  res.json(promos);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (users.find((u) => u.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ id: users.length + 1, username, passwordHash });
  res.status(201).json({ message: 'User registered' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '1h',
  });

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000,
  });
  res.json({ message: 'Login successful', username: user.username });
});

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// Protected route example
app.get('/api/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ username: payload.username });
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
