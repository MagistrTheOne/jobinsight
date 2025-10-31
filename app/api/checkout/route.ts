import { Checkout } from "@polar-sh/nextjs";

const getSuccessUrl = () => {
  if (process.env.POLAR_SUCCESS_URL) {
    return process.env.POLAR_SUCCESS_URL;
  }
  const baseUrl = process.env.NEXTAUTH_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return `${baseUrl}/checkout/success?checkout_id={CHECKOUT_ID}`;
};

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl: getSuccessUrl(),
  server: "production",
  theme: "dark",
});

