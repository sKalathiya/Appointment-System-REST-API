import express from "express";
import { getAccess_Action } from "./DB/actions";

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        // getting session from cookie
        const sessionToken = req.cookies["auth"];
        //if no session available
        if( !sessionToken){
            return res.sendStatus(401);
        }

        //finding user
        const access = await getAccess_Action();

        if( access.length != 1 || (access[0].session != sessionToken)){
            return res.sendStatus(400);
        }

        return next();
    
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}
