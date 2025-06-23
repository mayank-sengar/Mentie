import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Booking } from "../models/booking.model";
import { MentorProfile } from "../models/mentorProfile.model";


const createBooking = asyncHandler(async(req,res)=>{
    const {mentorUserId,date,time} = req.body;

    //checking for pre booked slots 
    const exisitingMentor=await Booking.findOne({
       mentorId: mentorUserId,
        date: new Date(date),
        time : time,
        status : {
            $in : ["pending","confirmed"]
        }
    })


    if(exisitingMentor){
        throw new ApiError(409,"This slot is not available")
    }

    // creating a booking

    const addBooking = await Booking.create({
         userId : req.user._id,
       mentorId: mentorUserId,
        date: new Date(date),
        time : time,
        status :"confirmed",

    })
    
    //removing availablity from mentor 
    const mentorProfile = await MentorProfile.findOne({userId: mentorUserId});

if(mentorProfile){
    const day= new Date(date).toLocaleDateString("en-US", {weekday : "long"});

    mentorProfile.availability = mentorProfile.availability.map((item)=>{

        if(item.day== day){
            
            item.day=day,
           item.slots= item.slots.filter((booked)=>  booked != time)
            

        }

        return item;

    })
}
if(mentorProfile){
   await  mentorProfile.save();
}
  


if(!addBooking){
throw new ApiError(500,"Booking failed");
}

return res.status(201).json(new ApiResponse(201,addBooking,"Booking done successfully"))




})



const getAllBookingforUsers = asyncHandler ( async (req,res)=> {
    const userId = req.user._id;

    const userBookings = await Booking.find({userId}).populate("mentorId", "fullName userName expertise ").sort({createdAt : 1});
//todo - get bookings according to status 

if(userBookings){
    return res.status(200).json(new ApiResponse(200, userBookings, "User bookings fetched successfully"));
}
})


const getAllBookingforMentors = asyncHandler ( async (req,res)=> {
const mentorId = req.user._id;

const mentorBookings = await Booking.find({mentorId : mentorId}).populate({"userId" : "userName fullName avatar"}).sort({createdAt : -1});

if(mentorBookings){
return res.status(200).json(new ApiResponse(200, mentorBookings, "Mentor bookings fetched successfully"));
}

}
)


const updateBookingStatus = asyncHandler ( async (req,res)=> {

    const {bookingId , status } = req.body;

    const booking =await Booking.findById({bookingId});

    const userId = booking.userId;
    const mentorId = booking.userId;

    if( (req.user._id != userId)  && (req.user._id != mentorId) ){
        throw new ApiError(401,"Unauthorized access of booking updation")
    }

    const validStatus = ["cancelled","completed"];

    if(!validStatus.includes(status)){
        throw new ApiError(400, "Invalid status");
    }
    //todo- cancel and readd slot 

    const updateStatus = await Booking.findByIdAndUpdate(bookingId, {
        status : status
    },
         {new: true}
    );
    
    if (!updated) throw new ApiError(404, "Booking not found");

  res.status(200).json(new ApiResponse(200, updated, "Booking status updated"));


}
)



const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id)
    .populate("mentorId", "fullName userName")
    .populate("userId", "fullName userName expertise ");

  if (!booking) throw new ApiError(404, "Booking not found");

  res.status(200).json(new ApiResponse(200, booking, "Booking details fetched"));
});




export {createBooking,getAllBookingforUsers,getAllBookingforMentors,updateBookingStatus,getBookingById}

