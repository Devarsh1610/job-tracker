// routes/applications.js
const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js');
const JobApplication = require('../models/JobApplication');
const { ensureAuthenticated } = require('../middleware/auth');

// ---------- PUBLIC: read-only list of ALL applications (no add/edit/delete) ----------
// This satisfies the "public page, read-only, one collection" requirement.
router.get('/public', async (req, res) => {
  try {
    const applications = await JobApplication.find()
      .populate('owner', 'username')
      .sort({ applicationDate: -1 });
    res.render('applications/public', { title: 'Public Applications', applications });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Could not load applications.' });
  }
});

// ---------- PRIVATE: list current user's applications, with fuzzy search/filter ----------
// The search itself is handled by Fuse.js (a separate npm package), not by
// Mongoose's own query operators. Mongoose is only used to fetch this user's
// applications; Fuse.js then does the actual matching in memory.
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const { q, status } = req.query;

    // 1. Pull this user's applications from the database via Mongoose (no
    //    text-search logic here — just fetch what belongs to the user).
    let applications = await JobApplication.find({ owner: req.user._id }).sort({
      applicationDate: -1
    });

    // 2. Optional status filter (an exact match, not a "search" feature).
    if (status) {
      applications = applications.filter((app) => app.status === status);
    }

    // 3. Fuzzy keyword search handled entirely by Fuse.js.
    if (q) {
      const fuse = new Fuse(applications, {
        keys: ['company', 'jobTitle', 'notes'],
        threshold: 0.4 // allows for typos/partial matches, unlike a plain DB query
      });
      applications = fuse.search(q).map((result) => result.item);
    }

    res.render('applications/index', {
      title: 'My Applications',
      applications,
      q,
      status
    });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Could not load your applications.' });
  }
});

// ---------- PRIVATE: show add form ----------
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('applications/new', { title: 'Add Application' });
});

// ---------- PRIVATE: create ----------
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { company, jobTitle, applicationDate, status, notes } = req.body;
    await JobApplication.create({
      company,
      jobTitle,
      applicationDate,
      status,
      notes,
      owner: req.user._id
    });
    req.flash('success_msg', 'Application added.');
    res.redirect('/applications');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Could not add that application.');
    res.redirect('/applications/new');
  }
});

// ---------- PRIVATE: show edit form ----------
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!application) {
      req.flash('error_msg', 'Application not found.');
      return res.redirect('/applications');
    }
    res.render('applications/edit', { title: 'Edit Application', application });
  } catch (err) {
    console.error(err);
    res.redirect('/applications');
  }
});

// ---------- PRIVATE: update ----------
router.put('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { company, jobTitle, applicationDate, status, notes } = req.body;
    await JobApplication.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { company, jobTitle, applicationDate, status, notes }
    );
    req.flash('success_msg', 'Application updated.');
    res.redirect('/applications');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Could not update that application.');
    res.redirect('/applications');
  }
});

// ---------- PRIVATE: show delete confirmation ----------
router.get('/:id/delete', ensureAuthenticated, async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!application) {
      req.flash('error_msg', 'Application not found.');
      return res.redirect('/applications');
    }
    res.render('applications/delete', { title: 'Delete Application', application });
  } catch (err) {
    console.error(err);
    res.redirect('/applications');
  }
});

// ---------- PRIVATE: delete ----------
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    await JobApplication.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    req.flash('success_msg', 'Application deleted.');
    res.redirect('/applications');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Could not delete that application.');
    res.redirect('/applications');
  }
});

module.exports = router;
