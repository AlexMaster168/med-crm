import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, UrlTree} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
        if (!this.authService.isAuthenticated()) {
            return this.router.createUrlTree(['/login']);
        }

        const expectedRole = route.data['role'];

        const userRole = this.authService.getUserRole();

        if (userRole === expectedRole) {
            return true;
        }

        if (userRole === 'doctor') {
            return this.router.createUrlTree(['/doctor/appointments']);
        } else if (userRole === 'patient') {
            return this.router.createUrlTree(['/patient/appointments']);
        }

        return this.router.createUrlTree(['/login']);
    }
}