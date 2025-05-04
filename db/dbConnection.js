const mongoose = require('mongoose');


const connectionDb = async ()=>{
    try{
          await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
         console.log("Connected to Db");
    } catch(err){
        console.log("Connection Error",err.message)
    }
}


module.exports = connectionDb;