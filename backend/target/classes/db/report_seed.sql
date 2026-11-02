-- Optional manual Reports demo seed. Spring Boot does not execute this file automatically.
-- Run only against a disposable/dev database after reviewing existing rows.

INSERT INTO areas (name, description, type, active, automation_enabled, created_at, updated_at)
SELECT s.name, s.description, s.type, TRUE, TRUE, NOW(), NOW()
FROM (
  SELECT 'Main Road' name, 'Primary city corridor' description, 'ROAD_HIGHWAY' type UNION ALL
  SELECT 'Central Market', 'Commercial district lighting', 'COMMERCIAL' UNION ALL
  SELECT 'Greenfield Residency', 'Residential streets', 'RESIDENTIAL' UNION ALL
  SELECT 'Riverside Park', 'Public park paths', 'PARK' UNION ALL
  SELECT 'North Highway', 'Northern highway corridor', 'ROAD_HIGHWAY' UNION ALL
  SELECT 'Civic School Zone', 'School perimeter lighting', 'SCHOOL_ZONE'
) s
WHERE NOT EXISTS (SELECT 1 FROM areas a WHERE a.name=s.name);

INSERT INTO street_lights (light_id, area, area_id, status, mode, brightness, power_rating, fault_status, created_at, updated_at)
SELECT x.light_id, x.area, a.id, x.status, x.mode, x.brightness, x.power_rating, x.fault_status, NOW(), NOW()
FROM (
  SELECT 'SL-DEMO-001' light_id, 'Main Road' area, 'ON' status, 'AUTO' mode, 100 brightness, 120.00 power_rating, FALSE fault_status UNION ALL
  SELECT 'SL-DEMO-002', 'Main Road', 'DIM', 'SCHEDULED', 50, 120.00, FALSE UNION ALL
  SELECT 'SL-DEMO-003', 'Central Market', 'FAULT', 'AUTO', 0, 150.00, TRUE UNION ALL
  SELECT 'SL-DEMO-004', 'Central Market', 'ON', 'MANUAL', 85, 150.00, FALSE UNION ALL
  SELECT 'SL-DEMO-005', 'Greenfield Residency', 'ON', 'AUTO', 75, 90.00, FALSE UNION ALL
  SELECT 'SL-DEMO-006', 'Greenfield Residency', 'OFF', 'SCHEDULED', 0, 90.00, FALSE UNION ALL
  SELECT 'SL-DEMO-007', 'Riverside Park', 'DIM', 'ENERGY_SAVING', 45, 80.00, FALSE UNION ALL
  SELECT 'SL-DEMO-008', 'North Highway', 'FAULT', 'AUTO', 0, 180.00, TRUE UNION ALL
  SELECT 'SL-DEMO-009', 'North Highway', 'ON', 'AUTO', 100, 180.00, FALSE UNION ALL
  SELECT 'SL-DEMO-010', 'Civic School Zone', 'OFF', 'SCHEDULED', 0, 100.00, FALSE UNION ALL
  SELECT 'SL-DEMO-011', 'Civic School Zone', 'ON', 'AUTO', 80, 100.00, FALSE UNION ALL
  SELECT 'SL-DEMO-012', 'Riverside Park', 'ON', 'AUTO', 65, 80.00, FALSE
) x JOIN areas a ON a.name=x.area
WHERE NOT EXISTS (SELECT 1 FROM street_lights l WHERE l.light_id=x.light_id);

-- Optional fault history, using the actual StreetLight foreign keys.
INSERT INTO street_light_maintenance (street_light_id, technician_id, status, assigned_at, resolved_at, notes, created_at, updated_at)
SELECT l.id, NULL, 'UNASSIGNED', NOW(), NULL, 'Demo voltage fault requires inspection', NOW(), NOW()
FROM street_lights l
WHERE l.light_id='SL-DEMO-003'
  AND NOT EXISTS (SELECT 1 FROM street_light_maintenance m WHERE m.street_light_id=l.id AND m.status='UNASSIGNED');
