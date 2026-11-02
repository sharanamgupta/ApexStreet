-- Optional manual Activity Logs seed. Spring Boot never executes this automatically.
-- Run only for a disposable/dev database after reviewing existing rows.
INSERT INTO activity_logs (action, description, module, area, user_or_system, target, status, type, event_timestamp, details, user_id, created_at)
SELECT 'AUTOMATED_ON', 'Street light SL-DEMO-001 turned ON automatically at sunset', 'Street Lights', 'Main Road', 'ApexStreet Scheduler', 'SL-DEMO-001', 'Success', 'Automation', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'brightness=100\ntrigger=sunset schedule', u.id, NOW()
FROM users u WHERE u.email='operator@apexstreet.com' AND NOT EXISTS (SELECT 1 FROM activity_logs);
INSERT INTO activity_logs (action, description, module, area, user_or_system, target, status, type, event_timestamp, details, user_id, created_at)
SELECT 'FAULT_ALERT', 'Voltage fluctuation warning detected on SL-DEMO-003', 'Street Lights', 'Central Market', 'ApexStreet Monitor', 'SL-DEMO-003', 'Warning', 'Fault', DATE_SUB(NOW(), INTERVAL 1 HOUR), 'faultStatus=true\nseverity=High', u.id, NOW()
FROM users u WHERE u.email='operator@apexstreet.com' AND EXISTS (SELECT 1 FROM activity_logs);
INSERT INTO activity_logs (action, description, module, area, user_or_system, target, status, type, event_timestamp, details, user_id, created_at)
SELECT 'AUTOMATION_RULE_SYNC', 'Automation schedule configuration synchronized', 'Automation', 'All Areas', 'ApexStreet Scheduler', 'Network schedule', 'Success', 'Automation', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 'scope=network\nresult=success', u.id, NOW()
FROM users u WHERE u.email='operator@apexstreet.com' AND (SELECT COUNT(*) FROM activity_logs) < 3;
INSERT INTO activity_logs (action, description, module, area, user_or_system, target, status, type, event_timestamp, details, user_id, created_at)
SELECT 'REPORT_VIEWED', 'Operational report viewed by operator', 'Reports', 'All Areas', u.email, 'System Reports', 'Info', 'User Action', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 'reportType=all', u.id, NOW()
FROM users u WHERE u.email='operator@apexstreet.com' AND (SELECT COUNT(*) FROM activity_logs) < 4;
