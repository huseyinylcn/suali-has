require("./utils/instrument");

const Sentry = require("@sentry/node");


const express = require("express")
const cors = require("cors")
const logger = require('./utils/logger');
const morgan = require('morgan');
const app = express()

const stream = {
  write: (message) => logger.info(message.trim()),
};


const myFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';
app.use(morgan(myFormat, { stream }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cors());







const manufacturer = require("./interfaces/http/manufacturer/manufacturer.routes")
 

app.use("/manufacturer",manufacturer)


Sentry.setupExpressErrorHandler(app);

module.exports = app