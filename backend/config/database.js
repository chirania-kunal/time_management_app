const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
const connectwithDB=()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(
        () => console.log('MongoDB connected')
    )
    .catch((err)=>{
        console.log("DB Connection Issues.");
        console.log(err);
        process.exit(1);
    });
}

module.exports= connectwithDB;