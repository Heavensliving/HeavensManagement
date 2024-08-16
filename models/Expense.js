import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  otherReason: {
    type: String,
    default: ''
  },
  paymentMethod: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true
  },
  propertyName: {
    type: String,
    required: true,
  },
  propertyId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
