// routes/transactions.js (optional)
import express from 'express';
const router = express.Router();
import transactionController from '../controllers/transact.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

router.get('/', verifyJWT, transactionController.getAllTransactions);
router.get('/summary', verifyJWT, transactionController.getTransactionSummary);
router.get('/:id', verifyJWT, transactionController.getTransactionById);
router.post('/', verifyJWT, transactionController.createTransaction);
router.put('/:id', verifyJWT, transactionController.updateTransaction);
router.delete('/:id', verifyJWT, transactionController.deleteTransaction);

export default router
