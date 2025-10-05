-- Migration: Add Funeral Tasks System
-- This migration creates a flexible task system for funerals that can be executed by n8n
-- Tasks can be of various types and have different statuses

-- Create enum for task status
CREATE TYPE task_status AS ENUM (
  'required',  -- Task is required but not yet started
  'todo',      -- Task is ready to be executed
  'pending',   -- Task is currently being executed
  'done',      -- Task has been completed successfully
  'error'      -- Task failed with an error
);

-- Create task_types table for flexible task definitions
CREATE TABLE task_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic task type information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  
  -- n8n workflow configuration
  n8n_workflow_id VARCHAR(255) NOT NULL,
  n8n_webhook_url TEXT,
  n8n_api_key VARCHAR(255), -- Encrypted API key for n8n authentication
  
  -- Task configuration
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  estimated_duration_minutes INTEGER,
  
  -- Input/output schema for the task
  input_schema JSONB,
  output_schema JSONB,
  
  -- Organization scope
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Metadata
  tags TEXT[],
  priority INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT unique_task_type_name_per_org UNIQUE (name, organization_id),
  CONSTRAINT positive_estimated_duration CHECK (estimated_duration_minutes > 0)
);

-- Create tasks table for individual task instances
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relationships
  funeral_id UUID NOT NULL REFERENCES funerals(id) ON DELETE CASCADE,
  task_type_id UUID NOT NULL REFERENCES task_types(id) ON DELETE RESTRICT,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Task execution information
  status task_status DEFAULT 'required',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  
  -- n8n execution details
  n8n_execution_id VARCHAR(255),
  n8n_execution_url TEXT,
  
  -- Task data
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Assignment and tracking
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Priority and scheduling
  priority INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  notes TEXT,
  tags TEXT[],
  
  -- Constraints
  CONSTRAINT valid_status_transitions CHECK (
    (status = 'required' AND started_at IS NULL AND completed_at IS NULL AND failed_at IS NULL) OR
    (status = 'todo' AND started_at IS NULL AND completed_at IS NULL AND failed_at IS NULL) OR
    (status = 'pending' AND started_at IS NOT NULL AND completed_at IS NULL AND failed_at IS NULL) OR
    (status = 'done' AND started_at IS NOT NULL AND completed_at IS NOT NULL AND failed_at IS NULL) OR
    (status = 'error' AND started_at IS NOT NULL AND completed_at IS NULL AND failed_at IS NOT NULL)
  ),
  CONSTRAINT positive_retry_count CHECK (retry_count >= 0),
  CONSTRAINT positive_max_retries CHECK (max_retries > 0),
  CONSTRAINT valid_due_date CHECK (due_date IS NULL OR due_date > created_at)
);

-- Create indexes for performance
CREATE INDEX idx_task_types_organization_id ON task_types(organization_id);
CREATE INDEX idx_task_types_active ON task_types(is_active) WHERE is_active = true;
CREATE INDEX idx_task_types_category ON task_types(category);
CREATE INDEX idx_task_types_n8n_workflow ON task_types(n8n_workflow_id);

CREATE INDEX idx_tasks_funeral_id ON tasks(funeral_id);
CREATE INDEX idx_tasks_task_type_id ON tasks(task_type_id);
CREATE INDEX idx_tasks_organization_id ON tasks(organization_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_scheduled_at ON tasks(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_tasks_n8n_execution_id ON tasks(n8n_execution_id) WHERE n8n_execution_id IS NOT NULL;
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Create composite indexes for common queries
CREATE INDEX idx_tasks_funeral_status ON tasks(funeral_id, status);
CREATE INDEX idx_tasks_organization_status ON tasks(organization_id, status);
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status) WHERE assigned_to IS NOT NULL;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_task_types_updated_at 
  BEFORE UPDATE ON task_types 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically assign organization_id to tasks
CREATE OR REPLACE FUNCTION assign_organization_id_to_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Get organization_id from the funeral
  SELECT organization_id INTO NEW.organization_id
  FROM funerals
  WHERE id = NEW.funeral_id;
  
  IF NEW.organization_id IS NULL THEN
    RAISE EXCEPTION 'Could not find organization_id for funeral %', NEW.funeral_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_organization_id_to_tasks_trigger
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION assign_organization_id_to_tasks();

-- Create trigger to automatically assign organization_id to task_types
CREATE OR REPLACE FUNCTION assign_organization_id_to_task_types()
RETURNS TRIGGER AS $$
BEGIN
  -- If organization_id is not provided, try to get it from the current user context
  -- This will be handled by RLS policies in practice
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := get_user_organization(auth.uid());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_organization_id_to_task_types_trigger
  BEFORE INSERT ON task_types
  FOR EACH ROW
  EXECUTE FUNCTION assign_organization_id_to_task_types();

-- Enable Row Level Security
ALTER TABLE task_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_types
CREATE POLICY "Users can view task types in their organization"
  ON task_types FOR SELECT
  USING (
    organization_id = get_user_organization(auth.uid()) OR
    is_organization_member(auth.uid(), organization_id)
  );

CREATE POLICY "Users can create task types in their organization"
  ON task_types FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization(auth.uid()) AND
    is_organization_member(auth.uid(), organization_id)
  );

CREATE POLICY "Users can update task types in their organization"
  ON task_types FOR UPDATE
  USING (
    organization_id = get_user_organization(auth.uid()) AND
    is_organization_member(auth.uid(), organization_id)
  );

CREATE POLICY "Users can delete task types in their organization"
  ON task_types FOR DELETE
  USING (
    organization_id = get_user_organization(auth.uid()) AND
    is_organization_member(auth.uid(), organization_id)
  );

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks in their organization"
  ON tasks FOR SELECT
  USING (
    organization_id = get_user_organization(auth.uid()) OR
    is_organization_member(auth.uid(), organization_id)
  );

CREATE POLICY "Users can create tasks in their organization"
  ON tasks FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization(auth.uid()) AND
    is_organization_member(auth.uid(), organization_id)
  );

CREATE POLICY "Users can update tasks in their organization"
  ON tasks FOR UPDATE
  USING (
    organization_id = get_user_organization(auth.uid()) AND
    is_organization_member(auth.uid(), organization_id)
  );

CREATE POLICY "Users can delete tasks in their organization"
  ON tasks FOR DELETE
  USING (
    organization_id = get_user_organization(auth.uid()) AND
    is_organization_member(auth.uid(), organization_id)
  );

-- Create useful views for task management
CREATE VIEW task_summary AS
SELECT 
  t.id,
  t.funeral_id,
  d.first_names as deceased_first_name,
  d.last_name as deceased_last_name,
  tt.name as task_type_name,
  tt.category,
  t.status,
  t.created_at,
  t.started_at,
  t.completed_at,
  t.due_date,
  t.priority,
  t.assigned_to,
  p.full_name as assigned_to_name,
  t.organization_id
FROM tasks t
JOIN funerals f ON t.funeral_id = f.id
LEFT JOIN deceased d ON f.deceased_id = d.id
JOIN task_types tt ON t.task_type_id = tt.id
LEFT JOIN profiles p ON t.assigned_to = p.id;

-- Create view for task statistics
CREATE VIEW task_statistics AS
SELECT 
  organization_id,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE status = 'required') as required_tasks,
  COUNT(*) FILTER (WHERE status = 'todo') as todo_tasks,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks,
  COUNT(*) FILTER (WHERE status = 'done') as done_tasks,
  COUNT(*) FILTER (WHERE status = 'error') as error_tasks,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/60) FILTER (WHERE status = 'done') as avg_completion_time_minutes
FROM tasks
GROUP BY organization_id;

-- Insert some default task types for common funeral tasks
-- These will be created when an organization is set up
INSERT INTO task_types (name, description, category, n8n_workflow_id, is_required, estimated_duration_minutes, tags) VALUES
('Obituary Creation', 'Create and publish obituary notice', 'communication', 'obituary-workflow', true, 30, ARRAY['communication', 'public', 'required']),
('Flower Arrangement', 'Order and arrange funeral flowers', 'logistics', 'flower-workflow', true, 45, ARRAY['logistics', 'supplier', 'required']),
('Catering Order', 'Arrange catering for funeral reception', 'logistics', 'catering-workflow', true, 60, ARRAY['logistics', 'supplier', 'required']),
('Transportation Booking', 'Book transportation for funeral procession', 'logistics', 'transport-workflow', true, 20, ARRAY['logistics', 'transport', 'required']),
('Music Selection', 'Select and arrange funeral music', 'ceremony', 'music-workflow', false, 30, ARRAY['ceremony', 'music', 'optional']),
('Video Tribute', 'Create memorial video tribute', 'ceremony', 'video-workflow', false, 120, ARRAY['ceremony', 'video', 'optional']),
('Document Preparation', 'Prepare legal and administrative documents', 'administrative', 'document-workflow', true, 90, ARRAY['administrative', 'legal', 'required']),
('Venue Confirmation', 'Confirm venue booking and setup', 'logistics', 'venue-workflow', true, 15, ARRAY['logistics', 'venue', 'required']);

-- Add comments for documentation
COMMENT ON TABLE task_types IS 'Defines different types of tasks that can be executed for funerals';
COMMENT ON TABLE tasks IS 'Individual task instances linked to specific funerals';
COMMENT ON TYPE task_status IS 'Status of a task: required, todo, pending, done, or error';
COMMENT ON VIEW task_summary IS 'Summary view of tasks with funeral and user information';
COMMENT ON VIEW task_statistics IS 'Statistical overview of tasks per organization';
