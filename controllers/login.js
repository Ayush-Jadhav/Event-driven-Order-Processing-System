const User = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt  = require("jsonwebtoken");
require("dotenv").config();

exports.logIn = async (req,res)=>{
    try{
        const {email,password} = req.body;

        // validate data 
        if(!email || !password){
            return res.status(400).json({ 
                success: false, 
                message: "Provide all require information" 
            });
        }

        const userInfo = await User.findOne({email});

        // check if user exists or not
        if(userInfo)
        {
            
            // compare password
            const comparePass = await bcrypt.compare(password,userInfo?.password)
            if(!comparePass){
                return res.status(400).json({ 
                    success: false, 
                    message: "Incorrect Password" 
                });
            }
            
            // if password matched and user exists, generate jwt token
            const payload = {
                email,
                id: userInfo._id,
            }
            
            const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
            const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    
            // Store refresh token in the database
            userInfo.refreshToken = refreshToken;
            await userInfo.save();
            
            userInfo.token = token;
            userInfo.password = undefined;
            
            const option = {
                expires: new Date(Date.now() + 5*24*60*60*1000),
                httpOnly: true,
            }
            
            res.cookie("token",token,option).status(200).json({
                success: true,
                token,
                refreshToken,
                userInfo,
                message: "User logged In successfully"
            })
        }
        else{
            return res.status(404).json({ 
                success: false, 
                message: "User is not found, please signUp" 
            });
        }
    }
    catch(err){
        console.error(err); 
        return res.status(500).json({ 
            success: false, 
            message: "Something went wrong. Please try again later." 
        });
    }
}


exports.refreshToken = async (req, res) => {
    try {
        const {refreshToken} = req.get("Authorization")?.replace("Bearer ", "") || req.body;

        if (!refreshToken) {
            return res.status(403).json({ 
                success: false, 
                message: "Refresh token is required" 
            });
        }

        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({ 
                success: false, 
                message: "Invalid refresh token" 
            });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Invalid or expired refresh token" 
                });
            }

            const newAccessToken = jwt.sign(
                { email: user.email, id: user._id }, 
                process.env.ACCESS_TOKEN_SECRET, 
                { expiresIn: "15m" });

            return res.status(200).json({
                success: true,
                accessToken: newAccessToken
            });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};
