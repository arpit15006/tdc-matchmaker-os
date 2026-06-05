import bcrypt from 'bcryptjs';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../lib/jwt';
import type { LoginInput } from './auth.schema';

export async function login({ email, password }: LoginInput) {
  const matchmaker = await prisma.matchmaker.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!matchmaker) throw AppError.unauthorized('Invalid email or password');

  const ok = await bcrypt.compare(password, matchmaker.passwordHash);
  if (!ok) throw AppError.unauthorized('Invalid email or password');

  const token = signToken({
    sub: matchmaker.id,
    email: matchmaker.email,
    name: matchmaker.name,
  });

  return {
    token,
    matchmaker: { id: matchmaker.id, email: matchmaker.email, name: matchmaker.name },
  };
}

export async function getMatchmakerById(id: string) {
  const matchmaker = await prisma.matchmaker.findUnique({
    where: { id },
    select: { id: true, email: true, name: true },
  });
  if (!matchmaker) throw AppError.notFound('Matchmaker not found');
  return matchmaker;
}
