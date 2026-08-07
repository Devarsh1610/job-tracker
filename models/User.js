// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    // Not required, because GitHub-login users won't have a local password
    type: String
  },
  githubId: {
    type: String
  },
  displayName: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash the password before saving, only if it was modified (or is new)
// Hash the password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check a plain-text password against the hashed one
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
