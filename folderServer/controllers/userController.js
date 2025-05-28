const { User } = require('../models');
const { comparePassword } = require('../helpers/bcrypt');
const { generateToken } = require('../helpers/jwt');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client();

class UserController {
    static async register(req, res, next) {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                throw { name: 'BadRequest', message: 'Username, email, and password are required' };
            }
            // Validasi tambahan bisa ditambahkan di sini (misal panjang password, format email)

            const newUser = await User.create({ username, email, password });
            res.status(201).json({
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw { name: 'BadRequest', message: 'Email and password are required' };
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw { name: 'Unauthorized', message: 'Invalid email or password' };
            }

            const isPasswordValid = comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw { name: 'Unauthorized', message: 'Invalid email or password' };
            }

            const payload = { id: user.id, email: user.email, username: user.username };
            const access_token = generateToken(payload);

            res.status(200).json({ access_token, username: user.username, email: user.email });
        } catch (error) {
            next(error);
        }
    }
    
    static async googleLogin(req, res, next) {
        try {
            const { id_token } = req.body;
            
            if (!id_token) {
                throw { name: 'BadRequest', message: 'Google ID token is required' };
            }
            
            const ticket = await client.verifyIdToken({
                idToken: id_token,
                audience: process.env.GOOGLE_CLIENT_ID || "656049011535-oht6cgegs4oe6.apps.googleusercontent.com"
            });
            
            const payload = ticket.getPayload();
            
            // Cek apakah user sudah ada
            let user = await User.findOne({ where: { email: payload.email } });
            
            if (!user) {
                // Buat user baru jika belum ada
                user = await User.create({
                    username: payload.name,
                    email: payload.email,
                    // Generate random password untuk user Google
                    password: Math.random().toString(36).slice(-8)
                });
            }
            
            // Generate JWT token
            const tokenPayload = { 
                id: user.id, 
                email: user.email, 
                username: user.username 
            };
            const access_token = generateToken(tokenPayload);
            
            res.status(200).json({ 
                access_token, 
                username: user.username, 
                email: user.email 
            });
            
        } catch (error) {
            console.error('Google Login Error:', error);
            next(error);
        }
    }
}

module.exports = UserController;