import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { NgTableComponent } from '../../../src/public-api';
import { ColumnDefinition, TableConfiguration, SortState, PageChangeEvent, PageSizeChangeEvent } from '../../../src/public-api';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastLogin: string;
  subscriptions: number;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgTableComponent, CommonModule, TitleCasePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('NgTables - Advanced Table Component');

  // Sample data - Extended dataset to demonstrate scrolling behavior
  private generateMoreUsers(): User[] {
    // Start with the base 25 users
    const baseUsers: User[] = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        company: 'Acme Corp',
        role: 'Admin',
        status: 'active',
        joinDate: '2023-01-15',
        lastLogin: '2024-09-16',
        subscriptions: 5
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        company: 'Tech Solutions',
        role: 'User',
        status: 'active',
        joinDate: '2023-03-22',
        lastLogin: '2024-09-15',
        subscriptions: 3
      },
      {
        id: 3,
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        company: 'Global Systems',
        role: 'Manager',
        status: 'inactive',
        joinDate: '2023-05-10',
        lastLogin: '2024-09-14',
        subscriptions: 7
      },
      {
        id: 4,
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'alice.brown@example.com',
        company: 'Future Tech',
        role: 'Developer',
        status: 'active',
        joinDate: '2023-04-03',
        lastLogin: '2024-09-13',
        subscriptions: 12
      },
      {
        id: 5,
        firstName: 'Charlie',
        lastName: 'Wilson',
        email: 'charlie.wilson@example.com',
        company: 'Digital Agency',
        role: 'Admin',
        status: 'active',
        joinDate: '2023-06-18',
        lastLogin: '2024-09-17',
        subscriptions: 8
      }
    ];
    
    // Generate 200 users by duplicating and modifying the base users
    const allUsers: User[] = [];
    for (let i = 0; i < 200; i++) {
      const baseUser = baseUsers[i % baseUsers.length];
      const iteration = Math.floor(i / baseUsers.length);
      allUsers.push({
        ...baseUser,
        id: i + 1,
        firstName: `${baseUser.firstName}${iteration > 0 ? iteration : ''}`,
        lastName: `${baseUser.lastName}${iteration > 0 ? iteration : ''}`,
        email: `${baseUser.firstName.toLowerCase()}${iteration > 0 ? iteration : ''}.${baseUser.lastName.toLowerCase()}${iteration > 0 ? iteration : ''}@${baseUser.company.toLowerCase().replace(/\s+/g, '')}.com`,
        subscriptions: Math.floor(Math.random() * 20) + 1
      });
    }
    
    return allUsers;
  }

  users = signal<User[]>(this.generateMoreUsers());

  // Table columns configuration
  columns = computed<ColumnDefinition<User>[]>(() => [
    {
      id: 'id',
      header: 'ID',
      accessor: 'id',
      width: '80px',
      frozen: 'left',
      sortable: true
    },
    {
      id: 'firstName',
      header: 'First Name',
      accessor: 'firstName',
      width: '150px',
      frozen: this.makeFrozenColumnsVisible() ? 'left' : undefined,
      sortable: true,
      useTemplate: this.useTemplateBasedColumns()
    },
    {
      id: 'lastName',
      header: 'Last Name',
      accessor: 'lastName',
      width: '150px',
      sortable: true
    },
    {
      id: 'email',
      header: 'Email Address',
      accessor: 'email',
      width: '250px',
      sortable: true
    },
    {
      id: 'company',
      header: 'Company',
      accessor: 'company',
      width: '200px',
      sortable: true
    },
    {
      id: 'role',
      header: 'Role',
      accessor: 'role',
      width: '120px',
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      width: '120px',
      sortable: true,
      useTemplate: this.useTemplateBasedColumns(),
      cellRenderer: !this.useTemplateBasedColumns() ? (value: string) => {
        const statusClass = value === 'active' ? 'status-active' : 
                           value === 'pending' ? 'status-pending' : 'status-inactive';
        return `<span class="status-badge ${statusClass}">${value}</span>`;
      } : undefined
    },
    {
      id: 'joinDate',
      header: 'Join Date',
      accessor: 'joinDate',
      width: '130px',
      sortable: true,
      cellRenderer: (value: string) => {
        return new Date(value).toLocaleDateString();
      }
    },
    {
      id: 'lastLogin',
      header: 'Last Login',
      accessor: 'lastLogin',
      width: '130px',
      frozen: this.makeFrozenColumnsVisible() ? 'right' : undefined,
      sortable: true,
      cellRenderer: (value: string) => {
        return new Date(value).toLocaleDateString();
      }
    },
    {
      id: 'subscriptions',
      header: 'Subscriptions',
      accessor: 'subscriptions',
      width: '120px',
      frozen: 'right',
      sortable: true,
      cellRenderer: (value: number) => {
        return `<strong>${value}</strong>`;
      }
    }
  ]);

  // Table configuration - computed based on toggles
  tableConfig = computed<TableConfiguration>(() => ({
    expandableRows: this.showExpandableRows(),
    selectable: this.enableSelection(),
    multiSelect: this.enableSelection() && this.enableMultiSelect(), // Only enable multiSelect when selection is enabled
    stickyHeader: true,
    horizontalScroll: true,
    emptyMessage: 'No users found',
    pagination: {
      enabled: true,
      pageSize: 75,
      pageSizeOptions: [25, 50, 75, 100, 200],
      showPageSizeSelector: true,
      showFirstLastButtons: true,
      showPageNumbers: true,
      maxPageButtons: 5,
      position: 'bottom'
    }
  }));

  // Configuration toggles for demo
  showExpandableRows = signal(true);
  enableSelection = signal(false);
  enableMultiSelect = signal(false);
  constrainWidth = signal(false);
  makeFrozenColumnsVisible = signal(false);
  useRowTemplate = signal(false);

  useTemplateBasedColumns(): boolean {
    return this.useRowTemplate();
  }

  // Toggle methods for demo controls
  toggleExpandableRows(): void {
    this.showExpandableRows.set(!this.showExpandableRows());
  }

  toggleSelection(): void {
    const newValue = !this.enableSelection();
    this.enableSelection.set(newValue);
    if (!newValue) {
      this.enableMultiSelect.set(false); // Disable multi-select when selection is disabled
    }
  }

  toggleMultiSelect(): void {
    this.enableMultiSelect.set(!this.enableMultiSelect());
  }

  toggleWidthConstraint(): void {
    this.constrainWidth.set(!this.constrainWidth());
  }

  toggleFrozenColumns(): void {
    this.makeFrozenColumnsVisible.set(!this.makeFrozenColumnsVisible());
  }

  toggleRowTemplate(): void {
    this.useRowTemplate.set(!this.useRowTemplate());
  }

  // Event handlers
  onSort(sortState: SortState): void {
    console.log('Sort changed:', sortState);
  }

  onRowExpand(event: { rowId: string; expanded: boolean; rowData: User }): void {
    console.log('Row expand changed:', event);
  }

  onSelectionChange(event: { selectedRows: string[]; allSelected: boolean }): void {
    console.log('Selection changed:', event);
  }

  onCellClick(event: { value: any; row: User; column: ColumnDefinition<User> }): void {
    console.log('Cell clicked:', event);
  }

  onRowClick(event: { row: User; rowId: string }): void {
    console.log('Row clicked:', event);
  }

  // Pagination event handlers
  onPageChange(event: PageChangeEvent): void {
    console.log('Page changed:', event);
  }

  onPageSizeChange(event: PageSizeChangeEvent): void {
    console.log('Page size changed:', event);
  }

  // Template methods for expandable row actions
  editUser(user: User): void {
    console.log('Edit user:', user);
    alert(`Editing user: ${user.firstName} ${user.lastName}`);
  }

  viewProfile(user: User): void {
    console.log('View profile:', user);
    alert(`Viewing profile for: ${user.firstName} ${user.lastName}`);
  }

  sendEmail(user: User): void {
    console.log('Send email to:', user);
    alert(`Sending email to: ${user.email}`);
  }
}
