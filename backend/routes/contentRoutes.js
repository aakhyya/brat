const express = require("express");
const router = express.Router();

const {
    createContent,getAllContent,getContentById,updateContent,deleteContent,searchContent,searchByMood,getDimensions,
    getUserLibrary,rateContent,toggleFavorite,deleteInteraction,getRecommendations,getCrossMediaRecommendations,
    searchMovies,enrichMovie,searchSongs,enrichSong,searchBooks,enrichBook
} = require("../controllers/contentController");
const { protect } = require("../middlewares/auth");

router.get("/", getAllContent);
router.get("/search", searchContent); 
router.get("/library",protect, getUserLibrary);
router.get("/recommendations", protect, getRecommendations);
// Mood-based search
router.post('/mood-search', protect, searchByMood);
router.get('/dimensions', getDimensions);
router.get("/:contentId/cross-media", protect, getCrossMediaRecommendations);
router.get("/:id", getContentById);


// Protected routes
router.post("/:contentId/rate", protect, rateContent);
router.post("/:contentId/favorite", protect, toggleFavorite);
router.delete("/:contentId/interaction", protect, deleteInteraction);
router.post("/", protect, createContent);
router.put("/:id", protect, updateContent);
router.delete("/:id", protect, deleteContent);

// Search routes (public - no auth required)
router.get('/enrich/movie/search', searchMovies);
router.get('/enrich/song/search', searchSongs);
router.get('/enrich/book/search', searchBooks);

// Enrich & save routes
router.post('/enrich/movie/:tmdbId', protect, enrichMovie);
router.post('/enrich/song/:itunesId', protect, enrichSong);
router.post('/enrich/book/:googleBooksId', protect, enrichBook);


module.exports = router;

