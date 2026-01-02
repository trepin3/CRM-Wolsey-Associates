export type Role = 'founder' | 'admin' | 'agent';

export interface User {
  id: string;
  email: string;
  role: Role;
  agencyId?: string | null;
}
