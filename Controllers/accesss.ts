import express from 'express';
import {getAccess_Action} from "../DB/actions"
import { pbkdf2Sync, randomBytes } from "crypto";


//getAccess
export const login = async( req:express.Request , res:express.Response) => {
    try {
    const password = req.body.password;
    const access = await getAccess_Action();
    if( access.length == 0){
        return res.status(400).json({error: "No Key found! Contact Administration!"});
    }

    const checkHash = pbkdf2Sync(password, access[0].key as string, 10000, 64, 'sha512').toString('hex')

    if( access[0]?.hash == checkHash) {
        access[0].session = randomBytes(32).toString('hex');
        await access[0].save();
        res.cookie("auth",access[0].session);
        return res.status(200).json({status: "success"}).end();
    }else{
        return res.status(400).json({error: "Cannot Login!"})
    }

    
  } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}


export const updatePassword =  async (req: express.Request, res: express.Response) => {
    try {
        const access = await getAccess_Action();
        if( access.length == 0){
            return res.status(400).json({error: "No Key found! Contact Administration!"});
        }

        const checkHash = pbkdf2Sync(req.body.password, access[0].key as string, 10000, 64, 'sha512').toString('hex')

    if( access[0]?.hash == checkHash) {

        const newKey = randomBytes(32).toString('hex')
        const genHash = pbkdf2Sync(req.body.newPassword, newKey, 10000, 64, 'sha512').toString('hex')
        access[0].key = newKey;
        access[0].hash = genHash;
        access[0].session = randomBytes(32).toString('hex');
        await access[0].save();
        res.cookie("auth",access[0].session);
        return res.status(200).json({status: "success"}).end();
    }else{
        return res.status(400).json({error: "Cannot Update!"})
    }

        
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}


export const logout = async( req: express.Request, res: express.Response) => {
    try {
      const sessionToken  = req.cookies["auth"];
      //checking session
      if( !sessionToken){
        return res.sendStatus(403);
      }
      // if such user exists
      const access  = await getAccess_Action();
  
      if( access.length != 1){
        return res.sendStatus(400);
      }
  
      access[0].session = undefined;
      await access[0].save();
      
      res.clearCookie("auth");
  
      return res.status(200).json({status: "success"}).end();
  
    } catch (error) {
      console.log(error);
      console.log(400);
    }
  }
  