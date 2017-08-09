import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedHorizontalBarchartComponent } from './stacked-horizontal-barchart.component';

describe('StackedHorizontalBarchartComponent', () => {
  let component: StackedHorizontalBarchartComponent;
  let fixture: ComponentFixture<StackedHorizontalBarchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackedHorizontalBarchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackedHorizontalBarchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
