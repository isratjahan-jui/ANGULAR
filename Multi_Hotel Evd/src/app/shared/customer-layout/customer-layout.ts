import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../model/user.model';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.css',
})
export class CustomerLayoutComponent implements OnInit {
  @Input() pageTitle = '';
  @Input() pageSub = '';

  user: User | null = null;
  isSidebarOpen = true;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getLoggedUser();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.auth.logout();
  }
}
