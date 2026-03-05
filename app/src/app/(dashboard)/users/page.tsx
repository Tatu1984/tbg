"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Shield,
  UserX,
  Eye,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Role = "owner" | "manager" | "cashier" | "inventory_staff";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: "active" | "inactive";
  lastLogin: string;
}

const initialUsers: User[] = [
  { id: 1, name: "Sudipto (Owner)", email: "sudipto@tbg.com", phone: "+91 98765 43210", role: "owner", status: "active", lastLogin: "5 min ago" },
  { id: 2, name: "Rakesh Kumar", email: "rakesh@tbg.com", phone: "+91 98765 43211", role: "manager", status: "active", lastLogin: "2 hours ago" },
  { id: 3, name: "Priya Sharma", email: "priya@tbg.com", phone: "+91 98765 43212", role: "cashier", status: "active", lastLogin: "30 min ago" },
  { id: 4, name: "Amit Verma", email: "amit@tbg.com", phone: "+91 98765 43213", role: "cashier", status: "active", lastLogin: "1 day ago" },
  { id: 5, name: "Deepak Singh", email: "deepak@tbg.com", phone: "+91 98765 43214", role: "inventory_staff", status: "inactive", lastLogin: "1 week ago" },
];

const roleColors: Record<Role, string> = {
  owner: "bg-brand/10 text-brand border-brand/20",
  manager: "bg-purple-500/10 text-purple-700 border-purple-200",
  cashier: "bg-blue-500/10 text-blue-700 border-blue-200",
  inventory_staff: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
};

const roleLabels: Record<Role, string> = {
  owner: "Owner",
  manager: "Manager",
  cashier: "Cashier",
  inventory_staff: "Inventory Staff",
};

const permissionModules = [
  "POS Billing",
  "Products",
  "Inventory",
  "Suppliers",
  "Reports",
  "Users",
  "Settings",
  "Non-Billed Sales",
  "Purchase Orders",
  "Customers",
] as const;

const rolePermissions: Record<Role, Record<string, boolean>> = {
  owner: {
    "POS Billing": true,
    "Products": true,
    "Inventory": true,
    "Suppliers": true,
    "Reports": true,
    "Users": true,
    "Settings": true,
    "Non-Billed Sales": true,
    "Purchase Orders": true,
    "Customers": true,
  },
  manager: {
    "POS Billing": true,
    "Products": true,
    "Inventory": true,
    "Suppliers": true,
    "Reports": true,
    "Users": false,
    "Settings": false,
    "Non-Billed Sales": true,
    "Purchase Orders": true,
    "Customers": true,
  },
  cashier: {
    "POS Billing": true,
    "Products": false,
    "Inventory": false,
    "Suppliers": false,
    "Reports": false,
    "Users": false,
    "Settings": false,
    "Non-Billed Sales": true,
    "Purchase Orders": false,
    "Customers": true,
  },
  inventory_staff: {
    "POS Billing": false,
    "Products": true,
    "Inventory": true,
    "Suppliers": true,
    "Reports": false,
    "Users": false,
    "Settings": false,
    "Non-Billed Sales": false,
    "Purchase Orders": true,
    "Customers": false,
  },
};

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}

const emptyForm: UserFormData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "cashier",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);

  // --- Add User ---
  function handleOpenAdd() {
    setFormData(emptyForm);
    setAddOpen(true);
  }

  function handleAddSubmit() {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const newUser: User = {
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      status: "active",
      lastLogin: "Never",
    };
    setUsers((prev) => [...prev, newUser]);
    setAddOpen(false);
    toast.success(`${newUser.name} has been added as ${roleLabels[newUser.role]}.`);
  }

  // --- Edit User ---
  function handleOpenEdit(user: User) {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: "",
      role: user.role,
    });
    setEditOpen(true);
  }

  function handleEditSubmit() {
    if (!selectedUser) return;
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              role: formData.role,
            }
          : u
      )
    );
    setEditOpen(false);
    toast.success(`${formData.name.trim()} has been updated.`);
  }

  // --- Deactivate / Reactivate ---
  function handleOpenDeactivate(user: User) {
    setSelectedUser(user);
    setDeactivateOpen(true);
  }

  function handleDeactivateConfirm() {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === "active" ? "inactive" : "active";
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, status: newStatus } : u))
    );
    setDeactivateOpen(false);
    toast.success(
      newStatus === "inactive"
        ? `${selectedUser.name} has been deactivated.`
        : `${selectedUser.name} has been reactivated.`
    );
  }

  // --- View Permissions ---
  function handleOpenPermissions(user: User) {
    setSelectedUser(user);
    setPermissionsOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage staff accounts and permissions
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenAdd}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {u.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium capitalize ${roleColors[u.role]}`}
                    >
                      <Shield className="h-3 w-3" />
                      {u.role.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.status === "active" ? "secondary" : "outline"}
                      className="text-xs capitalize"
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.lastLogin}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(u)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenPermissions(u)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleOpenDeactivate(u)}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          {u.status === "active" ? "Deactivate" : "Reactivate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ============ Add User Dialog ============ */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>
              Create a new staff account. They will receive login credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Full Name *</Label>
              <Input
                id="add-name"
                placeholder="e.g. Ravi Patel"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-email">Email *</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="ravi@tbg.com"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-phone">Phone</Label>
              <Input
                id="add-phone"
                type="tel"
                placeholder="+91 98765 43215"
                value={formData.phone}
                onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-password">Password *</Label>
              <Input
                id="add-password"
                type="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData((f) => ({ ...f, role: val as Role }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="inventory_staff">Inventory Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubmit}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ Edit User Dialog ============ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update account details for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">Change Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.password}
                onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData((f) => ({ ...f, role: val as Role }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="inventory_staff">Inventory Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ Deactivate Confirmation Dialog ============ */}
      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.status === "active" ? "Deactivate" : "Reactivate"} User
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.status === "active" ? (
                <>
                  <span className="font-semibold text-foreground">{selectedUser?.name}</span>{" "}
                  will no longer be able to access the system. Deactivate?
                </>
              ) : (
                <>
                  <span className="font-semibold text-foreground">{selectedUser?.name}</span>{" "}
                  will regain access to the system. Reactivate?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={selectedUser?.status === "active" ? "destructive" : "default"}
              onClick={handleDeactivateConfirm}
            >
              {selectedUser?.status === "active" ? "Deactivate" : "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ View Permissions Sheet ============ */}
      <Sheet open={permissionsOpen} onOpenChange={setPermissionsOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions
            </SheetTitle>
            <SheetDescription>
              RBAC permissions for{" "}
              <span className="font-medium text-foreground">{selectedUser?.name}</span>
            </SheetDescription>
          </SheetHeader>

          {selectedUser && (
            <div className="px-4 pb-6 space-y-4">
              {/* Role badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Role:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium capitalize ${roleColors[selectedUser.role]}`}
                >
                  <Shield className="h-3 w-3" />
                  {selectedUser.role.replace("_", " ")}
                </span>
              </div>

              <Separator />

              {/* Permissions matrix */}
              <div className="space-y-1">
                <p className="text-sm font-medium mb-3">Module Access</p>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Module</TableHead>
                        <TableHead className="text-xs text-center w-20">Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissionModules.map((mod) => {
                        const hasAccess = rolePermissions[selectedUser.role][mod];
                        return (
                          <TableRow key={mod}>
                            <TableCell className="text-sm py-2.5">{mod}</TableCell>
                            <TableCell className="text-center py-2.5">
                              {hasAccess ? (
                                <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground/50 mx-auto" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground">
                {selectedUser.role === "owner"
                  ? "Owners have full access to all modules and system settings."
                  : selectedUser.role === "manager"
                    ? "Managers can handle day-to-day operations but cannot manage users or system settings."
                    : selectedUser.role === "cashier"
                      ? "Cashiers can only access POS billing, non-billed sales, and customer records."
                      : "Inventory staff can manage products, inventory, suppliers, and purchase orders."}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
