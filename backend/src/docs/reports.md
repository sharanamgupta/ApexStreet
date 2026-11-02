# ApexStreet Reports

The Reports page reads live data from `GET /api/reports`. No report table was added: area, light, maintenance/fault, and automation values are calculated from the existing tables.

## Seed data

Optional development seed: `backend/src/main/resources/db/report_seed.sql`. Spring Boot does not execute it automatically. Run it manually after confirming the target database is disposable:

```sql
SOURCE backend/src/main/resources/db/report_seed.sql;
```

It adds six named areas and twelve lights only when matching IDs do not already exist, plus one optional unassigned maintenance record. It uses `areas`, `street_lights`, and `street_light_maintenance`; Automation configuration/activity remains in the existing Automation tables.

## API

`GET /api/reports?dateRange=7d&area=All%20Areas&reportType=all&search=`

All report reads require the existing JWT. `dateRange` accepts `today`, `7d`, `30d`, or `month`; area and search are optional. Invalid date ranges return `400` through the existing application error handling. Operators can use the full operator Reports page. USER requests are read-only through the existing User Reports route because this endpoint has no mutation methods.

Example response shape:

```json
{
  "summaryCards": [{"id":"total-lights","label":"Total Street Lights","value":"12"}],
  "filterOptions": {"areas":["All Areas","Main Road"],"reportTypes":[{"value":"all"}]},
  "performance": {"totalLights":12,"operationalLights":10,"faultyLights":2},
  "areaReports": [{"area":"Main Road","totalLights":2,"activeLights":2,"faultyLights":0}],
  "automation": {"automatedLightsCount":10,"totalActionsLogged":2},
  "faults": {"summary":{"totalFaults":2,"activeFaults":2}},
  "activities": []
}
```

## Verification queries

```sql
SELECT name, type FROM areas ORDER BY name;
SELECT area, status, mode, brightness, fault_status FROM street_lights ORDER BY area, light_id;
SELECT street_light_id, status, assigned_at FROM street_light_maintenance ORDER BY assigned_at DESC;
SELECT area_id, enabled, mode, season FROM automation_configurations;
```
