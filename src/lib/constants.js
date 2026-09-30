export const MOCK_DISABILITIES = [
  {
    id: "wheelchair",
    name: "Wheelchair",
    icon: "♿",
    description: "Step-free routes and accessible stations",
  },
  {
    id: "visual",
    name: "Visual",
    icon: "👁️",
    description: "Routes optimized for visual accessibility",
  },
  {
    id: "hearing",
    name: "Hearing",
    icon: "🦻",
    description: "Visual alerts and accessible information",
  },
  {
    id: "cognitive",
    name: "Cognitive",
    icon: "🧠",
    description: "Simple and easy-to-follow routes",
  },
];

export const MOCK_ROUTES = [
  {
    id: 1,
    mode: "Metro",
    duration: "12 min",
    distance: "5.2 km",
    accessible: true,
    steps: 0,
    stops: 3,
    realtime_updates: {
      delay_min: 0,
      vehicle_position: "On time",
      next_arrival: "4 min",
    },
  },
  {
    id: 2,
    mode: "Metro",
    duration: "18 min",
    distance: "6.8 km",
    accessible: true,
    steps: 0,
    stops: 5,
    realtime_updates: {
      delay_min: 2,
      vehicle_position: "2 min delay",
      next_arrival: "7 min",
    },
  },
];

export const MOCK_REPORTS = [
  {
    id: 1,
    description: "Lift is currently working",
    upvotes: 8,
    report_source: "user",
    verification_status: "unverified",
  },
  {
    id: 2,
    description: "Wheelchair ramp available at entrance",
    upvotes: 12,
    report_source: "volunteer",
    verification_status: "verified",
    verified_by_name: "Priya",
    verified_by_type: "volunteer",
  },
  {
    id: 3,
    description: "Accessible entrance verified",
    upvotes: 20,
    report_source: "ngo",
    verification_status: "verified",
    verified_by_name: "Access NGO",
    verified_by_type: "ngo",
  },
];export const DISABILITIES = [
  { id: "wheelchair", label: "Wheelchair", description: "Step-free access and turning space" },
  { id: "visual", label: "Visual impairment", description: "Clear visual and tactile guidance" },
  { id: "hearing", label: "Hearing impairment", description: "Visual alerts and written information" },
  { id: "mobility", label: "Mobility impairment", description: "Fewer stairs and shorter walking distances" },
];

export const ROUTES = [
  { id: "route-1", name: "Central Station to City Library", transportType: "Walking", estimatedTime: "18 min", distance: "1.2 km", accessibilityStatus: "Accessible", warnings: ["Narrow sidewalk near Market Street."] },
  { id: "route-2", name: "Central Station to City Library", transportType: "Bus + walking", estimatedTime: "24 min", distance: "2.1 km", accessibilityStatus: "Partially accessible", warnings: ["Step-free boarding varies by service."] },
  { id: "route-3", name: "Central Station to City Library", transportType: "Wheelchair-friendly", estimatedTime: "22 min", distance: "1.6 km", accessibilityStatus: "Accessible", warnings: [] },
];

export const REPORTS = [
  { id: "report-1", issueType: "Blocked curb ramp", location: "Market Street & 4th Avenue", description: "A delivery vehicle is blocking the northwest curb ramp.", status: "Needs review", date: "Today, 9:15 AM" },
  { id: "report-2", issueType: "Working elevator", location: "Central Station, platform 2", description: "The elevator is working and provides step-free platform access.", status: "Verified", date: "Yesterday" },
  { id: "report-3", issueType: "Uneven sidewalk", location: "Oak Park entrance", description: "Uneven paving near the east entrance may be difficult to navigate.", status: "In progress", date: "Sep 24, 2026" },
];
