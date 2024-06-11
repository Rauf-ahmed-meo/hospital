import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: String,
  qualification: String,
  timing: String,
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
