import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOkrSchema, insertTaskSchema, updateTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // OKR routes
  app.get("/api/okrs", async (req, res) => {
    try {
      const okrs = await storage.getOkrs();
      res.json(okrs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch OKRs" });
    }
  });

  app.get("/api/okrs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const okr = await storage.getOkr(id);
      if (!okr) {
        return res.status(404).json({ error: "OKR not found" });
      }
      res.json(okr);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch OKR" });
    }
  });

  app.post("/api/okrs", async (req, res) => {
    try {
      const validatedData = insertOkrSchema.parse(req.body);
      const okr = await storage.createOkr(validatedData);
      
      // Generate micro-tasks (simplified AI parsing simulation)
      const tasks = await generateMicroTasks(okr.id, validatedData.description);
      
      res.json({ okr, tasks });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid OKR data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create OKR" });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid task data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateTaskSchema.parse(req.body);
      const task = await storage.updateTask(id, validatedData);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid task data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.post("/api/tasks/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { proofUrl } = req.body;
      const task = await storage.completeTask(id, proofUrl);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete task" });
    }
  });

  // Reminder routes
  app.get("/api/reminders", async (req, res) => {
    try {
      const reminders = await storage.getReminders();
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reminders" });
    }
  });

  app.get("/api/reminders/upcoming", async (req, res) => {
    try {
      const reminders = await storage.getUpcomingReminders();
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming reminders" });
    }
  });

  app.patch("/api/reminders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateReminderStatus(id, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update reminder status" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const okrs = await storage.getOkrs();
      const tasks = await storage.getTasks();
      const reminders = await storage.getUpcomingReminders();

      const activeOkrs = okrs.filter(okr => okr.status === "active").length;
      const completedTasks = tasks.filter(task => task.status === "completed").length;
      const overallProgress = okrs.length > 0 
        ? Math.round(okrs.reduce((sum, okr) => sum + okr.progress, 0) / okrs.length)
        : 0;

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weeklyTasks = tasks.filter(task => task.createdAt >= weekStart);
      const weeklyCompletedTasks = weeklyTasks.filter(task => task.status === "completed").length;

      const monthStart = new Date();
      monthStart.setDate(1);
      const monthlyTasks = tasks.filter(task => task.createdAt >= monthStart);
      const monthlyCompletedTasks = monthlyTasks.filter(task => task.status === "completed").length;

      res.json({
        activeOkrs,
        completedTasks,
        overallProgress,
        weeklyProgress: {
          completed: weeklyCompletedTasks,
          total: weeklyTasks.length,
          percentage: weeklyTasks.length > 0 ? Math.round((weeklyCompletedTasks / weeklyTasks.length) * 100) : 0
        },
        monthlyProgress: {
          completed: monthlyCompletedTasks,
          total: monthlyTasks.length,
          percentage: monthlyTasks.length > 0 ? Math.round((monthlyCompletedTasks / monthlyTasks.length) * 100) : 0
        },
        upcomingReminders: reminders.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simplified AI parsing simulation for generating micro-tasks
async function generateMicroTasks(okrId: number, description: string) {
  const tasks = [];
  const now = new Date();
  
  // Basic pattern matching for common OKR types
  if (description.toLowerCase().includes("article") || description.toLowerCase().includes("blog")) {
    const articleCount = extractNumber(description) || 3;
    for (let i = 1; i <= articleCount; i++) {
      tasks.push({
        okrId,
        title: `Write article ${i}`,
        description: `Research, write, and publish article ${i}`,
        deadline: new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000), // Weekly intervals
        priority: i <= 2 ? "high" : "medium",
      });
      
      tasks.push({
        okrId,
        title: `Research for article ${i}`,
        description: `Gather information and sources for article ${i}`,
        deadline: new Date(now.getTime() + (i * 7 - 2) * 24 * 60 * 60 * 1000), // 2 days before writing
        priority: "medium",
      });
    }
  } else if (description.toLowerCase().includes("project") || description.toLowerCase().includes("coding")) {
    const projectCount = extractNumber(description) || 5;
    for (let i = 1; i <= projectCount; i++) {
      tasks.push({
        okrId,
        title: `Complete project ${i}`,
        description: `Build and deploy project ${i}`,
        deadline: new Date(now.getTime() + i * 14 * 24 * 60 * 60 * 1000), // Bi-weekly intervals
        priority: i <= 2 ? "high" : "medium",
      });
    }
  } else {
    // Generic task breakdown
    tasks.push({
      okrId,
      title: "Plan and research",
      description: "Break down the objective and research requirements",
      deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      priority: "high",
    });
    
    tasks.push({
      okrId,
      title: "Execute core work",
      description: "Complete the main deliverables",
      deadline: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      priority: "high",
    });
    
    tasks.push({
      okrId,
      title: "Review and finalize",
      description: "Review progress and finalize deliverables",
      deadline: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
      priority: "medium",
    });
  }

  // Create tasks in storage
  const createdTasks = [];
  for (const taskData of tasks) {
    const task = await storage.createTask(taskData);
    createdTasks.push(task);
  }

  return createdTasks;
}

function extractNumber(text: string): number | null {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}
