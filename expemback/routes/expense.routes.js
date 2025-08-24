import express from 'express';
import expenseController from '../controllers/expense.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js'; // Assuming you have this middleware

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// GET /api/expenses - Get all expenses with filters and pagination
router.get('/', expenseController.getAllExpenses);

// GET /api/expenses/summary - Get expense summary
router.get('/summary', expenseController.getExpenseSummary);

// GET /api/expenses/categories - Get available categories
router.get('/categories', expenseController.getCategories);

// GET /api/expenses/category/:category - Get expenses by category
router.get('/category/:category', expenseController.getExpensesByCategory);

// POST /api/expenses - Create new expense
router.post('/', expenseController.createExpense);

// PUT /api/expenses/:expenseId - Update expense
router.put('/:expenseId', expenseController.updateExpense);

// DELETE /api/expenses/:expenseId - Delete expense
router.delete('/:expenseId', expenseController.deleteExpense);
export default router;