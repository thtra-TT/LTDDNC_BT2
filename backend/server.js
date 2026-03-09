const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/profileRoutes');
const bookRoutes = require('./routes/bookRoutes.js')
const categoryRoutes = require("./routes/categoryRoutes");
const upload = require("./middleware/upload");
const cartRoutes = require('./routes/cartRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use("/uploads", express.static("uploads"));
app.post("/upload-avatar", upload.single("avatar"), (req, res) => {
  res.json({ filename: req.file.filename });
});
app.get("/", (req, res) => {
  res.json({
    message: "Backend API is running",
    status: "OK",
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
