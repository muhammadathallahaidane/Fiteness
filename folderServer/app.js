const express = require('express');
const app = express();
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

app.use(cors());
app.use(express.urlencoded({ extended: true })); // Your suggestion uses false, current uses true
app.use(express.json());

app.use('/', routes); // Adding '/' prefix as in your suggestion
app.use(errorHandler);

// Remove the server startup logic from app.js
module.exports = app;