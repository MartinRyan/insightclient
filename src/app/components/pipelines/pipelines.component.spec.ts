import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularSvgIconModule, SvgIconRegistryService, SvgLoader } from 'angular-svg-icon';
import { NgxSpinnerModule } from 'ngx-spinner';
import { of } from 'rxjs';

import { PipelinesComponent } from './pipelines.component';



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
