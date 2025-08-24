import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods:"GET,POST,PUT,DELETE,PATCH,HEAD",
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import expenseRouter from './routes/expense.routes.js'
import userRouter from './routes/user.routes.js'
import transactRouter from './routes/transact.routes.js'
import investmentRouter from './routes/investment.routes.js'
import earningRouter from './routes/earning.routes.js'

//routes declaration

app.use("/api/v1/users", userRouter)
app.use("/api/v1/users/transact", transactRouter)
app.use("/api/v1/users/investments", investmentRouter)
app.use("/api/v1/users/expense", expenseRouter)
app.use("/api/v1/users/earnings", earningRouter)



// http://localhost:8000/api/v1/users/register

export { app }