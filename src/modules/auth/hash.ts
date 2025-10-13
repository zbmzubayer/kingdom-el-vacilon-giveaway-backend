import { pbkdf2, randomBytes } from 'crypto';

type HashConfig = {
  iterations: number;
  keylen: number;
  digest: 'sha256' | 'sha512';
};

const HASHING_CONFIG: HashConfig = {
  iterations: 5000,
  keylen: 32,
  digest: 'sha512',
} as const;

const genSalt = () => randomBytes(16).toString('base64url');

function create(password: string): Promise<string> {
  const salt = genSalt();
  const { iterations, keylen, digest } = HASHING_CONFIG;
  return new Promise<string>((resolve, reject) => {
    pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(`${digest}$${iterations}$${keylen}$${salt}$${derivedKey.toString('base64url')}`);
      }
    });
  });
}

function verify(password: string, hash: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    const [digest, iterations, keylen, salt, originalHash] = hash.split('$');
    pbkdf2(password, salt, Number(iterations), Number(keylen), digest, (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(originalHash === derivedKey.toString('base64url'));
      }
    });
  });
}

export const hash = { create, verify };
