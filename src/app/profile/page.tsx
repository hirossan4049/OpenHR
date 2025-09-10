import { redirect } from 'next/navigation';

export default function ProfileRedirect() {
  // Redirect bare /profile to default locale path
  redirect('/en/profile');
}
