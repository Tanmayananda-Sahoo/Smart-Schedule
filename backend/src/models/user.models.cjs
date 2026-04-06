const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [4,"Name should be minimum of 4 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid mail address']
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [4, "Password should be of minimum 4 characters."],
        select: false
    },
    department: {
        type: String,
        required: [true, 'You are required to enter your department']
    },
    bio: {
        type: String,
        required: false,
        default: null
    },
    academicYear: {
        type: Number,
        required: [true, "Academic Year is a required field."],
        enum: [1,2,3,4]
    }
},{timestamps: true})


userSchema.pre('save', async function() {
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
})
userSchema.methods.isPasswordCorrect = async function(password) {
    console.log(password);
    console.log(this.password);
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateToken = function() {
    return jwt.sign(
        {
            userId: this._id
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: '3d'
        }
    )
} 

const User = new mongoose.model('User', userSchema);

module.exports = {
    User
};