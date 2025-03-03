// routes/api.js
const express = require('express');
const router = express.Router();
const about = require('./about');
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

//Sample data (in a real app, this could come from a database)
var users = [
  { id: 1, name: 'John Doe', email: 'john@example.com',username: 'john', password: '$2a$10$DxgH0tL6zRykjVfO.NA.Gyxfg9HqUP2lsSHysFfPx2N.Ja4Y.nJ0e' },
  { id: 2, name: 'Jane Doe', email: 'jane@example.com',username: 'jane', password: '$2a$10$DxgH0tL6zRykjVfO.NA.Gyxfg9HqUP2lsSHysFfPx2N.Ja4Y.nJ0e' }
];
// const users = [
//     { id: 1, username: 'john', password: '$2a$10$DxgH0tL6zRykjVfO.NA.Gyxfg9HqUP2lsSHysFfPx2N.Ja4Y.nJ0e' } // Password is 'password123'
//   ];
// Secret key to sign JWT tokens
const secretKey = process.env.SECRET_KEY

router.use(bodyParser.json());

let lastModified = new Date();
 const adminHTML = `
<html>
    <body>
        <h1>Welcome, Admin!</h1>
        <p>You have full access to the system1.</p>
    </body>
</html>
`;

//Middleware
router.use((req, res, next) => {
    console.log('Middleware : Routing');
    next(); // Pass control to the next middleware
  });
// Error-handling middleware
  router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });

// GET all users
router.get('/users', authenticate,(req, res) => {
  res.json(users);
});

router.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  });

// POST a new user
router.post('/adduser', async (req, res) => {
    const { name, email,username,password } = req.body;
    console.log(req);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      name,
      email,
      username,
      password:hashedPassword
    };
    users.push(newUser);
    res.status(201).send('User registered successfully');
    //res.status(201).json(newUser);
  });

// Route to log in (validate user credentials and issue JWT)
router.post('/login', async (req, res) => {
    
    const { username, password } = req.body;
    let filteredUser;
    // Find the user by username
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).send('Invalid username or password');
    }
    // else{
        
    //     res.status(201).send('found username');
    // }
   console.log("===>"+JSON.stringify(user))
    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).send('Invalid username or password');
    }
    else{
        const payload = { id: user.id, username: user.username };

        // Sign the token with a secret key
        const token = jwt.encode(payload, secretKey);

        // Send the token to the client
        res.status(200).send({ token });
       // res.status(201).send('Login Successful');
    }
});

  //============================================================================================

router.get('/admin', authenticate, (req, res) => {
    const authenticated = true; // Example condition for authentication. make false to get error
  if (!authenticated) {
    return res.status(401).send('Unauthorized access');
  }
    res.status(200).send(adminHTML);
  });



  
// Middleware to protect routes
function authenticate(req, res, next) {
    // Get the token from the Authorization header
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
      return res.status(403).send('Access denied. No token provided.');
    }
  
    try {
      // Verify the token to ensure its validity (this also decodes the token)
      const decoded = jwt.decode(token, secretKey); // This will throw an error if the token is invalid or expired

      // Attach the decoded user info to the request object
      req.user = decoded;

      next(); // Proceed to the next middleware/route handler
    } catch (err) {
      console.error(err); // Log the error for debugging purposes
      return res.status(400).send('Invalid or expired token.');
    }
}

router.get('/about', (req, res) => {
    
    res.json(about.aboutData);
  });

// GET a single user by ID
router.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');
  res.json(user);
});



// PUT update an existing user by ID
router.put('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');

  const { name, email } = req.body;
  user.name = name || user.name;
  user.email = email || user.email;

  res.json(user);
});

// DELETE a user by ID
router.delete('/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) return res.status(404).send('User not found');

  users.splice(userIndex, 1);
  res.status(204).send();
});

module.exports = router;
