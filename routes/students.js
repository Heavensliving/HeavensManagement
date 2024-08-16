import express from 'express';
import { Formidable } from 'formidable';
import bcrypt from 'bcryptjs';
import { uploadImage } from '../utils/cloudinary.js';
import Student from '../models/Student.js';
import { io } from '../index.js';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 259200 });

router.post('/', (req, res) => {
    const form = new Formidable();
  
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).json({ error: 'Error parsing form data' });
        }
    
        try {
            // Extract and process form fields
            const {
                name,
                address,
                contactNo,
                email,
                bloodGroup,
                parentName,
                parentNumber,
                course,
                advanceFee,
                nonRefundableDeposit,
                monthlyRent,
                hostelName,
                roomType,
                roomNo,
                referredBy,
                typeOfStay,
                joinDate,
                password,
                paymentStatus = 'Pending',
                currentStatus = 'Checked in',
                dateOfBirth, 
                gender,
                year,
                collegeName,
                parentOccupation, 
                workingPlace,
                branch,
                phase,     
            } = fields;


            // Convert to single values if they are arrays
            const joinDateFormatted = joinDate ? new Date(joinDate) : null;
            const paymentStatusString = Array.isArray(paymentStatus) ? paymentStatus[0] : String(paymentStatus);
            const currentStatusString = Array.isArray(currentStatus) ? currentStatus[0] : String(currentStatus);
            const passwordString = Array.isArray(password) ? password[0] : String(password);
            const hostelNameString = Array.isArray(hostelName) ? hostelName[0] : String(hostelName);
            const roomTypeString = Array.isArray(roomType) ? roomType[0] : String(roomType);
            const roomNoString = Array.isArray(roomNo) ? roomNo[0] : String(roomNo);
            const referredByString = Array.isArray(referredBy) ? referredBy[0] : String(referredBy);
            const typeOfStayString = Array.isArray(typeOfStay) ? typeOfStay[0] : String(typeOfStay);
            const advanceFeeNumber = Array.isArray(advanceFee) ? parseFloat(advanceFee[0]) : parseFloat(advanceFee) || null;
            const nonRefundableDepositNumber = Array.isArray(nonRefundableDeposit) ? parseFloat(nonRefundableDeposit[0]) : parseFloat(nonRefundableDeposit) || null;
            const monthlyRentNumber = Array.isArray(monthlyRent) ? parseFloat(monthlyRent[0]) : parseFloat(monthlyRent);
            const yearString = Array.isArray(year) ? year[0] : String(year);
            const dateOfBirthFormatted = dateOfBirth ? new Date(dateOfBirth) : null;
    
            // Validate numbers
            if (isNaN(advanceFeeNumber) && advanceFeeNumber !== null) throw new Error('Invalid advance fee');
            if (isNaN(nonRefundableDepositNumber) && nonRefundableDepositNumber !== null) throw new Error('Invalid non-refundable deposit');
            if (isNaN(monthlyRentNumber)) throw new Error('Invalid monthly rent');


            // Hash the password before saving
            // const passwordString = Array.isArray(password) ? password[0] : String(password);
            const hashedPassword = await bcrypt.hash(passwordString, 10);
    
            // Upload images if provided
            const adharFrontUrl = files.adharFront && files.adharFront[0] ? await uploadImage({ path: files.adharFront[0].filepath }) : '';
            const adharBackUrl = files.adharBack && files.adharBack[0] ? await uploadImage({ path: files.adharBack[0].filepath }) : '';
            const photoUrl = files.photo && files.photo[0] ? await uploadImage({ path: files.photo[0].filepath }) : '';
    
            // Generate student ID
            const studentId = `HVNS${Math.floor(100000 + Math.random() * 900000)}`;
    
            // Create and save student
            const student = new Student({
                name: String(name),
                address: String(address),
                contactNo: String(contactNo),
                email: Array.isArray(email) ? email[0] : String(email),
                bloodGroup: Array.isArray(bloodGroup) ? bloodGroup[0] : String(bloodGroup),
                parentName: Array.isArray(parentName) ? parentName[0] : String(parentName),
                parentNumber: Array.isArray(parentNumber) ? parentNumber[0] : String(parentNumber),
                course: Array.isArray(course) ? course[0] : String(course),
                advanceFee: advanceFeeNumber,
                nonRefundableDeposit: nonRefundableDepositNumber,
                monthlyRent: monthlyRentNumber,
                adharFrontImage: adharFrontUrl,
                adharBackImage: adharBackUrl,
                photo: photoUrl,
                hostelName: hostelNameString,
                roomType: roomTypeString,
                roomNo: roomNoString,
                referredBy: referredByString,
                typeOfStay: typeOfStayString,
                paymentStatus: paymentStatusString,
                studentId,
                joinDate: joinDateFormatted,
                currentStatus: currentStatusString,
                password: hashedPassword,
                dateOfBirth: dateOfBirthFormatted,
                gender: String(gender),
                year: yearString,
                collegeName: String(collegeName),
                parentOccupation: Array.isArray(parentOccupation) ? parentOccupation[0] : String(parentOccupation),
                workingPlace: Array.isArray(workingPlace) ? workingPlace[0] : String(workingPlace),
                branch: Array.isArray(branch) ? branch[0] : String(branch),
                phase: Array.isArray(phase) ? phase[0] : String(phase),
            });

            await student.save();

            // Clear the cache after adding a new student
            cache.del('students');

              // Emit update event to all clients
              io.emit('update', { message: 'Student list updated' });
    
            
            res.status(201).json({ message: 'Student added successfully', student });
        } catch (error) {
            console.error('Error saving student:', error);
            res.status(500).json({ error: error.message });
        }
    });
});


router.get('/', async (req, res) => {
    try {

        const cachedStudents = cache.get('students');
        if (cachedStudents) {
            return res.status(200).json(cachedStudents);
        }

      const students = await Student.find({});
      const formattedStudents = students.map(student => ({
        ...student.toObject(),
        dateOfBirth: student.dateOfBirth ? formatDate(student.dateOfBirth) : null,
        joinDate: student.joinDate ? formatDate(student.joinDate) : null,
    }));

     // Cache the fetched students
     cache.set('students', formattedStudents);

      res.status(200).json(formattedStudents);
    //   res.status(200).json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Error fetching student data' });
    }
  });


  router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student by ID:', error);
        res.status(500).json({ error: 'Error fetching student data' });
    }
});


router.put('/:id', async (req, res) => {
    const studentId = req.params.id;
    const updateData = req.body;

    try {
        const updatedStudent = await Student.findByIdAndUpdate(studentId, updateData, { new: true });

        if (!updatedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }

         // Clear the cache after updating a student
         cache.del('students');

        // Emit an event to notify that the student data has been updated
        io.emit('studentUpdated', updatedStudent);

        res.json(updatedStudent);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const student = await Student.findByIdAndDelete(id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

       // Clear the cache after deleting a student
       cache.del('students');


      res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/student-id/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      // Query by the custom studentId field
      const student = await Student.findOne({ studentId: studentId });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.status(200).json(student);
    } catch (error) {
      console.error('Error fetching student details:', error);
      res.status(500).json({ error: 'Failed to fetch student details' });
    }
  });

  router.get('/students-by-hostel/:hostelName', async (req, res) => {
    try {
      const { hostelName } = req.params;
      const students = await Student.find({ hostelName });
      res.json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

router.get('/monthly-rent/by-property', async (req, res) => {
  try {
      const propertyName = req.query.propertyName; // Get propertyName from query params

      if (!propertyName) {
          return res.status(400).json({ error: 'Property name is required' });
      }

      const students = await Student.find({ hostelName: propertyName });
      const totalMonthlyRent = students.reduce((sum, student) => sum + (student.monthlyRent || 0), 0);

      res.status(200).json({ totalMonthlyRent });
  } catch (error) {
      console.error('Error fetching monthly rent:', error);
      res.status(500).json({ error: 'Server error' });
  }
});

router.get('/students/by-property', async (req, res) => {
  try {
      const propertyName = req.query.propertyName; // Get propertyName from query params
      if (!propertyName) {
          return res.status(400).json({ error: 'Property name is required' });
      }
      const students = await Student.find({ hostelName: propertyName });
      
      // Log the student data to check if it's correct
      console.log('Students:', students);

      const refundableDeposits = students.reduce((total, student) => {
          const amount = parseFloat(student.advanceFee) || 0;
          console.log(`Advance Fee for ${student._id}:`, amount);
          return total + amount;
      }, 0);

      const nonRefundableDeposits = students.reduce((total, student) => {
          const amount = parseFloat(student.nonRefundableDeposit) || 0;
          console.log(`Non-Refundable Deposit for ${student._id}:`, amount);
          return total + amount;
      }, 0);

      res.json({
          refundableDeposits,
          nonRefundableDeposits,
      });
  } catch (error) {
      console.error('Error fetching students by property:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

  

const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};
  

export default router;
