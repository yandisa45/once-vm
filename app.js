const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { createUser, getUser } = require('./db');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'very_secret_key',
  resave: false,
  saveUninitialized: false
}));

// Routes
app.get('/', (req, res) => {
  if (req.session.user) {
    res.send(`<h1>Welcome, ${req.session.user.username}!</h1><a href="/logout">Logout</a>`);
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const success = createUser(username, password);

  if (success) {
    res.send('<h2>Signup successful!</h2><a href="/">Login</a>');
  } else {
    res.send('<h2>User already exists!</h2><a href="/signup">Try again</a>');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = getUser(username);

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = { id: user.id, username: user.username };
    res.redirect('/');
  } else {
    res.send('<h2>Login failed</h2><a href="/">Try again</a>');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
