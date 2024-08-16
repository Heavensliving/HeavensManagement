import express from 'express';
import FeePayment from '../models/FeePayment.js';

const router = express.Router();

// POST /api/payments
router.post('/', async (req, res) => {
  try {
    const { transactionId, paidDate, ...rest } = req.body;

    // Log the received data to check formatting
    console.log('Received data:', { transactionId, paidDate, ...rest });

    // Check if transactionId already exists
    const existingPayment = await FeePayment.findOne({ transactionId });
    if (existingPayment) {
      return res.status(400).json({ message: 'Transaction ID already exists' });
    }

    // Parse the paidDate from `yyyy-mm-dd` format to a Date object
    const formattedDate = new Date(paidDate); // Assuming paidDate is in `yyyy-mm-dd` format
    console.log('Formatted date:', formattedDate);

    const payment = new FeePayment({
      ...rest,
      paidDate: formattedDate,
      transactionId
    });

    await payment.save();
    res.status(201).json({ message: 'Payment successful' });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Payment failed', error: error.message });
  }
});

  router.get('/totalReceivedAmount', async (req, res) => {
    try {
        const totalAmount = await FeePayment.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]);

        if (!totalAmount || totalAmount.length === 0) {
            return res.status(404).json({ message: 'No payments found' });
        }

        res.json({ totalAmount: totalAmount[0].totalAmount });
    } catch (error) {
        console.error('Error fetching total received amount:', error);
        res.status(500).json({ message: 'Failed to fetch total received amount', error: error.message });
    }
});



router.get('/totalWaveOff', async (req, res) => {
  try {
      const totalWaveOff = await FeePayment.aggregate([
          {
              $group: {
                  _id: null,
                  totalWaveOff: { $sum: "$waveOff" }
              }
          }
      ]);

      if (!totalWaveOff || totalWaveOff.length === 0) {
          return res.status(404).json({ message: 'No wave-off data found' });
      }

      res.json({ totalWaveOff: totalWaveOff[0].totalWaveOff });
  } catch (error) {
      console.error('Error fetching total wave-off amount:', error);
      res.status(500).json({ message: 'Failed to fetch total wave-off amount', error: error.message });
  }
});

router.get('/totalWaveOff/by-filter', async (req, res) => {
  try {
    const { propertyId } = req.query; // Get propertyId from query parameters

    if (!propertyId) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    const totalWaveOff = await FeePayment.aggregate([
      { $match: { hostelId: propertyId } }, // Filter by hostelId (propertyId)
      { $group: { _id: null, waveOff: { $sum: "$waveOff" } } }
    ]);

    res.json({ waveOff: totalWaveOff[0]?.waveOff || 0 });
  } catch (error) {
    console.error('Error fetching total wave-off amount:', error);
    res.status(500).json({ error: 'Error fetching total wave-off amount' });
  }
});



router.get('/:id', async (req, res) => {
    try {
      const payment = await FeePayment.findById(req.params.id);
  
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
  
      res.json({
        ...payment.toObject(),
        paidDate: payment.formatPaidDate() // Use the formatted date
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({ message: 'Failed to fetch payment', error: error.message });
    }
  });

  router.get('/totalReceivedAmount/total', async (req, res) => {
    try {
      const { propertyId } = req.query; // Get propertyId from query parameters
  
      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' });
      }
  
      const totalAmount = await FeePayment.aggregate([
        { $match: { hostelId: propertyId } }, // Filter by hostelId (propertyId)
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" }
          }
        }
      ]);
  
      if (!totalAmount || totalAmount.length === 0) {
        return res.status(404).json({ message: 'No payments found' });
      }
  
      res.json({ totalAmount: totalAmount[0].totalAmount });
    } catch (error) {
      console.error('Error fetching total received amount:', error);
      res.status(500).json({ message: 'Failed to fetch total received amount', error: error.message });
    }
  });
  

  router.get('/fee/details', async (req, res) => {
    try {
      const { propertyId } = req.query; // Get propertyId from query parameters
  
      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' });
      }
  
      const payments = await FeePayment.aggregate([
        { $match: { hostelId: propertyId } }, // Filter by hostelId (propertyId)
        {
          $project: {
            _id: 0,
            studentId: 1,
            name: 1,
            hostelId: 1,
            hostelName: 1,
            transactionId: 1,
            monthYear: 1,
            paidDate: 1,
            rentAmount: 1,
            waveOff: 1,
            waveOffReason: 1,
            totalAmount: 1
          }
        }
      ]);
  
      if (!payments || payments.length === 0) {
        return res.status(404).json({ message: 'No payment details found' });
      }
  
      res.json({ payments });
    } catch (error) {
      console.error('Error fetching payment details:', error);
      res.status(500).json({ message: 'Failed to fetch payment details', error: error.message });
    }
  });


  router.get('/payments/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      // Assuming studentId is a string, not an ObjectId
      const payments = await FeePayment.find({ studentId });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching payment' });
    }
  });


export default router;
