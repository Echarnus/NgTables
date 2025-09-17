import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgTables } from '../src/ng-tables';

describe('NgTables', () => {
  let component: NgTables;
  let fixture: ComponentFixture<NgTables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgTables]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgTables);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
