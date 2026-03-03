import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export interface AuthPayload {
  token: string;
  username: string;
  roles: string[];
  permisos: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'auth';
  private readonly _auth = signal<AuthPayload | null>(this.read());

  auth = this._auth.asReadonly();
  permisosSet = computed(() => new Set(this._auth()?.permisos ?? []));
  rolesSet = computed(() => new Set(this._auth()?.roles ?? []));

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http
      .post<AuthPayload>('http://localhost:8080/api/auth/login', { username, password })
      .pipe(
        tap((res) => {
          this._auth.set(res);
          localStorage.setItem(this.KEY, JSON.stringify(res));
        })
      );
  }

  logout() {
    this._auth.set(null);
    localStorage.removeItem(this.KEY);
  }

  hasPermiso(...permisos: string[]) {
    if (permisos.length === 0) return true;
    const set = this.permisosSet();
    return permisos.some((p) => set.has(p));
  }
  hasRole(...roles: string[]) {
    if (roles.length === 0) return true;
    const set = this.rolesSet();
    return roles.some((r) => set.has(r));
  }

  private read(): AuthPayload | null {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? (JSON.parse(raw) as AuthPayload) : null;
    } catch {
      return null;
    }
  }

  isLoggedIn() {
    return !!this._auth()?.token;
  }
  
  token() {
  return this._auth()?.token ?? '';
}
}
