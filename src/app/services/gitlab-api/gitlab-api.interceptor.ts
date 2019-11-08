import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SettingsService } from '../settings/settings.service';

@Injectable()
export class GitLabApiInterceptor implements HttpInterceptor {
  constructor(private settingsService: SettingsService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const gitlabUrl =
      this.settingsService.settings.isGitlabDotCom === 'true'
        ? 'https://gitlab.com'
        : this.settingsService.settings.gitlabAddress;
    const apiReq = req.clone({
      url: `${gitlabUrl}/api/v4/${req.url}`,
      setHeaders: {
        'Private-Token': this.settingsService.settings.accessToken,
      },
    });
    return next.handle(apiReq);
  }
}
