const express = require('express');
const {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory
} = require('../controllers/categoryController');

const { isAuthenticatedUser } = require('../middlewares/auth'); 

const router = express.Router();

// Route to create a category
router.post('/category', isAuthenticatedUser, createCategory);

// Route to update a category
router.put('/category/:id', isAuthenticatedUser, updateCategory);

// Route to delete a category
router.delete('/category/:id', isAuthenticatedUser, deleteCategory);

// Route to get a single category
router.get('/category/:id', getCategory);

module.exports = router;
