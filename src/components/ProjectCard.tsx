import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FolderKanban, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  taskCount: number;
  memberCount: number;
  createdAt: string;
  status: "todo" | "in_progress" | "completed";
}

export const ProjectCard = ({
  id,
  name,
  description,
  taskCount,
  memberCount,
  createdAt,
  status,
}: ProjectCardProps) => {
  const statusColors = {
    todo: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    in_progress: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  const statusLabels = {
    todo: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return (
    <Card className="hover:shadow-lg transition-all border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          <Badge variant="outline" className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        </div>
        {description && (
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {taskCount} {taskCount === 1 ? "task" : "tasks"}
          </Badge>
          <Link to={`/projects/${id}`}>
            <Button size="sm">View Project</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
