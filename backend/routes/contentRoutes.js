const express = require("express");
const router = express.Router();

const {
    createContent,getAllContent,getContentById,updateContent,deleteContent,searchContent,
    searchMovies,enrichMovie,searchSongs,enrichSong,searchBooks,enrichBook
} = require("../controllers/contentController");
const { protect } = require("../middlewares/auth");

// Public routes
router.get("/", getAllContent);
router.get("/search", searchContent); 
router.get("/:id", getContentById);

// Protected routes
router.post("/", protect, createContent);
router.put("/:id", protect, updateContent);
router.delete("/:id", protect, deleteContent);

// Search routes
router.get('/enrich/movie/search', protect, searchMovies);
router.get('/enrich/song/search', protect, searchSongs);
router.get('/enrich/book/search', protect, searchBooks);

// Enrich & save routes
router.post('/enrich/movie/:tmdbId', protect, enrichMovie);
router.post('/enrich/song/:itunesId', protect, enrichSong);
router.post('/enrich/book/:googleBooksId', protect, enrichBook);

module.exports = router;

