export const ENDPOINTS = {
  LOGIN: `/auth/login`,
  USERS: {
    CREATE: '/users/create',
    VIEW_ALL: '/users/view-all',
    VIEW_ONE: (id: number) => `/users/${id}`,
    UPDATE: (userId: number) => `/users/update/${userId}`,
    DELETE: (id: number) => `/users/${id}`,
  },
  LOCATIONS: {
    CREATE: '/locations/create',
    VIEW_ALL: '/locations/view-all',
    VIEW_ONE: (id: number) => `/locations/${id}`,
    UPDATE: (locationId: number) => `/locations/update/${locationId}`,
    DELETE: (id: number) => `/locations/${id}`,
  },
    AUDIT_LOGS: {
    VIEW_ALL: '/audit-log/view-all',
  },
  INPUT_DETAILS: {
    CREATE: '/input-details/create',
    VIEW_ALL: '/input-details/view-all',
    VIEW_ONE: (id: number) => `/input-details/${id}`,
    UPDATE: (id: number) => `/input-details/update/${id}`,
    DELETE: (id: number) => `/input-details/${id}`,
  },
  COMPLIANCE_CATEGORIES: {
    CREATE: '/compliance-category/create',
    VIEW_ALL: '/compliance-category/view-all',
    VIEW_ONE: (id: number) => `/compliance-category/${id}`,
    UPDATE: (id: number) => `/compliance-category/update/${id}`,
    DELETE: (id: number) => `/compliance-category/${id}`,
     BY_INDUSTRY: (industryId: number) =>
    `/compliance-category/getComplianceCategoryByIndustryId/${industryId}`

  },
  COMPLIANCE_CONFIG: {
    CREATE: '/compliance-config/create',
    VIEW_ALL: '/compliance-config/view-all',
    VIEW_ONE: (id: number) => `/compliance-config/complianceConfigById/${id}`,
    BY_COMPLIANCE_CATEGORY: (complianceCategoryId: number) =>
      `/compliance-config/getComplianceConfigByComplianceCategoryId/${complianceCategoryId}`,
    UPDATE: (complianceConfigId: number) => `/compliance-config/update/${complianceConfigId}`,
    DELETE: (id: number) => `/compliance-config/${id}`,
  },
  COMPLIANCE_TRACKER: {
    CREATE: '/compliance-tracker/create',
    VIEW_ALL: '/compliance-tracker/view-all',
    BY_COMPLIANCE_CATEGORY: (complianceCategoryId: number) =>
      `/compliance-tracker/getComplianceTrackerByComplianceCategoryId/${complianceCategoryId}`,
    VIEW_ONE: (id: number) => `/compliance-tracker/complianceTrackerById/${id}`,
    UPDATE: (complianceTrackerId: number) => `/compliance-tracker/update/${complianceTrackerId}`,
    DELETE: (id: number) => `/compliance-tracker/${id}`,
  },
  FILE_UPLOAD: {
    UPLOAD_IMAGE: '/file-upload/uploadImage',
  },
  EVENT_LOGS: {
     VIEW_ALL: '/event-log/view-all',
  }
};
             
