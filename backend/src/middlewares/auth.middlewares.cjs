const jwt = require('jsonwebtoken');
const {User} = require('../models/user.models.cjs');

const isUserAuthenticated = async(req,res,next) => {
    const Token = req.cookies.Token;
    console.log("Token: ",Token)
    if(!Token) {
        return res.status(401)
        .json({
            message: 'User not authenticated. Please login again.'
        })
    }
    console.log("Secret: ", process.env.TOKEN_SECRET);
    const decodedUser = jwt.verify(Token, process.env.TOKEN_SECRET);
    const user = await User.findById(decodedUser.userId);
    req.user = user;
    next();
}

module.exports = {
    isUserAuthenticated
};