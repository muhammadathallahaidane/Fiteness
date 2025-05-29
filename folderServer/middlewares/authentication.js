const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models');

const authentication = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            throw { name: 'Unauthorized', message: 'Access token is missing' };
        }

        const [type, token] = authorization.split(' ');
        if (type !== 'Bearer' || !token) {
            throw { name: 'Unauthorized', message: 'Invalid token format' };
        }

        const payload = verifyToken(token);
        const user = await User.findByPk(payload.id);
        if (!user) {
            throw { name: 'Unauthorized', message: 'User not found' };
        }

        req.user = { // Menyimpan data user yang terotentikasi di request
            id: user.id,
            email: user.email,
            username: user.username
        };

        next();
    } catch (error) {
        next(error); // Teruskan error ke error handler
    }
};

module.exports = authentication;