import { MentorProfile } from "../models/mentorProfile.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const createOrUpdateMentorProfile= asyncHandler( async ( req,res )=>{

    const {bio,expertise,availability}  = req.body;
    
    const exisitngProfile = await MentorProfile.findById(req.user._id);
 

    if(exisitngProfile){
        exisitngProfile.bio = bio;
        exisitngProfile.expertise = expertise;
        exisitngProfile.availability=availability;

        await existingProfile.save();

        return res.status(200).json(new ApiResponse(200, existingProfile, "Mentor profile updated"));
    }

     const createProfile = await MentorProfile.create({
        userId: req.user._id,
        bio,
        expertise,
        availability
     })
     return res.status(200).json(new ApiResponse(200,createProfile,"Mentor profile created successfully"))



})


const getMentorProfile  = asyncHandler(async (req,res)=>{
    
    const mentorProfile= await MentorProfile.findById(req.user._id);

    if(!mentorProfile){
        throw new ApiError(400,"Mentor Profile does not exist ")
    }

    return res.status(200).json( new ApiResponse(200,mentorProfile,"Mentor Profile fetched successfully"));
})

const searchMentors = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === "") {
    throw new ApiError(400, "Search query is required");
  }


  const mentors = await MentorProfile.find()
    .populate({
      path: "userId",
      match: {
        $or: [
          { userName: { $regex: query, $options: "i" } },
          { fullName: { $regex: query, $options: "i" } }
        ]
      },
      select: "userName fullName avatar expertise" 
    });


  const filtered = mentors.filter((mentor) => mentor.userId !== null);

  res.status(200).json(new ApiResponse(200, filtered, "Mentors fetched successfully"));
});



const updateAvailability = asyncHandler(async (req, res) => {
  const { availability } = req.body;

  if (!Array.isArray(availability)) {
    throw new ApiError(400, "Availability must be an array of days with slots");
  }

  const mentor = await MentorProfile.findOne({ userId: req.user._id });

  if (!mentor) {
    throw new ApiError(404, "Mentor profile not found");
  }

  mentor.availability = availability;
  await mentor.save();

  return res.status(200).json(new ApiResponse(200, mentor, "Availability updated"));
});






export {createOrUpdateMentorProfile,getMentorProfile,searchMentors,updateAvailability}