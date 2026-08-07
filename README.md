# JobTrackr — Job Application Tracker

COMP 2068 – Assignment 2 (JavaScript Frameworks)
Author: Oguda

## Description

JobTrackr is a web app that helps job seekers keep track of the positions
they've applied to. Users can register an account, log in (with a username/password
or with GitHub), and then add, view, edit, and delete their own job applications —
tracking the company, job title, date applied, status (Applied / Interview / Offer /
Rejected), and notes. There's also a public, read-only page that lists all logged
applications for anyone to browse without logging in.

## Live Site

Live link: **[ADD YOUR RENDER URL HERE AFTER DEPLOYING]**

## Tech Stack

- Node.js / Express (scaffolded with Express Generator, HBS view engine)
- MongoDB + Mongoose
- Passport.js (Local strategy + GitHub OAuth strategy)
- Bootstrap 5 + custom CSS
- express-session + connect-mongo (session storage)
- connect-flash (flash messages)
- method-override (to support PUT/DELETE from HTML forms)

## Additional Feature

**Fuzzy search on the application list, powered by [Fuse.js](https://www.fusejs.io/).**
On the "My Applications" page, a user's applications are first fetched from
MongoDB via Mongoose (scoped to that user, with an optional exact-match status
filter). The keyword search itself is then handled entirely by Fuse.js, a
separate npm package, which does approximate/fuzzy matching across the
company, job title, and notes fields — so a search still finds a result even
with a typo or partial word, which is something Mongoose's own query
operators don't do on their own.

## Setup Instructions

1. Clone the repository and `cd` into the `ASSIGNMENT2` project folder.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in your own values:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `SESSION_SECRET` — any long random string
   - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `GITHUB_CALLBACK_URL` — from a
     GitHub OAuth App you register at https://github.com/settings/developers
4. Run `npm start` and visit `http://localhost:3000`.

## Code Sources / Citations

- Project scaffolded using the official Express Generator tool
  (`npx express-generator --view=hbs`).
- Authentication pattern (Passport local + session handling) adapted from the
  standard Passport.js documentation at https://www.passportjs.org/concepts/authentication/password/
- GitHub OAuth strategy based on the `passport-github2` package documentation:
  https://www.npmjs.com/package/passport-github2
- All application-specific code (models, routes, views, styling, and CRUD logic)
  was written independently for this assignment.

## Folder Structure

```
job-tracker/
├── app.js
├── bin/www
├── config/
│   ├── database.js       # Mongoose connection (URI from .env)
│   └── passport.js       # Local + GitHub auth strategies
├── middleware/
│   └── auth.js           # Route protection helpers
├── models/
│   ├── User.js
│   └── JobApplication.js
├── routes/
│   ├── index.js           # Home/splash page
│   ├── users.js            # Register, login, logout, GitHub OAuth
│   └── applications.js     # CRUD + public read-only listing
├── views/                  # HBS templates
└── public/stylesheets/style.css
```
