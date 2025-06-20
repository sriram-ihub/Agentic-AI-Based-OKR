import { motion } from "framer-motion";
import { Clock, Mail, Monitor, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reminder } from "@shared/schema";
import { formatRelativeTime } from "@/lib/utils";
import { slideUp } from "@/lib/animations";

interface ReminderCardProps {
  reminder: Reminder;
  onStatusChange: (id: number, status: string) => void;
}

const ReminderCard = ({ reminder, onStatusChange }: ReminderCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-50 border-green-200";
      case "viewed":
        return "bg-blue-50 border-blue-200";
      case "pending":
        return "bg-amber-50 border-amber-200";
      case "skipped":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "viewed":
        return <Info className="w-4 h-4 text-blue-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-600" />;
      case "skipped":
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (message: string) => {
    if (message.toLowerCase().includes("deadline") || message.toLowerCase().includes("due tomorrow")) {
      return "bg-red-50 border-red-200";
    } else if (message.toLowerCase().includes("due in")) {
      return "bg-amber-50 border-amber-200";
    }
    return "bg-blue-50 border-blue-200";
  };

  return (
    <motion.div
      className={`rounded-xl p-4 border transition-all hover:shadow-md ${getPriorityColor(reminder.message)}`}
      variants={slideUp}
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
          {getStatusIcon(reminder.status)}
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-800 mb-1">
            {reminder.message.split(' - ')[0]}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            {reminder.message.split(' - ').slice(1).join(' - ')}
          </p>
          
          <div className="flex items-center space-x-2 text-xs">
            <Badge variant="secondary" className={getStatusColor(reminder.status)}>
              {reminder.deliveryMethod === "email" ? (
                <Mail className="w-3 h-3 mr-1" />
              ) : (
                <Monitor className="w-3 h-3 mr-1" />
              )}
              {reminder.deliveryMethod === "email" ? "Email Sent" : "Dashboard"}
            </Badge>
            
            <span className="text-gray-500">
              {reminder.status === "sent" && reminder.sentAt ? 
                formatRelativeTime(new Date(reminder.sentAt)) :
                formatRelativeTime(new Date(reminder.scheduledFor))
              }
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReminderCard;
