const express = require("express")
const cors = require("cors")
const path = require("path")
const app = express()


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }))




app.use(cors());







const manufacturer = require("./interfaces/http/test/manufacturer.routes")
 




app.use("/manufacturer",manufacturer)




module.exports = app