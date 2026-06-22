 export const roleLabels = {
  admin: 'Әкімші',
  user: 'Пайдаланушы'
};

export const bookingStatusLabels = {
  pending: 'Күтуде',
  confirmed: 'Расталды',
  cancelled: 'Бас тартылды',
  completed: 'Аяқталды'
};

export const propertyStatusLabels = {
  active: 'Белсенді',
  draft: 'Нобай'
};

export const getRoleLabel = (role) => roleLabels[role] || role;

export const getBookingStatusLabel = (status) => bookingStatusLabels[status] || status;

export const getPropertyStatusLabel = (status) => propertyStatusLabels[status] || status;
