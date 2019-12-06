import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeRequestsComponent } from './merge-requests.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SvgIconRegistryService, SvgLoader, AngularSvgIconModule } from 'angular-svg-icon';
import { NgxSpinnerModule } from 'ngx-spinner';

describe('MergeRequestsComponent', () => {
  let component: MergeRequestsComponent;
  let fixture: ComponentFixture<MergeRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NgxSpinnerModule],
      declarations: [ MergeRequestsComponent ],
      providers: [HttpClientTestingModule, SvgIconRegistryService, SvgLoader, AngularSvgIconModule]
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
