"use client";

import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Shield,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/frontend/api/client";

type Role = "owner" | "manager" | "cashier" | "inventory_staff";

interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

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

interface UserFormData {
  username: string;
  name: string;
  password: string;
  role: Role;
}

const emptyForm: UserFormData = {
  username: "",
  name: "",
  password: "",
  role: "cashier",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data } = await apiClient.get("/users");
      setUsers(data.users);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  // --- Add User ---
  function handleOpenAdd() {
    setFormData(emptyForm);
    setAddOpen(true);
  }

  async function handleAddSubmit() {
    if (!formData.username.trim() || !formData.name.trim() || !formData.password.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      await apiClient.post("/users", formData);
      toast.success(`${formData.name} has been added as ${roleLabels[formData.role]}.`);
      setAddOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to add user";
      toast.error(msg);
    }
  }

  // --- Edit User ---
  function handleOpenEdit(user: User) {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      password: "",
      role: user.role,
    });
    setEditOpen(true);
  }

  async function handleEditSubmit() {
    if (!selectedUser) return;
    if (!formData.username.trim() || !formData.name.trim()) {
      toast.error("Username and name are required.");
      return;
    }

    const updateData: Record<string, unknown> = {
      id: selectedUser.id,
      username: formData.username.trim(),
      name: formData.name.trim(),
      role: formData.role,
    };
    if (formData.password.trim()) {
      updateData.password = formData.password.trim();
    }

    try {
      await apiClient.put("/users", updateData);
      toast.success(`${formData.name.trim()} has been updated.`);
      setEditOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update user";
      toast.error(msg);
    }
  }

  // --- Deactivate / Reactivate ---
  function handleOpenDeactivate(user: User) {
    setSelectedUser(user);
    setDeactivateOpen(true);
  }

  async function handleDeactivateConfirm() {
    if (!selectedUser) return;
    const newStatus = !selectedUser.active;
    try {
      await apiClient.put("/users", { id: selectedUser.id, active: newStatus });
      toast.success(
        newStatus
          ? `${selectedUser.name} has been reactivated.`
          : `${selectedUser.name} has been deactivated.`
      );
      setDeactivateOpen(false);
      fetchUsers();
    } catch {
      toast.error("Failed to update user status");
    }
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
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
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
                        <p className="text-sm font-medium">{u.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {u.username}
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
                        variant={u.active ? "secondary" : "outline"}
                        className="text-xs capitalize"
                      >
                        {u.active ? "active" : "inactive"}
                      </Badge>
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
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleOpenDeactivate(u)}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            {u.active ? "Deactivate" : "Reactivate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ============ Add User Dialog ============ */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>
              Create a new staff account with username and password.
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
              <Label htmlFor="add-username">Username *</Label>
              <Input
                id="add-username"
                placeholder="e.g. ravi"
                value={formData.username}
                onChange={(e) => setFormData((f) => ({ ...f, username: e.target.value }))}
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
              <Label htmlFor="edit-username">Username *</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData((f) => ({ ...f, username: e.target.value }))}
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
              {selectedUser?.active ? "Deactivate" : "Reactivate"} User
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.active ? (
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
              variant={selectedUser?.active ? "destructive" : "default"}
              onClick={handleDeactivateConfirm}
            >
              {selectedUser?.active ? "Deactivate" : "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
