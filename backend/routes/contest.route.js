import express from "express";
import { contestList, handlePastContests, handleUpdateLink, handleBookmark, handleRemoveBookmark } from "../controllers/contest.controller.js";

const router = express.Router();

router.get("/list", contestList);
router.get("/past", handlePastContests);
router.post("/updateLink", handleUpdateLink);
router.post("/bookmark", handleBookmark);
router.post("/removeBookmark", handleRemoveBookmark)

export default router;