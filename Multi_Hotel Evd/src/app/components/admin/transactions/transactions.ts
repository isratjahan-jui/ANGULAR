import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { Transaction } from '../../../model/transaction.model';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.css']
})
export class AdminTransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  constructor(
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.paymentService.getTransactions().subscribe({
      next: (txns) => {
        this.transactions = txns.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.filteredTransactions = [...this.transactions];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Admin Transactions: Load failed', err);
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredTransactions = this.transactions.filter(t => {
      const matchesSearch = t.transactionId.toLowerCase().includes(term) ||
                          String(t.bookingId).includes(this.searchTerm);
      const matchesStatus = this.statusFilter ? t.status === this.statusFilter : true;
      return matchesSearch && matchesStatus;
    });
    this.cdr.detectChanges();
  }
}