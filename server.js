import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import session from 'express-session';
import Comment from './models/Comment.js';
import Doctor from './models/Doctor.js'; // Import the Doctor model
import Contact from './models/Contact.js';

// Emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/commentsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Set up session management
app.use(session({
  secret: 'your_secret_key', // Change this to a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: null } // Session cookie will not have a max age
}));

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Routes

// Import Contact model

// Add a route to handle the form submission from the admin panel
app.post('/admin/contact', async (req, res) => {
  try {
    // Extract the contact number from the request body
    const { number } = req.body;

    // Delete the old contact number if it exists
    await Contact.deleteMany({});

    // Create a new contact document with the submitted number
    await Contact.create({ number });

    // Redirect back to the admin panel after successful submission
    res.redirect('/admin');
  } catch (error) {
    // Handle errors, maybe render an error page or send a JSON response
    console.error('Error submitting contact number:', error);
    res.status(500).send('Error submitting contact number');
  }
});


// Home route
app.get('/', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    const contact = await Contact.findOne(); // Fetch the contact number
    res.render('index', { comments, contact: contact ? contact.number : '' }); // Pass the contact number to the view
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (password === 'Muhammadazam3') {
    req.session.isAuthenticated = true;
    res.redirect('/admin');
  } else {
    res.render('login', { error: 'Invalid password' });
  }
});

// Admin route
app.get('/admin', isAuthenticated, (req, res) => {
  res.render('admin');
});

// Admin comments route
app.get('/admin/comments', isAuthenticated, async (req, res) => {
  const comments = await Comment.find().sort({ createdAt: -1 });
  res.render('admin-comments', { comments });
});

app.post('/comments/delete/:id', isAuthenticated, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});

// POST route for adding a new comment
app.post('/comments', async (req, res) => {
  const { author, text } = req.body;
  const comment = new Comment({ author, text });
  await comment.save();
  res.redirect('/');
});

// Doctors route
app.get('/doctors', async (req, res) => {
  const doctors = await Doctor.find();
  res.render('doctors', { doctors });
});

app.get('/about', async (req, res) => {
  res.render('about');
});


// Admin doctors route
app.get('/admin/doctors', isAuthenticated, async (req, res) => {
  const doctors = await Doctor.find();
  res.render('admin-doctors', { doctors });
});

app.get('/admin/doctors/add', isAuthenticated, (req, res) => {
  res.render('add-doctor');
});

app.post('/admin/doctors/add', isAuthenticated, async (req, res) => {
  const { name, qualification, timing, imageUrl } = req.body;
  const doctor = new Doctor({ name, qualification, timing, imageUrl });
  await doctor.save();
  res.redirect('/admin/doctors');
});

app.get('/admin/doctors/edit/:id', isAuthenticated, async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  res.render('edit-doctor', { doctor });
});

app.post('/admin/doctors/edit/:id', isAuthenticated, async (req, res) => {
  const { name, qualification, timing, imageUrl } = req.body;
  await Doctor.findByIdAndUpdate(req.params.id, { name, qualification, timing, imageUrl });
  res.redirect('/admin/doctors');
});

app.post('/admin/doctors/delete/:id', isAuthenticated, async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/admin');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
