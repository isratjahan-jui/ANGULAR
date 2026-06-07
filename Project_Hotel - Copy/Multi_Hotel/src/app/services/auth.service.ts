import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../model/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiUrl;
  public user$ = new BehaviorSubject<User | null>(this.getLoggedUser());

  constructor(private http: HttpClient, private router: Router) {}

  register(user: User): Observable<User> {
    user.createdAt = new Date().toISOString();
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      catchError(() => of([]))
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.getUsers();
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user);
  }

  deleteUser(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  login(email: string, password: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      timeout(8000),
      map(users => users.filter(u => u.email === email && u.password === password)),
      catchError(err => {
        throw err;
      })
    );
  }

  saveUser(user: User): void {
    localStorage.setItem('ss_user', JSON.stringify(user));
    this.user$.next(user);
  }

  getLoggedUser(): User | null {
    const user = localStorage.getItem('ss_user');
    return user ? JSON.parse(user) : null;
  }

  getDashboardPath(): string {
    const user = this.getLoggedUser();
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'owner') return '/owner/dashboard';
    return '/customer/dashboard';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('ss_user');
  }

  getRole(): string {
    return this.getLoggedUser()?.role || '';
  }

  logout(): void {
    localStorage.removeItem('ss_user');
    this.user$.next(null);
    this.router.navigate(['/']);
  }
}