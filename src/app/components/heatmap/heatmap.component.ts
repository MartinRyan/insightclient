import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.styl']
})
export class HeatmapComponent implements OnInit {
  // angular 7 heatmap
  heatmapData = [
    [93.8, 100, 100, 72.1, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 96, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 99, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 97.6, 100, 100, 17],
    [100, 99.8, 100, 100, 100, 100],
    [100, 100, 100, 97.8, 100, 100],
    [100, 89.7, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],

    [93.8, 100, 100, 72.1, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 96, 100],
    [100, 100, 97.8, 100, 100, 100],
    [100, 100, 23, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 97.6, 100, 100, 100],
    [100, 99.8, 100, 100, 100, 100],
    [100, 100, 100, 97.8, 100, 100],
    [100, 89.7, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],

    [93.8, 100, 100, 72.1, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 96, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 99, 100, 100, 100],
    [100, 100, 100, 75, 100, 100],
    [87, 100, 100, 100, 100, 100],
    [100, 100, 97.6, 100, 100, 100],
    [100, 99.8, 100, 100, 100, 100],
    [100, 100, 100, 97.8, 100, 100],
    [100, 89.7, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],

    [93.8, 100, 100, 72.1, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 82, 100, 100, 96, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 99, 100, 100, 100],
    [100, 100, 100, 97, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 97.6, 100, 100, 100],
    [100, 99.8, 100, 100, 100, 100],
    [100, 100, 100, 97.8, 100, 100],
    [100, 89.7, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],

    [93.8, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 96, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 99, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 97.6, 100, 100, 100],
    [100, 99.8, 100, 100, 100, 100],
    [100, 100, 100, 97.8, 100, 100],
    [100, 89.7, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],

    [93.8, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 82, 100, 100, 96, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 99, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [92, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 99.8, 100, 100, 100, 100],
    [80, 100, 100, 97.8, 100, 100],
    [100, 89.7, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],

    [100, 100, 100, 100, 100, 95],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 74, 100, 100, 100],
    [100, 100, 100, 100, 100, 37],
    [100, 100, 99, 100, 100, 100],
    [74, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 100, 97.8, 100, 100],
    [100, 100, 100, 54, 100, 100],
    [100, 100, 100, 100, 98, 100],

    [100, 100, 100, 100, 100, 95],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 74, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 99, 100, 100, 100],
    [74, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 99.8, 100, 100, 100, 100],
    [100, 100, 100, 97.8, 100, 100],
    [100, 100, 100, 54, 100, 100],
    [100, 100, 100, 100, 98, 100],

    [1, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [88, 100, 45, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 99, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100],
    [100, 100, 97.6, 100, 100, 100],
    [100, 99.8, 100, 100, 100, 100],
    [100, 100, 100, 97.8, 100, 100],
    [100, 89.7, 100, 100, 100, 100],
    [100, 100, 100, 100, 100, 100]

  ];

  yAxis = {
    labels: ['shared-runner-1', 'shared-runner-2', 'shared-runner-3', 'shared-runner-4', 'shared-runner-5', 'shared-runner-6',
    'shared-runner-7', 'runner-1', 'runner-2', 'runner-3', 'runner-4', 'runner-5', 'runner-6'],
  };

  xAxis = {
  //   labels: ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'],
  };

titleSettings = {
    text: '',
    textStyle: {
        size: '15px',
        fontWeight: '500',
        fontStyle: 'Normal'
}
};

legendSettings = {
    visible: true,
    position: 'Right',
    showLabel: true,
    height: '150px'
};

cellSettings = {
  showLabel: false,
  format: '{value}'
};

paletteSettings = {
  palette: [
  { value: 0, color: '#FF3939' },
  { value: 50, color: '#E85C27' },
  { value: 100, color: '#60FF73' }
  ]
};

  constructor() { }

  ngOnInit() {
  }

}