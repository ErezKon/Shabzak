import { CanActivateFn, Router } from "@angular/router";
import { UserService } from "../services/user.service";
import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

export function loggedInGuard(): CanActivateFn {
    return () => {
      // SSR safety: localStorage is not available on the server.
      const platformId = inject(PLATFORM_ID);
      if (!isPlatformBrowser(platformId)) return false;
      const userService: UserService = inject(UserService);
      const router: Router = inject(Router);
      const user = userService.getLoggeduser();
      if (user?.enabled && user?.activated) {
        return true;
      }
      router.navigateByUrl('login');
      return false;
    };
  }