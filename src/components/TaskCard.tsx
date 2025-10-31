import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  assignedTo?: {
    id: string;
    email: string;
    full_name?: string;
  };
  onStatusChange: (taskId: string, newStatus: "todo" | "in_progress" | "done") => void;
}

const statusConfig = {
  todo: { label: "To Do", variant: "default" as const, color: "bg-blue-500" },
  in_progress: { label: "In Progress", variant: "secondary" as const, color: "bg-warning" },
  done: { label: "Done", variant: "outline" as const, color: "bg-success" },
};

export const TaskCard = ({ id, title, description, status, assignedTo, onStatusChange }: TaskCardProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1 flex-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm line-clamp-2">{description}</CardDescription>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge variant={statusConfig[status].variant} className="cursor-pointer">
                {statusConfig[status].label}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(statusConfig).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onStatusChange(id, key as typeof status)}
                >
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {assignedTo && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {assignedTo.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {assignedTo.full_name || assignedTo.email}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
