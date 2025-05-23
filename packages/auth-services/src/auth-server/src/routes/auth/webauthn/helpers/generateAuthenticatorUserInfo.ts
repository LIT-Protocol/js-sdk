import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';

// Generate default username given timestamp, using timestamp format YYYY-MM-DD HH:MM:SS)
function generateDefaultUsername(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `Usernameless user (${year}-${month}-${day} ${hours}:${minutes}:${seconds})`;
}

type AuthenticatorUserInfo = {
  username: string;
  userId: string;
};

export function generateAuthenticatorUserInfo(
  username?: string
): AuthenticatorUserInfo {
  const _username = !!username ? username : generateDefaultUsername();
  const _userId = keccak256(toUtf8Bytes(_username)).slice(2);

  return {
    username: _username, // Unique ID for the user
    userId: _userId, // User-friendly display name
  };
}
