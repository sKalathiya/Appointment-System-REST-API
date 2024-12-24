import express from 'express';
import { addService, addServiceValidator, deleteService, findServiceValidator, getService, getServices, updateService, updateServiceValidator } from '../Controllers/service';
import {isAuthenticated} from "../middleware";

export default (router: express.Router) => {
    router.get("/service", getServices);
    router.get("/service/:id", isAuthenticated, findServiceValidator, getService);
    router.post("/service/add",isAuthenticated,  addServiceValidator , addService);
    router.delete("/service/:id",isAuthenticated, findServiceValidator, deleteService);
    router.post("/service/update/:id",isAuthenticated, updateServiceValidator, updateService);
}