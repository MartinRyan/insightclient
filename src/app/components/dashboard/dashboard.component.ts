import { Component, OnInit } from '@angular/core';
import { SettingsService } from './../../services/settings/settings.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.styl']
})
export class DashboardComponent implements OnInit {
  public isSettingsVisible = false;

  constructor(private settingsService: SettingsService) { }

  ngOnInit() {
    this.isSettingsVisible = this.settingsService.settings === null;
  }

  showSettings() {
    this.isSettingsVisible = true;
  }
}
