import express from 'express';
import { addWorker_Action, deleteAppointmentByWorker_Action, deleteWorker_Action, getAppointmentByFilter_Action, getAppointments_Action, getWorkerByEmail_Action, getWorkerById_Action, getWorkers_Action, updateWorker_Action } from '../DB/actions';
import {body , validationResult, param} from 'express-validator'
import { Service, status, workerModel } from '../DB/models';
import { getStringFromDate } from './service';



//Get all users
export const getWorkers = async( req: express.Request, res: express.Response) => {
    try {
     
      //calling _Action to get users
      const users = await getWorkers_Action();
  
      return res.status(200).json(users).end();
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }


export const getWorkerById = async (req: express.Request, res: express.Response) => {
try {
  const { id} = req.params
  const worker = await getWorkerById_Action(id);
  if(worker) {
    return res.status(200).json(worker);
  }else{
    return res.status(400).json({error: "Not able to find the worker!"});
  }


} catch (error) {
  console.log(error);
  return res.sendStatus(400);
}

}



  export const addWorker = async( req: express.Request, res: express.Response) => {
    try {
        const input_errors = validationResult(req);

        if (!input_errors.isEmpty()) {
          return res.status(400).json({ error: input_errors.array() });
        }

        const sub_worker = await getWorkerByEmail_Action(req.body.email);

        if( sub_worker ){
            return res.status(400).json ({ error: "Email already exists!"});
        }
        if( !validateSchedule(req.body.schedule)){
          return res.status(400).json({error: "Schedule is not correct!"})
        }
        const new_worker = await addWorker_Action(req.body);

        if( new_worker ){
            return res.status(200).json(new_worker);
        }else{
            return res.status(400).json({error: "something went wrong!"})
        }
    
    
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
  }


  export const updateWorkerDetails = async( req: express.Request, res: express.Response) => {
    try {
        const input_errors = validationResult(req);
        const { id} = req.params;

        if (!input_errors.isEmpty()) {
          return res.status(400).json({ error: input_errors.array() });
        }

        const sub_worker = await getWorkerByEmail_Action(req.body.email);

        if( sub_worker && id != sub_worker._id.toString() ){
            return res.status(400).json ({ error: "Email already exists!"});
        }
       
        const tmp_worker = await getWorkerById_Action(id);
        tmp_worker.email = req.body.email;
        tmp_worker.firstName = req.body.firstName;
        tmp_worker.lastName = req.body.lastName;
        tmp_worker.phone = req.body.phone;

        const new_Services = req.body.services as string[]
        let deleted_Services = tmp_worker.services.filter(s => !new_Services.includes(s._id.toString()));
        deleted_Services.forEach(async service => {
          let appointments = await getAppointmentByFilter_Action({worker: tmp_worker._id, service: service._id, date: {$gte:getStringFromDate(new Date())} })
          appointments.forEach(async app => {
            app.status = "Cancelled";
            await app.save();
          })
        })
       
        tmp_worker.services = req.body.services;

        await tmp_worker.save();

        if( tmp_worker ){
            return res.status(200).json(tmp_worker);
        }else{
            return res.status(400).json({error: "something went wrong!"})
        }
    
    
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
  }

export const updateSchedule = async (req: express.Request , res: express.Response) => {
  try {
    const { id} = req.params;
    if( !validateSchedule(req.body)){
      return res.status(400).json({error: "Schedule is not correct!"})
    }
    const tmp_worker = await getWorkerById_Action(id);
    tmp_worker.schedule = req.body;
    await tmp_worker.save();

    if( tmp_worker ){
         
      return res.status(200).json({status: "success"});
    }else{
        
      return res.status(400).json({error: "something went wrong!"})
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}


export const deleteWorker = async ( req: express.Request , res: express.Response) => {
    try {
      const { id} = req.params;
      const worker = await deleteWorker_Action(id);
      try {
        let appointments = await getAppointmentByFilter_Action({worker: worker._id, date: {$gte:getStringFromDate(new Date())}})
        appointments.forEach(async app => {
          app.status = "Cancelled";
          await app.save();
        })
      } catch (error) {
        await worker.save();
        return res.status(400).json({error: "Not able to delete!"});
      }


  
      if( worker ){
          return res.status(200).json(worker).end();
      }else{
          return res.status(400).json({error: "Not able to delete!"});
      }
  
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }


  


  
  



//VALIDATORS
export const addWorkerValidator = [
    body("firstName").notEmpty().trim(),
    body("lastName").notEmpty().trim(),
    body("email").isEmail(),
    body("phone").isMobilePhone("en-CA"),
    body("schedule").notEmpty(),
    body("services").notEmpty()
]


export const updateWorkerDetailsValidator = [
  body("firstName").notEmpty().trim(),
  body("lastName").notEmpty().trim(),
  body("email").isEmail(),
  body("phone").isMobilePhone("en-CA"),
  param("id").notEmpty()
]
  
export const deleteWorkerValidator = [
    param("id").notEmpty()
]


const validateSchedule = (schedule: Shift[]) => {
  if (schedule.length != 7) return false;
  const tmp = schedule.filter(shift => {
    const start_time = shift.startTime.split(":");
    const end_time = shift.endTime.split(":");
    const start_minute = (parseInt(start_time[0]) * 60) + parseInt(start_time[1]);
    let end_minute = (parseInt(end_time[0]) * 60) + parseInt(end_time[1]);
    if(end_minute == 0){
      end_minute = 24 * 60;
    }
    const duration = (end_minute - start_minute) / 60;

    if( parseInt(shift.hours) > duration) return true;
    return false;
  }).length;
  if( tmp > 0) return false;
  return true;
}


export interface Worker {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  schedule: Shift[];
  services: [];
}

export interface Shift {
  hours: string;
  startTime: string;
  endTime: string;
}
