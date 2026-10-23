import { Router } from 'express';
import {
  listTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  assignTechnician,
  updatePriority,
  addComment,
  submitFeedback,
  createPublicTicketHandler,
  trackTicketHandler,
  addPublicCommentHandler,
  submitPublicFeedbackHandler,
  listPublicTickets,
  getPublicTicketDetail,
  addPublicCommentDirectHandler,
  submitPublicFeedbackDirectHandler,
} from '../controllers/ticketController.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';
import { uploadAttachment } from '../middleware/upload.ts';

const router = Router();

// --- Public Endpoints (No authentication required) ---
router.get('/public', listPublicTickets);
router.get('/public/:idOrNumber', getPublicTicketDetail);
router.post('/public/:idOrNumber/comments', addPublicCommentDirectHandler);
router.post('/public/:idOrNumber/feedback', submitPublicFeedbackDirectHandler);
router.post('/public', uploadAttachment.array('attachments', 5) as any, createPublicTicketHandler);
router.post('/track', trackTicketHandler);
router.post('/track/comments', addPublicCommentHandler);
router.post('/track/feedback', submitPublicFeedbackHandler);

// --- Protected Endpoints (Requires Staff or Authenticated User) ---
router.use(requireAuth);

router.get('/', listTickets);
router.post('/', uploadAttachment.array('attachments', 5) as any, createTicket);
router.get('/:id', getTicketById);
router.patch('/:id/status', updateTicketStatus);
router.patch('/:id/assign', requireRole(['admin']), assignTechnician);
router.patch('/:id/priority', requireRole(['admin', 'technician']), updatePriority);
router.post('/:id/comments', addComment);
router.post('/:id/feedback', submitFeedback);

export default router;
