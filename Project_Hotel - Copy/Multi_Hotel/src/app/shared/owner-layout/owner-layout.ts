import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../model/user.model';

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './owner-layout.html',
  styleUrl: './owner-layout.css',
})
export class OwnerLayoutComponent implements OnInit {
  @Input() pageTitle = '';
  @Input() pageSub = '';

  owner: User | null = null;
  isSidebarOpen = true;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.owner = this.auth.getLoggedUser();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.auth.logout();
  }
}
