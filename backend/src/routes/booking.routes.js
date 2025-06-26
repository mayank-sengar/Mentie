import {Router } from 'express';
import  {createBooking,getAllBookingforUsers,getAllBookingforMentors,updateBookingStatus,getBookingById} from "../controllers/booking.controllers.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';


const router = Router();

router.route('/create-booking').post(verifyJWT,createBooking);
router.route('/get-booking-user').get(verifyJWT,getAllBookingforUsers);
router.route('/get-booking-mentor').get(verifyJWT,getAllBookingforMentors);
router.route('/update-booking-status').put(verifyJWT,updateBookingStatus);
router.route('/get-booking-status/:id').get(verifyJWT, getBookingById);

export default router;
