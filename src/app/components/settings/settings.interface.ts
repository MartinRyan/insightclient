export interface Settings {
  accessToken: string;
  gitlabAddress?: string;
  isGitlabDotCom: 'true' | 'false';
  namespace?: string;
  isCrossProject?: 'true' | 'false';
}
