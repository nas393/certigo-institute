-- Data updates (approved): hide user-created courses until admin approval; merge Supply Chain categories.
UPDATE public.certifications SET published = false WHERE created_by IS NOT NULL;
UPDATE public.certifications SET category = 'Supply Chain Management & Logistics'
 WHERE category IN ('Supply Chain', 'Supply Chain & Logistics');
