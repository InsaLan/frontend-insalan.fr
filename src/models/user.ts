interface UserPatch {
  current_password?: string;
  new_password?: string;
  password_validation?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface User {
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

export {
  type User,
  type UserPatch,
};
