// models/Commission.js
import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema({
  agentName: { type: String, required: true },
  amount: { type: Number, required: true },
  note: String,
  paymentType: { type: String, required: true },
  transactionId: String,
  userPropertyName: String,
  userPropertyId: String,
});

const Commission = mongoose.model('Commission', commissionSchema);

export default Commission;
