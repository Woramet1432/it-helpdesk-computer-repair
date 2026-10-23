import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export async function listAssets(req: AuthenticatedRequest, res: Response) {
  const { category, departmentId, status, search } = req.query;

  const assets = await db.getAssets({
    category: category as string,
    departmentId: departmentId ? Number(departmentId) : undefined,
    status: status as string,
    search: search as string,
  });

  return res.json({
    success: true,
    data: assets,
  });
}

export async function getAssetById(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  const asset = await db.getAssetById(id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลอุปกรณ์' });
  }
  return res.json({ success: true, data: asset });
}

export async function createAsset(req: AuthenticatedRequest, res: Response) {
  const {
    assetNumber,
    name,
    category,
    brandModel,
    serialNumber,
    departmentId,
    assignedUserId,
    status,
    purchaseDate,
    warrantyExpire,
    notes,
  } = req.body;

  if (!assetNumber || !name || !category) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกรหัสทรัพย์สิน ชื่ออุปกรณ์ และหมวดหมู่',
    });
  }

  // Check unique assetNumber
  const existing = await db.getAssets({ search: assetNumber });
  if (existing.some((a) => a.assetNumber.toLowerCase() === assetNumber.trim().toLowerCase())) {
    return res.status(409).json({
      success: false,
      message: 'รหัสทรัพย์สินนี้มีอยู่ในระบบแล้ว',
    });
  }

  const asset = await db.createAsset({
    assetNumber: assetNumber.trim().toUpperCase(),
    name: name.trim(),
    category,
    brandModel: brandModel?.trim(),
    serialNumber: serialNumber?.trim(),
    departmentId: departmentId ? Number(departmentId) : null,
    assignedUserId: assignedUserId ? Number(assignedUserId) : null,
    status: status || 'active',
    purchaseDate,
    warrantyExpire,
    notes: notes?.trim(),
  });

  await db.addAuditLog({
    userId: req.user?.userId,
    action: 'ASSET_CREATED',
    targetType: 'ASSET',
    targetId: String(asset.id),
    details: { assetNumber: asset.assetNumber, name: asset.name },
  });

  return res.status(201).json({
    success: true,
    message: 'เพิ่มอุปกรณ์ใหม่เรียบร้อยแล้ว',
    data: asset,
  });
}

export async function updateAsset(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  const asset = await db.getAssetById(id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'ไม่พบอุปกรณ์' });
  }

  const updated = await db.updateAsset(id, req.body);

  await db.addAuditLog({
    userId: req.user?.userId,
    action: 'ASSET_UPDATED',
    targetType: 'ASSET',
    targetId: String(id),
    details: { assetNumber: asset.assetNumber },
  });

  return res.json({
    success: true,
    message: 'อัปเดตข้อมูลอุปกรณ์เรียบร้อยแล้ว',
    data: updated,
  });
}

export async function deleteAsset(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  const asset = await db.getAssetById(id);
  if (!asset) {
    return res.status(404).json({ success: false, message: 'ไม่พบอุปกรณ์' });
  }

  await db.deleteAsset(id);

  await db.addAuditLog({
    userId: req.user?.userId,
    action: 'ASSET_DELETED',
    targetType: 'ASSET',
    targetId: String(id),
    details: { assetNumber: asset.assetNumber },
  });

  return res.json({
    success: true,
    message: 'ลบอุปกรณ์เรียบร้อยแล้ว',
  });
}
