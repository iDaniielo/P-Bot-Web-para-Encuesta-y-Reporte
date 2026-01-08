// Default survey and group IDs from migration
export const DEFAULT_SURVEY_ID = '00000000-0000-0000-0000-000000000001';
export const DEFAULT_GROUP_ID = '00000000-0000-0000-0000-000000000001';

// Survey status constants
export const SURVEY_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export type SurveyStatus = typeof SURVEY_STATUS[keyof typeof SURVEY_STATUS];
