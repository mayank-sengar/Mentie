import { mongoose } from 'mongoose';
import { MentorProfile } from './mentorProfile.model';


const mentorProfileSchema=new mongoose.Schema({
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique:true
   },
   bio:{
    type:String
   },
   expertise:
   [{type:String}],

   //arr of obj
   availability:[{
    day:{type:String},
    slots:[{type: String}]
   }
   ]
},
{timestamps:true}
);


export const MentorProfile = mongoose.model("MentorProfile",mentorProfileSchema);