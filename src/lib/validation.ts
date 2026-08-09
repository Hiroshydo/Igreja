import { z } from "zod";

export const memberCreateSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(8).optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  joinDate: z.string().optional().or(z.literal("")),
  status: z.enum(["ativo", "inativo", "pendente"]).default("ativo"),
  role: z.string().optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
});

export const memberUpdateSchema = memberCreateSchema.partial();

export const eventCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().or(z.literal("")),
  date: z.string().min(10),
  time: z.string().min(4),
  endTime: z.string().optional().or(z.literal("")),
  location: z.string().min(3),
  category: z.enum(["culto", "reuniao", "evento", "estudo", "outro"]).default("evento"),
  attendees: z.number().int().nonnegative().optional(),
  organizer: z.string().optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
});

export const eventUpdateSchema = eventCreateSchema.partial();

export const ministryCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(3),
  leader: z.string().optional().or(z.literal("")),
  leaderEmail: z.string().email().optional().or(z.literal("")),
  leaderPhone: z.string().optional().or(z.literal("")),
  members: z.number().int().nonnegative().default(0),
  category: z.string().min(2),
  image: z.string().url().optional().or(z.literal("")),
  meetingDay: z.string().optional().or(z.literal("")),
  meetingTime: z.string().optional().or(z.literal("")),
});

export const ministryUpdateSchema = ministryCreateSchema.partial();

export const financeMovementCreateSchema = z.object({
  accountId: z.string().min(1),
  type: z.enum(['receita', 'despesa']),
  category: z.string().min(1),
  amount: z.union([z.number().nonnegative(), z.string().min(1)]),
  occurredAt: z.string().min(1),
  description: z.string().optional().or(z.literal("")),
  origin: z.string().optional().or(z.literal("")),
  reference: z.string().optional().or(z.literal("")),
  documentReference: z.string().optional().or(z.literal("")),
  observations: z.string().optional().or(z.literal("")),
  eventId: z.string().optional().or(z.literal("")),
});

export const financeMovementUpdateSchema = financeMovementCreateSchema.partial();

export type MemberCreateInput = z.infer<typeof memberCreateSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
export type MinistryCreateInput = z.infer<typeof ministryCreateSchema>;
export type MinistryUpdateInput = z.infer<typeof ministryUpdateSchema>;
export type FinanceMovementCreateInput = z.infer<typeof financeMovementCreateSchema>;
export type FinanceMovementUpdateInput = z.infer<typeof financeMovementUpdateSchema>;
