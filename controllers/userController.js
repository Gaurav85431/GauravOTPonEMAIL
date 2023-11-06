const userproduct = require("../models/productModel");
const user = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const bcryptjs = require('bcryptjs');

const config = require("../config/config");

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const randomstring = require("randomstring");



const create_token = async (id) => {

    try {

        const token = await jwt.sign({ _id: id }, config.secret_jwt);
        return token;

    }
    catch (error) {
        res.status(400).send(error.message);
    }
}

const securePassword = async (password) => {
    try {
        const passwordHash = await bcryptjs.hash(password, 10);
        return passwordHash;
    }
    catch (error) {

        res.status(400).send(error.message);

    }
}

const register_user = async (req, res) => {


    try {

        const spassword = await securePassword(req.body.password);

        const users = new user({
            name: req.body.name,
            email: req.body.email,
            // phone: req.body.phone,
            mobile: req.body.mobile,
            password: spassword,
            type: req.body.type




            // password: req.body.password,



        });



        const userData = await user.findOne({ email: req.body.email });
        if (userData) {
            res.status(200).send({ success: false, msg: "This email is already exist" });

        }
        else {
            const user_data = await users.save();
            res.status(200).send({ success: true, data: user_data });
        }

    }

    catch (error) {


        res.status(400).send(error.message);
    }
}

//login Method

const user_login = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;


        const userData = await user.findOne({ email: email });

        if (userData) {

            // compare() is a function of bcryptjs, in that function we compare 2 values
            // first value "password" which user pass at the time of login
            // and second value "userData.password" means the original password stored in database

            const passwordmatch = await bcryptjs.compare(password, userData.password);

            if (passwordmatch) {

                const tokenData = await create_token(userData._id);
                console.log(tokenData);
                // save token in array   first find id and then push new token in array
                const id = userData._id;
                const updateToken = await user.updateOne({ _id: id }, { $push: { token: tokenData } });

                const userResult = {
                    _id: userData._id,
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    // phone: userData.phone,
                    mobile: userData.mobile,
                    type: userData.type,
                    token: tokenData

                }
                /*** own logic but it store 100 times same token */
                //--
                /*
                                const arrayToken = [];
                                for (let i = 0; i < 100; i++) {
                                    arrayToken[i] = tokenData;
                                }
                
                                // /--
                
                
                                const getID = await user.findOne({ email: email });
                                const getMyID = getID._id;
                
                                const saveToken = new user({
                
                                    name: userData.name,
                                    email: userData.email,
                                    password: userData.password,
                
                                    mobile: userData.mobile,
                                    type: userData.type,
                                    token: arrayToken//tokenData
                
                                });
                
                                const token_data_save = await saveToken.save();
                
                
                
                                // const TokenSaveData = await user.findByIdAndUpdate({ _id: getMyID }, {
                                //     $set: {
                                //         token: tokenData
                                //     }
                                // });
                
                */

                /***  own logic but it store 100 times same token end */


                const response = {
                    success: true,
                    msg: "User Details",
                    data: userResult
                }

                res.status(200).send(response);

            }
            else {
                res.status(200).send({ success: false, msg: "login details are incorrect" });
            }

        }
        else {
            res.status(200).send({ success: false, msg: "login details are incorrect" });
        }
    }
    catch (error) {
        res.status(400).send(error.message);
    }
}


/** logout ke liye all token ko delete kr denge db se */

const logoutAllDevice = async (req, res) => {

    try {

        const token = req.params.token;
        const tokenData = await user.findOne({ token: token });
        console.log(tokenData);
        if (tokenData) {

            const emptyToken = [];

            const userdata = await user.findByIdAndUpdate({ _id: tokenData._id }, { $set: { token: emptyToken } }, { new: true })


            res.status(200).send({ success: true, msg: "Logout successfully from all device" });



        }

        else {
            res.status(200).send({ success: false, msg: "invalid token" });
        }

    } catch (error) {
        res.status(400).send(error.message);
    }


}


/** Logout form one device */

const logout = async (req, res) => {

    try {

        const token = req.params.token;
        const tokenData = await user.findOne({ token: token });
        // console.log(tokenData);

        if (tokenData) {

            const myToken = tokenData.token;
            const emptyTokenArray = myToken.filter((item) => item !== token);


            const emptyToken = [];

            const userdata = await user.findByIdAndUpdate({ _id: tokenData._id }, { $set: { token: emptyTokenArray } }, { new: true })


            res.status(200).send({ success: true, msg: "Logout successfully from this device" });



        }

        else {
            res.status(200).send({ success: false, msg: "invalid token" });
        }

    } catch (error) {
        res.status(400).send(error.message);
    }


}






const getuser = async (req, res) => {
    try {

        const data = await user.find();
        const formattedData = data.map(item => ({

            id: item._id,
            name: item.name,
            email: item.email,
            // phone: item.phone,
            mobile: item.mobile,
            password: item.password,
            type: item.type

        }));

        // Send the formatted data as the response
        res.status(200).json(formattedData);
    } catch (error) {
        res.status(400).send(error.message);
    }
}


const resetpassword = async (req, res) => {
    try {

        const token = req.params.token;
        const tokenData = await user.findOne({ token: token });
        console.log(tokenData);
        if (tokenData) {

            const password = req.body.password;
            //  const oldpassword = tokenData.password;

            const passwordmatch = await bcryptjs.compare(password, tokenData.password);
            if (passwordmatch) {
                const new_password = req.body.newpassword;
                const confirmpassword = req.body.confirmpassword;
                if (new_password === confirmpassword) {
                    const newpassword = await securePassword(new_password);
                    /** my logicc */
                    // const token = req.query.token

                    // const changePW = user.findOne({ token: token });
                    // const chagingPW = changePW.updateOne({ _id: tokenData._id }, { $set: { password: newpassword } }, { new: true });



                    /** mylogic end  */
                    const userdata = await user.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: newpassword } }, { new: true })

                    res.status(200).send({ success: false, msg: "User password has been reset", data: userdata });
                }
                else {
                    res.status(200).send({ success: false, msg: "newPassword and confirmPassword didn't match" });
                }

            }
            else {
                res.status(200).send({ success: false, msg: "password is wrong" });
            }
        }

        else {
            res.status(200).send({ success: false, msg: "invalid token" });
        }

    } catch (error) {
        res.status(400).send(error.message);
    }
}



const sendresetpasswordmail = async (username, email, token) => {

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        // Generate OTP::
        const GenOTP = Math.floor(1000 + Math.random() * 9000).toString();
        const saveOTP = await user.updateOne({ email: email }, { $set: { otp: GenOTP } });




        const mailOption = {
            from: config.emailUser,
            to: email,
            subject: 'For reset password',
            // html: '<p> Hii ' + username + ', please click the link <a href= "https://gauravslonexpwd.onrender.com/api/resetpassword"> and reset your password </a>'
            html: '<p> Hii ' + username + ', The OTP is is ' + GenOTP + ', please click the link <a href= "http://127.0.0.1:3000/api/resetpassword"> and reset your password </a>'
        }

        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error);

            }
            else {
                console.log("Mail has been sent : ", info.response);
            }
        });



    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const forget_password = async (req, res) => {

    try {
        const email = req.body.email;
        const userData = await user.findOne({ email: email });




        if (userData) {

            const Randomstring = randomstring.generate();
            const data = await user.updateOne({ email: email }, { $set: { token: Randomstring } });
            sendresetpasswordmail(userData.name, userData.email, Randomstring);
            res.status(200).send({ success: true, msg: "Please check your inbox of email and reset your password" })

        }
        else {

            res.status(200).send({ success: true, msg: "This email does not exist" });

        }

    } catch (error) {

        res.status(200).send({ success: false, msg: error.message });

    }

}
/*
// reset password

const reset_password = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await user.findOne({ token: token });

        if (tokenData) {
            const password = req.body.password;
            const newpassword = await securePassword(password);
            const userdata = await user.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: newpassword, token: '' } }, { new: true })

            res.status(200).send({ success: true, msg: "User password has been reset", data: userdata })
        } else {
            res.status(200).send({ success: true, msg: "This link is invalid" });
        }

    } catch (error) {
        res.status(200).send({ success: false, msg: error.message });
    }
}
*/


// this will open reset.ejs file on browser
const emailforgot = async (req, res) => {
    try {
        res.render('reset');
    } catch (error) {
        console.log(error.message);
    }
}

const forgetuser = async (req, res) => {
    try {

        const email = req.body.email;

        const userdata = await user.findOne({ email: email })
        if (!userdata) {
            res.render('reset', { message: "This email doesn't exists" });
        }



        else {

            // const password = req.body.password;

            // const passwordmatch = await bcryptjs.compare(password, userdata.password);
            //  if (passwordmatch) {


            const MyOTP = req.body.OTP;

            const MatchOTP = await user.findOne({ otp: MyOTP });

            const newpassword = req.body.newpassword;
            const confirmpassword = req.body.confirmpassword;

            if (MatchOTP) {

                if (newpassword === confirmpassword) {


                    const newpswd = await securePassword(newpassword);
                    const userd = await user.findByIdAndUpdate({ _id: userdata._id }, { $set: { password: newpswd } }, { new: true })

                    res.render('data', { message: " Your password has been changed successfully" });
                    // res.status(200).send({ success: true, msg: "User password has been reset", data: userdata });


                }


                else {

                    res.render('reset', { message: " new password and confirm password did not match" });

                }
            }
            else {
                res.render('reset', { message: " OTP not match" });
            }
            //   }
            // else {

            //     res.render('reset', { message: "old password is wrong " });

            // }
        }

    } catch (error) {
        res.render('reset', { message: error.message });

        //console.log(error.message);
    }
}



/*
const fogetuser = async (req, res) => {
    try {

        const spassword = await securepassword(req.body.password);

        const user = new userregister({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            image: req.file.filename,
            password: spassword,
            is_admin: 0

        });

        const userdata = await user.save();

        if (userdata) {
            res.render('data', { message: " your password has been reset successfully " });

        }
        else {
            res.render('reset', { message: " your reset password has been failed" });
        }

    } catch (error) {
        console.log(error.message);
    }
}
*/

module.exports = {

    register_user,
    user_login,
    getuser,
    forget_password,
    //reset_password,
    emailforgot,
    forgetuser,
    resetpassword,
    logoutAllDevice,
    logout


}