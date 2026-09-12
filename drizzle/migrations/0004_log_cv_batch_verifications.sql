CREATE OR REPLACE FUNCTION public.verify_serials(_serials text[])
 RETURNS TABLE(input text, found boolean, serial text, status text, recipient_name text, cert_title text, issuer_name text, issued_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log every CV credential check as a real verification event so the live
  -- registry counters reflect actual scans, batch checks included.
  INSERT INTO public.verification_events(serial, outcome)
  SELECT upper(s),
         CASE WHEN c.id IS NULL THEN 'not_found'
              WHEN c.revoked THEN 'revoked'
              ELSE 'verified' END
  FROM unnest(_serials) AS s
  LEFT JOIN public.certificates c ON c.serial = upper(s);

  RETURN QUERY
  SELECT s AS input,
         c.id IS NOT NULL AS found,
         c.serial,
         CASE WHEN c.id IS NULL THEN 'unverified'
              WHEN c.revoked THEN 'revoked'
              ELSE 'active' END AS status,
         c.recipient_name,
         cf.title,
         cf.issuer_name,
         c.issued_at
  FROM unnest(_serials) AS s
  LEFT JOIN public.certificates c ON c.serial = upper(s)
  LEFT JOIN public.certifications cf ON cf.id = c.certification_id;
END;
$function$;