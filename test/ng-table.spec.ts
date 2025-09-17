import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { NgTableComponent } from '../src/ng-table/ng-table';
import { ColumnDefinition } from '../src/types/table.types';

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

  it('should handle pagination correctly', () => {
    const testData = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));
    const testColumns: ColumnDefinition[] = [
      { id: 'id', header: 'ID' },
      { id: 'name', header: 'Name' }
    ];
    const testConfig = {
      pagination: {
        enabled: true,
        pageSize: 25
      }
    };
    
    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.componentRef.setInput('config', testConfig);
    fixture.detectChanges();

    expect(component.isPaginationEnabled()).toBe(true);
    expect(component.paginationState().totalPages).toBe(4);
    expect(component.paginatedData().length).toBe(25);
    expect(component.paginatedData()[0]).toEqual({ id: 1, name: 'Item 1' });
  });

  it('should emit page change events', () => {
    const testData = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));
    const testColumns: ColumnDefinition[] = [
      { id: 'id', header: 'ID' },
      { id: 'name', header: 'Name' }
    ];
    const testConfig = {
      pagination: {
        enabled: true,
        pageSize: 25
      }
    };
    
    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.componentRef.setInput('config', testConfig);
    fixture.detectChanges();

    spyOn(component.pageChange, 'emit');
    
    const pageChangeEvent = {
      page: 2,
      pageSize: 25,
      totalItems: 100,
      previousPage: 1
    };
    
    component.onPageChange(pageChangeEvent);
    
    expect(component.pageChange.emit).toHaveBeenCalledWith(pageChangeEvent);
  });

  it('should return all data when pagination is disabled', () => {
    const testData = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));
    const testColumns: ColumnDefinition[] = [
      { id: 'id', header: 'ID' },
      { id: 'name', header: 'Name' }
    ];
    
    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.detectChanges();

    expect(component.isPaginationEnabled()).toBe(false);
    expect(component.paginatedData().length).toBe(100);
  });
});
