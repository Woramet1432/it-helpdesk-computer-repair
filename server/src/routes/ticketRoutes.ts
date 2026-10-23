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
} from '../controllers/ticketController.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';
import { uploadAttachment } from '../middleware/upload.ts';

const router = Router();

router.use(requireAuth);

router.get('/', listTickets);
router.post('/', uploadAttachment.array('attachments', 5), createTicket);
router.get('/:id', getTicketById);
router.patch('/:id/status', updateTicketStatus);
router.patch('/:id/assign', requireRole(['admin']), assignTechnician);
router.patch('/:id/priority', requireRole(['admin', 'technician']), updatePriority);
router.post('/:id/comments', addComment);
router.post('/:id/feedback', submitFeedback);

export default router;
