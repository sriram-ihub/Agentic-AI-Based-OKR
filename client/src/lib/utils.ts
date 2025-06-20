import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInHours < 1 && diffInHours > -1) {
    return diffInMs > 0 ? "Due soon" : "Overdue";
  } else if (diffInDays < 1 && diffInDays > -1) {
    const hours = Math.abs(Math.round(diffInHours));
    return diffInMs > 0 ? `Due in ${hours}h` : `${hours}h overdue`;
  } else if (Math.abs(diffInDays) < 7) {
    const days = Math.abs(Math.round(diffInDays));
    if (diffInMs > 0) {
      return days === 1 ? "Due tomorrow" : `Due in ${days} days`;
    } else {
      return days === 1 ? "Due yesterday" : `${days} days overdue`;
    }
  } else {
    return date.toLocaleDateString();
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "text-red-600 bg-red-100";
    case "medium":
      return "text-amber-600 bg-amber-100";
    case "low":
      return "text-emerald-600 bg-emerald-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case "completed":
      return "✅";
    case "pending":
      return "⏳";
    case "overdue":
      return "⚠️";
    default:
      return "📋";
  }
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function createCelebrationParticles(element: HTMLElement, count: number = 6): void {
  const rect = element.getBoundingClientRect();
  const colors = ['#10B981', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];
  
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.style.position = 'fixed';
      particle.style.left = rect.left + rect.width / 2 + 'px';
      particle.style.top = rect.top + rect.height / 2 + 'px';
      particle.style.width = '8px';
      particle.style.height = '8px';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '1000';
      
      const angle = (i * 60) * Math.PI / 180;
      const velocity = 100 + Math.random() * 50;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      document.body.appendChild(particle);
      
      let x = 0;
      let y = 0;
      let opacity = 1;
      
      const animate = () => {
        x += vx * 0.02;
        y += vy * 0.02;
        opacity -= 0.02;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
        particle.style.opacity = opacity.toString();
        
        if (opacity > 0) {
          requestAnimationFrame(animate);
        } else {
          document.body.removeChild(particle);
        }
      };
      
      requestAnimationFrame(animate);
    }, i * 50);
  }
}
