const { users } = require('../models/User');

exports.login = (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: 'Wrong password' });
  }

  res.json({
    message: 'Login success',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
};

exports.register = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing data: username, email and password are required' });
  }

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  users.push({
    id: Date.now(),
    username,
    email,
    password,
  });

  res.json({ message: 'Register success' });
};
