export interface StoreSettings {
  // Store basics
  storeName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phones: string;
  email: string;
  website: string;
  gstin: string;
  stateCode: string;

  // Bank details
  bankName: string;
  bankBranch: string;
  accountNo: string;
  ifscCode: string;

  // Invoice
  invoicePrefix: string;
  cashInvoicePrefix: string;
  defaultGst: number;
  signatoryName: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "THE BIKER GENOME",
  address: "6/16, Sahid Nagar",
  city: "Kolkata",
  state: "West Bengal",
  pincode: "700 078",
  phones: "+91 9831319291 / +91 8777277467 / +91 9038265961",
  email: "thebikergenome@gmail.com",
  website: "www.thebikergenome.com",
  gstin: "19AAPFT7973E1ZF",
  stateCode: "19",

  bankName: "AXIS BANK",
  bankBranch: "Sahid Nagar, Kolkata Branch",
  accountNo: "920020000488322",
  ifscCode: "",

  invoicePrefix: "TBG",
  cashInvoicePrefix: "CS",
  defaultGst: 18,
  signatoryName: "",
};

const STORAGE_KEY = "tbg-store-settings";

export function getStoreSettings(): StoreSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

export function saveStoreSettings(settings: StoreSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export { DEFAULT_SETTINGS };
