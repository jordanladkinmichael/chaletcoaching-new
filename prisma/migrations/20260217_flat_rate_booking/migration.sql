-- Rename durationMin → durationHours
ALTER TABLE "Booking" RENAME COLUMN "durationMin" TO "durationHours";

-- Convert any existing rows from minutes to hours:
-- 30 min → 1h, 60 min → 1h, 90 min → 2h, anything else → clamp to 1-3
UPDATE "Booking" SET "durationHours" = CASE
  WHEN "durationHours" <= 60 THEN 1
  WHEN "durationHours" <= 120 THEN 2
  ELSE 3
END;
