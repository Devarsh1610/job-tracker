// routes/users.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { forwardAuthenticated } = require('../middleware/auth');

// GET register page
router.get('/register', forwardAuthenticated, (req, res) => {
  res.render('register', { title: 'Register' });
});

// POST register
router.post('/register', forwardAuthenticated, async (req, res) => {
  const { username, password, password2 } = req.body;
  const errors = [];

  if (!username || !password || !password2) {
    errors.push({ message: 'Please fill in all fields.' });
  }
  if (password && password.length < 6) {
    errors.push({ message: 'Password should be at least 6 characters.' });
  }
  if (password !== password2) {
    errors.push({ message: 'Passwords do not match.' });
  }

  if (errors.length > 0) {
    return res.render('register', { title: 'Register', errors, username });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      errors.push({ message: 'That username is already taken.' });
      return res.render('register', { title: 'Register', errors, username });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    req.flash('success_msg', 'You are now registered and can log in.');
    res.redirect('/users/login');
  } catch (err) {
    console.error(err);
    res.render('register', {
      title: 'Register',
      errors: [{ message: 'Something went wrong. Please try again.' }],
      username
    });
  }
});

// GET login page
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('login', { title: 'Login' });
});

// POST login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/applications',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// GitHub OAuth login
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/users/login' }),
  (req, res) => {
    res.redirect('/applications');
  }
);

// Logout
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success_msg', 'You have logged out.');
    res.redirect('/users/login');
  });
});

module.exports = router;
