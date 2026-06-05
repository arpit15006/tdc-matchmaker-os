import type { NoteCategory } from '@prisma/client';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../lib/prisma';

export async function listNotes(customerId: string) {
  return prisma.note.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function createNote(
  customerId: string,
  authorId: string,
  data: { category: NoteCategory; content: string }
) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw AppError.notFound('Customer not found');

  const note = await prisma.note.create({
    data: { customerId, authorId, category: data.category, content: data.content },
    include: { author: { select: { id: true, name: true } } },
  });

  await prisma.$transaction([
    prisma.timelineEvent.create({
      data: {
        customerId,
        type: 'NOTE_ADDED',
        description: `Note added (${data.category})`,
        metadata: { noteId: note.id, category: data.category },
      },
    }),
    prisma.customer.update({
      where: { id: customerId },
      data: { lastInteractionDate: new Date() },
    }),
  ]);

  return note;
}

export async function updateNote(
  noteId: string,
  data: { category?: NoteCategory; content?: string }
) {
  const existing = await prisma.note.findUnique({ where: { id: noteId } });
  if (!existing) throw AppError.notFound('Note not found');
  return prisma.note.update({
    where: { id: noteId },
    data,
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function deleteNote(noteId: string) {
  const existing = await prisma.note.findUnique({ where: { id: noteId } });
  if (!existing) throw AppError.notFound('Note not found');
  await prisma.note.delete({ where: { id: noteId } });
  return { id: noteId };
}
