export interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  testMode: boolean;
  config: Record<string, string>;
}

export interface PaymentGatewayConfig {
  gateways: PaymentGateway[];
  activeGatewayId: string | null;
}

const DEFAULT_GATEWAYS: PaymentGateway[] = [
  {
    id: "razorpay",
    name: "Razorpay",
    description: "Accept payments via UPI, cards, wallets, and net banking with Razorpay",
    enabled: false,
    testMode: true,
    config: {
      keyId: "",
      keySecret: "",
      webhookSecret: "",
    },
  },
  {
    id: "phonepe",
    name: "PhonePe",
    description: "Accept UPI and wallet payments via PhonePe Payment Gateway",
    enabled: false,
    testMode: true,
    config: {
      merchantId: "",
      saltKey: "",
      saltIndex: "",
    },
  },
  {
    id: "cashfree",
    name: "Cashfree",
    description: "Accept payments via Cashfree Payments with UPI, cards, and more",
    enabled: false,
    testMode: true,
    config: {
      appId: "",
      secretKey: "",
    },
  },
  {
    id: "payu",
    name: "PayU",
    description: "Accept online payments via PayU India payment gateway",
    enabled: false,
    testMode: true,
    config: {
      merchantKey: "",
      merchantSalt: "",
    },
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept international card payments, wallets, and bank transfers via Stripe",
    enabled: false,
    testMode: true,
    config: {
      publishableKey: "",
      secretKey: "",
      webhookSecret: "",
    },
  },
];

const DEFAULT_CONFIG: PaymentGatewayConfig = {
  gateways: DEFAULT_GATEWAYS,
  activeGatewayId: null,
};

const STORAGE_KEY = "tbg-payment-gateways";

export function getPaymentGateways(): PaymentGatewayConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PaymentGatewayConfig;
      // Merge with defaults so newly added gateways appear automatically
      const mergedGateways = DEFAULT_GATEWAYS.map((defaultGw) => {
        const existing = parsed.gateways.find((g) => g.id === defaultGw.id);
        return existing ? { ...defaultGw, ...existing } : defaultGw;
      });
      return {
        gateways: mergedGateways,
        activeGatewayId: parsed.activeGatewayId,
      };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_CONFIG;
}

export function savePaymentGateways(config: PaymentGatewayConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function getActiveGateway(): PaymentGateway | null {
  const config = getPaymentGateways();
  if (!config.activeGatewayId) return null;
  const gateway = config.gateways.find(
    (g) => g.id === config.activeGatewayId && g.enabled
  );
  return gateway ?? null;
}

export { DEFAULT_GATEWAYS, DEFAULT_CONFIG };
