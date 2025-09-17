import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgTableComponent } from '../src/ng-table/ng-table';

describe('NgTableComponent', () => {
  let component: NgTableComponent;
  let fixture: ComponentFixture<NgTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
