-- Fix infinite recursion in RLS policies by creating SECURITY DEFINER functions

-- 1. Create function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 2. Create function to check if user is project admin
CREATE OR REPLACE FUNCTION public.is_project_admin(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members
    WHERE user_id = _user_id 
      AND project_id = _project_id 
      AND role = 'admin'
  )
$$;

-- 3. Fix user_roles policies - restrict visibility to own roles only
DROP POLICY IF EXISTS "User roles are viewable by everyone" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Update user_roles admin policy to use SECURITY DEFINER function
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Fix project_members policy to use SECURITY DEFINER function
DROP POLICY IF EXISTS "Project admins can manage members" ON public.project_members;

CREATE POLICY "Project admins can manage members"
ON public.project_members
FOR ALL
TO authenticated
USING (public.is_project_admin(auth.uid(), project_id));