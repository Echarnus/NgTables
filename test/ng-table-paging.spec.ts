import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { NgTablePagingComponent } from '../src/ng-table-paging/ng-table-paging';
import { PaginationState, PaginationConfiguration, PageChangeEvent, PageSizeChangeEvent } from '../src/types/table.types';

describe('NgTablePagingComponent', () => {
  let component: NgTablePagingComponent;
  let fixture: ComponentFixture<NgTablePagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgTablePagingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgTablePagingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Set required input
    const paginationState: PaginationState = {
      currentPage: 1,
      pageSize: 25,
      totalItems: 100,
      totalPages: 4
    };
    
    fixture.componentRef.setInput('pagination', paginationState);
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
  });

  it('should calculate visible page numbers correctly', () => {
    const paginationState: PaginationState = {
      currentPage: 3,
      pageSize: 25,
      totalItems: 200,
      totalPages: 8
    };
    
    fixture.componentRef.setInput('pagination', paginationState);
    fixture.detectChanges();

    const visiblePages = component.visiblePageNumbers();
    expect(visiblePages).toEqual([1, 2, 3, 4, 5]);
  });

  it('should calculate start and end items correctly', () => {
    const paginationState: PaginationState = {
      currentPage: 2,
      pageSize: 25,
      totalItems: 100,
      totalPages: 4
    };
    
    fixture.componentRef.setInput('pagination', paginationState);
    fixture.detectChanges();

    expect(component.startItem()).toBe(26);
    expect(component.endItem()).toBe(50);
  });

  it('should emit page change events', () => {
    const paginationState: PaginationState = {
      currentPage: 1,
      pageSize: 25,
      totalItems: 100,
      totalPages: 4
    };
    
    fixture.componentRef.setInput('pagination', paginationState);
    
    let emittedEvent: PageChangeEvent | undefined;
    component.pageChange.subscribe((event: PageChangeEvent) => {
      emittedEvent = event;
    });
    
    component.goToPage(3);
    
    expect(emittedEvent).toEqual({
      page: 3,
      pageSize: 25,
      totalItems: 100,
      previousPage: 1
    });
  });

  it('should emit page size change events', () => {
    const paginationState: PaginationState = {
      currentPage: 2,
      pageSize: 25,
      totalItems: 100,
      totalPages: 4
    };
    
    fixture.componentRef.setInput('pagination', paginationState);
    
    let emittedEvent: PageSizeChangeEvent | undefined;
    component.pageSizeChange.subscribe((event: PageSizeChangeEvent) => {
      emittedEvent = event;
    });
    
    component.onPageSizeChange(50);
    
    expect(emittedEvent).toEqual({
      pageSize: 50,
      page: 1, // Should adjust page to maintain position
      previousPageSize: 25
    });
  });

  it('should handle navigation state correctly', () => {
    const paginationState: PaginationState = {
      currentPage: 2,
      pageSize: 25,
      totalItems: 100,
      totalPages: 4
    };
    
    fixture.componentRef.setInput('pagination', paginationState);
    fixture.detectChanges();

    expect(component.canGoPrevious()).toBe(true);
    expect(component.canGoNext()).toBe(true);
  });

  it('should handle first page navigation state', () => {
    const paginationState: PaginationState = {
      currentPage: 1,
      pageSize: 25,
      totalItems: 100,
      totalPages: 4
    };
    
    fixture.componentRef.setInput('pagination', paginationState);
    fixture.detectChanges();

    expect(component.canGoPrevious()).toBe(false);
    expect(component.canGoNext()).toBe(true);
  });

  it('should handle last page navigation state', () => {
    const paginationState: PaginationState = {
      currentPage: 4,
      pageSize: 25,
      totalItems: 100,
      totalPages: 4
    };
    
    fixture.componentRef.setInput('pagination', paginationState);
    fixture.detectChanges();

    expect(component.canGoPrevious()).toBe(true);
    expect(component.canGoNext()).toBe(false);
  });
});