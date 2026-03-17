const db = require("../config/db");

exports.getPoints = (req, res) => {

  const userId = req.user.id;

  const sql = "SELECT reward_points FROM users WHERE id = ?";

  db.query(sql, [userId], (err, result) => {

    if (err) return res.status(500).json(err);

    res.json({
      points: result[0].reward_points
    });

  });

};

exports.usePoints = (req, res) => {

  const { points } = req.body;
  const userId = req.user.id;

  const sql = "SELECT reward_points FROM users WHERE id = ?";

  db.query(sql, [userId], (err, result) => {

    if (err) return res.status(500).json(err);

    const userPoints = result[0].reward_points;

    if (points > userPoints) {
      return res.json({
        message: "Không đủ điểm"
      });
    }

    const discount = points * 1000;

    res.json({
      discount
    });

  });

};