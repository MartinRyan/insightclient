import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';

import { PipelinesComponent } from './pipelines.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { SvgIconRegistryService, SvgLoader, AngularSvgIconModule } from 'angular-svg-icon';



describe('PipelinesComponent', () => {
  let component: PipelinesComponent;
  let fixture: ComponentFixture<PipelinesComponent>;
  let mockGitlabAPIService;

  beforeEach(async(() => {
    mockGitlabAPIService = jasmine.createSpyObj(['getGitlab']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NgxSpinnerModule],
      declarations: [ PipelinesComponent ],
      providers: [HttpClientTestingModule, SvgIconRegistryService, SvgLoader, AngularSvgIconModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelinesComponent);
    component = fixture.componentInstance;
    mockGitlabAPIService.getGitlab.and.returnValue(of('test value'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
