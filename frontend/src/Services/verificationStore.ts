/** Demo artist identity + claim verification (localStorage). */

export type ClaimType = "self" | "manager" | "";

export type VerificationStatus =
  | "unverified"
  | "pending_review"
  | "identity_verified"
  | "fully_verified"
  | "rejected";

export type VerificationRecord = {
  userId: string;
  /** Links to the public artist profile id when known */
  artistProfileId?: string;
  claimType: ClaimType;
  legalName: string;
  idNumberLast4: string;
  /** Demo: filename or "selfie-captured" */
  idDocLabel: string;
  selfieLabel: string;
  /** Manager-only */
  authorityNote: string;
  socialProofUrl: string;
  status: VerificationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  notes?: string;
};

const KEY = "otb_artist_verification_";

function empty(userId: string): VerificationRecord {
  return {
    userId,
    claimType: "",
    legalName: "",
    idNumberLast4: "",
    idDocLabel: "",
    selfieLabel: "",
    authorityNote: "",
    socialProofUrl: "",
    status: "unverified",
  };
}

export function getVerification(userId: string): VerificationRecord {
  try {
    const raw = localStorage.getItem(`${KEY}${userId}`);
    if (!raw) return empty(userId);
    return { ...empty(userId), ...(JSON.parse(raw) as VerificationRecord) };
  } catch {
    return empty(userId);
  }
}

export function saveVerification(
  userId: string,
  patch: Partial<VerificationRecord>
): VerificationRecord {
  const next = { ...getVerification(userId), ...patch, userId };
  localStorage.setItem(`${KEY}${userId}`, JSON.stringify(next));
  return next;
}

/** True once identity step has passed (can accept bookings in demo). */
export function isIdentityVerified(userId: string): boolean {
  const s = getVerification(userId).status;
  return s === "identity_verified" || s === "fully_verified";
}

/** Full claim verified (self or confirmed manager). */
export function isFullyVerified(userId: string): boolean {
  return getVerification(userId).status === "fully_verified";
}

/**
 * Demo review: auto-approve when minimum fields are present.
 * In production this would be a KYC provider + human review.
 */
export function submitVerification(
  userId: string,
  input: {
    claimType: ClaimType;
    legalName: string;
    idNumberLast4: string;
    idDocLabel: string;
    selfieLabel: string;
    authorityNote?: string;
    socialProofUrl?: string;
    artistProfileId?: string;
  }
): VerificationRecord {
  const now = new Date().toISOString();
  saveVerification(userId, {
    ...input,
    authorityNote: input.authorityNote || "",
    socialProofUrl: input.socialProofUrl || "",
    status: "pending_review",
    submittedAt: now,
    rejectionReason: undefined,
  });

  // Demo auto-review after "submission"
  const hasId =
    Boolean(input.legalName.trim()) &&
    input.idNumberLast4.replace(/\D/g, "").length >= 4 &&
    Boolean(input.idDocLabel) &&
    Boolean(input.selfieLabel);
  const claimOk =
    input.claimType === "self" ||
    (input.claimType === "manager" &&
      Boolean((input.authorityNote || "").trim().length > 10));

  if (!hasId || !input.claimType || !claimOk) {
    return saveVerification(userId, {
      status: "rejected",
      reviewedAt: now,
      rejectionReason:
        "Missing ID details, selfie, or manager authority note. Please complete all fields.",
    });
  }

  // Identity always verified when docs present; full when claim + social proof
  const full =
    claimOk &&
    (input.claimType === "self" ||
      Boolean((input.socialProofUrl || "").trim()) ||
      Boolean((input.authorityNote || "").trim().length > 20));

  return saveVerification(userId, {
    status: full ? "fully_verified" : "identity_verified",
    reviewedAt: now,
    rejectionReason: undefined,
  });
}

/** Demo helper: approve current pending as fully verified */
export function demoApproveFully(userId: string): VerificationRecord {
  return saveVerification(userId, {
    status: "fully_verified",
    reviewedAt: new Date().toISOString(),
    rejectionReason: undefined,
  });
}

export function clearVerification(userId: string): void {
  localStorage.removeItem(`${KEY}${userId}`);
}

export function verificationLabel(status: VerificationStatus): string {
  switch (status) {
    case "fully_verified":
      return "Verified artist";
    case "identity_verified":
      return "Identity verified";
    case "pending_review":
      return "Verification pending";
    case "rejected":
      return "Verification needs update";
    default:
      return "Not verified";
  }
}
