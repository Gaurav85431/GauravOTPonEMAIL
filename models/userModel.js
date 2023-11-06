const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    //  phone
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    token: {
        // type: String,
        type: Array,
        // default: ''
    },
    otp: {
        type: String,

        default: ""
    }


});

module.exports = mongoose.model("User", userSchema);