// routes/expense.js
import express from 'express';
import Expense from '../models/Expense.js';

const router = express.Router();

router.post('/add-expense', async (req, res) => {
    try {
      const { transactionId } = req.body;
  
      // Check if transactionId already exists
      if (transactionId) {
        const existingExpense = await Expense.findOne({ transactionId });
  
        if (existingExpense) {
          return res.status(400).json({ error: 'Transaction ID already exists' });
        }
      }
  
      const expense = new Expense(req.body);
      await expense.save();
      res.status(201).json({ expense, id: expense._id });
    } catch (error) {
      res.status(400).json({ error: 'Error adding expense' });
    }
  });

  router.get('/total-expense', async (req, res) => {
    try {
      const totalExpense = await Expense.aggregate([
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
      ]);
      res.json({ totalAmount: totalExpense[0]?.totalAmount || 0 });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching total expense amount' });
    }
  });

  router.get('/total-expense/by-filter', async (req, res) => {
    try {
        const { propertyId } = req.query; // Get propertyId from query parameters

        if (!propertyId) {
            return res.status(400).json({ error: 'Property ID is required' });
        }

        const totalExpense = await Expense.aggregate([
            { $match: { propertyId } }, // Filter by propertyId
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);

        res.json({ totalAmount: totalExpense[0]?.totalAmount || 0 });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching total expense amount' });
    }
});

  

export default router;
