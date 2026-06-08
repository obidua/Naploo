DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'king' AND enumtypid = 'pod_type'::regtype) THEN
    ALTER TYPE pod_type ADD VALUE 'king';
  END IF;
END $$;

ALTER TABLE pods ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES partners(id);
ALTER TABLE pods ADD COLUMN IF NOT EXISTS display_name varchar(80);
ALTER TABLE pods ADD COLUMN IF NOT EXISTS max_occupancy integer DEFAULT 1 NOT NULL;
ALTER TABLE pods ADD COLUMN IF NOT EXISTS dimensions varchar(120);
ALTER TABLE pods ADD COLUMN IF NOT EXISTS hourly_rate numeric(10, 2);
ALTER TABLE pods ADD COLUMN IF NOT EXISTS is_standalone boolean DEFAULT false NOT NULL;

ALTER TABLE pod_sets ALTER COLUMN set_number TYPE varchar(40);
ALTER TABLE pods ALTER COLUMN pod_number TYPE varchar(40);

UPDATE pods p
SET partner_id = ps.partner_id
FROM pod_sets ps
WHERE p.pod_set_id = ps.id
  AND p.partner_id IS NULL;

UPDATE pods
SET max_occupancy = CASE pod_type
  WHEN 'double' THEN 2
  WHEN 'king' THEN 3
  ELSE 1
END
WHERE max_occupancy IS NULL OR max_occupancy < 1;

ALTER TABLE pods ALTER COLUMN pod_set_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pods_partner_id ON pods(partner_id);
CREATE INDEX IF NOT EXISTS idx_pods_standalone ON pods(partner_id, is_standalone) WHERE is_standalone = true;