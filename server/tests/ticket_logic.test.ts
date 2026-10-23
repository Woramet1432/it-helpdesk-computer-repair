import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db/database.ts';

test('database generates properly formatted ticket numbers', () => {
  const ticketNumber = db.generateTicketNumber();
  assert.match(ticketNumber, /^TK-\d{6}-\d{4}$/);
});

test('user portal only returns tickets created by the logged-in user', async () => {
  // User ID 4 is Kanya
  const userTickets = await db.getTickets({
    userId: 4,
    role: 'user',
  });

  assert.ok(userTickets.length > 0);
  for (const t of userTickets) {
    assert.equal(t.requesterId, 4);
  }
});

test('admin portal returns all tickets across all departments', async () => {
  const allTickets = await db.getTickets({
    userId: 1,
    role: 'admin',
  });

  const distinctRequesters = new Set(allTickets.map((t) => t.requesterId));
  assert.ok(distinctRequesters.size > 1);
});

test('dashboard metrics calculate non-negative ticket stats and counts', async () => {
  const metrics = await db.getDashboardMetrics();

  assert.ok(metrics.totalTickets >= 5);
  assert.ok(metrics.newTickets >= 0);
  assert.ok(metrics.inProgressTickets >= 0);
  assert.ok(metrics.resolvedTickets >= 0);
  assert.ok(metrics.averageResolutionHours >= 0);
  assert.ok(metrics.categoryBreakdown.length > 0);
  assert.ok(metrics.statusBreakdown.length > 0);
});
