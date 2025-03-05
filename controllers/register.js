const User = require("../models/user");
const OTP = require("../models/otpForRegister");
const bcrypt = require('bcryptjs');
const otpGenerator = require("otp-generator");

exports.sendOTP =async (req,res)=>{
    try{
        // fetch data fromm req
        const {email,number} = req.body;

        // check if user already exists
        const isExist = await User.findOne({email});
        if(isExist)
        {
            return res.status(400).json({ 
                success: false, 
                message: "User already exists" 
            });
        }
       
        // generate otp for email verification
        const otp = otpGenerator.generate(6,{
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        })
        
        console.log("otp",otp);
        // create otp for email verification and send mail 
        const sendOTP = await OTP.create({number,email,otp});

        return res.status(200).json({ 
            success: true, 
            message: "OTP generates and sent successfully",
            otp
        });
    }
    catch(err){
        console.error(err); // Log the error for debugging
        return res.status(500).json({ 
            success: false, 
            message: "Something went wrong. Please try again later." 
        });
    }
}

exports.signUp = async (req,res)=>{
    try{
        // fetch data fromm req
        const {name,email,number,password,confirmPassword,otp} = req.body;


        // validate data
        if(!name || !email || !number || !password || !confirmPassword || !otp)
        {
            return res.status(400).json({ 
                success: false, 
                message: "All required fields must be provided." 
            });
        }


        // check password and confirmPassword
        if(password!==confirmPassword){
            return res.status(400).json({ 
                success: false, 
                message: "Password and confirmPassword must be same" 
            });
        }

        // verify otp
        const otpInDB = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        const originalOTP = otpInDB[0]?.otp;
        console.log("otpInDB",originalOTP);
        console.log("otp",otp)

        // Check if an OTP exists in the database
        if (!originalOTP) {
            return res.status(404).json({
                success: false,
                message: "No OTP found for this email.",
            });
        }

        // check if user already exists
        const isExist = await User.findOne({email,number});
        if(isExist)
            {
                return res.status(400).json({ 
                    success: false, 
                    message: "User already exists" 
                });
            }

        // Ensure both are strings and compare
        if (otp?.trim() !== originalOTP.toString().trim()) {
            return res.status(400).json({
                success: false,
                message: `Incorrect OTP`,
            });
        }

            
        // check password and confirmPassword
        if(password!==confirmPassword){
            return res.status(400).json({ 
                success: false, 
                message: "confirmPassword must be same." 
            });
        }

        // hash password before storing, salt round 10
        const hashPassword = await bcrypt.hash(password,10);

        const newUser = await User.create({
            name,
            email,
            number,
            password: hashPassword,
        });


        return res.status(200).json({
            success: true,
            message: "User created Successfull",
        })
    }
    catch(err){
        console.error(err); 
        return res.status(500).json({ 
            success: false, 
            message: "Something went wrong. Please try again later." 
        });
    }
}
