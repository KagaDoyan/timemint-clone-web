'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus } from 'lucide-react';
import { toast } from "sonner";

interface Department {
  id: number;
  name: string;
}

interface DepartmentPaginationResponse {
  data: {
    limit: number;
    page: number;
    data: Department[];
    totalPages: number;
    totalRows: number;
  };
  status: boolean;
  error?: string;
}

interface DepartmentPageProps {
  session: any;
}

export default function DepartmentManagement({ session }: DepartmentPageProps) {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Partial<Department>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [nameFilter, setNameFilter] = useState('');

  const columns = useMemo<ColumnDef<Department>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const department = row.original;

        const handleEdit = () => {
          setCurrentDepartment(department);
          setIsEditing(true);
          setIsDialogOpen(true);
        };

        const handleDeleteConfirmation = () => {
          setDepartmentToDelete(department);
          setIsDeleteDialogOpen(true);
        };

        return (
          <ActionDropdown
            onEdit={handleEdit}
            onDelete={handleDeleteConfirmation}
          />
        );
      },
    }
  ], []);

  // Fetch departments
  const fetchDepartments = async (limit: number = 10, page: number = 1, nameFilter: string = '') => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        ...(nameFilter && { name: nameFilter })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/departments/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      const result: DepartmentPaginationResponse = await response.json();

      if (result.status && result.data) {
        setDepartments(result.data.data);
        setTotalPages(result.data.totalPages);
        setTotalRows(result.data.totalRows);
        setCurrentPage(result.data.page);
      } else {
        toast.error(result.error || "Failed to fetch departments");
        setDepartments([]);
        setTotalPages(0);
        setTotalRows(0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error("Network error occurred");
      setDepartments([]);
      setTotalPages(0);
      setTotalRows(0);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments(limit, page, nameFilter);
  }, [limit, page, nameFilter]);

  // Create or update department
  const handleSaveDepartment = async () => {
    try {
      if (!currentDepartment.name?.trim()) {
        toast.error("Department name is required");
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/departments${isEditing ? `/${currentDepartment.id}` : ''}`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          name: currentDepartment.name.trim(),
          ...(isEditing && { id: currentDepartment.id })
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Operation failed: ${errorBody}`);
      }

      const result = await response.json();

      if (result.status) {
        toast.success(isEditing ? "department updated successfully" : "department created successfully");
        fetchDepartments(limit, page, nameFilter);
        setIsDialogOpen(false);
        setCurrentDepartment({});
        setIsEditing(false);
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(error instanceof Error ? error.message : "Network error occurred");
    }
  };

  // Delete department
  const handleDeleteDepartment = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/departments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        }
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Deletion failed: ${errorBody}`);
      }

      const result = await response.json();

      if (result.status) {
        toast.success("department deleted successfully");
        fetchDepartments(limit, page, nameFilter);
        setIsDeleteDialogOpen(false);
        setDepartmentToDelete(null);
      } else {
        toast.error(result.error || "Deletion failed");
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error(error instanceof Error ? error.message : "Network error occurred");
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    setCurrentDepartment({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold w-full text-center sm:text-left">department Management</h1>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus size={16} /> Create department
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={departments}
        pageSize={limit}
        totalPages={totalPages}
        onPageSizeChange={setLimit}
        onPageChange={setPage}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setCurrentDepartment({});
            setIsEditing(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit department' : 'Create department'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentDepartment.name || ''}
                onChange={(e) =>
                  setCurrentDepartment(prev => ({ ...prev, name: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter department name"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDepartment}
              disabled={!currentDepartment.name}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the department.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => departmentToDelete && handleDeleteDepartment(departmentToDelete.id.toString())}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="mt-4 text-sm text-muted-foreground text-center">
        Page {currentPage} of {totalPages} • Total Rows: {totalRows}
      </div>
    </div>
  );
}
