-- tax_settings に所得控除カラムを追加
ALTER TABLE tax_settings ADD COLUMN IF NOT EXISTS basic_deduction integer NOT NULL DEFAULT 480000;
ALTER TABLE tax_settings ADD COLUMN IF NOT EXISTS social_insurance integer NOT NULL DEFAULT 0;
ALTER TABLE tax_settings ADD COLUMN IF NOT EXISTS life_insurance integer NOT NULL DEFAULT 0;
ALTER TABLE tax_settings ADD COLUMN IF NOT EXISTS earthquake_insurance integer NOT NULL DEFAULT 0;
ALTER TABLE tax_settings ADD COLUMN IF NOT EXISTS spouse_deduction integer NOT NULL DEFAULT 0;
ALTER TABLE tax_settings ADD COLUMN IF NOT EXISTS dependents_deduction integer NOT NULL DEFAULT 0;
ALTER TABLE tax_settings ADD COLUMN IF NOT EXISTS other_deduction integer NOT NULL DEFAULT 0;
ALTER TABLE tax_settings ADD COLUMN IF NOT EXISTS blue_return_deduction integer NOT NULL DEFAULT 650000;
