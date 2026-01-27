const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json()); // 👈 BẮT BUỘC

app.use('/api', authRoutes);
app.use('/api', userRoutes);

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
