export interface User {
  id: number;
  last_login: Date;
  username: string;
  date_joined: Date;
  image?: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  groups: any[];
  user_permissions: any[];
}
