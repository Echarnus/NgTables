import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailchimpTable } from './mailchimp-table';

describe('MailchimpTable', () => {
  let component: MailchimpTable;
  let fixture: ComponentFixture<MailchimpTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailchimpTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailchimpTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
