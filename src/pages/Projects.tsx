import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  taskCount: number;
  memberCount: number;
}

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      const { data: projectMembers } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", user.id);

      const projectIds = projectMembers?.map((pm) => pm.project_id) || [];

      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds)
        .order("created_at", { ascending: false });

      if (projectsData) {
        const projectsWithStats = await Promise.all(
          projectsData.map(async (project) => {
            const { data: tasks } = await supabase
              .from("tasks")
              .select("id")
              .eq("project_id", project.id);

            const { data: members } = await supabase
              .from("project_members")
              .select("id")
              .eq("project_id", project.id);

            return {
              ...project,
              taskCount: tasks?.length || 0,
              memberCount: members?.length || 0,
            };
          })
        );

        setProjects(projectsWithStats);
      }
      setLoading(false);
    };

    fetchProjects();

    // Set up realtime subscription
    const channel = supabase
      .channel("projects-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => fetchProjects()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_members" },
        () => fetchProjects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage all your projects in one place</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No projects yet. Create your first project to get started!</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} {...project} createdAt={project.created_at} />
            ))}
          </div>
        )}

        <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </main>
    </div>
  );
};

export default Projects;
