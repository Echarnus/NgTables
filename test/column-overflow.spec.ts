import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { NgTableComponent } from '../src/ng-table/ng-table';
import { ColumnDefinition } from '../src/types/table.types';

describe('NgTableComponent - Column Overflow Strategies', () => {
  let component: NgTableComponent;
  let fixture: ComponentFixture<NgTableComponent>;

  const sampleData = [
    { id: 1, name: 'John Doe', description: 'This is a very long description that should demonstrate the overflow behavior. It contains multiple sentences to show how the text wrapping and truncation works.' },
    { id: 2, name: 'Jane Smith', description: 'Another long description to test the overflow strategies. This text is also quite lengthy and will help verify the multiline and expandable behaviors.' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgTableComponent);
    component = fixture.componentInstance;
  });

  it('should apply ellipsis overflow by default', () => {
    const columns: ColumnDefinition[] = [
      { id: 'name', header: 'Name', accessor: 'name' }
    ];

    fixture.componentRef.setInput('data', sampleData);
    fixture.componentRef.setInput('columns', columns);
    fixture.detectChanges();

    const cellContent = fixture.nativeElement.querySelector('.ngt-cell-content');
    expect(cellContent).toBeTruthy();
    expect(cellContent.classList.contains('ngt-overflow-ellipsis')).toBe(true);
  });

  it('should apply multiline overflow when specified', () => {
    const columns: ColumnDefinition[] = [
      { id: 'description', header: 'Description', accessor: 'description', overflow: 'multiline' }
    ];

    fixture.componentRef.setInput('data', sampleData);
    fixture.componentRef.setInput('columns', columns);
    fixture.detectChanges();

    const cellContent = fixture.nativeElement.querySelector('.ngt-cell-content');
    expect(cellContent).toBeTruthy();
    expect(cellContent.classList.contains('ngt-overflow-multiline')).toBe(true);
  });

  it('should apply expandable overflow when specified', () => {
    const columns: ColumnDefinition[] = [
      { id: 'description', header: 'Description', accessor: 'description', overflow: 'expandable' }
    ];

    fixture.componentRef.setInput('data', sampleData);
    fixture.componentRef.setInput('columns', columns);
    fixture.detectChanges();

    const cellContent = fixture.nativeElement.querySelector('.ngt-cell-content');
    const expandButton = fixture.nativeElement.querySelector('.ngt-expand-toggle');
    
    expect(cellContent).toBeTruthy();
    expect(expandButton).toBeTruthy();
    expect(cellContent.classList.contains('ngt-overflow-expandable')).toBe(true);
    expect(cellContent.classList.contains('ngt-collapsed')).toBe(true);
    expect(expandButton.textContent.trim()).toBe('More');
  });

  it('should toggle expandable cell content', () => {
    const columns: ColumnDefinition[] = [
      { id: 'description', header: 'Description', accessor: 'description', overflow: 'expandable' }
    ];

    fixture.componentRef.setInput('data', sampleData);
    fixture.componentRef.setInput('columns', columns);
    fixture.detectChanges();

    const expandButton = fixture.nativeElement.querySelector('.ngt-expand-toggle');
    const cellContent = fixture.nativeElement.querySelector('.ngt-cell-content');
    
    // Initially collapsed
    expect(cellContent.classList.contains('ngt-collapsed')).toBe(true);
    expect(cellContent.classList.contains('ngt-expanded')).toBe(false);
    expect(expandButton.textContent.trim()).toBe('More');

    // Click to expand
    expandButton.click();
    fixture.detectChanges();

    expect(cellContent.classList.contains('ngt-collapsed')).toBe(false);
    expect(cellContent.classList.contains('ngt-expanded')).toBe(true);
    expect(expandButton.textContent.trim()).toBe('Less');

    // Click to collapse
    expandButton.click();
    fixture.detectChanges();

    expect(cellContent.classList.contains('ngt-collapsed')).toBe(true);
    expect(cellContent.classList.contains('ngt-expanded')).toBe(false);
    expect(expandButton.textContent.trim()).toBe('More');
  });

  it('should manage cell expansion state independently per row and column', () => {
    const columns: ColumnDefinition[] = [
      { id: 'name', header: 'Name', accessor: 'name', overflow: 'expandable' },
      { id: 'description', header: 'Description', accessor: 'description', overflow: 'expandable' }
    ];

    fixture.componentRef.setInput('data', sampleData);
    fixture.componentRef.setInput('columns', columns);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.ngt-row');
    expect(rows.length).toBe(2);

    // First row, first column
    const firstRowFirstCell = rows[0].querySelector('.ngt-expand-toggle');
    // First row, second column
    const firstRowSecondCell = rows[0].querySelectorAll('.ngt-expand-toggle')[1];

    // Test independent expansion
    firstRowFirstCell.click();
    fixture.detectChanges();

    const firstRowFirstContent = rows[0].querySelector('.ngt-cell-content');
    const firstRowSecondContent = rows[0].querySelectorAll('.ngt-cell-content')[1];

    expect(firstRowFirstContent.classList.contains('ngt-expanded')).toBe(true);
    expect(firstRowSecondContent.classList.contains('ngt-collapsed')).toBe(true);
  });

  it('should generate correct CSS classes for different overflow strategies', () => {
    expect(component.getCellOverflowClass({ id: 'test', header: 'Test' })).toBe('ngt-overflow-ellipsis');
    expect(component.getCellOverflowClass({ id: 'test', header: 'Test', overflow: 'ellipsis' })).toBe('ngt-overflow-ellipsis');
    expect(component.getCellOverflowClass({ id: 'test', header: 'Test', overflow: 'multiline' })).toBe('ngt-overflow-multiline');
    expect(component.getCellOverflowClass({ id: 'test', header: 'Test', overflow: 'expandable' })).toBe('ngt-overflow-expandable');
  });

  it('should handle cell ID generation and expansion state', () => {
    const rowId = 'row-1';
    const columnId = 'col-1';
    
    expect(component.getCellId(rowId, columnId)).toBe('row-1-col-1');
    expect(component.isCellExpanded(rowId, columnId)).toBe(false);
    
    component.toggleCellExpansion(rowId, columnId);
    expect(component.isCellExpanded(rowId, columnId)).toBe(true);
    
    component.toggleCellExpansion(rowId, columnId);
    expect(component.isCellExpanded(rowId, columnId)).toBe(false);
  });
});