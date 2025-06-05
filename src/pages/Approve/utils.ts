const backPageUrls = {
  'list-detail': '/approve-list',
  detail: '/approve',
  create: '/approve',
  audit: '/approve-audit',
};

export const getBackPageUrl = (from: string) => {
  return backPageUrls[from];
};

export const STATUS_MAP = {
  ERROR: 'error',
  FAILD: 'error',
  WARNING: 'warning',
  COMPLETE: 'success',
  PENDING: 'processing',
};
