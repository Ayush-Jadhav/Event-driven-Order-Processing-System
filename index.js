const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

const connectWithDB = require("./config/connectDB");
connectWithDB();

app.use(express.json());
app.use(cookieParser());

const route = require("./route/routes");
app.use("/api",route);

require('dotenv').config();
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is listening at port ${port}`);
});

const worker = require("./worker/orderProcessor");
worker.startWorker();
