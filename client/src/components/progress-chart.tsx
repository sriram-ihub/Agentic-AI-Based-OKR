import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface ProgressChartProps {
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
}

const ProgressChart = ({ overallProgress, weeklyProgress, monthlyProgress }: ProgressChartProps) => {
  const pieData = [
    { name: "Completed", value: overallProgress, color: "#10B981" },
    { name: "Remaining", value: 100 - overallProgress, color: "#E5E7EB" },
  ];

  const barData = [
    {
      name: "This Week",
      completed: weeklyProgress.completed,
      total: weeklyProgress.total,
      percentage: weeklyProgress.percentage,
    },
    {
      name: "This Month",
      completed: monthlyProgress.completed,
      total: monthlyProgress.total,
      percentage: monthlyProgress.percentage,
    },
  ];

  const circumference = 2 * Math.PI * 56;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Circular Progress */}
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center">
          <motion.svg 
            className="w-32 h-32 transform -rotate-90"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="progress-ring"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1"/>
                <stop offset="100%" stopColor="#8B5CF6"/>
              </linearGradient>
            </defs>
          </motion.svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div 
                className="text-3xl font-bold gradient-text"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                {overallProgress}%
              </motion.div>
              <div className="text-sm text-gray-500">Overall</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">This Week</span>
          <span className="font-medium text-emerald-600">
            {weeklyProgress.completed}/{weeklyProgress.total} tasks
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${weeklyProgress.percentage}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
          />
        </div>
      </motion.div>

      {/* Monthly Progress */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">This Month</span>
          <span className="font-medium text-indigo-600">
            {monthlyProgress.completed}/{monthlyProgress.total} tasks
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${monthlyProgress.percentage}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 1 }}
          />
        </div>
      </motion.div>

      {/* Pie Chart */}
      <motion.div 
        className="h-48"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default ProgressChart;
