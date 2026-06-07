import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../model/user.model';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationBellComponent } from '../../components/notification/notification-bell/notification-bell';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  user: User | null = null;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(u => this.user = u);
  }

  logout(): void {
    this.auth.logout();
    this.user = null;
  }
}