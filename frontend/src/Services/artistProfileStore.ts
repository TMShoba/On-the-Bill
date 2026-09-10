/** Local profile data for artists: banking + completeness fields */

export type BankingDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType: "cheque" | "savings" | "transmission" | "";
  referenceHint?: string;
};

export type ArtistProfileExtras = {
  bio?: string;
  demoMixUrl?: string;
  phone?: string;
  instagram?: string;
  hasPhoto?: boolean;
};

const BANK_KEY = "otb_artist_banking_";
const EXTRAS_KEY = "otb_artist_extras_";

export function getBankingDetails(artistId: string): BankingDetails | null {
  try {
    const raw = localStorage.getItem(`${BANK_KEY}${artistId}`);
    return raw ? (JSON.parse(raw) as BankingDetails) : null;
  } catch {
    return null;
  }
}

export function saveBankingDetails(
  artistId: string,
  details: BankingDetails
): void {
  localStorage.setItem(`${BANK_KEY}${artistId}`, JSON.stringify(details));
}

export function getProfileExtras(artistId: string): ArtistProfileExtras {
  try {
    const raw = localStorage.getItem(`${EXTRAS_KEY}${artistId}`);
    return raw ? (JSON.parse(raw) as ArtistProfileExtras) : {};
  } catch {
    return {};
  }
}

export function saveProfileExtras(
  artistId: string,
  extras: ArtistProfileExtras
): void {
  const prev = getProfileExtras(artistId);
  localStorage.setItem(
    `${EXTRAS_KEY}${artistId}`,
    JSON.stringify({ ...prev, ...extras })
  );
}

export type ProfileCheck = {
  id: string;
  label: string;
  done: boolean;
  weight: number;
  hint: string;
};

/** Score profile completeness — complete profiles book and get paid faster */
export function getProfileStrength(
  artistId: string,
  opts?: {
    hasPhoto?: boolean;
    hasPublicBio?: boolean;
  }
): { percent: number; checks: ProfileCheck[]; nextHint: string } {
  const bank = getBankingDetails(artistId);
  const extras = getProfileExtras(artistId);
  const photo =
    opts?.hasPhoto ||
    extras.hasPhoto ||
    Boolean(localStorage.getItem(`otb_artist_photo_${artistId}`));

  const bankComplete = Boolean(
    bank?.bankName &&
      bank?.accountName &&
      bank?.accountNumber &&
      bank?.branchCode
  );

  const checks: ProfileCheck[] = [
    {
      id: "photo",
      label: "Profile photo",
      done: photo,
      weight: 20,
      hint: "Add a clear press photo so promoters recognise you",
    },
    {
      id: "bio",
      label: "Bio",
      done: Boolean(
        (extras.bio && extras.bio.trim().length > 20) || opts?.hasPublicBio
      ),
      weight: 15,
      hint: "Write a short bio (at least a few sentences)",
    },
    {
      id: "demo",
      label: "Demo mix / link",
      done: Boolean(extras.demoMixUrl?.trim()),
      weight: 25,
      hint: "Add a SoundCloud, Mixcloud or Drive link to a demo mix",
    },
    {
      id: "banking",
      label: "Banking details",
      done: bankComplete,
      weight: 25,
      hint: "Add banking so promoters can pay you after confirmed gigs",
    },
    {
      id: "contact",
      label: "Contact / social",
      done: Boolean(extras.phone?.trim() || extras.instagram?.trim()),
      weight: 15,
      hint: "Add a phone number or Instagram handle",
    },
  ];

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.reduce((s, c) => s + (c.done ? c.weight : 0), 0);
  const percent = Math.round((earned / totalWeight) * 100);
  const next = checks.find((c) => !c.done);

  return {
    percent,
    checks,
    nextHint: next
      ? `Your profile is ${percent}% complete — ${next.hint.toLowerCase()} to keep climbing.`
      : "Your profile is 100% complete — promoters can book and pay you smoothly.",
  };
}
