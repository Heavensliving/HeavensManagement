import mongoose from 'mongoose';

const FeePaymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  hostelId: {
    type: String,
    required: true
  },
  hostelName: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true // Ensure transactionId is unique
  },
  monthYear: {
    type: String,
    required: true
  },
  paidDate: {
    type: Date,
    required: true
  },
  rentAmount: {
    type: Number,
    required: true
  },
  waveOff: {
    type: Number,
    default: 0
  },
  waveOffReason: {
    type: String
  },
  totalAmount: {
    type: Number,
    required: true
  }
}, { timestamps: true });

FeePaymentSchema.methods.formatPaidDate = function() {
  const day = String(this.paidDate.getDate()).padStart(2, '0');
  const month = String(this.paidDate.getMonth() + 1).padStart(2, '0');
  const year = this.paidDate.getFullYear();
  return `${day}-${month}-${year}`;
};

const FeePayment = mongoose.model('FeePayment', FeePaymentSchema);

export default FeePayment;
