'use client';

import { useState, FormEvent } from 'react';
import { UserX, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

const DELETION_EMAIL = 'mrizwansar@gmail.com';

const TERMS = [
  'By submitting this form, you request permanent deletion of your PAKEZY account and associated personal data.',
  'Account deletion is processed within 90 days of your request. During this period, your account may be deactivated and you may not be able to sign in.',
  'Some data may be retained where required by law, for fraud prevention, dispute resolution, or legitimate business records (e.g. completed bookings).',
  'Deletion is irreversible once completed. You will need to create a new account if you wish to use PAKEZY again.',
  'We may contact you at the email address provided to verify your identity before processing the deletion request.',
  'Submitting false or fraudulent deletion requests may result in rejection of the request and possible account suspension.',
];

export default function AccountDeletionClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !reason.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!agreed) {
      setError('Please accept the terms and conditions to continue.');
      return;
    }

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
            <UserX size={22} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Account Deletion</h1>
            <p className="text-gray-400 text-sm">Request removal of your PAKEZY account and data</p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={22} className="text-green-600 shrink-0 mt-0.5" />
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-green-800 dark:text-green-300">Request Submitted</h2>
                <p className="text-green-700 dark:text-green-400 text-sm leading-relaxed">
                  Your account deletion request has been received. Your data will be deleted after{' '}
                  <strong>90 days</strong> from the date of this request.
                </p>
                <p className="text-green-700 dark:text-green-400 text-sm leading-relaxed">
                  For questions about the account deletion process, please contact us at{' '}
                  <a
                    href={`mailto:${DELETION_EMAIL}`}
                    className="font-bold underline hover:text-green-900 dark:hover:text-green-200"
                  >
                    {DELETION_EMAIL}
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Terms &amp; Conditions</h2>
              <ul className="space-y-3">
                {TERMS.map((term) => (
                  <li key={term} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="text-primary-500 font-bold shrink-0">•</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6 flex gap-3 items-start">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-800 dark:text-amber-300 text-sm">
                Need help with account deletion? Contact{' '}
                <a href={`mailto:${DELETION_EMAIL}`} className="font-bold underline">
                  {DELETION_EMAIL}
                </a>
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Deletion Request Form</h2>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your account email"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Reason for Account Deletion <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Please tell us why you want to delete your account"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  I have read and agree to the terms &amp; conditions for account deletion. I understand that my data
                  will be deleted after 90 days.
                </span>
              </label>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors active:scale-[0.99]"
              >
                Submit Deletion Request
              </button>
            </form>
          </>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400">
          <Mail size={14} />
          <span>
            Account deletion support:{' '}
            <a href={`mailto:${DELETION_EMAIL}`} className="text-primary-600 hover:underline font-medium">
              {DELETION_EMAIL}
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
