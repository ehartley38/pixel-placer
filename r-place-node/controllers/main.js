import { Router } from "express";

const mainRouter = Router()

mainRouter.get("/test", (req, res) => {
    return res.status(201).json({msg: "Hello sailor"})
})

export default mainRouter