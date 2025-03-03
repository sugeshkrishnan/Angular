const express = require('express')
const http = require('http')
const item= require('./item')


const app = express()

const port = process.env.PORT

app.use(express.json());

const apiRoutes = require('./routes');

app.get('/', (req, res) => {
  res.send('Hello World!')
})





// Use the imported routes
app.use('/', apiRoutes);



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});