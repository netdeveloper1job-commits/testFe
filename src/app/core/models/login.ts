export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    userType: string;
    email:string;
    password:string;
  };
}