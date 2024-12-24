import express from 'express';

const router = express.Router();
import workerRouter  from '../router/worker';
import serviceRouter from '../router/service'
import appointmentRouter from "../router/appointment"
import accessRouter from "../router/access"

export default (): express.Router  => {
    appointmentRouter(router);
    workerRouter(router);
    serviceRouter(router);
    accessRouter(router);
    return router;
}