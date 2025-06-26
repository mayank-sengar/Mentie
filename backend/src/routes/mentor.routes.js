import {Router } from 'express';
import  {createOrUpdateMentorProfile,getMentorProfile,searchMentors,updateAvailability} from "../controllers/mentor.controllers.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';


const router = Router();


router.route('/edit-mentor').post(verifyJWT,createOrUpdateMentorProfile);
router.route('/mentor-profile').get(verifyJWT,getMentorProfile);
router.route('/update-availability').put(verifyJWT,updateAvailability);
router.route('/search-mentor').get(searchMentors);



export default router;
