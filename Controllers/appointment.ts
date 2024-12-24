import express from 'express';
import {addAppointment_Action, addWorker_Action, checkAppointmentExist_Action, getAppointmentByFilter_Action, getAppointments_Action, getServiceById_Action, getWorkerById_Action, updateAppointmentStatus_Action} from "../DB/actions"
import {body , validationResult, param} from 'express-validator'
import { Appointment, Slot } from '../DB/models';
import service from '../router/service';


//getAllAppointment
export const getAllAppointments = async( req:express.Request , res:express.Response) => {
    try {
        //calling _Action to get appointments
      const appointments = await getAppointments_Action();  
      return res.status(200).json(appointments).end(); 
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

//getFilterAppointment 
export const getAppointmentsFilter = async (req: express.Request, res:express.Response) => {
    try {
        let from: string = req.query.from as string;
        let to: string = req.query.to as string;
        const appointments = await getAppointmentByFilter_Action({date: {$gte:new Date(from),$lte: new Date(to)}});
        return res.status(200).json(appointments).end(); 
        
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

// change status
export const changeStatus = async( req: express.Request, res: express.Response) => {
    try {
        const { id} = req.params;
        const appointment = await updateAppointmentStatus_Action(id, req.body);
        if(appointment){
            return res.status(200).json(appointment).end();
        }else{
            return res.status(400).json({error: "Cannot Update!"})
        }

        
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}


//Add appointment
export const addAppointment = async( req: express.Request, res: express.Response) => {
    try {
        const input_errors = validationResult(req);

        if (!input_errors.isEmpty()) {
          return res.status(400).json({ error: input_errors.array() });
        }

    

        //if appointment already exists
        const old_app = await checkAppointmentExist_Action(req.body.date, req.body.startTime, req.body.endTime, req.body.worker);

        if( old_app && old_app.status != "Cancelled" ){
            return res.status(400).json ({ error: "Appointment slot not available!"});
        }

        //check appointment time

        if(!checkAppointmentTime( req.body.startTime, req.body.endTime)){
            return res.status(400).json ({ error: "Appointment time not valid!"});
        }


        //worker accepts such service
        const worker = await getWorkerById_Action(req.body.worker);

        let checkService = false;
        worker?.services.forEach( service => {
            
            if(service._id.toString() == req.body.service) {
                checkService = true;
                return;
            }
        })

        if(!checkService) {
            return res.status(400).json ({ error: "Worker does not accept the selected Service!"});
        }

        //Check Schedule
        const new_appointment = await addAppointment_Action({...req.body , status: "Booked", paid: 0, tip: 0});

        if( new_appointment ){
            return res.status(200).json(new_appointment);
        }else{
            return res.status(400).json({error: "something went wrong!"})
        }
    
    
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
  }


export const getSlots = async (req: express.Request, res: express.Response) => {
    try {
        const input_errors = validationResult(req);

        if (!input_errors.isEmpty()) {
          return res.status(400).json({ error: input_errors.array() });
        }

        const day = new Date(req.body.date).getDay();
        const workerId = req.body.worker;
        const serviceId = req.body.service;
        const worker  = await getWorkerById_Action(workerId);
        
        if ( worker.services.filter(s => s._id == serviceId).length == 0 ){
           
            return res.status(400).json({error: "Employee does not provide selected service!"})

        }
        let startTime = worker.schedule[day].startTime;
        const endTime = worker.schedule[day].endTime;
        const hours = worker.schedule[day].hours;

        if( hours == 0){
         
            return res.status(400).json({error: "Employee does not work on the selected day!"})
        }

        let slots: Slot[] = [];
        let tmpEndTime = getNextSlot(startTime);
        while(checkAppointmentTime(startTime,tmpEndTime) && startTime != endTime){
            
            slots.push({
                worker: workerId,
                service: serviceId,
                startTime,
                endTime: tmpEndTime,
            })
            startTime = tmpEndTime;
            tmpEndTime = getNextSlot(startTime);
        }

        const  appointments = await getAppointmentByFilter_Action({worker: workerId , service: serviceId, date: new Date(req.body.date)})

        const result = slots.filter(slot => appointments.findIndex(a => (a.startTime == slot.startTime && (a.status == "Booked" || a.status == "Paid"))) == -1)
        console.log(day)
       
        return res.status(200).json(result);

        
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}


  //VALIDATORS
export const addAppointmentValidator = [
    body("worker").notEmpty().trim(),
    body("service").notEmpty().trim(),
    body("userName").notEmpty().trim(),
    body("userEmail").notEmpty().isEmail(),
    body("userPhone").isMobilePhone("en-CA"),
    body("date").notEmpty().trim(),
    body("startTime").notEmpty().trim(),
    body("endTime").notEmpty().trim(),
]

export const getSlotsValidator = [
    body("worker").notEmpty().trim(),
    body("service").notEmpty().trim(),
    body("date").notEmpty().trim(),
]

export const changeStatusValidator = [
    param("id").notEmpty(),
    body("status").notEmpty(),
]

function checkAppointmentTime(startTime: any, endTime: any) {
    const start_time = startTime.split(":");
    if( !( parseInt(start_time[1]) == 0  || parseInt(start_time[1]) == 30 )) return false;
    const end_time = endTime.split(":");
    if( !( parseInt(end_time[1]) == 0 || parseInt(end_time[1]) == 30 )  ) return false;
    const start_minute = (parseInt(start_time[0]) * 60) + parseInt(start_time[1]);
    let end_minute = (parseInt(end_time[0]) * 60) + parseInt(end_time[1]);
    if(end_minute == 0){
      end_minute = 24 * 60;
    }

    const duration = (end_minute - start_minute);
    
    if( duration > 30 ) return false;

    

    return true
}


function getNextSlot(startTime: string) {
    const start_time = startTime.split(":");
    let carry = 0;
    if( parseInt(start_time[1]) + 30  >= 60 ){
        carry = 1;
    }
    const newHour = (parseInt(start_time[0]) + carry) % 24;
    let nH = newHour.toString();
    if( newHour < 10){
        nH = "0" + newHour;
    }
    const newMinute = (parseInt(start_time[1]) + 30) % 60;
    let nM= newMinute.toString();
    if( newMinute < 10){
        nM = "0" + newMinute;
    }

    return nH + ":"+ nM;
}


