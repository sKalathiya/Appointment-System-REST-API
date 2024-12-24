import express from 'express';
import {addService_Action, deleteAppointmentByWorkerAndService_Action, deleteService_Action, getAppointmentByFilter_Action, getServiceById_Action, getServiceByName_Action, getServices_Action, getWorkerFromService_Action, updateService_Action} from '../DB/actions'
import {body , validationResult, param} from 'express-validator'
import service from '../router/service';
import { ObjectId } from 'mongoose';



//Get all Services
export const getServices = async( req: express.Request, res: express.Response) => {
    try {
     
      //calling _Action to get services
      const services = await getServices_Action();
  
      return res.status(200).json(services).end();
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }

  export const getService = async( req: express.Request, res: express.Response) => {
    try {
      const { id} = req.params;
      //calling _Action to get services
      const service = await getServiceById_Action(id);
  
      if( service ){
        return res.status(200).json(service).end();
    }else{
        return res.status(400).json({error: "Not able to find!"});
    }

    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }



  export const addService= async( req: express.Request, res: express.Response) => {
    try {
        const input_errors = validationResult(req);

        if (!input_errors.isEmpty()) {
          return res.status(400).json({ error: input_errors.array() });
        }

        const sub_service = await getServiceByName_Action(req.body.name);

        if( sub_service ){
            return res.status(400).json ({ error: "Name already exists!"});
        }

        const new_service = await addService_Action(req.body);

        if( new_service ){
            return res.status(200).json(new_service);
        }else{
            return res.status(400).json({error: "something went wrong!"})
        }
    
    
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
  }



export const deleteService = async ( req: express.Request , res: express.Response) => {
    try {
      const { id} = req.params;
      const service = await getServiceById_Action(id);

      let workers = await getWorkerFromService_Action(id);
       workers.forEach(async worker =>  {
        let index = worker.services.findIndex((s) => s == service._id);
        worker.services.splice(index, 1);
        await worker.save()
        let appointments = await getAppointmentByFilter_Action({worker: worker._id, service: service._id, date: {$gte:getStringFromDate(new Date())}})
        appointments.forEach(async app => {
          app.status = "Cancelled";
          await app.save();
        })
       
      })
  
      if( service ){
          return res.status(200).json(service).end();
      }else{
          return res.status(400).json({error: "Not able to delete!"});
      }
     
  
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }


export const updateService = async( req: express.Request, res: express.Response) => {
  try {
    
    const {id} = req.params;
    const service = await updateService_Action(id, req.body);
    if(service){
      return res.status(200).json(service).end();
    }else{
      return res.status(400).json({error: "Cannot Update!"})
    }

  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}
  
export function getStringFromDate(date: Date) {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");

  return year + "-" + month + "-" + day;
}


//VALIDATORS
export const addServiceValidator = [
    body("name").notEmpty().trim(),
    body("price").notEmpty().toInt(),
    body("description").notEmpty().trim(),
]
  
export const findServiceValidator = [
    param("id").notEmpty()
]

export const updateServiceValidator = [
  param("id").notEmpty(), 
  body("name").notEmpty(),
  body("price").notEmpty().toInt(),
  body("description").notEmpty(),
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

