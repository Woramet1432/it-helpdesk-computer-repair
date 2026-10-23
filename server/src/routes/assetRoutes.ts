import { Router } from 'express';
import {
  listAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../controllers/assetController.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

const router = Router();

router.use(requireAuth);

router.get('/', listAssets);
router.get('/:id', getAssetById);
router.post('/', requireRole(['admin', 'technician']), createAsset);
router.put('/:id', requireRole(['admin', 'technician']), updateAsset);
router.delete('/:id', requireRole(['admin']), deleteAsset);

export default router;
