import { mongoose } from 'mongoose';



const userSchema= new mongoose.Schema({
    userName: {
    type:String,
    required : true,
    unique: true,
    trim: true,
    index:true
    },
    email:{
        type:String,
        required: true,
        unique: true,
        trim:true
    },
    fullName: {
        type:String,
        required:true,
        
    },
    password:{
        type:String,
        //empty => oauth users
        //validation, error (custom)
        // required:[true,"Password is required"],
    },
    mobileNumber :{
        type:String,
    },
    avatar:{
    //cloudinary url
    type:String,
    },
    role:{
        type:String,
        enum:['user','mentor'],
        required:true,
    },
    refreshToken:{
        type:String
    },
    
},
{
    timestamps:true,
})


export const User = mongoose.model("User", userSchema)