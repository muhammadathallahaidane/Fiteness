const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const { Op } = require('sequelize'); // TAMBAHKAN INI
require("dotenv").config();
const axios = require('axios');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class UserController {
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        throw {
          name: "BadRequest",
          message: "Username, email, and password are required",
        };
      }
      // Validasi tambahan bisa ditambahkan di sini (misal panjang password, format email)

      const newUser = await User.create({ username, email, password });
      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw {
          name: "BadRequest",
          message: "Email and password are required",
        };
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }

      const isPasswordValid = comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }

      const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
      const access_token = generateToken(payload);

      res
        .status(200)
        .json({ access_token, username: user.username, email: user.email });
    } catch (error) {
      next(error);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      // Ubah dari id_token menjadi idToken
      const { idToken } = req.body;

      if (!idToken) {
        throw { name: "BadRequest", message: "Google ID token is required" };
      }

      const ticket = await client.verifyIdToken({
        idToken: idToken, // Gunakan idToken
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      console.log(payload);

      // Cek apakah user sudah ada
      let user = await User.findOne({ where: { email: payload.email } });

      if (!user) {
        // Buat user baru jika belum ada
        const emailParts = payload.email.split("@");
        const usernameFromEmail = emailParts[0];

        user = await User.create({
          username: usernameFromEmail,
          email: payload.email,
          // Generate random password untuk user Google
          password: Math.random().toString(36).slice(-8),
        });
      }

      // Generate JWT token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
      const access_token = generateToken(tokenPayload);

      res.status(200).json({
        access_token,
        user: {
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Google Login Error:", error);
      next(error);
    }
  }

  // Tambahkan import di atas
  
  // Tambahkan method baru di dalam class UserController
  static async stravaLogin(req, res, next) {
    try {
      const { code } = req.body;
  
      console.log('Received Strava code:', code);
      console.log('STRAVA_CLIENT_ID:', process.env.STRAVA_CLIENT_ID);
      console.log('STRAVA_CLIENT_SECRET:', process.env.STRAVA_CLIENT_SECRET ? 'SET' : 'NOT SET');
  
      if (!code) {
        throw { name: "BadRequest", message: "Strava authorization code is required" };
      }
  
      if (!process.env.STRAVA_CLIENT_ID || !process.env.STRAVA_CLIENT_SECRET) {
        throw { name: "BadRequest", message: "Strava credentials not configured" };
      }
  
      // Exchange code for access token
      console.log('Requesting token from Strava...');
      const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code'
      });
  
      console.log('Strava token response:', tokenResponse.data);
      const { access_token: stravaToken, athlete } = tokenResponse.data;
      
      // Validasi data athlete
      if (!athlete || !athlete.id) {
        throw { name: "BadRequest", message: "Invalid athlete data from Strava" };
      }
  
      // Cek apakah user sudah ada berdasarkan Strava ID atau email
      // PERBAIKAN: Gunakan Op.or untuk Sequelize v6+
      const { Op } = require('sequelize');
      
      let user = await User.findOne({ 
        where: { 
          [Op.or]: [
            { email: athlete.email || null },
            { StravaId: athlete.id.toString() }
          ]
        } 
      });
  
      if (!user) {
        // Buat user baru
        const username = athlete.username || 
                      `${athlete.firstname || 'User'}_${athlete.lastname || athlete.id}`;
        const email = athlete.email || `strava_${athlete.id}@temp.com`;
        
        user = await User.create({
          username: username,
          email: email,
          StravaId: athlete.id.toString(),
          // Generate random password untuk user Strava
          password: Math.random().toString(36).slice(-8),
        });
      } else {
        // Update Strava ID jika user sudah ada tapi belum punya Strava ID
        if (!user.StravaId) {
          user.StravaId = athlete.id.toString();
          await user.save();
        }
      }
  
      // Generate JWT token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
      const access_token = generateToken(tokenPayload);
  
      res.status(200).json({
        access_token,
        user: {
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Strava Login Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response && error.response.data) {
        return next({
          name: "BadRequest",
          message: `Strava API Error: ${error.response.data.message || JSON.stringify(error.response.data)}`
        });
      }
      
      next(error);
    }
  }
}

module.exports = UserController;
