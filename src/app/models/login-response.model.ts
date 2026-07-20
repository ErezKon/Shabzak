import { User } from './user.model';

/**
 * Response from the backend Login endpoint.
 * Contains the user profile and a signed JWT token.
 */
export interface LoginResponse {
    user: User;
    token: string;
}
