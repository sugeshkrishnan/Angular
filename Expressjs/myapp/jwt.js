const express = require('express');
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();

// Secret key to sign JWT tokens
const secretKey = process.env.SECRET_KEY

// Sample user data (in a real app, this would come from a database)
const users = [
  { id: 1, username: 'john', password: '$2a$10$DxgH0tL6zRykjVfO.NA.Gyxfg9HqUP2lsSHysFfPx2N.Ja4Y.nJ0e' } // Password is 'password123'
];

// Middleware to parse JSON bodies
app.use(bodyParser.json());