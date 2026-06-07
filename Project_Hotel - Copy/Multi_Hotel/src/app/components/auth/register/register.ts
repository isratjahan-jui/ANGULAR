import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../model/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPass = '';
  role: 'customer' | 'owner' | 'admin' = 'customer';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) { }


  doRegister(): void {
    if (!this.name || !this.email || !this.password) {
      this.error = 'Please fill all required fields.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }
    if (this.password !== this.confirmPass) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    const user: User = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: this.role
    };

    this.auth.register(user).subscribe(res => {
      this.loading = false;
      this.auth.saveUser(res);
      if (res.role === 'admin') this.router.navigate(['/admin/dashboard']);
      else if (res.role === 'owner') this.router.navigate(['/owner/dashboard']);
      else this.router.navigate(['/customer/dashboard']);
    }, () => {
      this.loading = false;
      this.error = 'Registration failed. Try again.';
    });
  }
}