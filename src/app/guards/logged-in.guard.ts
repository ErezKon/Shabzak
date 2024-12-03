import { CanActivateFn, Router } from "@angular/router";
import { UserService } from "../services/user.service";
import { inject } from "@angular/core";

export function loggedInGuard(): CanActivateFn {
    return () => {
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