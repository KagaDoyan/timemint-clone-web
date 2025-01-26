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

interface Employee {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  role_id: number;
  role: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface EmployeePaginationResponse {
  data: {
    limit: number;
    page: number;
    rows: Employee[];
    totalPages: number;
    totalRows: number;
  };
  status: boolean;
  error?: string;
}

interface EmployeePageProps {
  session: any;
}

export default function EmployeePage({ session }: EmployeePageProps) {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const columns = useMemo<ColumnDef<Employee>[]>(() => [
    {
      accessorKey: 'employee_id',
      header: 'Employee ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'address',
      header: 'Address',
    },
    {
      accessorKey: 'position',
      header: 'Position',
    },
    {
      accessorKey: 'role.name',
      header: 'Role',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const employee = row.original;

        const handleEdit = () => {
          setCurrentEmployee(employee);
          setIsEditing(true);
          setIsDialogOpen(true);
        };

        const handleDeleteConfirmation = () => {
          setEmployeeToDelete(employee);
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

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch employees');
      }

      const responseData: EmployeePaginationResponse = await res.json();

      if (responseData.status && responseData.data) {
        setEmployees(responseData.data.rows);
        setTotalPages(responseData.data.totalPages);
        setTotalRows(responseData.data.totalRows);
        setCurrentPage(responseData.data.page);
      } else {
        setEmployees([]);
        setTotalPages(0);
        setTotalRows(0);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      setTotalPages(0);
      setTotalRows(0);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit, page]);

  const handleSaveEmployee = async () => {
    try {
      if (!currentEmployee.name?.trim()) {
        toast.error("Employee name is required");
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/employees${isEditing ? `/${currentEmployee.id}` : ''}`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          employee_id: currentEmployee.employee_id,
          name: currentEmployee.name.trim(),
          email: currentEmployee.email,
          phone: currentEmployee.phone,
          address: currentEmployee.address,
          position: currentEmployee.position,
          role_id: currentEmployee.role_id,
          ...(isEditing && { id: currentEmployee.id })
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Operation failed: ${errorBody}`);
      }

      const result = await response.json();

      if (result.status) {
        toast.success(isEditing ? "Employee updated successfully" : "Employee created successfully");
        fetchData();
        setIsDialogOpen(false);
        setCurrentEmployee({});
        setIsEditing(false);
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(error instanceof Error ? error.message : "Network error occurred");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/${id}`, {
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
        toast.success("Employee deleted successfully");
        fetchData();
        setIsDeleteDialogOpen(false);
        setEmployeeToDelete(null);
      } else {
        toast.error(result.error || "Deletion failed");
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error instanceof Error ? error.message : "Network error occurred");
    }
  };

  const openCreateDialog = () => {
    setCurrentEmployee({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="w-full h-full p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>
      
      <div className="w-full">
        <DataTable
          columns={columns}
          data={employees}
          pageSize={limit}
          onPageSizeChange={setLimit}
          onPageChange={setPage}
        />
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setCurrentEmployee({});
            setIsEditing(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Employee' : 'Create Employee'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentEmployee.name || ''}
                onChange={(e) =>
                  setCurrentEmployee(prev => ({ ...prev, name: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter employee name"
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
              onClick={handleSaveEmployee}
              disabled={!currentEmployee.name}
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
              This will permanently delete the employee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => employeeToDelete && handleDeleteEmployee(employeeToDelete.id.toString())}
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
