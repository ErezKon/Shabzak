import { CanActivateFn, Router } from "@angular/router";
import { UserService } from "../services/user.service";
import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { UserRole } from "../models/user-role.enum";

export function adminGuard(): CanActivateFn {
    return () => {
      // SSR safety: localStorage is not available on the server.
      const platformId = inject(PLATFORM_ID);
      if (!isPlatformBrowser(platformId)) return false;
      const userService: UserService = inject(UserService);
      const router: Router = inject(Router);
      const user = userService.getLoggeduser();
      if (user?.enabled && user?.activated && user?.role > UserRole.Regular) {
        return true;
      }
      router.navigateByUrl('login');
      return false;
    };
  }