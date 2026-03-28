require("dotenv").config()
const connectDB = require("./src/config/database")
const app = require("./src/app")
const s3Client = require("./src/config/r2");
const {connectRedis} = require("./src/config/redis");
const logger = require('./src/utils/logger');




const PORT = process.env.PORT || 3000





const startServer = async () => {
    try {
        await Promise.all([
            connectDB(),
            connectRedis()
        ]);

        console.log("Tüm servisler hazır. Uygulama başlatılıyor...");
        
        app.listen(PORT, () => {
            console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
        });
        
    } catch (err) {
        logger.error("Servis Hatası:", err);
        //console.error("Kritik Hata: Servisler başlatılamadı!", err);
        process.exit(1); 
    }
};

startServer();