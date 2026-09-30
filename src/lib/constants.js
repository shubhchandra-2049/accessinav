export const DISABILITIES = [
  { id: 'wheelchair', label: 'Wheelchair', description: 'Step-free access and turning space' },
  { id: 'visual', label: 'Visual impairment', description: 'Clear visual and tactile guidance' },
  { id: 'hearing', label: 'Hearing impairment', description: 'Visual alerts and written information' },
  { id: 'mobility', label: 'Mobility impairment', description: 'Fewer stairs and shorter walking distances' },
]
export const ROUTES = [
  { id: 'r1', name: 'Central Station to City Library', transportType: 'Walking', estimatedTime: '18 min', distance: '1.2 km', accessibilityStatus: 'Accessible', warnings: ['Narrow sidewalk near Market Street.'] },
  { id: 'r2', name: 'Central Station to City Library', transportType: 'Bus + walking', estimatedTime: '24 min', distance: '2.1 km', accessibilityStatus: 'Partially accessible', warnings: ['Step-free boarding varies by service.'] },
  { id: 'r3', name: 'Central Station to City Library', transportType: 'Wheelchair-friendly', estimatedTime: '22 min', distance: '1.6 km', accessibilityStatus: 'Accessible', warnings: [] },
]
export const REPORTS = [
  { id: 'p1', issueType: 'Blocked curb ramp', location: 'Market Street & 4th Avenue', description: 'A delivery vehicle is blocking the northwest curb ramp.', status: 'Needs review', date: 'Today, 9:15 AM' },
  { id: 'p2', issueType: 'Working elevator', location: 'Central Station, platform 2', description: 'The elevator is working and provides step-free platform access.', status: 'Verified', date: 'Yesterday' },
  { id: 'p3', issueType: 'Uneven sidewalk', location: 'Oak Park entrance', description: 'Uneven paving near the east entrance may be difficult to navigate.', status: 'In progress', date: 'Sep 24, 2026' },
]
