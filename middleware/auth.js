// middleware/auth.js
// Blocks access to private routes if the user is not logged in.
module.exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in to view that page.');
  res.redirect('/users/login');
};

// Redirects logged-in users away from login/register pages.
module.exports.forwardAuthenticated = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/applications');
};
