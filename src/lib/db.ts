import Dexie, { type EntityTable } from 'dexie';
import type { UserFont, CardConfig, DrawingSession } from '@/types';

// ─── Database Schema ──────────────────────────────────────────────

interface LoveyourhandDB extends Dexie {
  fonts: EntityTable<UserFont, 'id'>;
  cards: EntityTable<CardConfig, 'id'>;
  sessions: EntityTable<DrawingSession, 'id'>;
}

export const db = new Dexie('loveyourhand') as LoveyourhandDB;

db.version(1).stores({
  fonts:    '&id, createdAt, updatedAt, language',
  cards:    '&id, fontId',
  sessions: '&id, fontId, savedAt',
});

// ─── Font Repository ──────────────────────────────────────────────

export const fontRepo = {
  async getAll(): Promise<UserFont[]> {
    return db.fonts.orderBy('updatedAt').reverse().toArray();
  },

  async getById(id: string): Promise<UserFont | undefined> {
    return db.fonts.get(id);
  },

  async save(font: UserFont): Promise<void> {
    await db.fonts.put(font);
  },

  async delete(id: string): Promise<void> {
    await db.fonts.delete(id);
    await db.sessions.where('fontId').equals(id).delete();
  },

  async getLatest(): Promise<UserFont | undefined> {
    return db.fonts.orderBy('updatedAt').last();
  },
};

// ─── Card Repository ──────────────────────────────────────────────

export const cardRepo = {
  async getAll(): Promise<CardConfig[]> {
    return db.cards.toArray();
  },

  async getByFontId(fontId: string): Promise<CardConfig[]> {
    return db.cards.where('fontId').equals(fontId).toArray();
  },

  async save(card: CardConfig): Promise<void> {
    await db.cards.put(card);
  },

  async delete(id: string): Promise<void> {
    await db.cards.delete(id);
  },
};

// ─── Session Repository ───────────────────────────────────────────

export const sessionRepo = {
  async get(id: string): Promise<DrawingSession | undefined> {
    return db.sessions.get(id);
  },

  async getLatest(): Promise<DrawingSession | undefined> {
    return db.sessions.orderBy('savedAt').last();
  },

  async save(session: DrawingSession): Promise<void> {
    await db.sessions.put(session);
  },

  async delete(id: string): Promise<void> {
    await db.sessions.delete(id);
  },

  async clear(): Promise<void> {
    await db.sessions.clear();
  },
};
