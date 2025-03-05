const mongoose = require("mongoose");
require("dotenv").config();

const connectWithDB = () =>{
    mongoose.connect(process.env.DATABASE_URL,{
        useNewURLParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log("Database connected Successfully"))
    .catch((err)=>{
        console.error(err);
        console.log("something went wrong while connecting DB");
    })
}

module.exports = connectWithDB;