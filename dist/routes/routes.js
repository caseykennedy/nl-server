"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
// import { signup, login, isAuth } from "../controllers/auth.js";
const router = express.Router();
router.get("/test", (req, res, next) => {
    res.json({ message: "here is your public resource" });
});
router.get("/public", (req, res, next) => {
    res.status(200).json({ message: "here is your public resource" });
});
// will match any other path
router.use("/", (req, res, next) => {
    res.status(404).json({ error: "page not found" });
});
exports.default = router;
//# sourceMappingURL=routes.js.map