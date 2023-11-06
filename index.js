const express = require('express');
const app = express();
const cors = require("cors");
const http = require("http");
app.use(express.json());
app.use(cors());

const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/mydbOTP')


// routes 
const getroute = require("./routes/getRoutes");
app.use('/api', getroute);


// 3000
app.listen(3000, function () {
    console.log("Server is ready");
})



const PORT = 8000;
const DB = "mongodb+srv://Gaurav:eP2ILjAadWqdYhMda@gauravemailotp.aetickl.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(DB)
    .then(() => {
        console.log("Connected to MongoDB");
        const server = http.createServer(app);
        server.listen(PORT, () => {
            console.log(`Server is running on :${PORT}`);
        });
    })
    .catch(error => {
        console.error("Error connecting to MongoDB:", error);
    });


