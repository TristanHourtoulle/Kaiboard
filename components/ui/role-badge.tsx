import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: string | null;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  className?: string;
}

export function RoleBadge({ role, size = 'md', showTitle = true, className }: RoleBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  if (role === 'SUPER_ADMIN') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge className={cn(
          "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow",
          sizeClasses[size]
        )}>
          <span className="mr-1">👑</span>
          Creator
        </Badge>
        {showTitle && (
          <Badge variant="outline" className={cn(
            "border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:bg-purple-950/30",
            sizeClasses[size]
          )}>
            Super Admin
          </Badge>
        )}
      </div>
    );
  }

  if (role === 'ADMIN') {
    return (
      <Badge className={cn(
        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:from-blue-700 hover:to-indigo-700 transition-colors",
        sizeClasses[size],
        className
      )}>
        <span className="mr-1">🛡️</span>
        Admin
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={cn(
      "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
      sizeClasses[size],
      className
    )}>
      <span className="mr-1">👤</span>
      Member
    </Badge>
  );
} 