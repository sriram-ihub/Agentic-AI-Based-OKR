import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Target, Clock, Flag, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { insertOkrSchema, InsertOkr } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { fadeIn, slideUp, scaleIn, celebrate } from "@/lib/animations";

type SubmissionState = "form" | "processing" | "parsed" | "success";

interface ParsedOkr {
  objective: string;
  deliverables: string[];
  timeline: string;
  tasks: Array<{
    title: string;
    description: string;
    deadline: string;
    priority: string;
  }>;
}

const OkrSubmission = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submissionState, setSubmissionState] = useState<SubmissionState>("form");
  const [parsedOkr, setParsedOkr] = useState<ParsedOkr | null>(null);

  const form = useForm<InsertOkr>({
    resolver: zodResolver(insertOkrSchema),
    defaultValues: {
      title: "",
      description: "",
      targetDate: new Date(),
      priority: "medium",
    },
  });

  const createOkrMutation = useMutation({
    mutationFn: async (data: InsertOkr) => {
      return apiRequest("POST", "/api/okrs", data);
    },
    onSuccess: (response) => {
      setSubmissionState("processing");
      
      // Simulate parsing process
      setTimeout(() => {
        const mockParsed: ParsedOkr = {
          objective: form.getValues("title"),
          deliverables: extractDeliverables(form.getValues("description")),
          timeline: form.getValues("targetDate").toLocaleDateString(),
          tasks: response.tasks || []
        };
        setParsedOkr(mockParsed);
        setSubmissionState("parsed");
        
        // Auto advance to success after showing parsed results
        setTimeout(() => {
          setSubmissionState("success");
          queryClient.invalidateQueries({ queryKey: ["/api/okrs"] });
          queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        }, 3000);
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create OKR. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertOkr) => {
    createOkrMutation.mutate(data);
  };

  const extractDeliverables = (description: string): string[] => {
    // Simple extraction logic - in a real app this would be more sophisticated
    const matches = description.match(/\d+/g);
    const count = matches ? parseInt(matches[0]) : 3;
    
    if (description.toLowerCase().includes("article") || description.toLowerCase().includes("blog")) {
      return Array.from({ length: count }, (_, i) => `Article ${i + 1}`);
    } else if (description.toLowerCase().includes("project")) {
      return Array.from({ length: count }, (_, i) => `Project ${i + 1}`);
    }
    
    return ["Research and Planning", "Core Development", "Review and Finalization"];
  };

  return (
    <motion.div
      className="min-h-screen pt-20 px-6 pb-6 relative z-10"
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-4xl mx-auto">
        
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
            <h1 className="text-3xl font-bold text-white">Create New OKR</h1>
            <p className="text-white/80">Define your objective and let AI generate actionable tasks</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {submissionState === "form" && (
            <motion.div
              key="form"
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Card className="glass-card rounded-3xl p-8">
                <CardContent className="p-0">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      
                      {/* OKR Title */}
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-lg font-semibold">
                              <Target className="w-5 h-5 mr-2 text-indigo-600" />
                              Objective Title
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Publish 3 AI articles by Q4"
                                className="text-lg py-3"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              A clear and concise statement of what you want to achieve
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* OKR Description */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-lg font-semibold">
                              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                              Detailed Description
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your objective in detail. Include specific deliverables, success criteria, and any relevant context. The more detail you provide, the better AI can generate actionable micro-tasks."
                                className="min-h-32 text-base resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Our AI will analyze this description to generate micro-tasks and timelines
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Target Date and Priority */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="targetDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center font-semibold">
                                <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                                Target Date
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="py-3"
                                  {...field}
                                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                                  onChange={(e) => field.onChange(new Date(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center font-semibold">
                                <Flag className="w-4 h-4 mr-2 text-amber-600" />
                                Priority Level
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="py-3">
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="high">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                      High Priority
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="medium">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                      Medium Priority
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="low">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                      Low Priority
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Submit Button */}
                      <motion.div
                        className="pt-6"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          disabled={createOkrMutation.isPending}
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-xl text-lg"
                        >
                          {createOkrMutation.isPending ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Creating OKR...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-2" />
                              Parse & Create OKR
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {submissionState === "processing" && (
            <motion.div
              key="processing"
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center py-16"
            >
              <Card className="glass-card rounded-3xl p-12">
                <CardContent className="p-0">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-6"
                  />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Processing Your OKR... 🧠</h3>
                  <p className="text-gray-600 text-lg">
                    Our AI is analyzing your objective and generating actionable micro-tasks
                  </p>
                  <motion.div
                    className="flex justify-center space-x-2 mt-6"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {submissionState === "parsed" && parsedOkr && (
            <motion.div
              key="parsed"
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Card className="glass-card rounded-3xl p-8">
                <CardContent className="p-0">
                  <div className="text-center mb-8">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4"
                      variants={celebrate}
                      animate="animate"
                    >
                      <CheckCircle className="text-white text-2xl" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">OKR Successfully Parsed! 🎉</h3>
                    <p className="text-gray-600">Here's how we've structured your objective:</p>
                  </div>

                  <div className="space-y-6">
                    {/* Objective */}
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                      <h4 className="font-semibold text-indigo-800 mb-2">📋 Objective</h4>
                      <p className="text-gray-700">{parsedOkr.objective}</p>
                    </div>

                    {/* Deliverables */}
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                      <h4 className="font-semibold text-purple-800 mb-3">🎯 Key Deliverables</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedOkr.deliverables.map((deliverable, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                            {deliverable}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                      <h4 className="font-semibold text-emerald-800 mb-2">📅 Timeline</h4>
                      <p className="text-gray-700">Target completion: {parsedOkr.timeline}</p>
                    </div>

                    {/* Generated Tasks */}
                    <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                      <h4 className="font-semibold text-amber-800 mb-3">⚡ Generated Micro-Tasks</h4>
                      <p className="text-sm text-amber-700 mb-4">
                        {parsedOkr.tasks.length} actionable tasks have been created to help you achieve your objective
                      </p>
                      <div className="space-y-2">
                        {parsedOkr.tasks.slice(0, 3).map((task, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-700">{task.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {task.priority}
                            </Badge>
                          </div>
                        ))}
                        {parsedOkr.tasks.length > 3 && (
                          <p className="text-xs text-gray-500 mt-2">
                            + {parsedOkr.tasks.length - 3} more tasks...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {submissionState === "success" && (
            <motion.div
              key="success"
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center py-16"
            >
              <Card className="glass-card rounded-3xl p-12">
                <CardContent className="p-0">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    variants={celebrate}
                    animate="animate"
                  >
                    <CheckCircle className="text-white text-3xl" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">OKR Created Successfully! 🚀</h3>
                  <p className="text-gray-600 text-lg mb-8">
                    Your objective is now active with {parsedOkr?.tasks.length || 0} micro-tasks ready to tackle
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => navigate("/")}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl"
                      >
                        View Dashboard
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSubmissionState("form");
                          setParsedOkr(null);
                          form.reset();
                        }}
                        className="px-8 py-3 rounded-xl"
                      >
                        Create Another OKR
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OkrSubmission;
