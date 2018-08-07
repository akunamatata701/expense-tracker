const Expense = require('../models/Expense');
const dateFormat = require('dateformat');

/**
 * GET /expense
 * Manage Expense page.
 */
exports.getExpense = (req, res, next) => {
  Expense.find({ userId: req.user.id }, (err, expenses) => {
    if (err) { return next(err); }

    res.render('expense/expense_list', {
      title: 'Manage Expense',
      expenses: expenses,
      filters: {}
    });
  })
};

exports.postExpense = (req, res, next) => {
  var query = { userId: req.user.id };

  if (req.body.datefrom)
    query.date = { $gte: req.body.datefrom };
  if (req.body.dateto)
    query.date = { $lte: req.body.dateto };
  if (req.body.description)
    query.description = { $regex: req.body.description };
  if (req.body.comment)
    query.comment = { $regex: req.body.comment };

  Expense.find(query)
    .exec((err, expenses) => {
      if (err) { return next(err); }

      res.render('expense/expense_list', {
        title: 'Manage Expense',
        expenses: expenses,
        filters: {
          datefrom: req.body.datefrom || '',
          dateto: req.body.dateto || '',
          description: req.body.description || '',
          comment: req.body.comment || ''
        }
      });
    })
};

exports.getAddExpense = (req, res) => {
  res.render('expense/expense', {
    title: 'Add Expense',
    type: 'Add',
    expense: {}
  });
};

exports.postAddExpense = (req, res, next) => {
  req.assert('date', 'Date cannot be blank').notEmpty();
  req.assert('description', 'Description cannot be blank').notEmpty();
  req.assert('amount', 'Amount cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/expense/add');
  }

  const expense = new Expense({
    date: req.body.date || '',
    description: req.body.description || '',
    amount: req.body.amount || '',
    comment: req.body.comment || '',
    userId: req.user.id || ''
  });

  expense.save((err) => {
    if (err) { return next(err); }
    req.flash('success', { msg: 'Expense has been added.' });
    res.redirect('/expense');
  });
};

exports.getEditExpense = (req, res, next) => {
  Expense
    .findOne({ _id: req.params.id })
    .exec((err, expense) => {
      if (err) { return next(err); }
      res.render('expense/expense', {
        title: 'Edit Expense',
        type: 'Edit',
        expense: {
          date: dateFormat(expense.date, "yyyy-mm-dd'T'hh:MM"),
          description: expense.description,
          amount: expense.amount,
          comment: expense.comment
        }
      });
    });
};

exports.postEditExpense = (req, res, next) => {
  Expense
    .findOne({ _id: req.params.id })
    .exec((err, expense) => {
      if (err) { return next(err); }
      expense.date = req.body.date;
      expense.description = req.body.description;
      expense.amount = req.body.amount;
      expense.comment = req.body.comment;
      expense.save((err) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'Expense has been updated.' });
        res.redirect('/expense');
      });
    });
};

exports.getDeleteExpense = (req, res, next) => {
  Expense
    .deleteOne({ _id: req.params.id })
    .exec((err, expense) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Expense has been deleted.' });
      res.redirect('/expense');
    });
};
