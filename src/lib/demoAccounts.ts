export const DEMO_PASSWORD = 'bumarket123';

export const DEMO_ACCOUNTS = [
  { label: 'Demo Buyer', email: 'buyer@bumarket.com', description: 'Browse, search, and place orders' },
  { label: 'Demo Seller', email: 'seller@bumarket.com', description: 'Manage inventory and confirm orders' },
] as const;

export function demoLoginErrorMessage(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('invalid login credentials')) {
    return 'Demo account not found. Create buyer@bumarket.com and seller@bumarket.com in Supabase Auth first.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Demo account email is not confirmed. Disable email confirmation in Supabase Auth settings for capstone demo.';
  }
  return message;
}
