import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { Invoice } from '../../../model/transaction.model';

@Component({
  selector: 'app-admin-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './invoices.html',
  styleUrls: ['./invoices.css']
})
export class AdminInvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  searchTerm: string = '';
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  constructor(
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.paymentService.getInvoices().subscribe({
      next: (invs) => {
        this.invoices = invs.sort((a, b) => 
          new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
        );
        this.filteredInvoices = [...this.invoices];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Admin Invoices: Load failed', err);
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredInvoices = this.invoices.filter(i => 
      i.invoiceNumber.toLowerCase().includes(term) ||
      i.customerName.toLowerCase().includes(term) ||
      i.hotelName.toLowerCase().includes(term)
    );
  }

  viewInvoice(inv: Invoice): void {
    // Implement invoice viewing logic if needed, 
    // or just link to a detail page
    alert('Invoice Detail: ' + inv.invoiceNumber);
  }
}
