export interface UserPatch {
  current_password?: string;
  new_password?: string;
  password_validation?: string;
  email?: string;
  first_name?: string;
  last_name?: string;

  [index: string]: string | undefined;
}

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

  [index: string]: number | Date | string | boolean | any[] | undefined;
}

export interface UserPatchError {
  user?: string[];
  password?: string;
}
