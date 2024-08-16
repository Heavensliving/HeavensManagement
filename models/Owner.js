import mongoose from 'mongoose';

const OwnerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  propertyName: String,
  propertyId: String,
  uniqueId: {
    type: String,
    unique: true
  } 
},{ timestamps: true });

export default mongoose.model('Owner', OwnerSchema);
