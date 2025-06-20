import { mongoose } from 'mongoose';

const bookingSchema= new mongoose.Schema({
userId:{
type: mongoose.Schema.Types.ObjectId,
ref:'User',
required:true,
},
mentorId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
},
date:{
    type:String,
    required:true,
},
time:{
    type:String,
    required:true,
},
status:{
    type:String,
    enum:['pending','confirmed','cancelled','completed'],
    default:'confirmed'
},
videoRoomId:{
    type:String,
},


},{
    timestamps:true,
})



export const Booking = mongoose.model("Booking",bookingSchema);