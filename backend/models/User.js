const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true}, 
    xp: {type: Number, default: 0}
  },
  { timestamps: true }
);
const User = mongoose.model('User', userSchema);
module.exports = User;