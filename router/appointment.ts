import express from 'express';
import { addAppointment, addAppointmentValidator, changeStatus, changeStatusValidator, getAllAppointments, getAppointmentsFilter, getSlots, getSlotsValidator } from '../Controllers/appointment';
import {isAuthenticated} from "../middleware";


export default (router: express.Router) => {
    router.get("/appointments" ,isAuthenticated, getAllAppointments);
    router.get("/appointment/filter" , isAuthenticated,  getAppointmentsFilter);
    router.post("/appointment/slots" , getSlotsValidator, getSlots);
    router.post("/appointment/add" ,addAppointmentValidator , addAppointment);
    router.post("/appointment/update/:id", isAuthenticated, changeStatusValidator, changeStatus);
   
}