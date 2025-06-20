import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, ExternalLink, Trophy, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TaskWithReminders } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime, getPriorityColor, createCelebrationParticles } from "@/lib/utils";
import { fadeIn, slideUp, scaleIn, celebrate } from "@/lib/animations";

interface CompletionForm {
  proofUrl?: string;
  confirmed: boolean;
}

const TaskCompletion = () => {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const taskId = params.id ? parseInt(params.id) : null;

  const form = useForm<CompletionForm>({
    defaultValues: {
      proofUrl: "",
      confirmed: false,
    },
  });

  // Fetch task details
  const { data: task, isLoading } = useQuery<TaskWithReminders>({
    queryKey: [`/api/tasks/${taskId}`],
    enabled: !!taskId,
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (data: { proofUrl?: string }) => {
      return apiRequest("POST", `/api/tasks/${taskId}/complete`, data);
    },
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/okrs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      // Create celebration effect
      setTimeout(() => {
        const container = document.querySelector('.completion-container');
        if (container) {
          createCelebrationParticles(container as HTMLElement, 12);
        }
      }, 500);

      toast({
        title: "Task completed! 🎉",
        description: "Congratulations on completing another task!",
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

  const handleSubmit = (data: CompletionForm) => {
    if (!data.confirmed) {
      toast({
        title: "Confirmation required",
        description: "Please confirm that the task has been completed.",
        variant: "destructive",
      });
      return;
    }

    completeTaskMutation.mutate({
      proofUrl: data.proofUrl || undefined,
    });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-6 pb-6 relative z-10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen pt-20 px-6 pb-6 relative z-10 flex items-center justify-center">
        <Card className="glass-card rounded-3xl p-8 max-w-md w-full">
          <CardContent className="text-center p-0">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Task Not Found</h2>
            <p className="text-gray-600 mb-6">The task you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <motion.div
        className="min-h-screen pt-20 px-6 pb-6 relative z-10 flex items-center justify-center completion-container"
        variants={fadeIn}
        initial="initial"
        animate="animate"
      >
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
        >
          <Card className="glass-card rounded-3xl p-12 max-w-lg w-full text-center">
            <CardContent className="p-0">
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6"
                variants={celebrate}
                animate="animate"
              >
                <Trophy className="text-white text-3xl" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Task Completed! 🎉</h2>
              <p className="text-gray-600 text-lg mb-2">Great job on completing:</p>
              <p className="font-semibold text-gray-800 mb-6">"{task.title}"</p>
              
              {form.getValues("proofUrl") && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-emerald-800 mb-2">Proof submitted:</p>
                  <a
                    href={form.getValues("proofUrl")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Proof
                  </a>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate("/")}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  >
                    Back to Dashboard
                  </Button>
                </motion.div>
                
                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="w-full"
                  >
                    View All Tasks
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen pt-20 px-6 pb-6 relative z-10"
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <motion.div
          className="flex items-center space-x-4 mb-8"
          variants={slideUp}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="glass-effect text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Complete Task</h1>
            <p className="text-white/80">Mark your task as completed and provide proof</p>
          </div>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
        >
          <Card className="glass-card rounded-3xl p-8">
            <CardContent className="p-0">
              
              {/* Task Details */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{task.title}</h2>
                    {task.description && (
                      <p className="text-gray-600 mb-4">{task.description}</p>
                    )}
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500 ml-4" />
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-gray-500">
                    <span>Due: {formatRelativeTime(new Date(task.deadline))}</span>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </Badge>
                </div>
              </div>

              <Separator className="mb-8" />

              {/* Completion Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  
                  {/* Proof URL */}
                  <FormField
                    control={form.control}
                    name="proofUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-lg font-semibold">
                          <ExternalLink className="w-5 h-5 mr-2 text-indigo-600" />
                          Proof URL (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://github.com/user/repo or https://linkedin.com/post"
                            className="text-base py-3 font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Link to GitHub commit, LinkedIn post, published article, or other proof of completion
                        </FormDescription>
                        {field.value && isValidUrl(field.value) && (
                          <div className="flex items-center text-sm text-emerald-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Valid URL provided
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirmation Checkbox */}
                  <FormField
                    control={form.control}
                    name="confirmed"
                    render={({ field }) => (
                      <FormItem>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-start space-x-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="flex-1">
                              <FormLabel className="text-base font-medium text-gray-800 cursor-pointer">
                                I confirm this task has been completed
                              </FormLabel>
                              <p className="text-sm text-gray-600 mt-1">
                                By checking this box, you're confirming that you have successfully completed 
                                the task according to its requirements and objectives.
                              </p>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Buttons */}
                  <div className="flex space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/")}
                      className="flex-1 py-3"
                      disabled={completeTaskMutation.isPending}
                    >
                      Cancel
                    </Button>
                    
                    <motion.div 
                      className="flex-1"
                      whileHover={{ scale: form.watch("confirmed") ? 1.02 : 1 }}
                      whileTap={{ scale: form.watch("confirmed") ? 0.98 : 1 }}
                    >
                      <Button
                        type="submit"
                        disabled={!form.watch("confirmed") || completeTaskMutation.isPending}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3"
                      >
                        {completeTaskMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Completing Task...
                          </>
                        ) : (
                          <>
                            <Trophy className="w-4 h-4 mr-2" />
                            Complete Task
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TaskCompletion;
