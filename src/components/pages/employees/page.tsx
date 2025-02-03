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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Department, Role } from '@/components/model';
import { de } from 'date-fns/locale';

interface Employee {
  id: number;
  employee_no: string;
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
  department_id: number;
  department: {
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
    data: Employee[];
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const columns = useMemo<ColumnDef<Employee>[]>(() => [
    {
      accessorKey: 'employee_no',
      header: 'Employee No.',
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
      accessorKey: 'department.name',
      header: 'Department',
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
          <div>
            <div className='hidden sm:block'>
              <ActionDropdown
                onEdit={handleEdit}
                onDelete={handleDeleteConfirmation}
              />
            </div>
            <div className='block sm:hidden'>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button className='w-full'>Action</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                      <div className='w-full flex justify-center items-center flex-col gap-2 p-4'>
                        <Button className='w-full ' onClick={handleEdit}>Edit</Button>
                        <Button className='w-full bg-destructive' onClick={handleDeleteConfirmation}>Delete</Button>
                      </div>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                      <div className="mt-3 gap-2">

                      </div>
                    </div>
                    <DrawerFooter>
                      <span className="text-muted-foreground text-center">Action</span>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'card-header',
      header: 'card-header',
      cell: ({ row }) => {
        const employee = row.original;
        return employee.name;
      }
    }
  ], []);

  const fetchRole = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/roles/all?limit=100&page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch roles');
      }
      const data = await res.json();
      setRoles(data.data.data);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchDepartment = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/departments/all?limit=100&page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await res.json();
      setDepartments(data.data.data);
    } catch (error) {
      console.error(error);
    }
  }

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
        setEmployees(responseData.data.data);
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

  useEffect(() => {
    fetchDepartment();
    fetchRole();
  }, []);

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
          employee_no: currentEmployee.employee_no,
          name: currentEmployee.name.trim(),
          email: currentEmployee.email,
          phone: currentEmployee.phone,
          address: currentEmployee.address,
          position: currentEmployee.position,
          role_id: currentEmployee.role_id,
          department_id: currentEmployee.department_id,
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
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        pageSize={limit}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
      />


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
          <div className="grid gap-6 py-4">
            {[
              { label: "Emp No.", value: currentEmployee.employee_no, key: "employee_no", placeholder: "Enter employee number" },
              { label: "Fullname", value: currentEmployee.name, key: "name", placeholder: "Enter employee name" },
              { label: "Email", value: currentEmployee.email, key: "email", placeholder: "Enter employee email" },
              { label: "Phone", value: currentEmployee.phone, key: "phone", placeholder: "Enter employee phone" },
              { label: "Job Title", value: currentEmployee.position, key: "position", placeholder: "Enter employee position" },
            ].map(({ label, value, key, placeholder }) => (
              <div className="grid grid-cols-4 items-center gap-4" key={key}>
                <Label htmlFor={key} className="text-right">
                  {label}
                </Label>
                <Input
                  id={key}
                  value={value || ""}
                  onChange={(e) => setCurrentEmployee((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="col-span-3"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department_id" className="text-right">
                Department
              </Label>
              <div className="col-span-3">
                <Select
                  onValueChange={(value) =>
                    setCurrentEmployee((prev) => ({ ...prev, department_id: Number(value) }))
                  }
                  defaultValue={currentEmployee.department_id?.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Departments</SelectLabel>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id.toString()}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role_id" className="text-right">
                Role
              </Label>
              <div className="col-span-3">
                <Select
                  onValueChange={(value) =>
                    setCurrentEmployee((prev) => ({ ...prev, role_id: parseInt(value) }))
                  }
                  defaultValue={currentEmployee.role_id?.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Roles</SelectLabel>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
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
