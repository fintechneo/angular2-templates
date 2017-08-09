import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalBarchartComponent } from './horizontal-barchart.component';

describe('HorizontalBarchartComponent', () => {
  let component: HorizontalBarchartComponent;
  let fixture: ComponentFixture<HorizontalBarchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizontalBarchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizontalBarchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
