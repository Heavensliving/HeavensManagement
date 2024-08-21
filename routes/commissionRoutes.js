// routes/commissionRoutes.js
import express from 'express';
import Commission from '../models/Commission.js';

const router = express.Router();

router.post('/commissions', async (req, res) => {
  try {
    const newCommission = new Commission(req.body);
    await newCommission.save();
    res.status(201).send('Commission added successfully');
  } catch (error) {
    res.status(500).send('Error adding commission');
  }
});

router.get('/by-property', async (req, res) => {
    const { propertyName } = req.query;

    if (!propertyName) {
        return res.status(400).json({ message: 'Property name is required' });
    }

    try {
        // Ensure this matches the field in your schema
        const commissions = await Commission.find({ userPropertyName: propertyName });
        const totalCommission = commissions.reduce((sum, commission) => sum + (parseFloat(commission.amount) || 0), 0);
        res.json(totalCommission);
    } catch (error) {
        console.error('Error fetching total commission amount:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/all', async (req, res) => {
    try {
      const commissions = await Commission.find();
      const totalCommission = commissions.reduce((sum, commission) => sum + (parseFloat(commission.amount) || 0), 0);
      res.json({ totalCommission });
    } catch (error) {
      console.error('Error fetching total commission amount:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });



export default router;
