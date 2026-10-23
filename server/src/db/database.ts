import pg from 'pg';
import fs from 'fs';
import path from 'path';
import {
  Department,
  User,
  SafeUser,
  Asset,
  Ticket,
  TicketComment,
  TicketAttachment,
  TicketStatusHistory,
  TicketFeedback,
  AuditLog,
  DashboardMetrics,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../types/index.ts';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_USERS,
  INITIAL_ASSETS,
  INITIAL_TICKETS,
  INITIAL_COMMENTS,
  INITIAL_STATUS_HISTORY,
  INITIAL_AUDIT_LOGS,
} from './seedData.ts';

const { Pool } = pg;

export class DatabaseService {
  private pool: pg.Pool | null = null;
  private isPostgresConnected = false;

  // In-memory data store for fallback or local preview
  private departments: Department[] = JSON.parse(JSON.stringify(INITIAL_DEPARTMENTS));
  private users: User[] = JSON.parse(JSON.stringify(INITIAL_USERS));
  private assets: Asset[] = JSON.parse(JSON.stringify(INITIAL_ASSETS));
  private tickets: Ticket[] = JSON.parse(JSON.stringify(INITIAL_TICKETS));
  private comments: TicketComment[] = JSON.parse(JSON.stringify(INITIAL_COMMENTS));
  private attachments: TicketAttachment[] = [];
  private statusHistory: TicketStatusHistory[] = JSON.parse(JSON.stringify(INITIAL_STATUS_HISTORY));
  private feedbacks: TicketFeedback[] = [
    {
      id: 1,
      ticketId: 4,
      userId: 4,
      rating: 5,
      comment: 'ช่างนรินทร์ให้บริการรวดเร็วมาก แนะนำวิธีการตั้งค่า OTP ชัดเจน ขอบคุณมากค่ะ',
      createdAt: '2026-10-16T14:30:00.000Z',
    },
    {
      id: 2,
      ticketId: 5,
      userId: 5,
      rating: 5,
      comment: 'ติดตั้งเร็วมาก ไม่รบกวนเวลาทำงานเลย เยี่ยมครับ',
      createdAt: '2026-10-12T09:00:00.000Z',
    },
  ];
  private auditLogs: AuditLog[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));

  private ticketCounter = 10;
  private commentCounter = 10;
  private attachmentCounter = 1;
  private historyCounter = 10;
  private assetCounter = 10;
  private userCounter = 10;
  private auditCounter = 10;

  constructor() {
    this.initPostgresIfAvailable();
  }

  private async initPostgresIfAvailable() {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      try {
        this.pool = new Pool({
          connectionString,
          ssl: process.env.NODE_ENV === 'production' && !connectionString.includes('localhost')
            ? { rejectUnauthorized: false }
            : false,
          connectionTimeoutMillis: 3000,
        });

        const client = await this.pool.connect();
        this.isPostgresConnected = true;
        console.log('✅ Connected successfully to PostgreSQL database:', connectionString.replace(/:[^:@]+@/, ':****@'));

        // Check if tables exist, if not auto-apply schema
        try {
          const checkRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'tickets'
          `);

          if (checkRes.rowCount === 0) {
            console.log('📦 Initializing PostgreSQL schema tables...');
            const schemaPath = path.resolve(process.cwd(), 'server/migrations/001_initial_schema.sql');
            if (fs.existsSync(schemaPath)) {
              const schemaSql = fs.readFileSync(schemaPath, 'utf8');
              await client.query(schemaSql);
              console.log('✅ PostgreSQL schema created successfully');
            }

            // Check if users seeded
            const seedPath = path.resolve(process.cwd(), 'server/seeds/001_seed_data.sql');
            if (fs.existsSync(seedPath)) {
              const seedSql = fs.readFileSync(seedPath, 'utf8');
              await client.query(seedSql);
              console.log('✅ Initial demo data seeded successfully into PostgreSQL');
            }
          }
        } catch (err: any) {
          console.warn('⚠️ Auto-migration check:', err.message);
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.warn('⚠️ PostgreSQL connection failed, operating with in-memory database fallback:', err.message);
        this.pool = null;
        this.isPostgresConnected = false;
      }
    } else {
      console.log('ℹ️ Running with embedded in-memory database (configure DATABASE_URL for PostgreSQL)');
    }
  }

  public isUsingPostgres(): boolean {
    return this.isPostgresConnected;
  }

  // --- Departments ---
  public async getDepartments(): Promise<Department[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT id, name, code, description FROM departments ORDER BY id ASC');
        return res.rows;
      } catch (e) {
        console.warn('Postgres getDepartments fallback to memory', e);
      }
    }
    return [...this.departments];
  }

  public async getDepartmentById(id: number): Promise<Department | null> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT id, name, code, description FROM departments WHERE id = $1', [id]);
        return res.rows[0] || null;
      } catch (e) {
        console.warn('Postgres getDepartmentById fallback', e);
      }
    }
    return this.departments.find((d) => d.id === id) || null;
  }

  // --- Users ---
  public async getUsers(): Promise<SafeUser[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(`
          SELECT u.id, u.username, u.email, u.full_name as "fullName", u.role, 
                 u.department_id as "departmentId", d.name as "departmentName", 
                 u.phone, u.location, u.is_active as "isActive", u.created_at as "createdAt"
          FROM users u
          LEFT JOIN departments d ON u.department_id = d.id
          ORDER BY u.id ASC
        `);
        return res.rows;
      } catch (e) {
        console.warn('Postgres getUsers fallback', e);
      }
    }
    return this.users.map((u) => {
      const dept = this.departments.find((d) => d.id === u.departmentId);
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        departmentId: u.departmentId,
        departmentName: dept?.name,
        phone: u.phone,
        location: u.location,
        isActive: u.isActive,
        createdAt: u.createdAt,
      };
    });
  }

  public async getUserById(id: number): Promise<User | null> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(`
          SELECT u.id, u.username, u.email, u.password_hash as "passwordHash", u.full_name as "fullName", 
                 u.role, u.department_id as "departmentId", d.name as "departmentName", 
                 u.phone, u.location, u.is_active as "isActive", u.created_at as "createdAt"
          FROM users u
          LEFT JOIN departments d ON u.department_id = d.id
          WHERE u.id = $1
        `, [id]);
        return res.rows[0] || null;
      } catch (e) {
        console.warn('Postgres getUserById fallback', e);
      }
    }
    const u = this.users.find((user) => user.id === id);
    if (!u) return null;
    const dept = this.departments.find((d) => d.id === u.departmentId);
    return { ...u, departmentName: dept?.name };
  }

  public async getUserByUsername(username: string): Promise<User | null> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(`
          SELECT u.id, u.username, u.email, u.password_hash as "passwordHash", u.full_name as "fullName", 
                 u.role, u.department_id as "departmentId", d.name as "departmentName", 
                 u.phone, u.location, u.is_active as "isActive", u.created_at as "createdAt"
          FROM users u
          LEFT JOIN departments d ON u.department_id = d.id
          WHERE LOWER(u.username) = LOWER($1)
        `, [username.trim()]);
        return res.rows[0] || null;
      } catch (e) {
        console.warn('Postgres getUserByUsername fallback', e);
      }
    }
    const u = this.users.find((user) => user.username.toLowerCase() === username.toLowerCase().trim());
    if (!u) return null;
    const dept = this.departments.find((d) => d.id === u.departmentId);
    return { ...u, departmentName: dept?.name };
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(`
          SELECT u.id, u.username, u.email, u.password_hash as "passwordHash", u.full_name as "fullName", 
                 u.role, u.department_id as "departmentId", d.name as "departmentName", 
                 u.phone, u.location, u.is_active as "isActive", u.created_at as "createdAt"
          FROM users u
          LEFT JOIN departments d ON u.department_id = d.id
          WHERE LOWER(u.email) = LOWER($1)
        `, [email.trim()]);
        return res.rows[0] || null;
      } catch (e) {
        console.warn('Postgres getUserByEmail fallback', e);
      }
    }
    const u = this.users.find((user) => user.email.toLowerCase() === email.toLowerCase().trim());
    if (!u) return null;
    const dept = this.departments.find((d) => d.id === u.departmentId);
    return { ...u, departmentName: dept?.name };
  }

  public async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<SafeUser> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(`
          INSERT INTO users (username, email, password_hash, full_name, role, department_id, phone, location, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id, username, email, full_name as "fullName", role, department_id as "departmentId", phone, location, is_active as "isActive", created_at as "createdAt"
        `, [
          userData.username,
          userData.email,
          userData.passwordHash,
          userData.fullName,
          userData.role,
          userData.departmentId || null,
          userData.phone || null,
          userData.location || null,
          userData.isActive ?? true,
        ]);
        const dept = await this.getDepartmentById(res.rows[0].departmentId);
        return { ...res.rows[0], departmentName: dept?.name };
      } catch (e) {
        console.warn('Postgres createUser fallback', e);
      }
    }

    const id = this.userCounter++;
    const now = new Date().toISOString();
    const newUser: User = {
      ...userData,
      id,
      createdAt: now,
    };
    this.users.push(newUser);

    const dept = this.departments.find((d) => d.id === newUser.departmentId);
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      departmentId: newUser.departmentId,
      departmentName: dept?.name,
      phone: newUser.phone,
      location: newUser.location,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
    };
  }

  public async updateUser(id: number, data: Partial<User>): Promise<SafeUser | null> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.role !== undefined) {
          fields.push(`role = $${idx++}`);
          values.push(data.role);
        }
        if (data.isActive !== undefined) {
          fields.push(`is_active = $${idx++}`);
          values.push(data.isActive);
        }
        if (data.departmentId !== undefined) {
          fields.push(`department_id = $${idx++}`);
          values.push(data.departmentId);
        }
        if (data.phone !== undefined) {
          fields.push(`phone = $${idx++}`);
          values.push(data.phone);
        }
        if (data.location !== undefined) {
          fields.push(`location = $${idx++}`);
          values.push(data.location);
        }

        if (fields.length > 0) {
          fields.push(`updated_at = NOW()`);
          values.push(id);
          const q = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, username, email, full_name as "fullName", role, department_id as "departmentId", phone, location, is_active as "isActive", created_at as "createdAt"`;
          const res = await this.pool.query(q, values);
          if (res.rows[0]) {
            const dept = await this.getDepartmentById(res.rows[0].departmentId);
            return { ...res.rows[0], departmentName: dept?.name };
          }
        }
      } catch (e) {
        console.warn('Postgres updateUser fallback', e);
      }
    }

    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const current = this.users[index];
    const updated: User = {
      ...current,
      ...data,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };
    this.users[index] = updated;

    const dept = this.departments.find((d) => d.id === updated.departmentId);
    return {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      fullName: updated.fullName,
      role: updated.role,
      departmentId: updated.departmentId,
      departmentName: dept?.name,
      phone: updated.phone,
      location: updated.location,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
    };
  }

  // --- Assets ---
  public async getAssets(filters?: {
    category?: string;
    departmentId?: number;
    status?: string;
    search?: string;
  }): Promise<Asset[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        let q = `
          SELECT a.id, a.asset_number as "assetNumber", a.name, a.category, 
                 a.brand_model as "brandModel", a.serial_number as "serialNumber", 
                 a.department_id as "departmentId", d.name as "departmentName", 
                 a.assigned_user_id as "assignedUserId", u.full_name as "assignedUserName", 
                 a.status, a.purchase_date as "purchaseDate", a.warranty_expire as "warrantyExpire", 
                 a.notes, a.created_at as "createdAt"
          FROM assets a
          LEFT JOIN departments d ON a.department_id = d.id
          LEFT JOIN users u ON a.assigned_user_id = u.id
          WHERE 1=1
        `;
        const values: any[] = [];
        let idx = 1;

        if (filters?.category) {
          q += ` AND a.category = $${idx++}`;
          values.push(filters.category);
        }
        if (filters?.departmentId) {
          q += ` AND a.department_id = $${idx++}`;
          values.push(filters.departmentId);
        }
        if (filters?.status) {
          q += ` AND a.status = $${idx++}`;
          values.push(filters.status);
        }
        if (filters?.search) {
          q += ` AND (LOWER(a.asset_number) LIKE $${idx} OR LOWER(a.name) LIKE $${idx} OR LOWER(a.brand_model) LIKE $${idx} OR LOWER(a.serial_number) LIKE $${idx})`;
          values.push(`%${filters.search.toLowerCase()}%`);
          idx++;
        }
        q += ' ORDER BY a.id DESC';
        const res = await this.pool.query(q, values);
        return res.rows;
      } catch (e) {
        console.warn('Postgres getAssets fallback', e);
      }
    }

    let result = [...this.assets];
    if (filters?.category) result = result.filter((a) => a.category === filters.category);
    if (filters?.departmentId) result = result.filter((a) => a.departmentId === Number(filters.departmentId));
    if (filters?.status) result = result.filter((a) => a.status === filters.status);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.assetNumber.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.brandModel && a.brandModel.toLowerCase().includes(q)) ||
          (a.serialNumber && a.serialNumber.toLowerCase().includes(q))
      );
    }

    return result.map((a) => {
      const dept = this.departments.find((d) => d.id === a.departmentId);
      const user = this.users.find((u) => u.id === a.assignedUserId);
      return {
        ...a,
        departmentName: dept?.name,
        assignedUserName: user?.fullName,
      };
    });
  }

  public async getAssetById(id: number): Promise<Asset | null> {
    const list = await this.getAssets();
    return list.find((a) => a.id === id) || null;
  }

  public async createAsset(assetData: Omit<Asset, 'id' | 'createdAt'>): Promise<Asset> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(`
          INSERT INTO assets (asset_number, name, category, brand_model, serial_number, department_id, assigned_user_id, status, purchase_date, warranty_expire, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `, [
          assetData.assetNumber,
          assetData.name,
          assetData.category,
          assetData.brandModel || null,
          assetData.serialNumber || null,
          assetData.departmentId || null,
          assetData.assignedUserId || null,
          assetData.status || 'active',
          assetData.purchaseDate || null,
          assetData.warrantyExpire || null,
          assetData.notes || null,
        ]);
        return this.getAssetById(res.rows[0].id) as Promise<Asset>;
      } catch (e) {
        console.warn('Postgres createAsset fallback', e);
      }
    }

    const id = this.assetCounter++;
    const now = new Date().toISOString();
    const newAsset: Asset = { ...assetData, id, createdAt: now };
    this.assets.push(newAsset);
    return this.getAssetById(id) as Promise<Asset>;
  }

  public async updateAsset(id: number, data: Partial<Asset>): Promise<Asset | null> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.name) { fields.push(`name = $${idx++}`); values.push(data.name); }
        if (data.category) { fields.push(`category = $${idx++}`); values.push(data.category); }
        if (data.brandModel !== undefined) { fields.push(`brand_model = $${idx++}`); values.push(data.brandModel); }
        if (data.serialNumber !== undefined) { fields.push(`serial_number = $${idx++}`); values.push(data.serialNumber); }
        if (data.departmentId !== undefined) { fields.push(`department_id = $${idx++}`); values.push(data.departmentId); }
        if (data.assignedUserId !== undefined) { fields.push(`assigned_user_id = $${idx++}`); values.push(data.assignedUserId); }
        if (data.status) { fields.push(`status = $${idx++}`); values.push(data.status); }
        if (data.purchaseDate !== undefined) { fields.push(`purchase_date = $${idx++}`); values.push(data.purchaseDate || null); }
        if (data.warrantyExpire !== undefined) { fields.push(`warranty_expire = $${idx++}`); values.push(data.warrantyExpire || null); }
        if (data.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(data.notes); }

        if (fields.length > 0) {
          fields.push(`updated_at = NOW()`);
          values.push(id);
          await this.pool.query(`UPDATE assets SET ${fields.join(', ')} WHERE id = $${idx}`, values);
          return this.getAssetById(id);
        }
      } catch (e) {
        console.warn('Postgres updateAsset fallback', e);
      }
    }

    const index = this.assets.findIndex((a) => a.id === id);
    if (index === -1) return null;
    this.assets[index] = { ...this.assets[index], ...data, id, updatedAt: new Date().toISOString() };
    return this.getAssetById(id);
  }

  public async deleteAsset(id: number): Promise<boolean> {
    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query('DELETE FROM assets WHERE id = $1', [id]);
        return true;
      } catch (e) {
        console.warn('Postgres deleteAsset fallback', e);
      }
    }
    const index = this.assets.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.assets.splice(index, 1);
    return true;
  }

  // --- Tickets ---
  public generateTicketNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const seq = String(this.ticketCounter).padStart(4, '0');
    return `TK-${year}${month}-${seq}`;
  }

  public async getTickets(options: {
    userId?: number;
    role?: string;
    status?: string;
    priority?: string;
    category?: string;
    departmentId?: number;
    technicianId?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Ticket[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        let q = `
          SELECT t.id, t.ticket_number as "ticketNumber", t.requester_id as "requesterId", 
                 req.full_name as "requesterName", req.email as "requesterEmail", req.role as "requesterRole",
                 t.department_id as "departmentId", d.name as "departmentName", 
                 t.asset_id as "assetId", COALESCE(a.asset_number, t.asset_number_custom) as "assetNumber", a.name as "assetName",
                 t.category, t.priority, t.status, t.title, t.description, t.location, t.contact_phone as "contactPhone",
                 t.assigned_technician_id as "assignedTechnicianId", tech.full_name as "assignedTechnicianName",
                 t.diagnosis, t.repair_actions as "repairActions", t.resolution_notes as "resolutionNotes",
                 t.created_at as "createdAt", t.updated_at as "updatedAt", t.accepted_at as "acceptedAt",
                 t.resolved_at as "resolvedAt", t.closed_at as "closedAt"
          FROM tickets t
          LEFT JOIN users req ON t.requester_id = req.id
          LEFT JOIN departments d ON t.department_id = d.id
          LEFT JOIN users tech ON t.assigned_technician_id = tech.id
          LEFT JOIN assets a ON t.asset_id = a.id
          WHERE 1=1
        `;
        const values: any[] = [];
        let idx = 1;

        if (options.role === 'user' && options.userId) {
          q += ` AND t.requester_id = $${idx++}`;
          values.push(options.userId);
        }
        if (options.status && options.status !== 'all') {
          q += ` AND t.status = $${idx++}`;
          values.push(options.status);
        }
        if (options.priority && options.priority !== 'all') {
          q += ` AND t.priority = $${idx++}`;
          values.push(options.priority);
        }
        if (options.category && options.category !== 'all') {
          q += ` AND t.category = $${idx++}`;
          values.push(options.category);
        }
        if (options.departmentId && options.departmentId !== 0) {
          q += ` AND t.department_id = $${idx++}`;
          values.push(Number(options.departmentId));
        }
        if (options.technicianId && options.technicianId !== 0) {
          q += ` AND t.assigned_technician_id = $${idx++}`;
          values.push(Number(options.technicianId));
        }
        if (options.startDate) {
          q += ` AND t.created_at >= $${idx++}`;
          values.push(options.startDate);
        }
        if (options.endDate) {
          q += ` AND t.created_at <= $${idx++}`;
          values.push(options.endDate);
        }
        if (options.search) {
          q += ` AND (LOWER(t.ticket_number) LIKE $${idx} OR LOWER(t.title) LIKE $${idx} OR LOWER(t.description) LIKE $${idx} OR LOWER(req.full_name) LIKE $${idx})`;
          values.push(`%${options.search.toLowerCase()}%`);
          idx++;
        }

        q += ' ORDER BY t.created_at DESC';
        const res = await this.pool.query(q, values);
        return res.rows;
      } catch (e) {
        console.warn('Postgres getTickets fallback', e);
      }
    }

    let list = [...this.tickets];
    if (options.role === 'user' && options.userId) {
      list = list.filter((t) => t.requesterId === options.userId);
    }
    if (options.status && options.status !== 'all') {
      list = list.filter((t) => t.status === options.status);
    }
    if (options.priority && options.priority !== 'all') {
      list = list.filter((t) => t.priority === options.priority);
    }
    if (options.category && options.category !== 'all') {
      list = list.filter((t) => t.category === options.category);
    }
    if (options.departmentId && options.departmentId !== 0) {
      list = list.filter((t) => t.departmentId === Number(options.departmentId));
    }
    if (options.technicianId && options.technicianId !== 0) {
      list = list.filter((t) => t.assignedTechnicianId === Number(options.technicianId));
    }
    if (options.startDate) {
      const start = new Date(options.startDate).getTime();
      list = list.filter((t) => new Date(t.createdAt).getTime() >= start);
    }
    if (options.endDate) {
      const end = new Date(options.endDate).getTime() + 86400000;
      list = list.filter((t) => new Date(t.createdAt).getTime() <= end);
    }
    if (options.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter((t) => {
        const req = this.users.find((u) => u.id === t.requesterId);
        return (
          t.ticketNumber.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.assetNumber && t.assetNumber.toLowerCase().includes(q)) ||
          (req && req.fullName.toLowerCase().includes(q))
        );
      });
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list.map((t) => this.populateTicketRelations(t, options.role === 'admin' || options.role === 'technician'));
  }

  public async getTicketById(id: number, includeInternal = false): Promise<Ticket | null> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(`
          SELECT t.id, t.ticket_number as "ticketNumber", t.requester_id as "requesterId", 
                 req.full_name as "requesterName", req.email as "requesterEmail", req.role as "requesterRole",
                 t.department_id as "departmentId", d.name as "departmentName", 
                 t.asset_id as "assetId", COALESCE(a.asset_number, t.asset_number_custom) as "assetNumber", a.name as "assetName",
                 t.category, t.priority, t.status, t.title, t.description, t.location, t.contact_phone as "contactPhone",
                 t.assigned_technician_id as "assignedTechnicianId", tech.full_name as "assignedTechnicianName",
                 t.diagnosis, t.repair_actions as "repairActions", t.resolution_notes as "resolutionNotes",
                 t.created_at as "createdAt", t.updated_at as "updatedAt", t.accepted_at as "acceptedAt",
                 t.resolved_at as "resolvedAt", t.closed_at as "closedAt"
          FROM tickets t
          LEFT JOIN users req ON t.requester_id = req.id
          LEFT JOIN departments d ON t.department_id = d.id
          LEFT JOIN users tech ON t.assigned_technician_id = tech.id
          LEFT JOIN assets a ON t.asset_id = a.id
          WHERE t.id = $1
        `, [id]);
        if (res.rows[0]) {
          const ticket = res.rows[0];
          // load comments
          let cQuery = `
            SELECT c.id, c.ticket_id as "ticketId", c.user_id as "userId", u.full_name as "userName", u.role as "userRole",
                   c.is_internal as "isInternal", c.comment, c.created_at as "createdAt"
            FROM ticket_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.ticket_id = $1
          `;
          if (!includeInternal) cQuery += ` AND c.is_internal = FALSE`;
          cQuery += ` ORDER BY c.created_at ASC`;
          const commentsRes = await this.pool.query(cQuery, [id]);
          ticket.comments = commentsRes.rows;

          // load history
          const historyRes = await this.pool.query(`
            SELECT h.id, h.ticket_id as "ticketId", h.changed_by_user_id as "changedByUserId", u.full_name as "changedByName",
                   h.from_status as "fromStatus", h.to_status as "toStatus", h.notes, h.created_at as "createdAt"
            FROM ticket_status_history h
            JOIN users u ON h.changed_by_user_id = u.id
            WHERE h.ticket_id = $1
            ORDER BY h.created_at ASC
          `, [id]);
          ticket.history = historyRes.rows;

          // load feedback
          const fbRes = await this.pool.query(`
            SELECT id, ticket_id as "ticketId", user_id as "userId", rating, comment, created_at as "createdAt"
            FROM ticket_feedback WHERE ticket_id = $1
          `, [id]);
          ticket.feedback = fbRes.rows[0] || null;

          // attachments
          const attRes = await this.pool.query(`
            SELECT id, ticket_id as "ticketId", uploader_id as "uploaderId", filename, original_name as "originalName",
                   mime_type as "mimeType", file_size as "fileSize", file_path as "filePath", created_at as "createdAt"
            FROM ticket_attachments WHERE ticket_id = $1
          `, [id]);
          ticket.attachments = attRes.rows;

          return ticket;
        }
      } catch (e) {
        console.warn('Postgres getTicketById fallback', e);
      }
    }

    const ticket = this.tickets.find((t) => t.id === id);
    if (!ticket) return null;
    return this.populateTicketRelations(ticket, includeInternal);
  }

  private populateTicketRelations(ticket: Ticket, includeInternal = false): Ticket {
    const requester = this.users.find((u) => u.id === ticket.requesterId);
    const tech = this.users.find((u) => u.id === ticket.assignedTechnicianId);
    const dept = this.departments.find((d) => d.id === ticket.departmentId);
    const asset = this.assets.find((a) => a.id === ticket.assetId);
    const feedback = this.feedbacks.find((f) => f.ticketId === ticket.id) || null;

    let ticketComments = this.comments.filter((c) => c.ticketId === ticket.id);
    if (!includeInternal) {
      ticketComments = ticketComments.filter((c) => !c.isInternal);
    }

    const ticketAttachments = this.attachments.filter((a) => a.ticketId === ticket.id);
    const ticketHistory = this.statusHistory.filter((h) => h.ticketId === ticket.id);

    return {
      ...ticket,
      requesterName: requester?.fullName,
      requesterEmail: requester?.email,
      requesterRole: requester?.role,
      departmentName: dept?.name,
      assignedTechnicianName: tech?.fullName,
      assetName: asset?.name,
      assetNumber: ticket.assetNumber || asset?.assetNumber || ticket.assetNumberCustom,
      comments: ticketComments,
      attachments: ticketAttachments,
      history: ticketHistory,
      feedback,
    };
  }

  public async createTicket(ticketData: {
    requesterId: number;
    departmentId?: number | null;
    assetId?: number | null;
    assetNumberCustom?: string;
    category: TicketCategory;
    priority: TicketPriority;
    title: string;
    description: string;
    location: string;
    contactPhone: string;
    attachmentFiles?: Array<{
      filename: string;
      originalName: string;
      mimeType: string;
      fileSize: number;
      filePath: string;
    }>;
  }): Promise<Ticket> {
    const ticketNumber = this.generateTicketNumber();
    const id = this.ticketCounter++;
    const now = new Date().toISOString();

    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(`
          INSERT INTO tickets (ticket_number, requester_id, department_id, asset_id, asset_number_custom, category, priority, status, title, description, location, contact_phone)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', $8, $9, $10, $11)
          RETURNING id
        `, [
          ticketNumber,
          ticketData.requesterId,
          ticketData.departmentId || null,
          ticketData.assetId || null,
          ticketData.assetNumberCustom || null,
          ticketData.category,
          ticketData.priority,
          ticketData.title,
          ticketData.description,
          ticketData.location,
          ticketData.contactPhone,
        ]);
        const newId = res.rows[0].id;

        // Status history
        await this.pool.query(`
          INSERT INTO ticket_status_history (ticket_id, changed_by_user_id, from_status, to_status, notes)
          VALUES ($1, $2, NULL, 'new', 'เปิดใบแจ้งซ่อมใหม่ผ่านระบบ')
        `, [newId, ticketData.requesterId]);

        // Attachments
        if (ticketData.attachmentFiles) {
          for (const f of ticketData.attachmentFiles) {
            await this.pool.query(`
              INSERT INTO ticket_attachments (ticket_id, uploader_id, filename, original_name, mime_type, file_size, file_path)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [newId, ticketData.requesterId, f.filename, f.originalName, f.mimeType, f.fileSize, f.filePath]);
          }
        }
        return (await this.getTicketById(newId, false))!;
      } catch (e) {
        console.warn('Postgres createTicket fallback', e);
      }
    }

    let assetNumber = ticketData.assetNumberCustom;
    let assetName: string | undefined;
    if (ticketData.assetId) {
      const asset = this.assets.find((a) => a.id === ticketData.assetId);
      if (asset) {
        assetNumber = asset.assetNumber;
        assetName = asset.name;
      }
    }

    const newTicket: Ticket = {
      id,
      ticketNumber,
      requesterId: ticketData.requesterId,
      departmentId: ticketData.departmentId || null,
      assetId: ticketData.assetId || null,
      assetNumber,
      assetName,
      assetNumberCustom: ticketData.assetNumberCustom,
      category: ticketData.category,
      priority: ticketData.priority,
      status: 'new',
      title: ticketData.title,
      description: ticketData.description,
      location: ticketData.location,
      contactPhone: ticketData.contactPhone,
      createdAt: now,
      updatedAt: now,
    };

    this.tickets.unshift(newTicket);
    const user = this.users.find((u) => u.id === ticketData.requesterId);
    this.statusHistory.push({
      id: this.historyCounter++,
      ticketId: id,
      changedByUserId: ticketData.requesterId,
      changedByName: user?.fullName || 'ผู้แจ้งซ่อม',
      fromStatus: null,
      toStatus: 'new',
      notes: 'เปิดใบแจ้งซ่อมใหม่ในระบบ',
      createdAt: now,
    });

    if (ticketData.attachmentFiles && ticketData.attachmentFiles.length > 0) {
      for (const file of ticketData.attachmentFiles) {
        this.attachments.push({
          id: this.attachmentCounter++,
          ticketId: id,
          uploaderId: ticketData.requesterId,
          uploaderName: user?.fullName,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          fileSize: file.fileSize,
          filePath: file.filePath,
          createdAt: now,
        });
      }
    }

    return this.populateTicketRelations(newTicket, false);
  }

  public async updateTicketStatus(
    ticketId: number,
    userId: number,
    newStatus: TicketStatus,
    notes?: string
  ): Promise<Ticket | null> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const cur = await this.getTicketById(ticketId, true);
        if (!cur) return null;

        let extraSql = '';
        if (newStatus === 'accepted' && !cur.acceptedAt) extraSql += ', accepted_at = NOW()';
        if (newStatus === 'resolved') extraSql += ', resolved_at = NOW()';
        if (newStatus === 'closed') extraSql += ', closed_at = NOW()';

        await this.pool.query(`UPDATE tickets SET status = $1, updated_at = NOW() ${extraSql} WHERE id = $2`, [newStatus, ticketId]);
        await this.pool.query(`
          INSERT INTO ticket_status_history (ticket_id, changed_by_user_id, from_status, to_status, notes)
          VALUES ($1, $2, $3, $4, $5)
        `, [ticketId, userId, cur.status, newStatus, notes || `เปลี่ยนสถานะเป็น ${newStatus}`]);

        return this.getTicketById(ticketId, true);
      } catch (e) {
        console.warn('Postgres updateTicketStatus fallback', e);
      }
    }

    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    const oldStatus = ticket.status;
    const now = new Date().toISOString();
    ticket.status = newStatus;
    ticket.updatedAt = now;

    if (newStatus === 'accepted' && !ticket.acceptedAt) ticket.acceptedAt = now;
    if (newStatus === 'resolved') ticket.resolvedAt = now;
    if (newStatus === 'closed') ticket.closedAt = now;

    const user = this.users.find((u) => u.id === userId);
    this.statusHistory.push({
      id: this.historyCounter++,
      ticketId,
      changedByUserId: userId,
      changedByName: user?.fullName || 'เจ้าหน้าที่',
      fromStatus: oldStatus,
      toStatus: newStatus,
      notes: notes || `เปลี่ยนสถานะเป็น ${newStatus}`,
      createdAt: now,
    });

    return this.populateTicketRelations(ticket, true);
  }

  public async assignTechnician(
    ticketId: number,
    userId: number,
    technicianId: number
  ): Promise<Ticket | null> {
    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(`
          UPDATE tickets 
          SET assigned_technician_id = $1, 
              status = CASE WHEN status = 'new' THEN 'accepted' ELSE status END,
              accepted_at = CASE WHEN status = 'new' THEN NOW() ELSE accepted_at END,
              updated_at = NOW()
          WHERE id = $2
        `, [technicianId, ticketId]);

        const tech = await this.getUserById(technicianId);
        await this.pool.query(`
          INSERT INTO ticket_status_history (ticket_id, changed_by_user_id, from_status, to_status, notes)
          VALUES ($1, $2, 'accepted', 'accepted', $3)
        `, [ticketId, userId, `มอบหมายงานให้ช่าง ${tech?.fullName || 'เจ้าหน้าที่'}`]);

        return this.getTicketById(ticketId, true);
      } catch (e) {
        console.warn('Postgres assignTechnician fallback', e);
      }
    }

    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return null;
    const tech = this.users.find((u) => u.id === technicianId);
    if (!tech) return null;

    ticket.assignedTechnicianId = technicianId;
    ticket.updatedAt = new Date().toISOString();

    if (ticket.status === 'new') {
      ticket.status = 'accepted';
      ticket.acceptedAt = new Date().toISOString();
    }

    const user = this.users.find((u) => u.id === userId);
    this.statusHistory.push({
      id: this.historyCounter++,
      ticketId,
      changedByUserId: userId,
      changedByName: user?.fullName || 'เจ้าหน้าที่',
      fromStatus: ticket.status,
      toStatus: ticket.status,
      notes: `มอบหมายงานให้ช่าง ${tech.fullName}`,
      createdAt: new Date().toISOString(),
    });

    return this.populateTicketRelations(ticket, true);
  }

  public async updateTicketDetails(
    ticketId: number,
    data: {
      priority?: TicketPriority;
      diagnosis?: string;
      repairActions?: string;
      resolutionNotes?: string;
    }
  ): Promise<Ticket | null> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const fields: string[] = ['updated_at = NOW()'];
        const values: any[] = [];
        let idx = 1;

        if (data.priority) { fields.push(`priority = $${idx++}`); values.push(data.priority); }
        if (data.diagnosis !== undefined) { fields.push(`diagnosis = $${idx++}`); values.push(data.diagnosis); }
        if (data.repairActions !== undefined) { fields.push(`repair_actions = $${idx++}`); values.push(data.repairActions); }
        if (data.resolutionNotes !== undefined) { fields.push(`resolution_notes = $${idx++}`); values.push(data.resolutionNotes); }

        values.push(ticketId);
        await this.pool.query(`UPDATE tickets SET ${fields.join(', ')} WHERE id = $${idx}`, values);
        return this.getTicketById(ticketId, true);
      } catch (e) {
        console.warn('Postgres updateTicketDetails fallback', e);
      }
    }

    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    if (data.priority) ticket.priority = data.priority;
    if (data.diagnosis !== undefined) ticket.diagnosis = data.diagnosis;
    if (data.repairActions !== undefined) ticket.repairActions = data.repairActions;
    if (data.resolutionNotes !== undefined) ticket.resolutionNotes = data.resolutionNotes;
    ticket.updatedAt = new Date().toISOString();

    return this.populateTicketRelations(ticket, true);
  }

  // --- Comments ---
  public async addComment(data: {
    ticketId: number;
    userId: number;
    comment: string;
    isInternal: boolean;
  }): Promise<TicketComment> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(`
          INSERT INTO ticket_comments (ticket_id, user_id, is_internal, comment)
          VALUES ($1, $2, $3, $4)
          RETURNING id, ticket_id as "ticketId", user_id as "userId", is_internal as "isInternal", comment, created_at as "createdAt"
        `, [data.ticketId, data.userId, data.isInternal, data.comment]);
        const user = await this.getUserById(data.userId);
        return {
          ...res.rows[0],
          userName: user?.fullName || 'เจ้าหน้าที่',
          userRole: user?.role || 'user',
        };
      } catch (e) {
        console.warn('Postgres addComment fallback', e);
      }
    }

    const user = this.users.find((u) => u.id === data.userId);
    const newComment: TicketComment = {
      id: this.commentCounter++,
      ticketId: data.ticketId,
      userId: data.userId,
      userName: user?.fullName || 'ผู้ใช้งาน',
      userRole: user?.role || 'user',
      isInternal: data.isInternal,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };
    this.comments.push(newComment);
    return newComment;
  }

  // --- Feedback ---
  public async addFeedback(data: {
    ticketId: number;
    userId: number;
    rating: number;
    comment?: string;
  }): Promise<TicketFeedback> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(`
          INSERT INTO ticket_feedback (ticket_id, user_id, rating, comment)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (ticket_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
          RETURNING id, ticket_id as "ticketId", user_id as "userId", rating, comment, created_at as "createdAt"
        `, [data.ticketId, data.userId, data.rating, data.comment || null]);
        return res.rows[0];
      } catch (e) {
        console.warn('Postgres addFeedback fallback', e);
      }
    }

    const existingIndex = this.feedbacks.findIndex((f) => f.ticketId === data.ticketId);
    const feedback: TicketFeedback = {
      id: existingIndex !== -1 ? this.feedbacks[existingIndex].id : this.feedbacks.length + 1,
      ticketId: data.ticketId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      this.feedbacks[existingIndex] = feedback;
    } else {
      this.feedbacks.push(feedback);
    }
    return feedback;
  }

  // --- Audit Logs ---
  public async addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(`
          INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, user_agent, details)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          log.userId || null,
          log.action,
          log.targetType,
          log.targetId || null,
          log.ipAddress || null,
          log.userAgent || null,
          log.details ? JSON.stringify(log.details) : null,
        ]);
      } catch (e) {
        console.warn('Postgres addAuditLog fallback', e);
      }
    }

    const user = log.userId ? this.users.find((u) => u.id === log.userId) : null;
    const newLog: AuditLog = {
      ...log,
      id: this.auditCounter++,
      userName: user?.fullName,
      userRole: user?.role,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  public async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(`
          SELECT a.id, a.user_id as "userId", u.full_name as "userName", u.role as "userRole",
                 a.action, a.target_type as "targetType", a.target_id as "targetId",
                 a.ip_address as "ipAddress", a.user_agent as "userAgent", a.details, a.created_at as "createdAt"
          FROM audit_logs a
          LEFT JOIN users u ON a.user_id = u.id
          ORDER BY a.created_at DESC
          LIMIT $1
        `, [limit]);
        return res.rows;
      } catch (e) {
        console.warn('Postgres getAuditLogs fallback', e);
      }
    }
    return this.auditLogs.slice(0, limit);
  }

  // --- Dashboard Metrics & Analytics ---
  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    const tickets = await this.getTickets({});
    const departments = await this.getDepartments();
    const users = await this.getUsers();

    const total = tickets.length;
    const newCount = tickets.filter((t) => t.status === 'new').length;
    const inProgressCount = tickets.filter((t) => t.status === 'in_progress' || t.status === 'accepted').length;
    const waitingUserCount = tickets.filter((t) => t.status === 'waiting_user').length;
    const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;
    const closedCount = tickets.filter((t) => t.status === 'closed').length;

    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const overdueCount = tickets.filter((t) => {
      const isUnfinished = t.status !== 'resolved' && t.status !== 'closed' && t.status !== 'cancelled';
      const isOld = new Date(t.createdAt).getTime() < threeDaysAgo;
      return isUnfinished && isOld;
    }).length;

    const criticalPending = tickets.filter(
      (t) => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed'
    ).length;

    let totalResolvedHours = 0;
    let resolvedItemCount = 0;
    for (const t of tickets) {
      if (t.resolvedAt && t.createdAt) {
        const diffHours = (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
        if (diffHours >= 0) {
          totalResolvedHours += diffHours;
          resolvedItemCount++;
        }
      }
    }
    const averageResolutionHours = resolvedItemCount > 0 ? Math.round((totalResolvedHours / resolvedItemCount) * 10) / 10 : 4.5;

    const categories: TicketCategory[] = [
      'computer_laptop',
      'printer',
      'network_internet',
      'software',
      'email_account',
      'other_equipment',
    ];
    const categoryBreakdown = categories.map((cat) => ({
      category: cat,
      count: tickets.filter((t) => t.category === cat).length,
    }));

    const statuses: TicketStatus[] = [
      'new',
      'accepted',
      'in_progress',
      'waiting_user',
      'resolved',
      'closed',
      'cancelled',
    ];
    const statusBreakdown = statuses.map((st) => ({
      status: st,
      count: tickets.filter((t) => t.status === st).length,
    }));

    const priorities: TicketPriority[] = ['low', 'normal', 'high', 'critical'];
    const priorityBreakdown = priorities.map((p) => ({
      priority: p,
      count: tickets.filter((t) => t.priority === p).length,
    }));

    const departmentBreakdown = departments.map((d) => ({
      departmentName: d.name,
      count: tickets.filter((t) => t.departmentId === d.id).length,
    }));

    const technicians = users.filter((u) => u.role === 'technician' || u.role === 'admin');
    const technicianWorkload = technicians.map((tech) => ({
      technicianName: tech.fullName,
      activeCount: tickets.filter(
        (t) => t.assignedTechnicianId === tech.id && t.status !== 'resolved' && t.status !== 'closed' && t.status !== 'cancelled'
      ).length,
      resolvedCount: tickets.filter((t) => t.assignedTechnicianId === tech.id && (t.status === 'resolved' || t.status === 'closed')).length,
    }));

    return {
      totalTickets: total,
      newTickets: newCount,
      inProgressTickets: inProgressCount,
      waitingUserTickets: waitingUserCount,
      resolvedTickets: resolvedCount,
      closedTickets: closedCount,
      overdueTickets: overdueCount,
      averageResolutionHours,
      criticalPending,
      categoryBreakdown,
      statusBreakdown,
      priorityBreakdown,
      departmentBreakdown,
      technicianWorkload,
    };
  }
}

export const db = new DatabaseService();
