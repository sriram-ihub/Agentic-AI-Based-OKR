import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Target, CheckSquare, TrendingUp, Bell, Calendar, Award, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TaskCard from "@/components/task-card";
import ReminderCard from "@/components/reminder-card";
import ProgressChart from "@/components/progress-chart";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { fadeIn, slideUp, staggerContainer, staggerItem, bounce, cardHover } from "@/lib/animations";
import { OkrWithTasks, Task, Reminder } from "@shared/schema";
import { useState } from "react";

interface DashboardStats {
  activeOkrs: number;
  completedTasks: number;
  overallProgress: number;
  weeklyProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  monthlyProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  upcomingReminders: number;
}

const Dashboard = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [taskFilter, setTaskFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: okrs, isLoading: okrsLoading } = useQuery<OkrWithTasks[]>({
    queryKey: ["/api/okrs"],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: reminders, isLoading: remindersLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  // Mutations
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("POST", `/api/tasks/${taskId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/okrs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Task completed! 🎉",
        description: "Great job on completing another task!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      return apiRequest("PATCH", `/api/tasks/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/okrs"] });
    },
  });

  // Filter tasks
  const filteredTasks = tasks?.filter(task => {
    if (taskFilter === "pending" && task.status !== "pending") return false;
    if (taskFilter === "completed" && task.status !== "completed") return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    return true;
  });

  // Get today's tasks
  const todaysTasks = filteredTasks?.filter(task => {
    const deadline = new Date(task.deadline);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return deadline <= tomorrow && task.status === "pending";
  });

  const handleCompleteTask = (id: number) => {
    completeTaskMutation.mutate(id);
  };

  const handleUpdateTask = (id: number, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ id, updates });
  };

  const handleStatusChange = (id: number, status: string) => {
    // Update reminder status (would be implemented with mutation)
    console.log("Update reminder status:", id, status);
  };

  if (statsLoading || okrsLoading || tasksLoading || remindersLoading) {
    return (
      <div className="min-h-screen pt-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Loading skeletons */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-3xl p-6">
                <div className="skeleton h-4 w-3/4 mb-4"></div>
                <div className="skeleton h-8 w-1/2 mb-2"></div>
                <div className="skeleton h-3 w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen pt-20 px-6 pb-6 relative z-10"
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation */}
        <motion.nav 
          className="glass-effect fixed top-0 left-0 right-0 z-50 px-6 py-4"
          variants={slideUp}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-bold text-white">OKR Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative">
                <Bell className="w-4 h-4" />
                {stats && stats.upcomingReminders > 0 && (
                  <motion.span 
                    className="notification-badge absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </Button>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <motion.div
          className="glass-card rounded-3xl p-8 mb-8"
          variants={slideUp}
          initial="initial"
          animate="animate"
        >
          <div className="text-center">
            <motion.h2 
              className="text-4xl font-bold gradient-text mb-4"
              variants={bounce}
              animate="animate"
            >
              Welcome Back, Student! 🎯
            </motion.h2>
            <p className="text-gray-600 text-lg mb-6">Track your objectives, complete tasks, and achieve your goals</p>
            
            {stats && (
              <motion.div 
                className="flex justify-center space-x-8"
                variants={staggerContainer}
                animate="animate"
              >
                <motion.div className="text-center" variants={staggerItem}>
                  <div className="text-3xl font-bold text-indigo-600">{stats.activeOkrs}</div>
                  <div className="text-sm text-gray-500">Active OKRs</div>
                </motion.div>
                <motion.div className="text-center" variants={staggerItem}>
                  <div className="text-3xl font-bold text-emerald-600">{stats.completedTasks}</div>
                  <div className="text-sm text-gray-500">Completed Tasks</div>
                </motion.div>
                <motion.div className="text-center" variants={staggerItem}>
                  <div className="text-3xl font-bold text-purple-600">{stats.overallProgress}%</div>
                  <div className="text-sm text-gray-500">Overall Progress</div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={cardHover} whileHover="hover">
            <Button
              onClick={() => navigate("/okr/new")}
              className="glass-card w-full h-24 p-4 text-center bg-transparent hover:bg-white/10 border border-white/20 text-gray-800 hover:text-gray-900"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Plus className="text-white text-sm" />
                </div>
                <span className="text-sm font-medium">New OKR</span>
              </div>
            </Button>
          </motion.div>

          <motion.div variants={cardHover} whileHover="hover">
            <Button className="glass-card w-full h-24 p-4 text-center bg-transparent hover:bg-white/10 border border-white/20 text-gray-800 hover:text-gray-900">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <CheckSquare className="text-white text-sm" />
                </div>
                <span className="text-sm font-medium">My Tasks</span>
              </div>
            </Button>
          </motion.div>

          <motion.div variants={cardHover} whileHover="hover">
            <Button className="glass-card w-full h-24 p-4 text-center bg-transparent hover:bg-white/10 border border-white/20 text-gray-800 hover:text-gray-900">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white text-sm" />
                </div>
                <span className="text-sm font-medium">Progress</span>
              </div>
            </Button>
          </motion.div>

          <motion.div variants={cardHover} whileHover="hover">
            <Button className="glass-card w-full h-24 p-4 text-center bg-transparent hover:bg-white/10 border border-white/20 text-gray-800 hover:text-gray-900">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Bell className="text-white text-sm" />
                </div>
                <span className="text-sm font-medium">Reminders</span>
              </div>
            </Button>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - OKRs and Tasks */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active OKRs */}
            <motion.div 
              className="glass-card rounded-3xl p-6"
              variants={slideUp}
              initial="initial"
              animate="animate"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Active OKRs</h3>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                  {okrs?.filter(okr => okr.status === "active").length || 0} Active
                </Badge>
              </div>
              
              <AnimatePresence>
                <motion.div 
                  className="space-y-4"
                  variants={staggerContainer}
                  animate="animate"
                >
                  {okrs?.filter(okr => okr.status === "active").map((okr) => (
                    <motion.div
                      key={okr.id}
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
                      variants={staggerItem}
                      whileHover={{ scale: 1.02 }}
                      layout
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">{okr.title}</h4>
                          <p className="text-sm text-gray-600">
                            Timeline: {new Date(okr.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">{okr.progress}%</div>
                          <div className="text-xs text-gray-500">Complete</div>
                        </div>
                      </div>
                      
                      <Progress value={okr.progress} className="mb-4" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {okr.completedTasks} of {okr.totalTasks} tasks completed
                        </span>
                        <Badge 
                          variant={okr.progress >= 70 ? "default" : "secondary"}
                          className={okr.progress >= 70 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}
                        >
                          {okr.progress >= 70 ? "On Track 🎯" : "Needs Attention ⚠️"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Task Dashboard */}
            <motion.div 
              className="glass-card rounded-3xl p-6"
              variants={slideUp}
              initial="initial"
              animate="animate"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Today's Tasks</h3>
                <div className="flex space-x-2">
                  <Select value={taskFilter} onValueChange={setTaskFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <AnimatePresence>
                <motion.div 
                  className="space-y-3"
                  variants={staggerContainer}
                  animate="animate"
                >
                  {todaysTasks?.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                      onUpdate={handleUpdateTask}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate("/okr/new")}
                  className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Task
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column - Progress and Reminders */}
          <div className="space-y-8">
            
            {/* Progress Overview */}
            <motion.div 
              className="glass-card rounded-3xl p-6"
              variants={slideUp}
              initial="initial"
              animate="animate"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Progress Overview</h3>
              
              {stats && (
                <ProgressChart
                  overallProgress={stats.overallProgress}
                  weeklyProgress={stats.weeklyProgress}
                  monthlyProgress={stats.monthlyProgress}
                />
              )}
            </motion.div>

            {/* Reminder Center */}
            <motion.div 
              className="glass-card rounded-3xl p-6"
              variants={slideUp}
              initial="initial"
              animate="animate"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Upcoming Reminders</h3>
                {stats && stats.upcomingReminders > 0 && (
                  <Badge variant="destructive" className="notification-badge">
                    {stats.upcomingReminders}
                  </Badge>
                )}
              </div>

              <AnimatePresence>
                <motion.div 
                  className="space-y-4"
                  variants={staggerContainer}
                  animate="animate"
                >
                  {reminders?.slice(0, 3).map(reminder => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Achievement Badges */}
            <motion.div 
              className="glass-card rounded-3xl p-6"
              variants={slideUp}
              initial="initial"
              animate="animate"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Achievements</h3>
              
              <motion.div 
                className="grid grid-cols-2 gap-4"
                variants={staggerContainer}
                animate="animate"
              >
                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200"
                  variants={staggerItem}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="text-sm font-medium text-gray-800">Task Master</div>
                  <div className="text-xs text-gray-500">10 tasks completed</div>
                </motion.div>
                
                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                  variants={staggerItem}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-sm font-medium text-gray-800">On Target</div>
                  <div className="text-xs text-gray-500">75% OKR progress</div>
                </motion.div>
                
                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200"
                  variants={staggerItem}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-sm font-medium text-gray-800">Speed Demon</div>
                  <div className="text-xs text-gray-500">5 tasks in one day</div>
                </motion.div>
                
                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                  variants={staggerItem}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-sm font-medium text-gray-800">Streak</div>
                  <div className="text-xs text-gray-500">7 days active</div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
