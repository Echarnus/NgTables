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

  // Sample data - Extended dataset to demonstrate scrolling behavior
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
    },
    {
      id: 6,
      firstName: 'Diana',
      lastName: 'Martinez',
      email: 'diana.martinez@example.com',
      company: 'Innovation Labs',
      role: 'Manager',
      status: 'active',
      joinDate: '2023-02-14',
      lastLogin: '2024-09-16',
      subscriptions: 15
    },
    {
      id: 7,
      firstName: 'Edward',
      lastName: 'Thompson',
      email: 'edward.thompson@example.com',
      company: 'Enterprise Solutions',
      role: 'User',
      status: 'active',
      joinDate: '2023-04-03',
      lastLogin: '2024-09-14',
      subscriptions: 7
    },
    {
      id: 8,
      firstName: 'Fiona',
      lastName: 'Garcia',
      email: 'fiona.garcia@example.com',
      company: 'Creative Studio',
      role: 'Designer',
      status: 'active',
      joinDate: '2023-05-20',
      lastLogin: '2024-09-13',
      subscriptions: 9
    },
    {
      id: 9,
      firstName: 'George',
      lastName: 'Lee',
      email: 'george.lee@example.com',
      company: 'DataCorp',
      role: 'Analyst',
      status: 'active',
      joinDate: '2023-07-11',
      lastLogin: '2024-09-12',
      subscriptions: 4
    },
    {
      id: 10,
      firstName: 'Hannah',
      lastName: 'White',
      email: 'hannah.white@example.com',
      company: 'TechFlow',
      role: 'Developer',
      status: 'active',
      joinDate: '2023-08-25',
      lastLogin: '2024-09-11',
      subscriptions: 11
    },
    {
      id: 11,
      firstName: 'Ian',
      lastName: 'Davis',
      email: 'ian.davis@example.com',
      company: 'MegaCorp Industries',
      role: 'Senior Manager',
      status: 'active',
      joinDate: '2022-12-01',
      lastLogin: '2024-09-10',
      subscriptions: 20
    },
    {
      id: 12,
      firstName: 'Julia',
      lastName: 'Anderson',
      email: 'julia.anderson@example.com',
      company: 'StartupHub',
      role: 'Product Owner',
      status: 'active',
      joinDate: '2023-09-15',
      lastLogin: '2024-09-09',
      subscriptions: 6
    },
    {
      id: 13,
      firstName: 'Kevin',
      lastName: 'Miller',
      email: 'kevin.miller@example.com',
      company: 'CloudTech Systems',
      role: 'DevOps Engineer',
      status: 'active',
      joinDate: '2023-10-30',
      lastLogin: '2024-09-08',
      subscriptions: 13
    },
    {
      id: 14,
      firstName: 'Laura',
      lastName: 'Wilson',
      email: 'laura.wilson@example.com',
      company: 'Future Innovations',
      role: 'UX Designer',
      status: 'pending',
      joinDate: '2024-01-22',
      lastLogin: '2024-09-07',
      subscriptions: 2
    },
    {
      id: 15,
      firstName: 'Michael',
      lastName: 'Moore',
      email: 'michael.moore@example.com',
      company: 'ScaleUp Ventures',
      role: 'Business Analyst',
      status: 'active',
      joinDate: '2023-11-18',
      lastLogin: '2024-09-06',
      subscriptions: 8
    },
    {
      id: 16,
      firstName: 'Natalie',
      lastName: 'Taylor',
      email: 'natalie.taylor@example.com',
      company: 'DigitalFirst Agency',
      role: 'Marketing Manager',
      status: 'active',
      joinDate: '2023-12-05',
      lastLogin: '2024-09-05',
      subscriptions: 17
    },
    {
      id: 17,
      firstName: 'Oliver',
      lastName: 'Jackson',
      email: 'oliver.jackson@example.com',
      company: 'NextGen Technologies',
      role: 'Software Architect',
      status: 'active',
      joinDate: '2024-02-14',
      lastLogin: '2024-09-04',
      subscriptions: 14
    },
    {
      id: 18,
      firstName: 'Patricia',
      lastName: 'Thomas',
      email: 'patricia.thomas@example.com',
      company: 'EliteConsulting Group',
      role: 'Senior Consultant',
      status: 'active',
      joinDate: '2024-03-08',
      lastLogin: '2024-09-03',
      subscriptions: 19
    },
    {
      id: 19,
      firstName: 'Quincy',
      lastName: 'Robinson',
      email: 'quincy.robinson@example.com',
      company: 'AgileDev Studios',
      role: 'Scrum Master',
      status: 'inactive',
      joinDate: '2024-04-12',
      lastLogin: '2024-08-15',
      subscriptions: 1
    },
    {
      id: 20,
      firstName: 'Rachel',
      lastName: 'Clark',
      email: 'rachel.clark@example.com',
      company: 'InnovateNow Corporation',
      role: 'Chief Technology Officer',
      status: 'active',
      joinDate: '2024-05-20',
      lastLogin: '2024-09-02',
      subscriptions: 25
    },
    {
      id: 21,
      firstName: 'Samuel',
      lastName: 'Rodriguez',
      email: 'samuel.rodriguez@example.com',
      company: 'CloudFirst Solutions',
      role: 'Platform Engineer',
      status: 'active',
      joinDate: '2024-06-10',
      lastLogin: '2024-09-01',
      subscriptions: 10
    },
    {
      id: 22,
      firstName: 'Tiffany',
      lastName: 'Lewis',
      email: 'tiffany.lewis@example.com',
      company: 'DataDriven Analytics',
      role: 'Data Scientist',
      status: 'active',
      joinDate: '2024-07-02',
      lastLogin: '2024-08-31',
      subscriptions: 12
    },
    {
      id: 23,
      firstName: 'Ulysses',
      lastName: 'Walker',
      email: 'ulysses.walker@example.com',
      company: 'TechAdvantage Partners',
      role: 'Infrastructure Manager',
      status: 'active',
      joinDate: '2024-08-15',
      lastLogin: '2024-08-30',
      subscriptions: 7
    },
    {
      id: 24,
      firstName: 'Victoria',
      lastName: 'Hall',
      email: 'victoria.hall@example.com',
      company: 'ModernApp Development',
      role: 'Frontend Developer',
      status: 'pending',
      joinDate: '2024-09-01',
      lastLogin: '2024-08-29',
      subscriptions: 3
    },
    {
      id: 25,
      firstName: 'William',
      lastName: 'Allen',
      email: 'william.allen@example.com',
      company: 'FinTech Innovations Ltd',
      role: 'Security Specialist',
      status: 'active',
      joinDate: '2024-09-10',
      lastLogin: '2024-08-28',
      subscriptions: 16
    }
  ]);

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
    emptyMessage: 'No users found'
  }));

  // Configuration toggles for demo
  showExpandableRows = signal(true);
  enableSelection = signal(false);
  enableMultiSelect = signal(false);
  constrainWidth = signal(false);
  makeFrozenColumnsVisible = signal(false);

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
