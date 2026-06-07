import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { User } from '../../../model/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-users.html',
  styleUrls: ['./manage-users.css']
})
export class ManageUsersComponent implements OnInit {

  users: User[] = [];
  filtered: User[] = [];
  search = '';
  filterRole = '';

  constructor(private auth: AuthService,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.auth.getAllUsers().subscribe({
      next: (u) => {
        this.users = u || [];
        this.search = '';
        this.filterRole = '';
        this.applyFilter(); // This will set 'filtered' correctly
         this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.users = [];
        this.applyFilter();

      }
    });
  }

  applyFilter(): void {
    if (!this.users) return;
    const s = this.search.toLowerCase().trim();
    this.filtered = this.users.filter(u => {
      const matchSearch = !s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
      const matchRole = !this.filterRole || u.role === this.filterRole;
      return matchSearch && matchRole;
    });
  }

  deleteUser(id: string): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.auth.deleteUser(id).subscribe(() => {
      this.users = this.users.filter(u => u.id !== id);
      this.applyFilter();
    });
  }
}