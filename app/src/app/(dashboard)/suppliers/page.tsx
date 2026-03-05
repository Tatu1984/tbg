"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { Plus, MoreHorizontal, Edit, Trash2, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

type Supplier = {
  id: number;
  name: string;
  contact: string;
  gst: string;
  address: string;
  terms: string;
};

const initialSuppliers: Supplier[] = [
  { id: 1, name: "Rynox Gear Pvt Ltd", contact: "+91 80 2656 1234", gst: "29AABCR1234M1ZR", address: "Bangalore, KA", terms: "Net 30" },
  { id: 2, name: "Steelbird Helmets", contact: "+91 124 456 7890", gst: "06AABCS5678N1ZQ", address: "Gurugram, HR", terms: "Net 15" },
  { id: 3, name: "Cramster Motorcycling", contact: "+91 80 4123 5678", gst: "29AABCC9012P1ZR", address: "Bangalore, KA", terms: "Net 30" },
  { id: 4, name: "Royal Enfield Accessories", contact: "+91 44 2231 4567", gst: "33AABCR3456Q1ZS", address: "Chennai, TN", terms: "COD" },
  { id: 5, name: "Quad Lock India", contact: "+91 22 6789 0123", gst: "27AABCQ7890R1ZT", address: "Mumbai, MH", terms: "Net 45" },
];

const paymentTermsOptions = ["COD", "Net 15", "Net 30", "Net 45", "Net 60"];

type FormData = {
  name: string;
  contact: string;
  address: string;
  gst: string;
  terms: string;
};

const emptyForm: FormData = {
  name: "",
  contact: "",
  address: "",
  gst: "",
  terms: "",
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [nextId, setNextId] = useState(6);

  // Add/Edit dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  function openAddDialog() {
    setEditingSupplier(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditDialog(supplier: Supplier) {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      contact: supplier.contact,
      address: supplier.address,
      gst: supplier.gst,
      terms: supplier.terms,
    });
    setFormOpen(true);
  }

  function openDeleteDialog(supplier: Supplier) {
    setDeletingSupplier(supplier);
    setDeleteOpen(true);
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim() || !form.contact.trim() || !form.terms) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (editingSupplier) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === editingSupplier.id
            ? { ...s, ...form }
            : s
        )
      );
      toast.success(`"${form.name}" has been updated.`);
    } else {
      const newSupplier: Supplier = {
        id: nextId,
        ...form,
      };
      setSuppliers((prev) => [...prev, newSupplier]);
      setNextId((prev) => prev + 1);
      toast.success(`"${form.name}" has been added.`);
    }

    setFormOpen(false);
  }

  function handleDelete() {
    if (!deletingSupplier) return;
    setSuppliers((prev) => prev.filter((s) => s.id !== deletingSupplier.id));
    toast.success(`"${deletingSupplier.name}" has been removed.`);
    setDeleteOpen(false);
    setDeletingSupplier(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground">
            Manage supplier contacts and purchase terms
          </p>
        </div>
        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>GST Number</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {s.contact}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {s.gst}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {s.address}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{s.terms}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(s)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(s)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {suppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No suppliers found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Supplier Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Edit Supplier" : "Add Supplier"}
            </DialogTitle>
            <DialogDescription>
              {editingSupplier
                ? "Update the supplier details below."
                : "Fill in the details to add a new supplier."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Name *</Label>
              <Input
                id="supplier-name"
                placeholder="e.g. Rynox Gear Pvt Ltd"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-contact">Contact Number *</Label>
              <Input
                id="supplier-contact"
                placeholder="e.g. +91 80 2656 1234"
                value={form.contact}
                onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-address">Address</Label>
              <Input
                id="supplier-address"
                placeholder="e.g. Bangalore, KA"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-gst">GST Number</Label>
              <Input
                id="supplier-gst"
                placeholder="e.g. 29AABCR1234M1ZR"
                value={form.gst}
                onChange={(e) => setForm((f) => ({ ...f, gst: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Terms *</Label>
              <Select
                value={form.terms}
                onValueChange={(value) => setForm((f) => ({ ...f, terms: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTermsOptions.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingSupplier ? "Save Changes" : "Add Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Supplier</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {deletingSupplier ? `"${deletingSupplier.name}"` : "this supplier"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
