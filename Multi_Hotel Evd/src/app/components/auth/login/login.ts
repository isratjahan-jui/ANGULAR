import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule,
    FormsModule,
    RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {


  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) { }

  doLogin(): void {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (users) => {
        if (users.length > 0) {
          this.auth.saveUser(users[0]);
          this.router.navigate([this.auth.getDashboardPath()]);
        } else {
          this.error = 'Invalid email or password';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.error = 'Connection failed. Please check if the server is running.';
        this.loading = false;
      }
    });
  }
}







