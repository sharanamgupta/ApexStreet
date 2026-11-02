-- Optional, manual demo seed for Automation. This file is never executed by Spring Boot.
-- It intentionally depends on existing Area and StreetLight rows and inserts nothing when they are absent.
INSERT INTO automation_configurations (area_id, enabled, mode, fault_hold_enabled, preserve_last_safe_command, season, created_at, updated_at)
SELECT a.id, TRUE, 'NORMAL', TRUE, TRUE, 'SUMMER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM areas a WHERE a.name IN ('Main Road','Market','Residential Area','Park','Highway','School Zone')
AND NOT EXISTS (SELECT 1 FROM automation_configurations c WHERE c.area_id=a.id);

INSERT INTO automation_schedule_phases (configuration_id,start_time,end_time,action,brightness,week_type,priority,phase_order,created_at,updated_at)
SELECT c.id,'18:30:00','22:00:00','ON',100,'WEEKDAY',10,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM automation_configurations c JOIN areas a ON a.id=c.area_id
WHERE a.name IN ('Main Road','Market','Residential Area','Park','Highway','School Zone')
AND NOT EXISTS (SELECT 1 FROM automation_schedule_phases p WHERE p.configuration_id=c.id);

-- Add further phases, event plans, and light overrides here after confirming the real IDs in your database.
