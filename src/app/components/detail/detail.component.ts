import { Component, OnInit } from '@angular/core';
import { RunnersService } from 'src/app/services/gitlab-api/runners.service';
import { Incident } from 'src/app/models/incident';
import { format, subDays } from 'date-fns';
import Memoize from 'lodash-decorators/memoize';
import { isEmpty } from 'lodash';
import { Uptime } from 'src/app/models/uptime';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.styl']
})
export class DetailComponent implements OnInit {
  service: RunnersService;
  uptimes: Array<Uptime>;
  incidents: Array<Incident>;
  n: string;

  constructor(private runnerService: RunnersService) {
    this.service = runnerService;
  }

  ngOnInit() {
    this.uptimes = this.fetchUptime();
    this.incidents = this.fetchIncidents();
  }

  fetchUptime() {
    return [
      {
        id: '123',
        name: 'shared_runner_1',
        day: 1,
        uptime: 100,
        status: 'normal_operations',
        colour: '#28a745'
      },
      {
        id: '123',
        name: 'shared_runner_1',
        day: 1,
        uptime: 100,
        status: 'normal_operations',
        colour: '#28a745'
      },
      {
        id: '123',
        name: 'shared_runner_1',
        day: 1,
        uptime: 100,
        status: 'normal_operations',
        colour: '#28a745'
      },
      {
        id: '123',
        name: 'shared_runner_1',
        day: 1,
        uptime: 100,
        status: 'normal_operations',
        colour: '#28a745'
      },
      {
        id: '123',
        name: 'shared_runner_1',
        day: 1,
        uptime: 100,
        status: 'normal_operations',
        colour: '#28a745'
      },
      {
        id: '123',
        name: 'shared_runner_1',
        day: 1,
        uptime: 100,
        status: 'normal_operations',
        colour: '#28a745'
      },
      {
        id: '123',
        name: 'shared_runner_1',
        day: 1,
        uptime: 100,
        status: 'normal_operations',
        colour: '#28a745'
      }
    ];
  }

  fetchIncidents() {
    // return this.service.fetchIncidents;
    return [
      {
        timestamp: '1582144175907',
        date: 'Thurs Feb 20 2020',
        id: '13421a',
        name: 'shared_runner_1',
        description: 'test03-447589',
        ip_address: '127.0.0.1',
        is_shared: 'true',
        status: 'offline'
      },
      {
        timestamp: '15812933175315',
        date: 'Mon Feb 03 2020',
        id: '43512',
        name: 'shared_runner_1',
        description: 'test-11-1424631',
        ip_address: '127.0.0.1',
        is_shared: 'true',
        status: 'offline'
      },
      {
        timestamp: '15810331756041',
        date: 'Fri Feb 07 2020',
        id: '43512',
        name: 'shared-runner-2',
        description: 'test-43-5457',
        ip_address: '127.0.0.1',
        is_shared: 'true',
        status: 'paused'
      },
      {
        timestamp: '15811641756043',
        date: 'Wed Jan 19 2020',
        id: '712b',
        name: 'runner-4',
        description: 'test-2-44567',
        ip_address: '127.0.0.1',
        is_shared: 'false',
        status: 'offline'
      },
      {
        timestamp: '15804941756043',
        date: 'Mon Nov 03 2019',
        id: '898965',
        name: 'shared_runner_1',
        description: 'test-10-5771',
        ip_address: '127.0.0.1',
        is_shared: 'true',
        status: 'offline'
      }
    ];
  }
  @Memoize
  getIncidentIcon(value) {
    let icon = '';
    if (value === 'active') {
      icon = 'done_outline';
    } else if (value === 'online') {
      icon = 'done';
    } else if (value === 'paused') {
      icon = 'error';
    } else if (value === 'offline') {
      icon = 'offline_bolt';
    } else if (isEmpty(value)) {
      icon = 'warning';
    }
    return icon;
  }

  @Memoize
  getIconHistorical(value) {
    let icon = '';
    if (value === 'normal_operation') {
      icon = 'done_outline';
    } else if (value === 'outage') {
      icon = 'offline_bolt';
    } else if (value === 'disruption') {
      icon = 'warning';
    } else if (isEmpty(value)) {
      icon = 'warning';
    }
    return icon;
  }

  @Memoize
  getUptimeColour(value) {
    let colour = '';
    if (value === 'normal_operation') {
      colour = 'green';
    } else if (value === 'outage') {
      colour = 'red';
    } else if (value === 'disruption') {
      colour = 'orange';
    } else if (isEmpty(value)) {
      colour = 'grey';
    }
    return colour;
  }
}
