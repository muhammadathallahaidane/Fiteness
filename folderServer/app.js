require('dotenv').config(); // Untuk memuat variabel lingkungan dari .env
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

app.use(cors());
app.use(express.json()); // Middleware untuk parsing JSON
app.use(express.urlencoded({ extended: true })); // Middleware untuk parsing URL-encoded data

app.use(routes); // Menggunakan routes utama

app.use(errorHandler); // Middleware error handling global

// Hanya jalankan server jika file ini dijalankan langsung (bukan di-require oleh test)
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app; // Ekspor app untuk testing