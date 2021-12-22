const { prototype } = require('aws-sdk/clients/acm')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')

const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidPassword = function(password) {
    if (password.length > 7 && password.length < 16)
        return true
}


//API 1 Register User =================================================================================================

const registerUser = async function(req, res) {
    try {
        const requestBody = req.body

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })
            return
        }

        // Extract params
        let { fname, lname, email, profileImage, phone, password, address } = requestBody; // Object destructing
        //Validation Starts
        if (!isValid(fname)) {
            res.status(400).send({ status: false, Message: "Please provide first name" })
            return
        }
        fname = fname.trim()

        if (!isValid(lname)) {
            res.status(400).send({ status: false, Message: "Please provide last name" })
            return
        }
        lname = lname.trim()

        if (!isValid(phone)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild phone number" })
            return
        }

        if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/.test(phone.split(' ').join('')))) {
            res.status(400).send({ status: false, message: `phone no should be a valid phone no` })
            return
        }

        if (!isValid(email)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild email" })
            return
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.split(' ').join('')))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }

        if (!isValid(profileImage)) {
            res.status(400).send({ status: false, Message: "Please provide profile image" })
            return
        }

        profileImage = profileImage.trim()

        let profile = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i

        if (!profile.test(profileImage)) {
            res.status(400).send({ status: false, message: `Please povide a valid URL for profile image` })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, Message: "Please provide password" })
            return
        }
        if (!isValidPassword(password)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild password ,Password should be of 8 - 15 characters" })
            return
        }

        if (!isValid(address)) {
            res.status(400).send({ status: false, Message: "Please provide address" })
            return
        }

        if (!isValid(address.shipping)) {
            res.status(400).send({ status: false, Message: "Please provide shipping address" })
            return
        }

        if (!isValid(address.billing)) {
            res.status(400).send({ status: false, Message: "Please provide shipping address" })
            return
        }

        let Email = email.split(' ').join('')
        const isEmailAlreadyUsed = await userModel.findOne({ email: Email }); // {email: email} object shorthand property

        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${Email} email address is already registered` })
            return
        }
        let Phone = phone.split(' ').join('')
        const isPhoneAlreadyUsed = await userModel.findOne({ phone: Phone });

        if (isPhoneAlreadyUsed) {
            res.status(400).send({ status: false, message: `${Phone}  phone is already registered` })
            return
        }
        //  const encryptedPassword = await bcrypt.hash(password, saltRounds)
        let FPhone = phone.split(' ').join('');
        let FEmail = email.split(' ').join('')
        const userData = { fname, lname, phone: FPhone, email: FEmail, password, address, profileImage }

        const newUser = await userModel.create(userData);

        res.status(201).send({ status: true, message: `User registered successfully`, data: newUser });

    } catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }

}

//API 2 - Login User===================================================================================================
const loginUser = async function(req, res) {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide login details' })
            return
        }

        // Extract params
        const { email, password } = requestBody;

        // Validation starts
        if (!isValid(email)) {
            res.status(400).send({ status: false, message: `Email is required` })
            return
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, message: `Password is required` })
            return
        }

        const user = await userModel.findOne({ email, password });

        if (!user) {
            res.status(401).send({ status: false, message: `Invalid login credentials` });
            return
        }
        const token = await jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60
        }, 'group7')

        res.header('x-api-key', token);
        res.status(200).send({ status: true, message: `user login successfull` });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}





module.exports = { registerUser, loginUser }