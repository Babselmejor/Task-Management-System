import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Users, Zap } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TaskFlow
          </div>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </nav>

      <main className="container mx-auto px-4">
        <section className="py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Collaborative Task Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Organize projects, assign tasks, and track progress in real-time with your team. Built with modern tools for seamless collaboration.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </section>

        <section className="py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Task Management</h3>
              <p className="text-muted-foreground">
                Create, organize, and track tasks with intuitive kanban boards. Move tasks between To Do, In Progress, and Done.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Assign tasks to team members, manage project access, and collaborate seamlessly with role-based permissions.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-lg bg-success/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold">Real-time Updates</h3>
              <p className="text-muted-foreground">
                See changes instantly as your team updates tasks. Stay synchronized with automatic updates across all devices.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">
            Join teams already using TaskFlow to manage their projects efficiently.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Create Your Account
          </Button>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          © 2024 TaskFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
