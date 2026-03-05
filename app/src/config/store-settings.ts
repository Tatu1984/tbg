export interface BankAccount {
  id: string;
  bankName: string;
  bankBranch: string;
  accountNo: string;
  ifscCode: string;
  isDefault: boolean;
}

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

  // Bank details (multiple accounts)
  bankAccounts: BankAccount[];

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

  bankAccounts: [
    {
      id: "default",
      bankName: "AXIS BANK",
      bankBranch: "Sahid Nagar, Kolkata Branch",
      accountNo: "920020000488322",
      ifscCode: "",
      isDefault: true,
    },
  ],

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
      const parsed = JSON.parse(stored);
      // Migrate old single bank fields to bankAccounts array
      if (!parsed.bankAccounts && parsed.bankName) {
        parsed.bankAccounts = [
          {
            id: "migrated",
            bankName: parsed.bankName,
            bankBranch: parsed.bankBranch || "",
            accountNo: parsed.accountNo || "",
            ifscCode: parsed.ifscCode || "",
            isDefault: true,
          },
        ];
        delete parsed.bankName;
        delete parsed.bankBranch;
        delete parsed.accountNo;
        delete parsed.ifscCode;
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
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

export function getDefaultBank(settings: StoreSettings): BankAccount | undefined {
  return settings.bankAccounts.find((b) => b.isDefault) || settings.bankAccounts[0];
}

export { DEFAULT_SETTINGS };
