import {Router } from 'express';
import {registerUser,loginUser,changeCurrentPassword,updateUserProfile,refreshAccessToken,logoutUser,getCurrentUser} from "../controllers/auth.controllers.js";

import {upload} from  "../middlewares/multer.middleware.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();


router.route("/register").post(
  upload.single("avatar"),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-profile").put(verifyJWT, updateUserProfile);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/profile").get(verifyJWT, getCurrentUser);

export default router;



