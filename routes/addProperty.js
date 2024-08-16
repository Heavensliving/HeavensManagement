import express from 'express';
import { uploadImage } from '../utils/cloudinary.js';
import Property from '../models/Property.js';

const router = express.Router();

router.post('/add-property', async (req, res) => {
    try {
      const propertyData = req.body; // Directly receive the data
  
      const newProperty = new Property(propertyData);
  
      await newProperty.save();
      
      res.status(200).json({ message: 'Property added successfully!' });
    } catch (error) {
      console.error('Error adding property:', error);
      res.status(500).json({ error: error.message || 'Failed to add property' });
    }
  });

  // router.get('/get-properties', async (req, res) => {
  //   try {
  //     const properties = await Property.find().select('propertyName');
  //     res.status(200).json(properties);
  //   } catch (error) {
  //     console.error('Error fetching properties:', error);
  //     res.status(500).json({ error: error.message || 'Failed to fetch properties' });
  //   }
  // });

  router.get('/get-properties', async (req, res) => {
    try {
        const { propertyId } = req.query;
        let query = {};

        if (propertyId) {
            query.uniquepropertyId = propertyId; // Filter by propertyId
        }

        const properties = await Property.find(query);
        res.status(200).json(properties);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch properties' });
    }
});

router.get('/get-properties-by-name', async (req, res) => {
  try {
      const { propertyName } = req.query;
      if (!propertyName) {
          return res.status(400).json({ error: 'Property name is required' });
      }

      console.log('Received Property Name:', propertyName); // Log the propertyName

      // Case insensitive search
      const properties = await Property.find({ propertyName: { $regex: new RegExp(propertyName, 'i') } });

      console.log('Matching Properties:', properties); // Log the matching properties

      res.status(200).json({ count: properties.length }); // Return the count of matched properties
  } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch properties' });
  }
});


router.get('/property-name/:propertyName', (req, res) => {
  const propertyName = req.params.propertyName;
  
  Property.findOne({ propertyName: propertyName }, 'uniquepropertyId')
    .then(property => {
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.json({ uniquepropertyId: property.uniquepropertyId });
    })
    .catch(error => res.status(500).json({ message: error.message }));
});


export default router;
