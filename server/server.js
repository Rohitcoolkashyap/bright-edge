const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`Running in ${process.env.NODE_ENV} mode`);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const cruxRoutes = require('./routes/crux');

app.use('/api/crux', cruxRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});