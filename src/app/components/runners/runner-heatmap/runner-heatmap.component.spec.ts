import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunnerHeatmapComponent } from './runner-heatmap.component';

describe('RunnerHeatmapComponent', () => {
  let component: RunnerHeatmapComponent;
  let fixture: ComponentFixture<RunnerHeatmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunnerHeatmapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunnerHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
