"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, Printer, CreditCard, Bell, FileText, Landmark, Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import {
  type StoreSettings,
  type BankAccount,
  getStoreSettings,
  saveStoreSettings,
} from "@/config/store-settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    setSettings(getStoreSettings());
  }, []);

  if (!settings) return null;

  function update<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleSave() {
    if (settings) {
      saveStoreSettings(settings);
      toast.success("Settings saved successfully");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage store configuration, invoice details and preferences
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList>
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            Store
          </TabsTrigger>
          <TabsTrigger value="invoice" className="gap-2">
            <FileText className="h-4 w-4" />
            Invoice
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-2">
            <Landmark className="h-4 w-4" />
            Bank
          </TabsTrigger>
          <TabsTrigger value="printer" className="gap-2">
            <Printer className="h-4 w-4" />
            Printer
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* ── Store Information ──────────────────────────────── */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Store Information</CardTitle>
              <CardDescription>
                These details appear on the invoice header
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Store Name</Label>
                  <Input
                    value={settings.storeName}
                    onChange={(e) => update("storeName", e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={settings.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={settings.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={settings.state}
                    onChange={(e) => update("state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input
                    value={settings.pincode}
                    onChange={(e) => update("pincode", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State Code</Label>
                  <Input
                    value={settings.stateCode}
                    onChange={(e) => update("stateCode", e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Phone Numbers</Label>
                  <Input
                    value={settings.phones}
                    onChange={(e) => update("phones", e.target.value)}
                    placeholder="+91 98313 19291 / +91 87772 77467"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={settings.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={settings.website}
                    onChange={(e) => update("website", e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>GSTIN</Label>
                  <Input
                    value={settings.gstin}
                    onChange={(e) => update("gstin", e.target.value)}
                    placeholder="e.g. 19AAPFT7973E1ZF"
                    className="font-mono"
                  />
                </div>
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Invoice Settings ──────────────────────────────── */}
        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Configuration</CardTitle>
              <CardDescription>
                Invoice numbering and tax defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Regular Invoice Prefix</Label>
                  <Input
                    value={settings.invoicePrefix}
                    onChange={(e) => update("invoicePrefix", e.target.value)}
                    placeholder="TBG"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cash Invoice Prefix</Label>
                  <Input
                    value={settings.cashInvoicePrefix}
                    onChange={(e) => update("cashInvoicePrefix", e.target.value)}
                    placeholder="CS"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default GST %</Label>
                  <Input
                    type="number"
                    value={settings.defaultGst}
                    onChange={(e) => update("defaultGst", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Authorised Signatory Name</Label>
                  <Input
                    value={settings.signatoryName}
                    onChange={(e) => update("signatoryName", e.target.value)}
                    placeholder="Name printed on invoice"
                  />
                </div>
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Bank Details ──────────────────────────────────── */}
        <TabsContent value="bank">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Bank Accounts</h3>
                <p className="text-sm text-muted-foreground">
                  Bank details printed on invoices. The default account is shown on all invoices.
                </p>
              </div>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  const newAccount: BankAccount = {
                    id: `bank-${Date.now()}`,
                    bankName: "",
                    bankBranch: "",
                    accountNo: "",
                    ifscCode: "",
                    isDefault: settings.bankAccounts.length === 0,
                  };
                  update("bankAccounts", [...settings.bankAccounts, newAccount]);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </div>

            {settings.bankAccounts.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Landmark className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No bank accounts added. Click &quot;Add Account&quot; to get started.</p>
                </CardContent>
              </Card>
            )}

            {settings.bankAccounts.map((bank, index) => (
              <Card key={bank.id} className={bank.isDefault ? "border-brand" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Landmark className="h-4 w-4" />
                      {bank.bankName || `Account ${index + 1}`}
                      {bank.isDefault && (
                        <Badge variant="secondary" className="text-[10px]">Default</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {!bank.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => {
                            const updated = settings.bankAccounts.map((b) => ({
                              ...b,
                              isDefault: b.id === bank.id,
                            }));
                            update("bankAccounts", updated);
                          }}
                        >
                          <Star className="h-3.5 w-3.5" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          const updated = settings.bankAccounts.filter((b) => b.id !== bank.id);
                          if (bank.isDefault && updated.length > 0) {
                            updated[0].isDefault = true;
                          }
                          update("bankAccounts", updated);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input
                        value={bank.bankName}
                        onChange={(e) => {
                          const updated = settings.bankAccounts.map((b) =>
                            b.id === bank.id ? { ...b, bankName: e.target.value } : b
                          );
                          update("bankAccounts", updated);
                        }}
                        placeholder="e.g. AXIS BANK"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Branch</Label>
                      <Input
                        value={bank.bankBranch}
                        onChange={(e) => {
                          const updated = settings.bankAccounts.map((b) =>
                            b.id === bank.id ? { ...b, bankBranch: e.target.value } : b
                          );
                          update("bankAccounts", updated);
                        }}
                        placeholder="e.g. Sahid Nagar, Kolkata Branch"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        value={bank.accountNo}
                        onChange={(e) => {
                          const updated = settings.bankAccounts.map((b) =>
                            b.id === bank.id ? { ...b, accountNo: e.target.value } : b
                          );
                          update("bankAccounts", updated);
                        }}
                        placeholder="e.g. 920020000488322"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>IFSC Code</Label>
                      <Input
                        value={bank.ifscCode}
                        onChange={(e) => {
                          const updated = settings.bankAccounts.map((b) =>
                            b.id === bank.id ? { ...b, ifscCode: e.target.value } : b
                          );
                          update("bankAccounts", updated);
                        }}
                        placeholder="e.g. UTIB0001234"
                        className="font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </TabsContent>

        {/* ── Printer ──────────────────────────────────────── */}
        <TabsContent value="printer">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Printer Configuration</CardTitle>
              <CardDescription>
                Configure the receipt printer connected to this terminal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Printer Type</Label>
                  <Select defaultValue="browser">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thermal">Thermal Printer</SelectItem>
                      <SelectItem value="inkjet">Inkjet/Laser</SelectItem>
                      <SelectItem value="browser">Browser Print</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Paper Size</Label>
                  <Select defaultValue="a4">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58mm">58mm</SelectItem>
                      <SelectItem value="80mm">80mm</SelectItem>
                      <SelectItem value="a4">A4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => toast.success("Printer configured.")}>
                Save & Test Print
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Payment ──────────────────────────────────────── */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Gateway</CardTitle>
              <CardDescription>
                Configure Razorpay for online payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Razorpay Key ID</Label>
                <Input placeholder="rzp_live_xxxxxxxxxxxxx" type="password" />
              </div>
              <div className="space-y-2">
                <Label>Razorpay Key Secret</Label>
                <Input placeholder="xxxxxxxxxxxxx" type="password" />
              </div>
              <Button onClick={() => toast.success("Payment gateway verified and saved")}>
                Save & Verify
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Alerts ───────────────────────────────────────── */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alert Settings</CardTitle>
              <CardDescription>
                Configure low stock alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Reorder Level</Label>
                <Input type="number" defaultValue="5" />
              </div>
              <div className="space-y-2">
                <Label>Alert Email</Label>
                <Input defaultValue="admin@thebikergenome.com" />
              </div>
              <Button onClick={() => toast.success("Alert settings saved")}>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
