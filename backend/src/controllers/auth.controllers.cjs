const {User} = require('../models/user.models.cjs');

//completed and tested.
const register = async(req,res) => {
    //Taking the input
    const { name, email, password, confirmPassword, department, academicYear, bio } = req.body;

    //Validation
    if([name, password, email, confirmPassword, department].some((field) => field.trim() == '')) {
        return res.status(401)
        .json({
            message: 'Fields cannot be empty. Every field is compulsory'
        })
    }

    if(academicYear<0 || academicYear>4) {
        return res.status(400)
        .json({
            message: 'Academic year has to be between 1 and 4'
        })
    }
    
    if(password != confirmPassword) {
        return res.status(401)
        .json({
            message: 'Password and Confirm Password must match'
        })
    }

    if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return res.status(401)
        .json({
            message: "Please enter a valid email address"
        })
    }

    //Checking if the user is already present.

    const ifUserExist = await User.findOne({email});
    if(ifUserExist) {
        return res.status(401)
        .json({
            message: "User already exists. Please Login."
        })
    }

    //Creating a user.

    const createdUser = await User.create({
        name,
        email,
        password,
        department,
        academicYear,
        bio
    })
    
    const token = await createdUser.generateToken();
    
    if(!token) {
        return res.status(401)
        .json({
            message: "Token could not be generated."
        })
    }

    return res.status(200)
    .cookie('Token',token)
    .json({
        message: 'User created successfully',
        user: createdUser
    })
}

//completed and tested.
const login = async(req,res) => {
    //Taking user input
    const {email, password} = req.body;

    //Validation
    if([email, password].some((field) => field.trim() == '')) {
        return res.status(401)
        .json({
            message: 'All the fields are mandatory.'
        })
    }

    const existingUser = await User.findOne({email}).select('+password');
    if(!existingUser) {
        return res.status(401)
        .json({
            message: 'Invalid credentials.'
        })
    }
    const isPasswordValid = await existingUser.isPasswordCorrect(password);
    if(!isPasswordValid) {
        return res.status(401)
        .json({
            message: 'Invalid credentials.'
        })
    }

    //Fetch User
    const user = await User.findOne({email});

    const token = existingUser.generateToken();
    console.log("Token: ",token);
    if(!token) {
        return res.status(401)
        .json({
            message: "Token could not be generated."
        })
    }
    return res.status(200)
    .cookie('Token', token)
    .json({
        message: 'User logged in successfully.',
        User: user
    })
}

//completed and tested
const updatePassword = async(req,res) => {
    const {oldPassword, password, confirmPassword} = req.body;
    const userId = req.user._id;

    if(!userId) {
        return res.status(400)
        .json({
            message:"User is not authenticated."
        })
    }
    const existingUser = await User.findById(userId).select('+password');
    if(!existingUser) {
        return res.status(400)
        .json({
            message: "User does not exists."
        })
    }

    const isPasswordValid = await existingUser.isPasswordCorrect(oldPassword);

    if(!isPasswordValid) {
        return res.status(400)
        .json({
            message: "Please enter the correct password."
        })
    }

    if(password != confirmPassword) {
        return res.status(400)
        .json({
            message: "New password and confirm password should be same."
        })
    }
    const fetchedUser = await User.findById(userId);
    fetchedUser.password = password;
    await fetchedUser.save();
    if(!fetchedUser) {
        return res.status(401)
        .json({
            message: 'There is a problem with authenticating you. Please try logging in again.'
        })
    }

    return res.status(200)
    .json({
        message: "Password updated successfully.",
        user: fetchedUser
    })
}

const fetchUser = async(req,res) => {
    const id = req.user._id;

    if(!id) {
        return res.status(400)
        .json({
            message: "User not authenticated. Please Login again."
        })
    }
    const user = await User.findById(id);
    if(!user) {
        return res.status(400)
        .json({
            message: "User not found. Please register."
        })
    }

    return res.status(200)
    .json({
        message: "User fetched successfully.",
        user
    })
}

const updateEmail = async(req,res) => {
    const {email} = req.body;
    const userId = req.user._id;
    const fetchedUser = await User.findByIdAndUpdate(userId, {email}, {new:true});
    if(!fetchedUser) {
        return res.status(401)
        .json({
            message: 'There is a problem with authenticating you. Please try logging in again.'
        })
    }
    return res.status(200)
    .json({
        message: 'Credentials updated successfully.',
        email: fetchedUser.email
    })
}

const updateName = async(req,res) => {
    const {name} = req.body;
    const userId = req.user._id;
    const fetchedUser = await User.findByIdAndUpdate(userId, {name}, {new:true});
    if(!fetchedUser) {
        return res.status(401)
        .json({
            message: 'There is a problem with authenticating you. Please try logging in again.'
        })
    }
    return res.status(200)
    .json({
        message: 'Credentials updated successfully.',
         name: fetchedUser.name
    })
}


module.exports = {
    register,
    login,
    updatePassword,
    fetchUser
}