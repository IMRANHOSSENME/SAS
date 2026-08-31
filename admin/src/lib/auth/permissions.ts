import { User } from '../../types/common';

export const isAdmin = (user?: User | null) => {
  return user?.role === 'ADMIN';
};

export const isTeacher = (user?: User | null) => {
  return user?.role === 'TEACHER';
};

export const canManageDevices = (user?: User | null) => {
  return isAdmin(user);
};

export const canManageUsers = (user?: User | null) => {
  return isAdmin(user);
};
