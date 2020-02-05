export interface Settings {
  timeRange: string;
  accessToken: string;
  gitlabAddress?: string;
  isGitlabDotCom: 'true' | 'false';
  namespace?: any;
  subgroup?: any;
  isCrossProject?: 'true' | 'false';
  perPage: string;
}
