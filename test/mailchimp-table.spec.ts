import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { MailchimpTableComponent } from './mailchimp-table';
import { ColumnDefinition } from '../types/table.types';

describe('MailchimpTableComponent', () => {
  let component: MailchimpTableComponent;
  let fixture: ComponentFixture<MailchimpTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailchimpTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailchimpTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Set required inputs
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('columns', []);
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
  });

  it('should handle empty data', () => {
    const testData: any[] = [];
    const testColumns: ColumnDefinition[] = [
      { id: 'test', header: 'Test Column' }
    ];
    
    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.detectChanges();

    expect(component.data()).toEqual(testData);
    expect(component.columns()).toEqual(testColumns);
  });

  it('should emit sort change events', () => {
    const testColumns: ColumnDefinition[] = [
      { id: 'name', header: 'Name', sortable: true }
    ];
    
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.detectChanges();

    spyOn(component.sortChange, 'emit');
    
    component.onSort(testColumns[0]);
    
    expect(component.sortChange.emit).toHaveBeenCalledWith({
      columnId: 'name',
      direction: 'asc'
    });
  });
});
