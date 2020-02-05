import { Injectable } from '@angular/core';

import { Settings } from './../../components/settings/settings.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private savedSettings: Settings = null;
  public isVisible = this.settings === null;

  set settings(settings: Settings) {
    this.savedSettings = settings;
    console.log('settings service settings: ', settings);
    localStorage.setItem('gitlab_settings', JSON.stringify(settings));
  }

  get settings(): Settings {
    if (this.savedSettings === null) {
      this.savedSettings = JSON.parse(localStorage.getItem('gitlab_settings'));
    }
    return this.savedSettings;
  }
}
