import {accessModel, appointmentModel, Service, serviceModel, Worker, workerModel} from './models';


//WORKER
export const getWorkers_Action = () => workerModel.find().populate<{services: Service[]}>("services");
export const getWorkerByEmail_Action = (email: string)  => workerModel.findOne({email});
export const getWorkerById_Action = (id: string) => workerModel.findById(id).populate<{services: Service[]}>("services");;
export const addWorker_Action = (values: Record<string, any>) => new workerModel(values).save().then((worker) => worker.toObject());
export const deleteWorker_Action = (id: string) => workerModel.findOneAndDelete({_id: id});
export const updateWorker_Action  = (id: string, values: Record<string,any>) => workerModel.findByIdAndUpdate(id,values);
export const getWorkerFromService_Action = (id: string) => workerModel.find({services: id})


//APPOINTMENT
export const getAppointments_Action = () => appointmentModel.find().populate<{worker: Worker, service: Service }>("worker service");
export const addAppointment_Action = (values: Record<string, any>) => new appointmentModel(values).save().then((appointment) => appointment.toObject());
export const checkAppointmentExist_Action = (date: string, startTime: string, endTime: string, worker: string) => appointmentModel.findOne({date, startTime, endTime, worker});
export const getAppointmentByFilter_Action = (values: Record<string, any>) => appointmentModel.find(values).populate<{worker: Worker, service: Service }>("worker service");
export const updateAppointmentStatus_Action  = (id: string, values: Record<string,any>) => appointmentModel.findByIdAndUpdate(id,values);
export const deleteAppointmentByWorker_Action = ( id: string ) => appointmentModel.deleteMany({worker: id})
export const deleteAppointmentByWorkerAndService_Action = ( id: string, service:string ) => appointmentModel.deleteMany({worker: id, service})




//Services
export const getServices_Action = () => serviceModel.find();
export const getServiceById_Action = (id: string) => serviceModel.findById(id);
export const getServiceByName_Action = (name: string) => serviceModel.findOne({name});
export const addService_Action = (values: Record<string, any>) => new serviceModel(values).save().then((service) => service.toObject());
export const deleteService_Action = (id: string) => serviceModel.findOneAndDelete({_id: id});
export const updateService_Action  = (id: string, values: Record<string,any>) => serviceModel.findByIdAndUpdate(id,values);



export const getAccess_Action = () => accessModel.find();
export const addAccess_Action = (values: Record<string, any>) => new accessModel(values).save().then((access) => access.toObject());
