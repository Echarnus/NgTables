import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgTableComponent } from '../../../src/public-api';
import { ColumnDefinition, TableConfiguration, SortState } from '../../../src/public-api';

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
  imports: [RouterOutlet, NgTableComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('NgTables - Advanced Table Component');

  // Sample data
  users = signal<User[]>([
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
      subscriptions: 12
    },
    {
      id: 3,
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      company: 'StartupXYZ',
      role: 'Editor',
      status: 'pending',
      joinDate: '2024-01-10',
      lastLogin: '2024-09-10',
      subscriptions: 3
    },
    {
      id: 4,
      firstName: 'Alice',
      lastName: 'Brown',
      email: 'alice.brown@example.com',
      company: 'Global Inc',
      role: 'User',
      status: 'inactive',
      joinDate: '2022-11-05',
      lastLogin: '2024-08-20',
      subscriptions: 0
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
  ]);

  // Table columns configuration
  columns = signal<ColumnDefinition<User>[]>([
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
      sortable: true
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
      cellRenderer: (value: string) => {
        const statusClass = value === 'active' ? 'status-active' : 
                           value === 'pending' ? 'status-pending' : 'status-inactive';
        return `<span class="status-badge ${statusClass}">${value}</span>`;
      }
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
    emptyMessage: 'No users found'
  }));

  // Configuration toggles for demo
  showExpandableRows = signal(true);
  enableSelection = signal(false);
  enableMultiSelect = signal(false);

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
}
