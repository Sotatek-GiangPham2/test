export class JwtPayload {
  userId: number;

  role: string;

  iat?: string;

  exp?: string;
}

export class JwtDecodedData {
  email: string;

  id: number;

  walletAddress: string;
}
