const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

module.exports = function (passport) {

  // Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });

        if (!user) {
          return done(null, false, { message: 'That username is not registered.' });
        }

        if (!user.password) {
          return done(null, false, { message: 'Please log in with GitHub for this account.' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);

      } catch (err) {
        return done(err);
      }
    })
  );

  // GitHub Strategy (only if credentials exist)
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.GITHUB_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ githubId: profile.id });

            if (user) {
              return done(null, user);
            }

            user = await User.create({
              githubId: profile.id,
              username: profile.username || `github_${profile.id}`,
              displayName: profile.displayName || profile.username
            });

            return done(null, user);

          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

};