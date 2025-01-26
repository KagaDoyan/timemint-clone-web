export interface Role {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleRequest {
  name: string;
}

export interface UpdateRoleRequest {
  id: string;
  name: string;
}

export interface RoleResponse {
  success: boolean;
  data?: Role | Role[];
  error?: string;
}
