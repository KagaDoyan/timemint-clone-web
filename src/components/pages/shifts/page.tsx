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
import { Shift, Department } from '@/components/model';
import { useToast } from '@/hooks/use-toast';
import { TimePicker } from '@/components/ui/timepicker';

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

interface ShiftPaginationResponse {
  data: {
    limit: number;
    page: number;
    data: Shift[];
    totalPages: number;
    totalRows: number;
  };
  status: boolean;
  error?: string;
}

interface ShiftPageProps {
  session: any;
}

export default function ShiftManagement({ session }: ShiftPageProps) {
  const {toast} = useToast()
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [Shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<Partial<Shift>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ShiftToDelete, setShiftToDelete] = useState<Shift | null>(null);
  const [nameFilter, setNameFilter] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);

  const columns = useMemo<ColumnDef<Shift>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'start_time',
      header: 'Shift Time',
      cell: ({ row }) => {
        const { start_time, end_time } = row.original;
        return `${start_time} - ${end_time}`;
      }
    },
    {
      accessorKey: 'color',
      header: 'indicate color',
      cell: ({ row }) => {
        const color = row.original.color;
        return <div style={{ backgroundColor: color, width: '40px', height: '10px', borderRadius: '10%' }}></div>;
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const Shift = row.original;

        const handleEdit = () => {
          setCurrentShift(Shift);
          setIsEditing(true);
          setIsDialogOpen(true);
        };

        const handleDeleteConfirmation = () => {
          setShiftToDelete(Shift);
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

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/departments/all?limit=100&page=1`, {
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
      setDepartments(result.data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch shifts
  const fetchShifts = async (limit: number = 10, page: number = 1, nameFilter: string = '') => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        ...(nameFilter && { name: nameFilter })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shifts/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }

      const result: ShiftPaginationResponse = await response.json();

      if (result.status && result.data) {
        setShifts(result.data.data);
        setTotalPages(result.data.totalPages);
        setTotalRows(result.data.totalRows);
        setCurrentPage(result.data.page);
      } else {
        toast({
          title: 'Error',
          description: result.error || "Failed to fetch shifts",
          variant: 'destructive',
        });
        setShifts([]);
        setTotalPages(0);
        setTotalRows(0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: 'Error',
        description: "Network error occurred",
        variant: 'destructive',
      });
      setShifts([]);
      setTotalPages(0);
      setTotalRows(0);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts(limit, page, nameFilter);
    // fetchDepartments();
  }, [limit, page, nameFilter]);

  // Create or update shift
  const handleSaveShift = async () => {
    try {
      if (!currentShift.name?.trim()) {
        toast({
          title: 'Error',
          description: "Shift name is required",
          variant: 'destructive',
        });
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/shifts${isEditing ? `/${currentShift.id}` : ''}`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          name: currentShift.name.trim(),
          description: currentShift.description?.trim() || '',
          color: currentShift.color,
          start_time: currentShift.start_time,
          end_time: currentShift.end_time,
          ...(isEditing && { id: currentShift.id })
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Operation failed: ${errorBody}`);
      }

      const result = await response.json();

      if (result.status) {
        toast({
          title: isEditing ? "Shift updated successfully" : "Shift created successfully",
          variant: 'default',
        });
        fetchShifts(limit, page, nameFilter);
        setIsDialogOpen(false);
        setCurrentShift({});
        setIsEditing(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || "Operation failed",
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving shift:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : "Network error occurred",
        variant: 'destructive',
      });
    }
  };

  // Delete shift
  const handleDeleteShift = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shifts/${id}`, {
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
        toast({
          title: "Shift deleted successfully",
          variant: 'default',
        });
        fetchShifts(limit, page, nameFilter);
        setIsDeleteDialogOpen(false);
        setShiftToDelete(null);
      } else {
        toast({
          title: 'Error',
          description: result.error || "Deletion failed",
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : "Network error occurred",
        variant: 'destructive',
      });
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    setCurrentShift({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold w-full text-center sm:text-left">Shift Management</h1>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus size={16} /> Create Shift Time
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={Shifts || []}
        pageSize={limit}
        currentPage={page}
        totalPages={totalPages}
        onPageSizeChange={setLimit}
        onPageChange={setPage}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setCurrentShift({});
            setIsEditing(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Shift' : 'Create Shift'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentShift.name || ''}
                onChange={(e) =>
                  setCurrentShift(prev => ({ ...prev, name: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter shift name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={currentShift.description || ''}
                onChange={(e) =>
                  setCurrentShift(prev => ({ ...prev, description: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter shift description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_time" className="text-right">
                Start Time
              </Label>
              <TimePicker
                value={currentShift.start_time}
                onChange={(time: string) => setCurrentShift(prev => ({ ...prev, start_time: time }))}
                placeholder='HH:mm'
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_time" className="text-right">
                End Time
              </Label>
              <TimePicker
                value={currentShift.end_time || ''}
                onChange={(time: string) => setCurrentShift(prev => ({ ...prev, end_time: time }))}
                className="col-span-3"
                placeholder='HH:mm'
              />
            </div>
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Select
                onValueChange={value => {
                  setCurrentShift(prev => ({ ...prev, department_id: Number(value) }))
                }}
                defaultValue={currentShift.department_id?.toString() || ''}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(department => (
                    <SelectItem key={department.id} value={department.id.toString()}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <Input
                type='color'
                id="color"
                value={currentShift.color || '#f59e0b'}
                onChange={(e) =>
                  setCurrentShift(prev => ({ ...prev, color: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter color"
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
              onClick={handleSaveShift}
              disabled={!currentShift.name}
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
              This will permanently delete the shift.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => ShiftToDelete && handleDeleteShift(ShiftToDelete.id.toString())}
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
