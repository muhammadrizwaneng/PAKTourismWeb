import { Metadata } from 'next';
import AccountDeletionClient from './AccountDeletionClient';

export const metadata: Metadata = {
  title: 'Account Deletion — PAKEZY',
  description: 'Request deletion of your PAKEZY account and associated personal data.',
};

export default function AccountDeletionPage() {
  return <AccountDeletionClient />;
}
