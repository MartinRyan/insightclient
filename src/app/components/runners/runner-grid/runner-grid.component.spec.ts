import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunnerGridComponent } from './runner-grid.component';

describe('RunnerGridComponent', () => {
  let component: RunnerGridComponent;
  let fixture: ComponentFixture<RunnerGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunnerGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunnerGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
