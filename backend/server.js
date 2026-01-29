const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', userRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Backend API is running",
    status: "OK",
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
