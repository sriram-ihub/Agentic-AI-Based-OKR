import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Target, Flag, CheckCircle, Loader2 } from "lucide-react";
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
      priority: "medium",
    },
  });

  const extractDeliverables = (description: string): string[] => {
    const matches = description.match(/\d+/g);
    const count = matches ? parseInt(matches[0]) : 3;
    
    if (description.toLowerCase().includes("article") || description.toLowerCase().includes("blog")) {
      return Array.from({ length: count }, (_, i) => `Article ${i + 1}`);
    } else if (description.toLowerCase().includes("project")) {
      return Array.from({ length: count }, (_, i) => `Project ${i + 1}`);
    }
    return ["Research", "Development", "Review"];
  };

  const createOkrMutation = useMutation({
    mutationFn: async (data: InsertOkr) => {
      // Mock response for development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        return {
          okr: {
            ...data,
            tasks: [
              {
                title: "Research phase",
                description: "Initial research and planning",
                deadline: new Date(Date.now() + 12096e5).toISOString().split('T')[0], // 2 weeks from now
                priority: "high"
              },
              {
                title: "Implementation",
                description: "Core development work",
                deadline: new Date(Date.now() + 24192e5).toISOString().split('T')[0], // 4 weeks from now
                priority: "medium"
              }
            ]
          },
          parsed: {
            objective: data.title,
            deliverables: extractDeliverables(data.description),
            timeline: "Q" + Math.ceil((new Date().getMonth() + 4) / 3) + " " + new Date().getFullYear()
          }
        };
      }

      // Real API call
      const response = await apiRequest("POST", "/api/okrs", data);
      if (!response.ok) throw new Error('API request failed');
      return response.json();
    },
    onSuccess: (result) => {
      setSubmissionState("processing");
      setTimeout(() => {
        setParsedOkr({
          objective: result.parsed.objective,
          deliverables: result.parsed.deliverables,
          timeline: result.parsed.timeline,
          tasks: result.okr.tasks || []
        });
        setSubmissionState("parsed");
        setTimeout(() => {
          setSubmissionState("success");
          queryClient.invalidateQueries({ queryKey: ["/api/okrs"] });
          queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        }, 2000);
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create OKR",
        variant: "destructive",
      });
      setSubmissionState("form");
    }
  });

  const handleSubmit = (data: InsertOkr) => {
    createOkrMutation.mutate(data);
  };

  return (
    <motion.div
      className="min-h-screen pt-20 px-6 pb-6 relative z-10"
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div className="flex items-center space-x-4 mb-8" variants={slideUp}>
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
            <p className="text-white/80">Define your objective and key results</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {submissionState === "form" && (
            <motion.div key="form" variants={scaleIn} initial="initial" animate="animate" exit="exit">
              <Card className="glass-card rounded-3xl p-8">
                <CardContent className="p-0">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                placeholder="Describe your objective in detail..."
                                className="min-h-32 text-base resize-none"
                                {...field}
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
                                <SelectItem value="high">High Priority</SelectItem>
                                <SelectItem value="medium">Medium Priority</SelectItem>
                                <SelectItem value="low">Low Priority</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={createOkrMutation.isPending}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl text-lg"
                      >
                        {createOkrMutation.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Creating OKR...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Create OKR
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {submissionState === "processing" && (
            <motion.div key="processing" variants={scaleIn} className="text-center py-16">
              <Card className="glass-card rounded-3xl p-12">
                <CardContent className="p-0">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-6"
                  />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Processing Your OKR</h3>
                  <p className="text-gray-600 text-lg">Generating tasks and timeline...</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {submissionState === "parsed" && parsedOkr && (
            <motion.div key="parsed" variants={scaleIn}>
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
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">OKR Parsed Successfully</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                      <h4 className="font-semibold text-indigo-800 mb-2">Objective</h4>
                      <p className="text-gray-700">{parsedOkr.objective}</p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                      <h4 className="font-semibold text-purple-800 mb-3">Key Deliverables</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedOkr.deliverables.map((deliverable, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                            {deliverable}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                      <h4 className="font-semibold text-amber-800 mb-3">Generated Tasks</h4>
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
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {submissionState === "success" && (
            <motion.div key="success" variants={scaleIn} className="text-center py-16">
              <Card className="glass-card rounded-3xl p-12">
                <CardContent className="p-0">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    variants={celebrate}
                    animate="animate"
                  >
                    <CheckCircle className="text-white text-3xl" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">OKR Created!</h3>
                  <p className="text-gray-600 text-lg mb-8">
                    {parsedOkr?.tasks.length || 0} tasks generated
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => navigate("/")}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl"
                    >
                      View Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubmissionState("form");
                        form.reset();
                      }}
                      className="px-8 py-3 rounded-xl"
                    >
                      Create Another
                    </Button>
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