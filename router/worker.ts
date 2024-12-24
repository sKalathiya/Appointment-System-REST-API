import express from 'express';
import { addWorker, addWorkerValidator, deleteWorker, deleteWorkerValidator, getWorkerById, getWorkers, updateSchedule, updateWorkerDetails, updateWorkerDetailsValidator } from '../Controllers/worker';
import {isAuthenticated} from "../middleware";

export default (router: express.Router) => {
    router.get("/worker", getWorkers);
    router.get("/worker/:id", isAuthenticated, getWorkerById);
    router.post("/worker/add", isAuthenticated, addWorkerValidator , addWorker);
    router.delete("/worker/:id", isAuthenticated , deleteWorkerValidator, deleteWorker);
    router.post("/worker/update/:id", isAuthenticated , updateWorkerDetailsValidator, updateWorkerDetails);
    router.post("/worker/update/schedule/:id",isAuthenticated,  updateSchedule);
}