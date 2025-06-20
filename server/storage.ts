import { okrs, tasks, reminders, type Okr, type InsertOkr, type Task, type InsertTask, type UpdateTask, type Reminder, type InsertReminder, type OkrWithTasks, type TaskWithReminders } from "@shared/schema";

export interface IStorage {
  // OKR methods
  createOkr(okr: InsertOkr): Promise<Okr>;
  getOkrs(): Promise<OkrWithTasks[]>;
  getOkr(id: number): Promise<OkrWithTasks | undefined>;
  updateOkrProgress(id: number, progress: number): Promise<void>;
  
  // Task methods
  createTask(task: InsertTask): Promise<Task>;
  getTasks(): Promise<Task[]>;
  getTasksByOkr(okrId: number): Promise<Task[]>;
  getTask(id: number): Promise<TaskWithReminders | undefined>;
  updateTask(id: number, updates: UpdateTask): Promise<Task | undefined>;
  completeTask(id: number, proofUrl?: string): Promise<Task | undefined>;
  
  // Reminder methods
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  getReminders(): Promise<Reminder[]>;
  getUpcomingReminders(): Promise<Reminder[]>;
  updateReminderStatus(id: number, status: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private okrs: Map<number, Okr>;
  private tasks: Map<number, Task>;
  private reminders: Map<number, Reminder>;
  private currentOkrId: number;
  private currentTaskId: number;
  private currentReminderId: number;

  constructor() {
    this.okrs = new Map();
    this.tasks = new Map();
    this.reminders = new Map();
    this.currentOkrId = 1;
    this.currentTaskId = 1;
    this.currentReminderId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample OKR 1
    const okr1: Okr = {
      id: 1,
      title: "Publish 3 AI Articles by Q4",
      description: "Write and publish 3 comprehensive articles about AI trends, applications, and future predictions",
      targetDate: new Date("2024-12-31"),
      priority: "high",
      status: "active",
      progress: 75,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.okrs.set(1, okr1);

    // Sample OKR 2
    const okr2: Okr = {
      id: 2,
      title: "Complete 5 Coding Projects",
      description: "Build and deploy 5 full-stack applications using modern technologies",
      targetDate: new Date("2024-12-15"),
      priority: "medium",
      status: "active",
      progress: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.okrs.set(2, okr2);

    // Sample tasks for OKR 1
    const tasks1 = [
      {
        id: 1,
        okrId: 1,
        title: "Write 500 words for Article 1",
        description: "Focus on AI in healthcare applications",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        priority: "high",
        status: "pending",
        completedAt: null,
        proofUrl: null,
        createdAt: new Date(),
      },
      {
        id: 2,
        okrId: 1,
        title: "Research AI trends for Article 2",
        description: "Gather latest information on AI developments",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        priority: "medium",
        status: "pending",
        completedAt: null,
        proofUrl: null,
        createdAt: new Date(),
      },
      {
        id: 3,
        okrId: 1,
        title: "Complete React project setup",
        description: "Initialize React project with TypeScript",
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        priority: "low",
        status: "completed",
        completedAt: new Date(),
        proofUrl: "https://github.com/user/react-setup",
        createdAt: new Date(),
      },
      {
        id: 4,
        okrId: 1,
        title: "Update LinkedIn profile",
        description: "Add new skills and recent projects",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        priority: "low",
        status: "pending",
        completedAt: null,
        proofUrl: null,
        createdAt: new Date(),
      },
    ];

    tasks1.forEach(task => this.tasks.set(task.id, task as Task));

    // Sample reminders
    const sampleReminders = [
      {
        id: 1,
        taskId: 1,
        message: "Article 1 Deadline - Write 500 words - due tomorrow",
        deliveryMethod: "email",
        status: "sent",
        scheduledFor: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: 2,
        taskId: 2,
        message: "Research Task - AI trends research - due in 3 days",
        deliveryMethod: "dashboard",
        status: "viewed",
        scheduledFor: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: 3,
        taskId: 4,
        message: "Weekly Review - Review progress and plan next week",
        deliveryMethod: "dashboard",
        status: "pending",
        scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Friday
        sentAt: null,
        createdAt: new Date(),
      },
    ];

    sampleReminders.forEach(reminder => this.reminders.set(reminder.id, reminder as Reminder));

    this.currentOkrId = 3;
    this.currentTaskId = 5;
    this.currentReminderId = 4;
  }

  async createOkr(insertOkr: InsertOkr): Promise<Okr> {
    const id = this.currentOkrId++;
    const okr: Okr = {
      ...insertOkr,
      id,
      status: "active",
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.okrs.set(id, okr);
    return okr;
  }

  async getOkrs(): Promise<OkrWithTasks[]> {
    const okrsWithTasks: OkrWithTasks[] = [];
    
    for (const okr of this.okrs.values()) {
      const tasks = Array.from(this.tasks.values()).filter(task => task.okrId === okr.id);
      const completedTasks = tasks.filter(task => task.status === "completed").length;
      
      okrsWithTasks.push({
        ...okr,
        tasks,
        completedTasks,
        totalTasks: tasks.length,
      });
    }
    
    return okrsWithTasks;
  }

  async getOkr(id: number): Promise<OkrWithTasks | undefined> {
    const okr = this.okrs.get(id);
    if (!okr) return undefined;
    
    const tasks = Array.from(this.tasks.values()).filter(task => task.okrId === id);
    const completedTasks = tasks.filter(task => task.status === "completed").length;
    
    return {
      ...okr,
      tasks,
      completedTasks,
      totalTasks: tasks.length,
    };
  }

  async updateOkrProgress(id: number, progress: number): Promise<void> {
    const okr = this.okrs.get(id);
    if (okr) {
      okr.progress = progress;
      okr.updatedAt = new Date();
      this.okrs.set(id, okr);
    }
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...insertTask,
      id,
      status: "pending",
      completedAt: null,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByOkr(okrId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.okrId === okrId);
  }

  async getTask(id: number): Promise<TaskWithReminders | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const reminders = Array.from(this.reminders.values()).filter(reminder => reminder.taskId === id);
    
    return {
      ...task,
      reminders,
    };
  }

  async updateTask(id: number, updates: UpdateTask): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async completeTask(id: number, proofUrl?: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const completedTask = {
      ...task,
      status: "completed" as const,
      completedAt: new Date(),
      proofUrl: proofUrl || null,
    };
    
    this.tasks.set(id, completedTask);
    
    // Update OKR progress
    const okrTasks = Array.from(this.tasks.values()).filter(t => t.okrId === task.okrId);
    const completedCount = okrTasks.filter(t => t.status === "completed").length;
    const progress = Math.round((completedCount / okrTasks.length) * 100);
    
    await this.updateOkrProgress(task.okrId, progress);
    
    return completedTask;
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.currentReminderId++;
    const reminder: Reminder = {
      ...insertReminder,
      id,
      status: "pending",
      sentAt: null,
      createdAt: new Date(),
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async getReminders(): Promise<Reminder[]> {
    return Array.from(this.reminders.values());
  }

  async getUpcomingReminders(): Promise<Reminder[]> {
    const now = new Date();
    const upcoming = Array.from(this.reminders.values())
      .filter(reminder => reminder.scheduledFor > now)
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    
    return upcoming.slice(0, 10); // Return next 10 reminders
  }

  async updateReminderStatus(id: number, status: string): Promise<void> {
    const reminder = this.reminders.get(id);
    if (reminder) {
      reminder.status = status;
      if (status === "sent") {
        reminder.sentAt = new Date();
      }
      this.reminders.set(id, reminder);
    }
  }
}

export const storage = new MemStorage();
