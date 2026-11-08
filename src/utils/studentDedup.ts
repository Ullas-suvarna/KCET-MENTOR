/**
 * studentDedup.ts
 * ───────────────
 * Multi-pass student deduplication engine.
 * Matches records from /users and /user_accounts across 5 signals:
 *   1. Exact email match
 *   2. Real Auth UID match (ignores synthetic ids)
 *   3. Formatted student ID match (KCET-XXXXXX)
 *   4. Normalized full name match (excluding generic placeholders)
 *   5. Sanitized-email == uid cross-collection match
 *
 * Used by AdminDataContext to guarantee each student appears exactly once
 * regardless of sign-in method (Google OAuth, Email/Password, or offline ID).
 */

import { User } from '../types';

const GENERIC_NAMES = new Set(['student', 'guest', 'guest student', 'kcet aspirant', 'user', '']);
const SYNTHETIC_PREFIXES = ['test_', 'receipt_', 'user_'];

function isSyntheticUid(uid: string): boolean {
  if (!uid || uid === 'guest') return true;
  return SYNTHETIC_PREFIXES.some(p => uid.toLowerCase().startsWith(p));
}

function sanitizeEmail(email: string): string {
  return email.replace(/\./g, '_').replace(/@/g, '_');
}

/** Returns true if two raw student records belong to the same person. */
export function areSameStudent(a: Partial<User> & { docId?: string }, b: Partial<User> & { docId?: string }): boolean {
  const aEmail = (a.email || '').trim().toLowerCase();
  const bEmail = (b.email || '').trim().toLowerCase();

  // 1. Exact email match
  if (aEmail && bEmail && aEmail.includes('@') && bEmail.includes('@') && aEmail === bEmail) return true;

  // 2. Real UID match
  const aUid = (a.uid || '').trim();
  const bUid = (b.uid || '').trim();
  if (!isSyntheticUid(aUid) && !isSyntheticUid(bUid) && aUid.toLowerCase() === bUid.toLowerCase()) return true;

  // 3. Student ID match
  const aId = (a.formattedStudentId || a.studentId || '').trim().toLowerCase();
  const bId = (b.formattedStudentId || b.studentId || '').trim().toLowerCase();
  if (aId && bId && aId === bId) return true;

  // 4. Normalized name match (skip generic placeholders)
  const aName = (a.name || '').trim().toLowerCase();
  const bName = (b.name || '').trim().toLowerCase();
  if (aName && bName && !GENERIC_NAMES.has(aName) && !GENERIC_NAMES.has(bName) && aName === bName) return true;

  // 5. Sanitized-email ↔ uid cross-collection match
  if (aEmail) {
    const aSan = sanitizeEmail(aEmail);
    if (aSan && bUid && aSan.toLowerCase() === bUid.toLowerCase()) return true;
  }
  if (bEmail) {
    const bSan = sanitizeEmail(bEmail);
    if (bSan && aUid && bSan.toLowerCase() === aUid.toLowerCase()) return true;
  }

  return false;
}

type RawStudent = Partial<User> & { docId?: string };

/**
 * Clusters raw student records by identity and merges each cluster
 * into a single canonical User profile.
 */
export function deduplicateStudentProfiles(raw: RawStudent[], deletedUids: Set<string>): User[] {
  // Filter out deleted students first
  const active = raw.filter(s => {
    const uid   = (s.uid   || '').trim();
    const email = (s.email || '').trim().toLowerCase();
    return !deletedUids.has(uid) && !deletedUids.has(email) && !deletedUids.has(sanitizeEmail(email));
  });

  // Build clusters
  const clusters: RawStudent[][] = [];
  for (const student of active) {
    const existing = clusters.find(cluster => cluster.some(e => areSameStudent(e, student)));
    if (existing) {
      existing.push(student);
    } else {
      clusters.push([student]);
    }
  }

  // Merge each cluster into one canonical profile
  return clusters.map(cluster => {
    // Pick best base profile: real email > real uid > newest lastUpdatedMillis
    const sorted = [...cluster].sort((a, b) => {
      const aRealEmail = (a.email || '').includes('@') ? 1 : 0;
      const bRealEmail = (b.email || '').includes('@') ? 1 : 0;
      if (aRealEmail !== bRealEmail) return bRealEmail - aRealEmail;
      const aRealUid = !isSyntheticUid(a.uid || '') ? 1 : 0;
      const bRealUid = !isSyntheticUid(b.uid || '') ? 1 : 0;
      if (aRealUid !== bRealUid) return bRealUid - aRealUid;
      return (Number(b.lastUpdatedMillis) || 0) - (Number(a.lastUpdatedMillis) || 0);
    });
    const best = sorted[0];

    // Merge best attributes from the whole cluster
    const canonicalEmail     = cluster.find(s => (s.email || '').includes('@'))?.email    || best.email    || '';
    const canonicalName      = cluster.find(s => !GENERIC_NAMES.has((s.name || '').toLowerCase()))?.name || best.name || 'Student';
    const canonicalStudentId = cluster.find(s => s.formattedStudentId || s.studentId)?.formattedStudentId
                             || cluster.find(s => s.studentId)?.studentId
                             || best.formattedStudentId
                             || best.studentId
                             || (best.uid ? `KCET-${best.uid.slice(-6).toUpperCase()}` : 'KCET-000001');
    const canonicalPassword  = cluster.find(s => s.password || s.displayPassword)?.password
                             || cluster.find(s => s.displayPassword)?.displayPassword
                             || best.password
                             || best.displayPassword
                             || 'kcet@user2026';
    const canonicalPhone     = cluster.find(s => s.phone && s.phone.trim().length > 0)?.phone
                             || best.phone
                             || '+91 98450 12345';
    const canonicalStream    = cluster.find(s => s.targetStream && s.targetStream.trim().length > 0)?.targetStream
                             || best.targetStream
                             || 'Engineering (CS/IS)';
    const canonicalRank      = cluster.find(s => s.kcetTargetRank && s.kcetTargetRank.trim().length > 0)?.kcetTargetRank
                             || best.kcetTargetRank
                             || 'Under 500';
    const canonicalRegDate   = cluster.find(s => s.registrationDate || s.createdAt)?.registrationDate
                             || cluster.find(s => s.createdAt)?.createdAt
                             || best.registrationDate
                             || best.createdAt
                             || '2026-10-04';
    const canonicalPhoto     = cluster.find(s => s.photoUrl)?.photoUrl || best.photoUrl || '';

    // Determine isPremium / isBlocked / isForceLoggedOut based on newest timestamp
    const clusterWithTime = [...cluster].sort((a, b) => 
      (Number(b.lastUpdatedMillis || (b as any).lastUpdated) || 0) - (Number(a.lastUpdatedMillis || (a as any).lastUpdated) || 0)
    );
    const newestPrem = clusterWithTime.find(s => s.isPremium !== undefined || (s as any).premium !== undefined);
    const isPremium = newestPrem !== undefined
      ? Boolean(newestPrem.isPremium ?? (newestPrem as any).premium)
      : cluster.some(s => Boolean(s.isPremium || (s as any).premium));

    const newestBlock = clusterWithTime.find(s => s.isBlocked !== undefined || (s as any).blocked !== undefined || (s as any).status !== undefined);
    const isBlocked = newestBlock !== undefined
      ? Boolean(newestBlock.isBlocked ?? (newestBlock as any).blocked ?? ((newestBlock as any).status === 'BLOCKED'))
      : cluster.some(s => Boolean(s.isBlocked || (s as any).blocked || (s as any).status === 'BLOCKED'));

    const newestLogout = clusterWithTime.find(s => s.isForceLoggedOut !== undefined || (s as any).forceLogout !== undefined);
    const isForceLoggedOut = newestLogout !== undefined
      ? Boolean(newestLogout.isForceLoggedOut ?? (newestLogout as any).forceLogout)
      : cluster.some(s => Boolean(s.isForceLoggedOut || (s as any).forceLogout));

    const blockReason        = cluster.find(s => s.blockReason)?.blockReason || best.blockReason || '';

    return {
      ...best,
      uid:         canonicalEmail
                     ? (cluster.find(s => (s.email || '').includes('@') && !isSyntheticUid(s.uid || ''))?.uid || best.uid || '')
                     : (best.uid || ''),
      name:        canonicalName,
      email:       canonicalEmail,
      studentId:   canonicalStudentId,
      formattedStudentId: canonicalStudentId,
      password:    canonicalPassword,
      displayPassword: canonicalPassword,
      phone:       canonicalPhone,
      targetStream: canonicalStream,
      kcetTargetRank: canonicalRank,
      registrationDate: canonicalRegDate,
      createdAt:   best.createdAt || canonicalRegDate,
      examYear:    best.examYear || 2026,
      photoUrl:    canonicalPhoto,
      isPremium,
      isBlocked,
      isForceLoggedOut,
      blockReason,
    } as User;
  });
}
