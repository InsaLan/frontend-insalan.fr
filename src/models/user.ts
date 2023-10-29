interface UserPatch {
  [index: string]: string | undefined;
  current_password?: string;
  new_password?: string;
  password_validation?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface User {
  [index: string]: number | Date | string | boolean | any[] | undefined;
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

interface UserPatchError {
  user?: string[];
  password?: string;
}

export {
  type User,
  type UserPatch,
  type UserPatchError,
};
