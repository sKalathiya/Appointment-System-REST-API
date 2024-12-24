import mongoose, { Document, Schema } from 'mongoose';

const serviceSchema= new mongoose.Schema({
    "name": {type: String, require: true},
    "price": {type: Number, require: true},
    "description": {type: String, require: true}
})

export interface Service {
    "_id": string
    "name": string,
    "price": Number,
    "description": string
}

export interface Worker {
    "_id": string
    "firstName": string,
    "lastName": string,
    "phone": Number,
    "email": string,
    "schedule": Shift[],
    "services": Service[]
}

export interface Shift {
    "hours": Number,
    "startTime": string,
    "endTime": string
}

export interface Appointment {
    "worker":Worker,
    "service": Service,
    "userName": string,
    "userEmail": string,
    "userPhone": Number,
    "date": String,
    "startTime": string,
    "endTime": string,
    "status": status,
    "paid": Number,
    "tip": Number
}

export interface Slot {
    "startTime": string,
    "endTime": string,
    "worker": string,
    "service": string
}

export enum status {
    "Cancelled",
    "Paid",
    "Booked"
}

const workerSchema= new mongoose.Schema({
    "firstName": {type: String, require: true},
    "lastName": {type: String, require: true},
    "email": {type: String, require: true},
    "phone": {type: Number, require: true},
    "schedule": [
         {
            "hours" : {type: Number},
            "startTime" : {type: String},
            "endTime": {type: String}
        }
    ],
    "services" : [{ type: Schema.Types.ObjectId , ref: 'Service' }]
})

const appointmentSchema= new mongoose.Schema({
    "worker":{ type: Schema.Types.ObjectId , ref: 'Worker' },
    "service": {type: Schema.Types.ObjectId, ref: "Service"},
    "userName": {type: String, require: true},
    "userEmail": {type: String, require: true},
    "userPhone": {type: Number, require: true},
    "date": {type: Date, require: true},
    "startTime": {type: String, require: true},
    "endTime": {type: String, require: true},
    "paid":{type: Number, require: false},
    "tip":{type: Number, require: false},
    "status": {type: String, enum:['Cancelled', 'Paid', 'Booked'], require: true},
})


const accessSchema= new mongoose.Schema({
    "key": {type: String, require: true},
    "hash": {type:String,require: true},
    "session": {type:String, require: false},
})


export const serviceModel = mongoose.model("Service", serviceSchema);
export const workerModel = mongoose.model("Worker", workerSchema);
export const accessModel = mongoose.model("Access", accessSchema);
export const appointmentModel = mongoose.model("Appointment", appointmentSchema);
