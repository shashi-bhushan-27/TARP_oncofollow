// =============================================
// OncoFollow — Role-based access
// One place that decides which screens each role can open.
// Patients and caregivers see their own care; care teams see the work queues.
// =============================================

import { UserRole } from '@/types';

const PATIENT_SIDE = ['/dashboard/patient', '/symptoms', '/upload', '/assistant', '/timeline', '/notifications'];
const CARE_TEAM = ['/dashboard/clinician', '/alerts', '/assistant', '/timeline'];

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  patient: PATIENT_SIDE,
  caregiver: PATIENT_SIDE,
  clinician: CARE_TEAM,
  admin: ['/dashboard/admin', '/dashboard/clinician', '/alerts'],
};

export const ROLE_HOME: Record<UserRole, string> = {
  patient: '/dashboard/patient',
  caregiver: '/dashboard/patient',
  clinician: '/dashboard/clinician',
  admin: '/dashboard/admin',
};

export function canAccess(role: UserRole, pathname: string): boolean {
  return ROLE_ROUTES[role].some(route => pathname === route || pathname.startsWith(`${route}/`));
}

export function isPatientSide(role: UserRole): boolean {
  return role === 'patient' || role === 'caregiver';
}
