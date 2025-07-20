const mongoose = require('mongoose');

require("dotenv").config();
// Connect to MongoDB
const connectwithDB=()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(
        () => console.log('MongoDB connected')
    )
    .catch(
        err => console.error('MongoDB connection error:', err)
    );
}

module.exports= connectwithDB;