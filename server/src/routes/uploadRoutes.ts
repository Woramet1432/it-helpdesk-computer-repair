import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.ts';

const router = Router();
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

// Authenticated or safe token check for previewing attachments
router.get('/:filename', authenticate, (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'ไม่พบไฟล์แนบ' });
  }

  return res.sendFile(filePath);
});

export default router;
