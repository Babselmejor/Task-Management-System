import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  assigned_to: string | null;
  assignee?: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;

      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectData) {
        setProject(projectData);
      }

      const { data: tasksData } = await supabase
        .from("tasks")
        .select(`
          *,
          assignee:profiles!assigned_to (
            id,
            email,
            full_name
          )
        `)
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (tasksData) {
        setTasks(tasksData);
      }
      setLoading(false);
    };

    fetchData();

    // Set up realtime subscription
    const channel = supabase
      .channel(`project-${id}-updates`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${id}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  const handleStatusChange = async (taskId: string, newStatus: "todo" | "in_progress" | "done") => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/projects">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              {loading ? (
                <>
                  <Skeleton className="h-10 w-64 mb-2" />
                  <Skeleton className="h-5 w-96" />
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold mb-2">{project?.name}</h1>
                  {project?.description && (
                    <p className="text-muted-foreground">{project.description}</p>
                  )}
                </>
              )}
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <h2 className="text-lg font-semibold">To Do ({todoTasks.length})</h2>
            </div>
            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
            ) : (
              <div className="space-y-3">
                {todoTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description || undefined}
                    status={task.status}
                    assignedTo={task.assignee || undefined}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-warning" />
              <h2 className="text-lg font-semibold">In Progress ({inProgressTasks.length})</h2>
            </div>
            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
            ) : (
              <div className="space-y-3">
                {inProgressTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description || undefined}
                    status={task.status}
                    assignedTo={task.assignee || undefined}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <h2 className="text-lg font-semibold">Done ({doneTasks.length})</h2>
            </div>
            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
            ) : (
              <div className="space-y-3">
                {doneTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description || undefined}
                    status={task.status}
                    assignedTo={task.assignee || undefined}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {id && <CreateTaskDialog open={dialogOpen} onOpenChange={setDialogOpen} projectId={id} />}
      </main>
    </div>
  );
};

export default ProjectDetail;
