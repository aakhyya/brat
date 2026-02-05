const express = require("express");
const router = express.Router();

const {createContent,getAllContent,getContentById,updateContent,deleteContent,searchContent} = require("../controllers/contentController");
const { protect } = require("../middlewares/auth");

// Public routes
router.get("/", getAllContent);
router.get("/search", searchContent); 
router.get("/:id", getContentById);

// Protected routes
router.post("/", protect, createContent);
router.put("/:id", protect, updateContent);
router.delete("/:id", protect, deleteContent);

module.exports = router;

