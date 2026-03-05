"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Minus,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  SplitSquareHorizontal,
  Search,
  PackagePlus,
  Check,
  ChevronsUpDown,
  Receipt,
  ShoppingBag,
  X,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  type StoreSettings,
  type BankAccount,
  getStoreSettings,
  getDefaultBank,
} from "@/config/store-settings";

// ── Mock product data (will come from DB) ────────────────────────────────
const INITIAL_PRODUCTS = [
  { id: "1", sku: "BG-HEL-001", hsn: "6506", name: "MT Thunder 3 Helmet - Black M", price: 5500, mrp: 6200, gst: 18, stock: 7, category: "Helmets" },
  { id: "2", sku: "BG-HEL-002", hsn: "6506", name: "LS2 FF800 Storm Helmet - Blue L", price: 8900, mrp: 9500, gst: 18, stock: 1, category: "Helmets" },
  { id: "3", sku: "BG-JAK-001", hsn: "6201", name: "Rynox Storm Evo Jacket - L", price: 5990, mrp: 6490, gst: 18, stock: 4, category: "Riding Jackets" },
  { id: "4", sku: "BG-GLV-001", hsn: "6116", name: "Rynox Air GT Gloves - M", price: 1490, mrp: 1690, gst: 18, stock: 2, category: "Riding Gloves" },
  { id: "5", sku: "BG-BOT-001", hsn: "6403", name: "Cramster Blaster Boots - 10", price: 2990, mrp: 3490, gst: 18, stock: 5, category: "Riding Boots" },
  { id: "6", sku: "BG-ACC-001", hsn: "4202", name: "Royal Enfield Saddle Bag", price: 2990, mrp: 3490, gst: 18, stock: 6, category: "Luggage & Bags" },
  { id: "7", sku: "BG-ACC-002", hsn: "8517", name: "Phone Mount - Quad Lock", price: 3200, mrp: 3500, gst: 18, stock: 8, category: "Bike Accessories" },
  { id: "8", sku: "BG-PRO-001", hsn: "6307", name: "Knee Guard Pro - Rynox", price: 1890, mrp: 2190, gst: 18, stock: 3, category: "Protection Gear" },
];

type Product = (typeof INITIAL_PRODUCTS)[number];

interface InvoiceItem {
  product: Product;
  quantity: number;
  discount: number; // always percentage
  overridePrice: number | null;
  overrideGst: number | null;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  gstin: string;
  stateCode: string;
}

interface InvoiceSnapshotType {
  invoiceNo: string;
  items: InvoiceItem[];
  customer: CustomerInfo;
  subtotal: number;
  totalGst: number;
  globalDiscount: number;
  grandTotal: number;
  paymentMethod: string;
  date: string;
  isCash: boolean;
  store: StoreSettings;
  bank: BankAccount | undefined;
}

const CATEGORIES = [
  "Helmets",
  "Riding Jackets",
  "Riding Gloves",
  "Riding Boots",
  "Bike Accessories",
  "Bike Parts",
  "Luggage & Bags",
  "Protection Gear",
];

// ── Number to words (Indian system) ──────────────────────────────────────
function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }

  const whole = Math.floor(Math.abs(num));
  const paise = Math.round((Math.abs(num) - whole) * 100);
  let result = "Rupees " + convert(whole);
  if (paise > 0) result += " and " + convert(paise) + " Paise";
  return result + " Only";
}

// ── Generate A4 Tax Invoice HTML ─────────────────────────────────────────
function generateInvoiceHTML(snap: InvoiceSnapshotType): string {
  const s = snap.store;
  const c = snap.customer;

  const itemRows = snap.items.map((it, i) => {
    const unitPrice = it.overridePrice ?? it.product.price;
    const gstRate = it.overrideGst ?? it.product.gst;
    const discAmt = Math.round(unitPrice * it.quantity * it.discount / 100 * 100) / 100;
    const taxableValue = unitPrice * it.quantity - discAmt;
    const halfRate = gstRate / 2;
    const sgst = snap.isCash ? 0 : taxableValue * halfRate / 100;
    const cgst = snap.isCash ? 0 : taxableValue * halfRate / 100;
    const total = taxableValue + sgst + cgst;

    return `<tr>
      <td style="text-align:center;padding:6px 4px;border:1px solid #000">${i + 1}</td>
      <td style="padding:6px 8px;border:1px solid #000;font-weight:bold">${it.product.name}</td>
      <td style="text-align:center;padding:6px 4px;border:1px solid #000">${it.product.hsn || ""}</td>
      <td style="text-align:center;padding:6px 4px;border:1px solid #000">${it.quantity}</td>
      <td style="text-align:right;padding:6px 8px;border:1px solid #000">${unitPrice.toFixed(2)}</td>
      <td style="text-align:right;padding:6px 8px;border:1px solid #000">${taxableValue.toFixed(2)}</td>
      <td style="text-align:center;padding:6px 4px;border:1px solid #000">${snap.isCash ? "-" : halfRate.toFixed(1) + "%"}</td>
      <td style="text-align:right;padding:6px 6px;border:1px solid #000">${snap.isCash ? "-" : sgst.toFixed(2)}</td>
      <td style="text-align:center;padding:6px 4px;border:1px solid #000">${snap.isCash ? "-" : halfRate.toFixed(1) + "%"}</td>
      <td style="text-align:right;padding:6px 6px;border:1px solid #000">${snap.isCash ? "-" : cgst.toFixed(2)}</td>
      <td style="text-align:center;padding:6px 4px;border:1px solid #000">-</td>
      <td style="text-align:right;padding:6px 6px;border:1px solid #000">-</td>
      <td style="text-align:right;padding:6px 8px;border:1px solid #000;font-weight:bold">${total.toFixed(2)}</td>
    </tr>`;
  }).join("");

  // Add empty rows to fill the table (min ~12 rows for A4 look)
  const emptyRowCount = Math.max(0, 10 - snap.items.length);
  const emptyRows = Array(emptyRowCount).fill(`<tr>
    <td style="padding:14px 4px;border:1px solid #000">&nbsp;</td>
    <td style="border:1px solid #000"></td><td style="border:1px solid #000"></td>
    <td style="border:1px solid #000"></td><td style="border:1px solid #000"></td>
    <td style="border:1px solid #000"></td><td style="border:1px solid #000"></td>
    <td style="border:1px solid #000"></td><td style="border:1px solid #000"></td>
    <td style="border:1px solid #000"></td><td style="border:1px solid #000"></td>
    <td style="border:1px solid #000"></td><td style="border:1px solid #000"></td>
  </tr>`).join("");

  const netAmount = Math.round(snap.grandTotal);
  const amountInWords = numberToWords(netAmount);

  return `<!DOCTYPE html>
<html><head>
<title>Tax Invoice ${snap.invoiceNo}</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; }
  table { border-collapse: collapse; width: 100%; }
  .invoice-box { border: 2px solid #000; padding: 0; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head><body>
<div class="invoice-box">
  <!-- Header -->
  <table>
    <tr>
      <td style="width:65%;padding:10px 15px;border-bottom:2px solid #000;border-right:2px solid #000;vertical-align:top">
        <div style="text-align:center">
          <div style="font-size:9px;font-weight:bold;letter-spacing:1px;margin-bottom:2px">TAX INVOICE</div>
          <div style="font-size:22px;font-weight:900;font-family:Impact,Arial,sans-serif;letter-spacing:2px">${s.storeName}</div>
          <div style="font-size:11px;margin-top:2px">${s.address}, ${s.city} - ${s.pincode}</div>
          <div style="font-size:10px">Phone : ${s.phones}</div>
          <div style="font-size:10px">E-mail : ${s.email}</div>
        </div>
      </td>
      <td style="width:35%;padding:10px 15px;border-bottom:2px solid #000;vertical-align:top">
        <div style="font-size:11px;margin-bottom:8px"><strong>GSTIN : ${s.gstin}</strong></div>
        <table style="width:100%">
          <tr><td style="padding:3px 0;font-size:11px">INVOICE NO :</td><td style="text-align:right;font-weight:bold;font-size:13px">${snap.invoiceNo}</td></tr>
          <tr><td style="padding:3px 0;font-size:11px">INVOICE DATE :</td><td style="text-align:right;font-weight:bold;font-size:11px">${snap.date}</td></tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Customer Info -->
  <table>
    <tr>
      <td style="padding:8px 15px;border-bottom:1px solid #000">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="width:80px;padding:3px 0;white-space:nowrap"><strong>NAME:</strong></td>
            <td colspan="5" style="border-bottom:1px solid #999;padding:3px 4px;font-weight:bold">${c.name || ""}</td>
          </tr>
          <tr>
            <td style="padding:3px 0;white-space:nowrap"><strong>ADDRESS</strong></td>
            <td colspan="5" style="border-bottom:1px solid #999;padding:3px 4px">${c.address || ""}</td>
          </tr>
          <tr>
            <td style="padding:3px 0;white-space:nowrap"><strong>GSTIN NO.</strong></td>
            <td style="border-bottom:1px solid #999;padding:3px 4px;width:30%">${c.gstin || ""}</td>
            <td style="padding:3px 0 3px 20px;white-space:nowrap"><strong>STATE CODE:</strong></td>
            <td style="border-bottom:1px solid #999;padding:3px 4px;width:10%">${c.stateCode || ""}</td>
            <td style="padding:3px 0 3px 20px;white-space:nowrap"><strong>MOBILE NO:</strong></td>
            <td style="border-bottom:1px solid #999;padding:3px 4px;width:20%">${c.phone || ""}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Items Table -->
  <table style="font-size:10px">
    <thead>
      <tr style="background:#f0f0f0">
        <th rowspan="2" style="border:1px solid #000;padding:4px;width:30px">NO</th>
        <th rowspan="2" style="border:1px solid #000;padding:4px;text-align:left">DESCRIPTION OF GOODS</th>
        <th rowspan="2" style="border:1px solid #000;padding:4px;width:50px">HSN<br/>CODE</th>
        <th rowspan="2" style="border:1px solid #000;padding:4px;width:35px">QTN</th>
        <th rowspan="2" style="border:1px solid #000;padding:4px;width:70px">RATE</th>
        <th rowspan="2" style="border:1px solid #000;padding:4px;width:80px">TAXABLE<br/>VALUE</th>
        <th colspan="6" style="border:1px solid #000;padding:4px;text-align:center">GST TAX</th>
        <th rowspan="2" style="border:1px solid #000;padding:4px;width:80px;text-align:right">TOTAL</th>
      </tr>
      <tr style="background:#f0f0f0">
        <th style="border:1px solid #000;padding:3px;width:35px">%</th>
        <th style="border:1px solid #000;padding:3px;width:55px">SGST</th>
        <th style="border:1px solid #000;padding:3px;width:35px">%</th>
        <th style="border:1px solid #000;padding:3px;width:55px">CGST</th>
        <th style="border:1px solid #000;padding:3px;width:30px">%</th>
        <th style="border:1px solid #000;padding:3px;width:50px">IGST</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      ${emptyRows}
    </tbody>
  </table>

  <!-- Totals -->
  <table>
    <tr>
      <td style="border:1px solid #000;padding:0" colspan="100%">
        <table style="width:100%">
          <tr>
            <td style="width:65%;padding:4px 15px;border-right:1px solid #000"></td>
            <td style="padding:6px 15px;text-align:right;font-size:12px">
              <strong>Total Bill Amount :</strong>
            </td>
            <td style="padding:6px 15px;text-align:right;font-size:13px;font-weight:bold;width:120px">
              &#8377; ${snap.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Amount in words + Net Amount -->
  <table>
    <tr>
      <td style="width:65%;padding:6px 15px;border:1px solid #000;border-right:2px solid #000;font-size:11px">
        <strong>Amount Chargeable (In Words):</strong><br/>
        <em>${amountInWords}</em>
      </td>
      <td style="padding:6px 15px;border:1px solid #000;text-align:right">
        ${snap.globalDiscount > 0 ? `<div style="font-size:10px;margin-bottom:4px">Discount: -&#8377; ${snap.globalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>` : ""}
        <div style="font-size:13px;font-weight:bold">Net Amount : &nbsp; &#8377; ${netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </td>
    </tr>
  </table>

  <!-- Footer: Payment + Bank + Signatures -->
  <table>
    <tr>
      <td style="width:35%;padding:8px 15px;border:1px solid #000;vertical-align:top;font-size:11px">
        <strong>Payment Received By:</strong>&nbsp;&nbsp;${snap.paymentMethod.toUpperCase()}
        <div style="height:40px"></div>
        <div style="border-top:1px solid #999;padding-top:4px;font-size:10px">Receiver's Signature</div>
      </td>
      <td style="width:30%;padding:8px 15px;border:1px solid #000;vertical-align:top;text-align:center;font-size:10px">
        <strong style="text-decoration:underline">RTGS/NEFT TO BE SENT TO</strong><br/><br/>
        ${snap.bank ? `Bank Name: ${snap.bank.bankName} (${snap.bank.bankBranch})<br/>
        Account No.: ${snap.bank.accountNo}
        ${snap.bank.ifscCode ? "<br/>IFSC: " + snap.bank.ifscCode : ""}` : "No bank account configured"}
      </td>
      <td style="width:35%;padding:8px 15px;border:1px solid #000;vertical-align:top;text-align:right;font-size:11px">
        <div>For: <strong>${s.storeName}</strong></div>
        <div style="height:40px"></div>
        <div style="border-top:1px solid #999;display:inline-block;padding-top:4px;font-size:10px">Authorised Signatory</div>
      </td>
    </tr>
  </table>
</div>
</body></html>`;
}

// ── Component ────────────────────────────────────────────────────────────

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [invoiceCounter] = useState(() => Number(String(Date.now()).slice(-4)));
  const [cashCounter, setCashCounter] = useState(1);
  const [regularCounter, setRegularCounter] = useState(1);

  // Customer info
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    gstin: "",
    stateCode: "",
  });

  // Store settings from localStorage
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  useEffect(() => {
    const s = getStoreSettings();
    setStoreSettings(s);
    const defaultBank = getDefaultBank(s);
    if (defaultBank) setSelectedBankId(defaultBank.id);
  }, []);

  // Invoice preview
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false);
  const [invoiceSnapshot, setInvoiceSnapshot] = useState<InvoiceSnapshotType | null>(null);

  function handlePrint() {
    if (!invoiceSnapshot) return;
    const html = generateInvoiceHTML(invoiceSnapshot);
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    // Let user see preview, then print via Ctrl+P or browser print
  }

  function handleDirectPrint() {
    if (!invoiceSnapshot) return;
    const html = generateInvoiceHTML(invoiceSnapshot);
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    hsn: "",
    category: "",
    price: "",
    mrp: "",
    gst: "18",
    stock: "1",
  });

  const inStockProducts = useMemo(
    () => products.filter((p) => p.stock > 0),
    [products]
  );

  function addItem(product: Product) {
    setSearchOpen(false);
    const existing = items.find((it) => it.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`Only ${product.stock} in stock for ${product.name}`);
        return;
      }
      setItems(
        items.map((it) =>
          it.product.id === product.id
            ? { ...it, quantity: it.quantity + 1 }
            : it
        )
      );
    } else {
      setItems([...items, { product, quantity: 1, discount: 0, overridePrice: null, overrideGst: null }]);
    }
    toast.success(`Added ${product.name}`);
  }

  function updateQuantity(productId: string, delta: number) {
    setItems(
      items
        .map((it) => {
          if (it.product.id !== productId) return it;
          const newQty = it.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > it.product.stock) {
            toast.error(`Only ${it.product.stock} in stock`);
            return it;
          }
          return { ...it, quantity: newQty };
        })
        .filter(Boolean) as InvoiceItem[]
    );
  }

  function removeItem(productId: string) {
    setItems(items.filter((it) => it.product.id !== productId));
  }

  function updateItemPrice(productId: string, price: number | null) {
    setItems(
      items.map((it) =>
        it.product.id === productId ? { ...it, overridePrice: price } : it
      )
    );
  }

  function updateItemGst(productId: string, gst: number | null) {
    setItems(
      items.map((it) =>
        it.product.id === productId ? { ...it, overrideGst: gst } : it
      )
    );
  }

  function updateItemDiscount(productId: string, discount: number) {
    setItems(
      items.map((it) =>
        it.product.id === productId ? { ...it, discount } : it
      )
    );
  }

  // Calculations
  const isCash = paymentMethod === "cash";

  function getUnitPrice(it: InvoiceItem) {
    return it.overridePrice ?? it.product.price;
  }

  function getGstRate(it: InvoiceItem) {
    return it.overrideGst ?? it.product.gst;
  }

  function getItemDiscountAmount(it: InvoiceItem) {
    const lineValue = getUnitPrice(it) * it.quantity;
    return Math.round(lineValue * it.discount / 100 * 100) / 100;
  }

  const subtotal = items.reduce(
    (sum, it) => sum + getUnitPrice(it) * it.quantity - getItemDiscountAmount(it),
    0
  );
  const totalGst = isCash
    ? 0
    : items.reduce(
        (sum, it) =>
          sum +
          ((getUnitPrice(it) * it.quantity - getItemDiscountAmount(it)) * getGstRate(it)) / 100,
        0
      );
  const grandTotal = subtotal + totalGst - globalDiscount;

  function handleNewProduct(e: React.FormEvent) {
    e.preventDefault();
    const product: Product = {
      id: `new-${Date.now()}`,
      sku: newProduct.sku || `BG-NEW-${Date.now().toString(36).toUpperCase()}`,
      hsn: newProduct.hsn || "",
      name: newProduct.name,
      price: Number(newProduct.price),
      mrp: Number(newProduct.mrp) || Number(newProduct.price),
      gst: Number(newProduct.gst),
      stock: Number(newProduct.stock),
      category: newProduct.category || "Bike Accessories",
    };
    setProducts([...products, product]);
    addItem(product);
    setNewProductOpen(false);
    setNewProduct({
      name: "",
      sku: "",
      hsn: "",
      category: "",
      price: "",
      mrp: "",
      gst: "18",
      stock: "1",
    });
    toast.success(`Product "${product.name}" added to catalog & invoice`);
  }

  function handleGenerateInvoice() {
    if (items.length === 0) {
      toast.error("Add items to the invoice first");
      return;
    }
    if (!storeSettings) return;

    const prefix = isCash ? storeSettings.cashInvoicePrefix : storeSettings.invoicePrefix;
    const counter = isCash ? cashCounter : regularCounter;
    const currentInvoiceNo = `${prefix}-${String(invoiceCounter)}-${String(counter).padStart(3, "0")}`;

    if (isCash) {
      setCashCounter((c) => c + 1);
    } else {
      setRegularCounter((c) => c + 1);
    }

    setInvoiceSnapshot({
      invoiceNo: currentInvoiceNo,
      items: [...items],
      customer: { ...customer },
      subtotal,
      totalGst,
      globalDiscount,
      grandTotal,
      paymentMethod,
      isCash,
      store: storeSettings,
      bank: storeSettings.bankAccounts.find((b) => b.id === selectedBankId) || getDefaultBank(storeSettings),
      date: new Date().toLocaleDateString("en-IN"),
    });
    setInvoicePreviewOpen(true);

    // Only deduct stock for non-cash sales
    if (!isCash) {
      setProducts(
        products.map((p) => {
          const invoiceItem = items.find((it) => it.product.id === p.id);
          if (invoiceItem) {
            return { ...p, stock: p.stock - invoiceItem.quantity };
          }
          return p;
        })
      );
    }

    toast.success(
      `Invoice generated! Total: ₹${grandTotal.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      })} (${paymentMethod.toUpperCase()})`
    );
    setItems([]);
    setGlobalDiscount(0);
    setCustomer({ name: "", phone: "", address: "", gstin: "", stateCode: "" });
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-7rem)]">
      {/* Left - Product selection & invoice items */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Product search bar */}
        <div className="flex items-center gap-3 mb-4">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={searchOpen}
                className="flex-1 justify-between h-12 text-base"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                  Search products by name or SKU...
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Type product name or SKU..." />
                <CommandList>
                  <CommandEmpty>
                    <div className="py-4 text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        No products found.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          setSearchOpen(false);
                          setNewProductOpen(true);
                        }}
                      >
                        <PackagePlus className="h-4 w-4" />
                        Add New Product
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup heading="In Stock">
                    {inStockProducts.map((product) => {
                      const isAdded = items.some(
                        (it) => it.product.id === product.id
                      );
                      return (
                        <CommandItem
                          key={product.id}
                          value={`${product.name} ${product.sku}`}
                          onSelect={() => addItem(product)}
                          className="flex items-center justify-between py-3"
                        >
                          <div className="flex items-center gap-3">
                            {isAdded ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.sku} &middot; {product.category}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              &#8377;{product.price.toLocaleString("en-IN")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Stock: {product.stock}
                            </p>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="gap-2 h-12 bg-brand hover:bg-brand/90 text-brand-foreground shrink-0"
              >
                <PackagePlus className="h-5 w-5" />
                New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  This product will be saved to the catalog and added to the
                  current invoice.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewProduct} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="np-name">Product Name *</Label>
                    <Input
                      id="np-name"
                      placeholder="e.g., AGV K3 SV Helmet - L"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-sku">SKU / Barcode</Label>
                    <Input
                      id="np-sku"
                      placeholder="Auto-generated if blank"
                      value={newProduct.sku}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, sku: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-hsn">HSN Code</Label>
                    <Input
                      id="np-hsn"
                      placeholder="e.g., 6506"
                      value={newProduct.hsn}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, hsn: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-category">Category</Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(val) =>
                        setNewProduct({ ...newProduct, category: val })
                      }
                    >
                      <SelectTrigger id="np-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-price">Selling Price (&#8377;) *</Label>
                    <Input
                      id="np-price"
                      type="number"
                      placeholder="0"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-mrp">MRP (&#8377;)</Label>
                    <Input
                      id="np-mrp"
                      type="number"
                      placeholder="0"
                      value={newProduct.mrp}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, mrp: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-gst">GST %</Label>
                    <Input
                      id="np-gst"
                      type="number"
                      value={newProduct.gst}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, gst: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np-stock">Initial Stock</Label>
                    <Input
                      id="np-stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 pt-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="gap-2">
                    <PackagePlus className="h-4 w-4" />
                    Add & Bill
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Live Invoice Preview */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Invoice Preview
                {items.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {items.length} items
                  </Badge>
                )}
              </CardTitle>
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setItems([]);
                    toast("Invoice cleared");
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              <div className="border-2 border-foreground/80 mx-3 mb-3 text-[11px]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                {/* Invoice Header */}
                <div className="grid grid-cols-[65%_35%] border-b-2 border-foreground/80">
                  <div className="border-r-2 border-foreground/80 p-2.5 text-center">
                    <div className="text-[9px] font-bold tracking-widest mb-0.5">TAX INVOICE</div>
                    <div className="text-[20px] font-black tracking-wider" style={{ fontFamily: "Impact, Arial, sans-serif" }}>
                      {storeSettings?.storeName || "THE BIKER GENOME"}
                    </div>
                    <div className="text-[10px] mt-0.5">
                      {storeSettings ? `${storeSettings.address}, ${storeSettings.city} - ${storeSettings.pincode}` : ""}
                    </div>
                    <div className="text-[10px]">Phone : {storeSettings?.phones || ""}</div>
                    <div className="text-[10px]">E-mail : {storeSettings?.email || ""}</div>
                  </div>
                  <div className="p-2.5">
                    <div className="font-bold mb-2">GSTIN : {storeSettings?.gstin || ""}</div>
                    <div className="flex justify-between text-[10px] py-0.5">
                      <span>INVOICE NO :</span>
                      <span className="font-bold text-[12px]">—</span>
                    </div>
                    <div className="flex justify-between text-[10px] py-0.5">
                      <span>INVOICE DATE :</span>
                      <span className="font-bold">{new Date().toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-2 border-b border-foreground/80">
                  <div className="grid grid-cols-[70px_1fr] gap-y-1 text-[10px]">
                    <span className="font-bold">NAME:</span>
                    <span className="border-b border-foreground/30 font-bold">{customer.name || "\u00A0"}</span>
                    <span className="font-bold">ADDRESS:</span>
                    <span className="border-b border-foreground/30">{customer.address || "\u00A0"}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-x-2 mt-1 text-[10px]">
                    <span className="font-bold">GSTIN NO.</span>
                    <span className="border-b border-foreground/30">{customer.gstin || "\u00A0"}</span>
                    <span className="font-bold text-right">STATE CODE:</span>
                    <span className="border-b border-foreground/30">{customer.stateCode || "\u00A0"}</span>
                    <span className="font-bold text-right">MOBILE NO:</span>
                    <span className="border-b border-foreground/30">{customer.phone || "\u00A0"}</span>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th rowSpan={2} className="border border-foreground/80 p-1 w-[28px]">NO</th>
                      <th rowSpan={2} className="border border-foreground/80 p-1 text-left">DESCRIPTION</th>
                      <th rowSpan={2} className="border border-foreground/80 p-1 w-[40px]">HSN</th>
                      <th rowSpan={2} className="border border-foreground/80 p-1 w-[30px]">QTY</th>
                      <th rowSpan={2} className="border border-foreground/80 p-1 w-[55px] text-right">RATE</th>
                      <th rowSpan={2} className="border border-foreground/80 p-1 w-[40px] text-right">DISC%</th>
                      <th rowSpan={2} className="border border-foreground/80 p-1 w-[65px] text-right">TAXABLE</th>
                      <th colSpan={2} className="border border-foreground/80 p-1 text-center">SGST</th>
                      <th colSpan={2} className="border border-foreground/80 p-1 text-center">CGST</th>
                      <th rowSpan={2} className="border border-foreground/80 p-1 w-[65px] text-right">TOTAL</th>
                      <th rowSpan={2} className="border border-foreground/80 p-1 w-[28px]"></th>
                    </tr>
                    <tr className="bg-muted/50">
                      <th className="border border-foreground/80 p-0.5 w-[28px] text-center">%</th>
                      <th className="border border-foreground/80 p-0.5 w-[45px] text-right">AMT</th>
                      <th className="border border-foreground/80 p-0.5 w-[28px] text-center">%</th>
                      <th className="border border-foreground/80 p-0.5 w-[45px] text-right">AMT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => {
                      const unitPrice = getUnitPrice(it);
                      const gstRate = getGstRate(it);
                      const discAmt = getItemDiscountAmount(it);
                      const taxableValue = unitPrice * it.quantity - discAmt;
                      const halfRate = gstRate / 2;
                      const sgst = isCash ? 0 : taxableValue * halfRate / 100;
                      const cgst = isCash ? 0 : taxableValue * halfRate / 100;
                      const total = taxableValue + sgst + cgst;

                      return (
                        <tr key={it.product.id} className="hover:bg-muted/30 group">
                          <td className="border border-foreground/80 p-1 text-center">{idx + 1}</td>
                          <td className="border border-foreground/80 p-1">
                            <span className="font-bold truncate max-w-[180px] block">{it.product.name}</span>
                          </td>
                          <td className="border border-foreground/80 p-1 text-center">{it.product.hsn || ""}</td>
                          <td className="border border-foreground/80 p-0.5 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => updateQuantity(it.product.id, -1)}>
                                <Minus className="h-2 w-2" />
                              </Button>
                              <span className="w-5 text-center font-semibold">{it.quantity}</span>
                              <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => updateQuantity(it.product.id, 1)}>
                                <Plus className="h-2 w-2" />
                              </Button>
                            </div>
                          </td>
                          <td className="border border-foreground/80 p-0.5">
                            <Input
                              type="number"
                              className="w-full h-5 text-[10px] text-right px-1 border-0 bg-transparent"
                              value={it.overridePrice ?? it.product.price}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                updateItemPrice(it.product.id, val === it.product.price ? null : val || null);
                              }}
                            />
                          </td>
                          <td className="border border-foreground/80 p-0.5">
                            <Input
                              type="number"
                              className="w-full h-5 text-[10px] text-right px-1 border-0 bg-transparent"
                              value={it.discount || ""}
                              placeholder="0"
                              onChange={(e) => updateItemDiscount(it.product.id, Number(e.target.value) || 0)}
                            />
                          </td>
                          <td className="border border-foreground/80 p-1 text-right">{taxableValue.toFixed(2)}</td>
                          <td className="border border-foreground/80 p-1 text-center">{isCash ? "-" : `${halfRate.toFixed(1)}%`}</td>
                          <td className="border border-foreground/80 p-1 text-right">{isCash ? "-" : sgst.toFixed(2)}</td>
                          <td className="border border-foreground/80 p-1 text-center">{isCash ? "-" : `${halfRate.toFixed(1)}%`}</td>
                          <td className="border border-foreground/80 p-1 text-right">{isCash ? "-" : cgst.toFixed(2)}</td>
                          <td className="border border-foreground/80 p-1 text-right font-bold">{total.toFixed(2)}</td>
                          <td className="border border-foreground/80 p-1 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 opacity-0 group-hover:opacity-100 text-destructive"
                              onClick={() => removeItem(it.product.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Empty rows to fill invoice look */}
                    {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
                      <tr
                        key={`empty-${i}`}
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() => setSearchOpen(true)}
                      >
                        <td className="border border-foreground/80 p-2.5 text-center text-foreground/20">{items.length + i + 1}</td>
                        <td className="border border-foreground/80 p-2.5 text-foreground/20 text-[9px]">
                          {i === 0 && items.length === 0 ? "Click to add item or search above..." : "\u00A0"}
                        </td>
                        <td className="border border-foreground/80 p-2.5"></td>
                        <td className="border border-foreground/80 p-2.5"></td>
                        <td className="border border-foreground/80 p-2.5"></td>
                        <td className="border border-foreground/80 p-2.5"></td>
                        <td className="border border-foreground/80 p-2.5"></td>
                        <td className="border border-foreground/80 p-2.5"></td>
                        <td className="border border-foreground/80 p-2.5"></td>
                        <td className="border border-foreground/80 p-2.5"></td>
                        <td className="border border-foreground/80 p-2.5"></td>
                        <td className="border border-foreground/80 p-2.5"></td>
                        <td className="border border-foreground/80 p-2.5"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Row */}
                <div className="grid grid-cols-[65%_35%] border-t border-foreground/80">
                  <div className="border-r-2 border-foreground/80 p-2 text-[10px]">
                    <strong>Amount Chargeable (In Words):</strong><br />
                    <em>{grandTotal > 0 ? numberToWords(Math.round(grandTotal)) : "—"}</em>
                  </div>
                  <div className="p-2 text-right">
                    {globalDiscount > 0 && (
                      <div className="text-[10px] mb-1">Discount: -₹{globalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                    )}
                    <div className="text-[12px] font-bold">
                      Net Amount: ₹{Math.round(grandTotal).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="grid grid-cols-3 border-t border-foreground/80 text-[10px]">
                  <div className="border-r border-foreground/80 p-2">
                    <strong>Payment:</strong> {paymentMethod.toUpperCase()}
                    <div className="h-6" />
                    <div className="border-t border-foreground/30 pt-1 text-[9px]">Receiver&apos;s Signature</div>
                  </div>
                  <div className="border-r border-foreground/80 p-2 text-center">
                    <strong className="underline">RTGS/NEFT TO BE SENT TO</strong>
                    {storeSettings && (() => {
                      const bank = storeSettings.bankAccounts.find((b) => b.id === selectedBankId) || getDefaultBank(storeSettings);
                      return bank ? (
                        <div className="mt-1 text-[9px]">
                          {bank.bankName} ({bank.bankBranch})<br />
                          A/C: {bank.accountNo}
                          {bank.ifscCode && <><br />IFSC: {bank.ifscCode}</>}
                        </div>
                      ) : null;
                    })()}
                  </div>
                  <div className="p-2 text-right">
                    <div>For: <strong>{storeSettings?.storeName || ""}</strong></div>
                    <div className="h-6" />
                    <div className="border-t border-foreground/30 inline-block pt-1 text-[9px]">Authorised Signatory</div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right - Payment panel */}
      <div className="w-[340px] shrink-0 flex flex-col gap-4">
        {/* Store info */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center shrink-0">
                <span className="text-brand-foreground font-bold text-sm">
                  B
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm">The Biker Genome</p>
                <p className="text-xs text-muted-foreground">
                  {isCash ? "Cash Sale" : "Tax Invoice"}
                </p>
              </div>
              {isCash && (
                <Badge variant="outline" className="ml-auto text-[10px] border-amber-400 text-amber-600">
                  No GST &middot; No Trail
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Name"
                className="h-8 text-xs"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
              <Input
                placeholder="Mobile"
                className="h-8 text-xs"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
            </div>
            <Input
              placeholder="Address"
              className="h-8 text-xs"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="GSTIN (optional)"
                className="h-8 text-xs font-mono"
                value={customer.gstin}
                onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
              />
              <Input
                placeholder="State Code"
                className="h-8 text-xs"
                value={customer.stateCode}
                onChange={(e) => setCustomer({ ...customer, stateCode: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="text-base">Bill Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  &#8377;{subtotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST</span>
                <span>
                  {isCash ? "\u2014" : `\u20B9${totalGst.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Discount (₹)</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    className="w-16 h-7 text-xs text-right"
                    value={globalDiscount || ""}
                    placeholder="0"
                    onChange={(e) =>
                      setGlobalDiscount(Number(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-brand">
                  &#8377;
                  {grandTotal.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {/* Payment method */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Payment Method
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "cash", icon: Banknote, label: "Cash" },
                    { value: "upi", icon: Smartphone, label: "UPI" },
                    { value: "card", icon: CreditCard, label: "Card" },
                    {
                      value: "split",
                      icon: SplitSquareHorizontal,
                      label: "Split",
                    },
                  ].map((pm) => {
                    const PmIcon = pm.icon;
                    return (
                      <button
                        key={pm.value}
                        type="button"
                        onClick={() => setPaymentMethod(pm.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all",
                          paymentMethod === pm.value
                            ? "border-brand bg-brand/5 text-brand"
                            : "border-border text-muted-foreground hover:border-foreground/20"
                        )}
                      >
                        <PmIcon className="h-5 w-5" />
                        {pm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bank account selector */}
              {storeSettings && storeSettings.bankAccounts.length > 1 && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Bank Account (for invoice)
                  </Label>
                  <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {storeSettings.bankAccounts.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.bankName} - {b.accountNo.slice(-4).padStart(b.accountNo.length, "*")}
                          {b.isDefault ? " (Default)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full h-12 text-base gap-2 bg-brand hover:bg-brand/90 text-brand-foreground"
                  onClick={handleGenerateInvoice}
                  disabled={items.length === 0}
                >
                  <Receipt className="h-5 w-5" />
                  Generate Invoice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={invoicePreviewOpen} onOpenChange={setInvoicePreviewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Invoice Preview &mdash; {invoiceSnapshot?.invoiceNo}
            </DialogTitle>
            <DialogDescription>
              Review the tax invoice below. Use Preview to see the print layout, or Print to send directly to printer.
            </DialogDescription>
          </DialogHeader>

          {invoiceSnapshot && (
            <>
              {/* Inline preview via iframe for proper CSS isolation */}
              <iframe
                className="w-full border rounded-lg bg-white"
                style={{ height: "60vh" }}
                srcDoc={generateInvoiceHTML(invoiceSnapshot)}
                title={`Invoice Preview ${invoiceSnapshot.invoiceNo}`}
              />

              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button variant="outline" className="gap-2" onClick={handlePrint}>
                  <Eye className="h-4 w-4" />
                  Preview in New Tab
                </Button>
                <Button className="gap-2" onClick={handleDirectPrint}>
                  <Printer className="h-4 w-4" />
                  Print Invoice
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
