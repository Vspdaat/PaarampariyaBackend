// const express = require('express');
// const {
//     createCategory,
//     updateCategory,
//     deleteCategory,
//     getCategory
// } = require('../controllers/categoryController');

// const { isAuthenticatedUser } = require('../middlewares/auth'); 

// const router = express.Router();

// // Route to create a category
// router.post('/category', isAuthenticatedUser, createCategory);

// // Route to update a category
// router.put('/category/:id', isAuthenticatedUser, updateCategory);

// // Route to delete a category
// router.delete('/category/:id', isAuthenticatedUser, deleteCategory);

// // Route to get a single category
// router.get('/category/:id', getCategory);

// module.exports = router;

const express = require('express');
const { 
    createCategory, 
    getCategories, 
    getCategoryById, 
    updateCategory, 
    deleteCategory 
} = require('../controllers/categoryController');

const router = express.Router();

// Create a category
router.post('/category', createCategory);

// Get all categories
router.get('/categories', getCategories);

// Get a single category by ID
router.get('/category/:id', getCategoryById);

// Update a category
router.put('/category/:id', updateCategory);

// Delete a category
router.delete('/category/:id', deleteCategory);

module.exports = router;
