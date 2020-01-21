export interface Settings {
  accessToken: string;
  gitlabAddress?: string;
  isGitlabDotCom: 'true' | 'false';
  namespace?: any;
  subgroup?: any;
  isCrossProject?: 'true' | 'false';
}
