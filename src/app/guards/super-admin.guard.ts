import { CanActivateFn, Router } from "@angular/router";
import { UserService } from "../services/user.service";
import { inject } from "@angular/core";
import { UserRole } from "../models/user-role.enum";

export function superAdminGuard(): CanActivateFn {
    return () => {
      const userService: UserService = inject(UserService);
      const router: Router = inject(Router);
      const user = userService.getLoggeduser();
      if (user?.enabled && user?.activated && user?.role >= UserRole.SuperAdmin) {
        return true;
      }
      router.navigateByUrl('login');
      return false;
    };
  }