import express from 'express';
import { login, logout, updatePassword } from '../Controllers/accesss';



export default (router: express.Router) => {
    router.post("/login", login),
    router.post("/logout", logout)
    router.post("/updatePassword", updatePassword);
}