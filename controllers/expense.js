const Expense = require('../models/Expense');

/**
 * GET /expense
 * Manage Expense page.
 */
exports.getExpense = (req, res) => {
  Expense.find({}, function (err, expenses) {
    if (err) throw err

    res.render('expense/manage', {
      title: 'Manage Expense',
      expenses: expenses
    });
  })
};
