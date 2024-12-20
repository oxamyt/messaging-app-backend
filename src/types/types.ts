export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserProfile {
  username: string;
  bio: string;
  avatarUrl: string;
  id: number;
}

export interface UserResponse {
  message: string;
  users: { username: string }[];
}
