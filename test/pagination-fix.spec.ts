import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgTableComponent } from '../src/ng-table/ng-table';
import { ColumnDefinition } from '../src/types/table.types';

describe('Pagination Bug Fix - Issue #34', () => {
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

  it('should allow user to change page size and not reset to config default', () => {
    // Create test data with 200 items
    const testData = Array.from({ length: 200 }, (_, i) => ({ 
      id: i + 1, 
      name: `Item ${i + 1}` 
    }));
    
    const testColumns: ColumnDefinition[] = [
      { id: 'id', header: 'ID' },
      { id: 'name', header: 'Name' }
    ];
    
    // Config with 75 as default page size (like in the demo)
    const testConfig = {
      pagination: {
        enabled: true,
        pageSize: 75,
        pageSizeOptions: [25, 50, 75, 100, 200]
      }
    };
    
    // Set inputs and detect changes
    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.componentRef.setInput('config', testConfig);
    fixture.detectChanges();

    // Initial state: should show 75 items (from config)
    expect(component.paginationState().pageSize).toBe(75);
    expect(component.paginatedData().length).toBe(75);
    expect(component.paginationState().totalPages).toBe(3); // 200/75 = 2.67 -> 3

    // User changes page size to 25
    component.onPageSizeChange({
      pageSize: 25,
      page: 1,
      previousPageSize: 75
    });
    fixture.detectChanges();

    // After user change: should show 25 items and stay at 25
    expect(component.paginationState().pageSize).toBe(25);
    expect(component.paginatedData().length).toBe(25);
    expect(component.paginationState().totalPages).toBe(8); // 200/25 = 8

    // Test another change to 50
    component.onPageSizeChange({
      pageSize: 50,
      page: 1,
      previousPageSize: 25
    });
    fixture.detectChanges();

    // Should now show 50 items
    expect(component.paginationState().pageSize).toBe(50);
    expect(component.paginatedData().length).toBe(50);
    expect(component.paginationState().totalPages).toBe(4); // 200/50 = 4
  });

  it('should prevent config effect from overriding user-set page size', () => {
    const testData = Array.from({ length: 100 }, (_, i) => ({ 
      id: i + 1, 
      name: `Item ${i + 1}` 
    }));
    
    const testColumns: ColumnDefinition[] = [
      { id: 'id', header: 'ID' },
      { id: 'name', header: 'Name' }
    ];
    
    // Initial config with pageSize 75
    const initialConfig = {
      pagination: {
        enabled: true,
        pageSize: 75
      }
    };
    
    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    fixture.componentRef.setInput('config', initialConfig);
    fixture.detectChanges();

    // Initial: 75 items per page
    expect(component.paginationState().pageSize).toBe(75);

    // User changes to 25
    component.onPageSizeChange({
      pageSize: 25,
      page: 1,
      previousPageSize: 75
    });
    fixture.detectChanges();

    // Should be 25 now
    expect(component.paginationState().pageSize).toBe(25);

    // Simulate config update (like what would happen in real usage)
    const updatedConfig = {
      pagination: {
        enabled: true,
        pageSize: 75  // Same pageSize as before
      }
    };
    
    fixture.componentRef.setInput('config', updatedConfig);
    fixture.detectChanges();

    // Should STILL be 25 (user's choice), not reset to 75
    expect(component.paginationState().pageSize).toBe(25);
  });
});