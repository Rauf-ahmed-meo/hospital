import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  number: { type: String, required: true },
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
