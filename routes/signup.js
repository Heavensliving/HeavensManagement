import express from 'express';
import bcrypt from 'bcrypt';
import Owner from '../models/Owner.js'; // Import the model

const router = express.Router();

const generateUniqueId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    return `HSOWN${randomNum}`;
  };

  router.post('/signup', async (req, res) => {
    try {
      const { name, email, password, role, propertyName, propertyId } = req.body;
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Generate a unique ID
      const uniqueId = generateUniqueId();
  
      // Create a new owner
      const newOwner = new Owner({
        name,
        email,
        password: hashedPassword,
        role,
        propertyName,
        propertyId,
        uniqueId // Add the generated unique ID
      });
  
      // Save to the database
      await newOwner.save();
  
      res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login attempt with email:', email);
    
      // Find the owner by email
      const owner = await Owner.findOne({ email });
      console.log('Found owner:', owner);
    
      if (!owner) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    
      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, owner.password);
      console.log('Password match:', isMatch);
    
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    
      // Authentication successful, include the role, propertyName, and propertyId in the response
      res.status(200).json({
        message: 'Login successful',
        role: owner.role,
        propertyName: owner.propertyName || null,
        propertyId: owner.propertyId || null
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  
  
export default router;
