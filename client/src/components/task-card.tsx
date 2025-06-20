import { motion } from "framer-motion";
import { Check, Clock, MoreVertical, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@shared/schema";
import { formatRelativeTime, getPriorityColor, createCelebrationParticles } from "@/lib/utils";
import { cardHover, celebrate } from "@/lib/animations";
import { useLocation } from "wouter";

interface TaskCardProps {
  task: Task;
  onComplete: (id: number) => void;
  onUpdate: (id: number, updates: Partial<Task>) => void;
}

const TaskCard = ({ task, onComplete, onUpdate }: TaskCardProps) => {
  const [, navigate] = useLocation();
  const isCompleted = task.status === "completed";
  const isOverdue = !isCompleted && new Date(task.deadline) < new Date();

  const handleCheckboxChange = (checked: boolean) => {
    if (checked && !isCompleted) {
      // Navigate to completion page for proof submission
      navigate(`/task/${task.id}/complete`);
    }
  };

  const handleComplete = () => {
    if (!isCompleted) {
      onComplete(task.id);
      // Create celebration effect
      setTimeout(() => {
        const card = document.querySelector(`[data-task-id="${task.id}"]`);
        if (card) {
          createCelebrationParticles(card as HTMLElement);
        }
      }, 100);
    }
  };

  return (
    <motion.div
      data-task-id={task.id}
      className={`task-card ${isCompleted ? 'completed-task' : 'bg-white'} ${
        task.priority === 'high' ? 'priority-high' : 
        task.priority === 'medium' ? 'priority-medium' : 'priority-low'
      } rounded-xl p-4 shadow-sm hover:shadow-md`}
      variants={cardHover}
      whileHover="hover"
      layout
    >
      <div className="flex items-center space-x-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleCheckboxChange}
            className={`w-5 h-5 border-2 ${
              task.priority === 'high' ? 'border-red-400' :
              task.priority === 'medium' ? 'border-amber-400' : 'border-emerald-400'
            } ${isCompleted ? 'bg-emerald-500 border-emerald-500' : ''}`}
          />
        </motion.div>

        <div className="flex-1">
          <h4 className={`font-medium ${isCompleted ? 'text-white line-through' : 'text-gray-800'}`}>
            {task.title}
          </h4>
          <div className="flex items-center space-x-4 text-sm mt-1">
            <span className={`flex items-center ${isCompleted ? 'text-emerald-100' : 'text-gray-500'}`}>
              <Clock className="w-3 h-3 mr-1" />
              {isCompleted ? 'Completed' : formatRelativeTime(new Date(task.deadline))}
            </span>
            <Badge
              variant="secondary"
              className={`text-xs ${isCompleted ? 'bg-emerald-400 text-emerald-900' : ''} ${
                !isCompleted ? getPriorityColor(task.priority) : ''
              }`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Badge>
            {isOverdue && !isCompleted && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
          {task.description && (
            <p className={`text-sm mt-1 ${isCompleted ? 'text-emerald-100' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isCompleted && (
            <motion.div
              variants={celebrate}
              animate="animate"
            >
              <Trophy className="w-5 h-5 text-yellow-300" />
            </motion.div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isCompleted && (
                <DropdownMenuItem onClick={handleComplete}>
                  <Check className="w-4 h-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate(`/task/${task.id}/complete`)}>
                Edit Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
