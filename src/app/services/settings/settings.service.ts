import { Injectable } from '@angular/core';

import { Settings } from './../../components/settings/settings.interface';
import { isEmpty } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private savedSettings: Settings = null;
  public isVisible = this.settings === null;
  private defaults = {
    accessToken: "",
    gitlabAddress: "https://scs-repos-stage.bom.gov.au",
    namespace: "",
    numberOfDaysGrid: 5,
    numberOfDaysHeatmap: 100,
    perPage: 100,
    subgroup: "",
    timeRange: 2
  };

  set settings(settings: Settings) {
    this.savedSettings = settings;
    console.log('settings service settings: ', settings);
    localStorage.setItem('insight_settings', JSON.stringify(settings));
  }

  get settings(): Settings {
   if (localStorage.getItem('insight_settings') !== null) {
      this.savedSettings = JSON.parse(localStorage.getItem('insight_settings'));
    }
    else {
      this.savedSettings = this.defaults;
    }
    return this.savedSettings;
  }
}
