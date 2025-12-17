export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface TokenRequestDTO {
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export interface AssignRoleDTO {
  username: string;
  roleName: string;
}

export interface CreateRoleDto {
  roleName: string;
}
