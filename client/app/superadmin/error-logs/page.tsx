/**
 * Error Logs - Redirect to Frontend Errors
 * 
 * Eski URL uchun redirect
 */

import { redirect } from 'next/navigation';

export default function ErrorLogsRedirect() {
  redirect('/superadmin/frontend-errors');
}
