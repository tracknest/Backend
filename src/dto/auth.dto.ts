export interface SignupDTO {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface GoogleAuthDTO {
  googleId: string;
  first_name: string;
  last_name: string;
  email: string;
  avatarUrl?: string;
}

export interface MonoConnectDTO {
  code: string;          
}