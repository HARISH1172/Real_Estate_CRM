export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  AGENT: 'AGENT',
};

export const LEAD_STATUS = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  INTERESTED: 'INTERESTED',
  BOOKING: 'BOOKING',
};

export const LEAD_STATUS_LABELS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  INTERESTED: 'Interested',
  BOOKING: 'Booking Done',
};

export const LEAD_STATUS_BADGE = {
  NEW: 'badge-info',
  CONTACTED: 'badge-primary',
  INTERESTED: 'badge-warning',
  BOOKING: 'badge-success',
};

export const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Plot',
  'Commercial',
  'Office Space',
  'Warehouse',
  'Independent House',
  'Studio',
];


export const AGENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const FOLLOW_UP_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const VISIT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const VISIT_STATUS_BADGE = {
  SCHEDULED: 'badge-info',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
};
