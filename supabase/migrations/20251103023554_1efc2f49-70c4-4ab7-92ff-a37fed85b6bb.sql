-- Add status field to projects table for Kanban layout
ALTER TABLE public.projects 
ADD COLUMN status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed'));