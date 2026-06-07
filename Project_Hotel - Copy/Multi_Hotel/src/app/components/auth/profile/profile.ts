import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { User } from '../../../model/user.model';
import { AuthService } from '../../../services/auth.service';

import { CustomerLayoutComponent } from '../../../shared/customer-layout/customer-layout';
import { OwnerLayoutComponent } from '../../../shared/owner-layout/owner-layout';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CustomerLayoutComponent, OwnerLayoutComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {

  user: User | null = null;
  name = '';
  phone = '';
  previewImage: string | null = null;
  saved = false;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getLoggedUser();
    if (this.user) {
      this.name = this.user.name;
      this.phone = this.user.phone || '';
      this.previewImage = this.user.image || null;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    if (!this.user) return;
    this.user.name = this.name;
    this.user.phone = this.phone;
    if (this.previewImage) {
      this.user.image = this.previewImage;
    }
    this.auth.saveUser(this.user);
    this.saved = true;
    setTimeout(() => this.saved = false, 2500);
  }
}