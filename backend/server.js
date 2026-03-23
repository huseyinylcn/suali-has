require("dotenv").config()
const connectDB = require("./src/config/database")
const app = require("./src/app")
const s3Client = require("./src/config/r2");



const PORT = process.env.PORT || 3000


connectDB().then(result => {
    console.log("Bağlantı Başarılı :)", true)
    app.listen(PORT, () => {
        console.log(`http://localhost:${PORT}`)
    })

}).catch(err => {

    console.log("Hata || Veri Tabanına Bağlanılamadı :(", err)
})