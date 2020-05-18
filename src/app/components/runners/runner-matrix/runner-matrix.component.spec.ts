import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunnerMatrixComponent } from './runner-matrix.component';

describe('RunnerMatrixComponent', () => {
  let component: RunnerMatrixComponent;
  let fixture: ComponentFixture<RunnerMatrixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunnerMatrixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunnerMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
