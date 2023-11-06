var mongoose= require("mongoose");

const productSchema= mongoose.Schema({
    title:{
        type: String,
        required: true
    },

    description:{
        type: String,
        required: true
    },

    // price: {
    //     type: String,
    //     required: true
    // },

     images:{
         type: String,
         required: true
     }

    // images:{
    //     type: Array,
    //     required: true,
    //     validate: [arrayLimit, "you can pass upto 8 product images"]

    // }
});

// function arrayLimit(val){
//     return val.length <= 8;
// }


module.exports= mongoose.model("product", productSchema);