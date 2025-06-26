import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from 'jsonwebtoken'
import mongoose from "mongoose" 


import {User} from "../models/user.model.js"

const generateAccessandRefreshTokens = async (userId) => {
    try{
    const user=await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken=refreshToken;
    user.accessToken=accessToken;

    //saving the refresh and accessToken directly without again
    await user.save({validateBeforSave:false});


    return {accessToken,refreshToken}
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async(req,res)=>{




    const {fullName,userName,email,password,mobileNumber,role}=req.body

    if(
        [fullName,userName,email,password,role].some((field)=>
            field?.trim() === ""
        )
    ){
        throw new ApiError(400,"All Fields are required");
    }


    const existingUser = await User.findOne({
          $or : [{userName},{email}]
    })

    if(existingUser){
        throw new ApiError(409,"User with same email or username already exists")
    }


    const avatarLocalPath=req.files?.avatar[0]?.path;


    const avatar=await uploadOnCloudinary(avatarLocalPath);
    let avatarUrl=avatar?.url;

    if(!avatar?.url){
         avatarUrl= "https://res.cloudinary.com/dtppemevc/image/upload/v1750444117/ChatGPT_Image_Jun_20_2025_11_57_29_PM_zv7zeb.png";
    }

    const user =await User.create({
        fullName,
        userName,
        avatar: avatarUrl,
        mobileNumber,
        email,
        password,
        role,
        
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser ){
    throw  new ApiError(500,"Something went wrong while registering the user")
}

if(createdUser){
    return new ApiResponse(200,createdUser,"User registered successfully")
}

        
})

const loginUser = asyncHandler( async (req,res)=>{

   
    const {userName,email,password} = req.body

    if(!userName && !email){
        throw new ApiError(400,"Username/Email is required ")
    }

    if(!password){
     throw new ApiError(400,"Password is  required ")
    }

    const userPresent=await User.findOne({
           $or:[{userName},{email}]
    })

    if(!userPresent){
        throw new ApiError(404,"User is not registered")
    }
 
    const userPassword = await userPresent.isPasswordCorrect(password)

    if(!userPassword){
        throw new ApiError(401,"Invalid user credentials");
    }

     const {accessToken,refreshToken} = await generateAccessandRefreshTokens(userPresent._id)

     if( !accessToken || !refreshToken){
    throw new ApiError( 500,"Something went wrong in accessToken or refreshToken method call")
       }

    
    const loggedInUser = await User.findById(userPresent._id)
        .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };
   
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser },
                "User logged in successfully"
            )
        )

})

const logoutUser=asyncHandler( async ( req,res)=>{


    
   
     await User.findByIdAndUpdate(
    req.user._id,
    {
 
        $set: {
            refreshToken: undefined
        }
    },
    {
        new:true
    }
 ) 

 const options = {
    httpOnly: true,
    secure:true
 }

 return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).
 json(new ApiResponse(200,{},"Logged out successfully"))



})


const getCurrentUser = asyncHandler(async (req,res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
      );
      
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    const user=req.user;
     const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

     if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password");
     }
    
     user.password=newPassword;
     await user.save({validationBeforeSave: false});
    
     return res.
    status(200).
    json(new ApiResponse(200,{},"Password updated successfully"))
    
})
const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullName, mobileNumber } = req.body;
    const user = req.user;

    let avatarUrl = user.avatar; // keep existing avatar by default
    if (req.files?.avatar && req.files.avatar[0]?.path) {
        const avatar = await uploadOnCloudinary(req.files.avatar[0].path);
        if (avatar?.url) {
            avatarUrl = avatar.url;
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            fullName,
            avatar: avatarUrl,
            mobileNumber,
        },
        {
            new: true,
        }
    );

    if (!updatedUser) {
        throw new ApiError(404, "User not found or update failed");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User profile updated successfully")
    );
});



const refreshAccessToken= asyncHandler(async(req,res)=>{
    const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;
    
    if(!incommingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try{
        const decodedToken = jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        
        const user = User.findById(decodedToken?._id);
        if(!user){
             throw new ApiError(401, "unauthorized request ") 
        }

        if(incommingRefreshToken !== user?.refreshToken ){
             throw new ApiError(401, "unauthorized request ")
        }

        const options={
            httpOnly:true,
            secure:true
        }

        const {accessToken, newRefreshToken} = await generateAccessandRefreshTokens(user._id);
       
         user.refreshToken = newRefreshToken;
            await user.save({ validateBeforeSave: false });
             
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {accessToken, refreshToken: newRefreshToken},
                    "Access token refreshed"
                )
            )

    }
    catch(error){
     throw new ApiError(401, error?.message || "Invalid refresh token");

    }
})

export {generateAccessandRefreshTokens,registerUser,loginUser,changeCurrentPassword,refreshAccessToken,updateUserProfile,logoutUser,getCurrentUser}









