const mongoose = require("mongoose");


const postSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    title:String,
    desc:String,
    image: {
        data: Buffer,
        contentType: String
      },

})
module.exports = mongoose.model("post",postSchema);