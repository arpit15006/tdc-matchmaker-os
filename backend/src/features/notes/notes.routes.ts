import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth } from '../../middleware/requireAuth';
import { validate } from '../../middleware/validate';
import { createNoteSchema, updateNoteSchema } from './notes.schema';
import * as notesService from './notes.service';

// Mounted at /api/customers/:id/notes — needs parent params.
export const customerNotesRouter = Router({ mergeParams: true });

customerNotesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await notesService.listNotes(req.params.id));
  })
);

customerNotesRouter.post(
  '/',
  validate(createNoteSchema),
  asyncHandler(async (req, res) => {
    const note = await notesService.createNote(req.params.id, req.matchmaker!.sub, req.body);
    res.status(201).json(note);
  })
);

// Mounted at /api/notes for update/delete by note id.
export const notesRouter = Router();
notesRouter.use(requireAuth);

notesRouter.patch(
  '/:noteId',
  validate(updateNoteSchema),
  asyncHandler(async (req, res) => {
    res.json(await notesService.updateNote(req.params.noteId, req.body));
  })
);

notesRouter.delete(
  '/:noteId',
  asyncHandler(async (req, res) => {
    res.json(await notesService.deleteNote(req.params.noteId));
  })
);

export default customerNotesRouter;
