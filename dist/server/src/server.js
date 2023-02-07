"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cors = require("cors");
const errorHandler = require("errorhandler");
const express = require("express");
const expressValidator = require("express-validator");
const logger = require("morgan");
const routes_1 = require("./controllers/routes");
const background_1 = require("./controllers/background");
/**
 * Create Express server.
 */
const app = express();
/**
 * Express configuration.
 */
const DEFAULT_PORT = 3000;
app.set("port", process.env.PORT || DEFAULT_PORT);
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cors());
/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());
/**
 * Initialize routing.
 */
routes_1.initRoutes(app);
// app.use(router);
app.set("appService", background_1.getAppService());
/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
    console.log("  App is running at http://localhost:%d in %s mode", app.get("port"), app.get("env"));
    console.log("  Press CTRL-C to stop\n");
});
module.exports = app;
//# sourceMappingURL=server.js.map