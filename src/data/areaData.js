export const areaTypes = ['Residential', 'Commercial', 'Road/Highway', 'Park', 'School Zone'];

export const initialAreas = [
  { id: 'AREA-001', name: 'Main Road', type: 'Road/Highway', description: 'Primary east-west arterial corridor.', lights: 85, on: 60, dim: 20, off: 5, faults: 0, energy: 8.4, savings: 18, automation: 'Active', brightness: 86 },
  { id: 'AREA-002', name: 'Central Market', type: 'Commercial', description: 'High-footfall retail and dining district.', lights: 62, on: 42, dim: 12, off: 6, faults: 2, energy: 7.1, savings: 21, automation: 'Active', brightness: 79 },
  { id: 'AREA-003', name: 'Greenfield Residency', type: 'Residential', description: 'Residential streets with evening dimming.', lights: 58, on: 33, dim: 18, off: 7, faults: 0, energy: 5.8, savings: 27, automation: 'Active', brightness: 71 },
  { id: 'AREA-004', name: 'Riverside Park', type: 'Park', description: 'Pedestrian paths and recreation spaces.', lights: 34, on: 20, dim: 9, off: 5, faults: 0, energy: 3.2, savings: 32, automation: 'Active', brightness: 64 },
  { id: 'AREA-005', name: 'North Highway', type: 'Road/Highway', description: 'High-speed connection to the north district.', lights: 76, on: 58, dim: 14, off: 4, faults: 0, energy: 10.2, savings: 15, automation: 'Active', brightness: 90 },
  { id: 'AREA-006', name: 'Civic School Zone', type: 'School Zone', description: 'Safety-priority streets around civic schools.', lights: 41, on: 27, dim: 8, off: 6, faults: 0, energy: 4.6, savings: 24, automation: 'Active', brightness: 76 },
  { id: 'AREA-007', name: 'Tech Park', type: 'Commercial', description: 'Office campuses and late-shift access roads.', lights: 47, on: 31, dim: 11, off: 5, faults: 0, energy: 6.3, savings: 20, automation: 'Active', brightness: 82 },
  { id: 'AREA-008', name: 'Lakeside Homes', type: 'Residential', description: 'Quiet residential loop beside the lake.', lights: 29, on: 15, dim: 9, off: 5, faults: 0, energy: 2.7, savings: 35, automation: 'Active', brightness: 59 },
  { id: 'AREA-009', name: 'Old Town Square', type: 'Commercial', description: 'Heritage plaza with manual event lighting.', lights: 26, on: 14, dim: 6, off: 6, faults: 0, energy: 3.4, savings: 16, automation: 'Inactive', brightness: 68 },
  { id: 'AREA-010', name: 'South Bypass', type: 'Road/Highway', description: 'Peripheral bypass under maintenance review.', lights: 31, on: 23, dim: 4, off: 4, faults: 1, energy: 4.8, savings: 12, automation: 'Inactive', brightness: 84 },
  { id: 'AREA-011', name: 'Community Garden', type: 'Park', description: 'Low-energy lighting for garden walkways.', lights: 8, on: 5, dim: 2, off: 1, faults: 0, energy: 0.9, savings: 38, automation: 'Active', brightness: 58 },
  { id: 'AREA-012', name: 'East Learning Campus', type: 'School Zone', description: 'Campus perimeter and student transit route.', lights: 3, on: 2, dim: 1, off: 0, faults: 0, energy: 0.4, savings: 29, automation: 'Active', brightness: 73 },
];
