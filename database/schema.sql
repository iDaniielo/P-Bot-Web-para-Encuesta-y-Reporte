-- Create the survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  regalo VARCHAR(100) NOT NULL,
  lugar VARCHAR(100) NOT NULL,
  gasto DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert data (for the survey form)
CREATE POLICY "Allow public insert" ON survey_responses
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create a policy that allows anyone to read data (for the dashboard)
CREATE POLICY "Allow public read" ON survey_responses
  FOR SELECT
  TO public
  USING (true);

-- Optional: Add comments to the table and columns
COMMENT ON TABLE survey_responses IS 'Stores survey responses from the P-Bot survey form';
COMMENT ON COLUMN survey_responses.nombre IS 'Name of the respondent';
COMMENT ON COLUMN survey_responses.telefono IS 'Phone number of the respondent';
COMMENT ON COLUMN survey_responses.regalo IS 'Preferred gift type';
COMMENT ON COLUMN survey_responses.lugar IS 'Preferred shopping place';
COMMENT ON COLUMN survey_responses.gasto IS 'Typical spending amount in euros';
COMMENT ON COLUMN survey_responses.created_at IS 'Timestamp when the response was submitted';
