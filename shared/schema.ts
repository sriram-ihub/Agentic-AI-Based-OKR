import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const okrs = pgTable("okrs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetDate: timestamp("target_date").notNull(),
  priority: text("priority").notNull(), // "high", "medium", "low"
  status: text("status").notNull().default("active"), // "active", "completed", "paused"
  progress: integer("progress").notNull().default(0), // 0-100
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  okrId: integer("okr_id").notNull().references(() => okrs.id),
  title: text("title").notNull(),
  description: text("description"),
  deadline: timestamp("deadline").notNull(),
  priority: text("priority").notNull(), // "high", "medium", "low"
  status: text("status").notNull().default("pending"), // "pending", "completed"
  completedAt: timestamp("completed_at"),
  proofUrl: text("proof_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  message: text("message").notNull(),
  deliveryMethod: text("delivery_method").notNull(), // "email", "dashboard"
  status: text("status").notNull().default("pending"), // "pending", "sent", "viewed", "skipped"
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOkrSchema = createInsertSchema(okrs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  progress: true,
  status: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  status: true,
  completedAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export const updateTaskSchema = createInsertSchema(tasks).partial().omit({
  id: true,
  createdAt: true,
  okrId: true,
});

export type Okr = typeof okrs.$inferSelect;
export type InsertOkr = z.infer<typeof insertOkrSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

// Extended types with relations
export type OkrWithTasks = Okr & {
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
};

export type TaskWithReminders = Task & {
  reminders: Reminder[];
};
