-- Add new fields for document number and admission date in templates_back table
ALTER TABLE public.templates_back 
ADD COLUMN doc_num_x integer NOT NULL DEFAULT 264,
ADD COLUMN doc_num_y integer NOT NULL DEFAULT 302,
ADD COLUMN doc_num_w integer NOT NULL DEFAULT 300,
ADD COLUMN doc_num_h integer NOT NULL DEFAULT 28,
ADD COLUMN doc_num_color text NOT NULL DEFAULT '#000000',
ADD COLUMN doc_num_weight text NOT NULL DEFAULT '600',
ADD COLUMN doc_num_max_size integer NOT NULL DEFAULT 20,
ADD COLUMN admission_x integer NOT NULL DEFAULT 564,
ADD COLUMN admission_y integer NOT NULL DEFAULT 302,
ADD COLUMN admission_w integer NOT NULL DEFAULT 300,
ADD COLUMN admission_h integer NOT NULL DEFAULT 28,
ADD COLUMN admission_color text NOT NULL DEFAULT '#000000',
ADD COLUMN admission_weight text NOT NULL DEFAULT '600',
ADD COLUMN admission_max_size integer NOT NULL DEFAULT 20;