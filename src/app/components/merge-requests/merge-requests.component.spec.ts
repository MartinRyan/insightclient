import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeRequestsComponent } from './merge-requests.component';
import { HttpClientModule } from '@angular/common/http';

describe('MergeRequestsComponent', () => {
  let component: MergeRequestsComponent;
  let fixture: ComponentFixture<MergeRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergeRequestsComponent ],
      providers: [HttpClientModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
