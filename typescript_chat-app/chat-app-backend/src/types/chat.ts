/** Shape of a user as exposed by GET /api/users (never includes the password). */
export interface PublicUser {
  id: number;
  name: string;
  isOnline: boolean;
}
