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
];