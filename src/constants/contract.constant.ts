import dotenv from 'dotenv';

dotenv.config();

export const PAYMENT_CONTRACT_EIP712 = {
  WITHDRAW_DOMAIN: {
    chainId: Number(process.env.PAYMENT_EIP712_CHAIN_ID),
    name: process.env.PAYMENT_EIP712_NAME,
    version: process.env.PAYMENT_EIP712_VERSION,
    verifyingContract: process.env.PAYMENT_CONTRACT_ADDRESS,
  },
};
