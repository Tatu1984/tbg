"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Store, Printer, CreditCard, Bell } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage store configuration and preferences
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList>
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            Store
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

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Store Information</CardTitle>
              <CardDescription>
                Basic details shown on invoices and the website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input defaultValue="The Biker Genome" />
                </div>
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input defaultValue="29AABCT1234M1ZR" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="store@thebikergenome.com" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Address</Label>
                  <Input defaultValue="123 MG Road, Bangalore, Karnataka - 560001" />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default GST %</Label>
                  <Input type="number" defaultValue="18" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue="inr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">INR (&#8377;)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => toast.success("Store settings saved")}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

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
                  <Select defaultValue="thermal">
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
                  <Select defaultValue="80mm">
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
              <Button onClick={() => toast.success("Printer configured. Test page sent.")}>Save & Test Print</Button>
            </CardContent>
          </Card>
        </TabsContent>

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
              <Button onClick={() => toast.success("Payment gateway verified and saved")}>Save & Verify</Button>
            </CardContent>
          </Card>
        </TabsContent>

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
              <Button onClick={() => toast.success("Alert settings saved")}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
