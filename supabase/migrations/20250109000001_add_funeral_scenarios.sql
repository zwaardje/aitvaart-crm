-- Create funeral_scenarios table
CREATE TABLE funeral_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  entrepreneur_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  funeral_id UUID NOT NULL REFERENCES funerals(id) ON DELETE CASCADE,
  section VARCHAR(100) NOT NULL, -- e.g., 'verzorging_en_opbaring', 'ceremonie', 'kosten'
  item_type VARCHAR(100) NOT NULL, -- e.g., 'laatste_verzorging', 'thanatopraxie', 'ceremonie'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  extra_field_label VARCHAR(100), -- e.g., 'Verzorglocatie', 'Opbaarlocatie'
  extra_field_value VARCHAR(255),
  order_in_section INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_funeral_scenarios_funeral_id ON funeral_scenarios(funeral_id);
CREATE INDEX idx_funeral_scenarios_entrepreneur_id ON funeral_scenarios(entrepreneur_id);
CREATE INDEX idx_funeral_scenarios_section ON funeral_scenarios(section);
CREATE INDEX idx_funeral_scenarios_item_type ON funeral_scenarios(item_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_funeral_scenarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_funeral_scenarios_updated_at
  BEFORE UPDATE ON funeral_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_funeral_scenarios_updated_at();

-- Enable RLS
ALTER TABLE funeral_scenarios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own funeral scenarios" ON funeral_scenarios
  FOR SELECT USING (
    entrepreneur_id = auth.uid()
  );

CREATE POLICY "Users can insert their own funeral scenarios" ON funeral_scenarios
  FOR INSERT WITH CHECK (
    entrepreneur_id = auth.uid()
  );

CREATE POLICY "Users can update their own funeral scenarios" ON funeral_scenarios
  FOR UPDATE USING (
    entrepreneur_id = auth.uid()
  );

CREATE POLICY "Users can delete their own funeral scenarios" ON funeral_scenarios
  FOR DELETE USING (
    entrepreneur_id = auth.uid()
  );
