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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { LeaveType } from '@/components/model';
import { useToast } from '@/hooks/use-toast';

interface LeaveTypePaginationResponse {
  data: {
    limit: number;
    page: number;
    data: LeaveType[];
    totalPages: number;
    totalRows: number;
  };
  status: boolean;
  error?: string;
}

interface Leave_typeManagementProps {
  session: any;
}

export default function LeavetypeManagement({ session }: Leave_typeManagementProps) {
  const {toast} = useToast()
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [leave_types, setLeave_types] = useState< LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentLeave_type, setCurrentLeave_type] = useState<Partial<LeaveType>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leave_typeToDelete, setLeave_typeToDelete] = useState<LeaveType | null>(null);
  const [leave_typeFilter, setLeave_typeFilter] = useState('');

  const columns = useMemo<ColumnDef<LeaveType>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'leave_type',
      header: 'Leave Type',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'annually_max',
      header: 'Annual Max',
    },
    {
      accessorKey: 'payable',
      header: 'Paid',
      cell: ({ row }) => {
        const leave_type = row.original;
        return leave_type.payable ? 'Yes' : 'No';
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const leave_type = row.original;

        const handleEdit = () => {
          setCurrentLeave_type(leave_type);
          setIsEditing(true);
          setIsDialogOpen(true);
        };

        const handleDeleteConfirmation = () => {
          setLeave_typeToDelete(leave_type);
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

  // Fetch roles
  const fetchLeave_types = async (limit: number = 10, page: number = 1, nameFilter: string = '') => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        ...(nameFilter && { name: nameFilter })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-types/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leave types');
      }

      const result: LeaveTypePaginationResponse = await response.json();

      if (result.status && result.data) {
        setLeave_types(result.data.data);
        setTotalPages(result.data.totalPages);
        setTotalRows(result.data.totalRows);
        setCurrentPage(result.data.page);
      } else {
        toast({
          title: 'Error',
          description: result.error || "Failed to fetch leave types",
          variant: "destructive",
        });
        setLeave_types([]);
        setTotalPages(0);
        setTotalRows(0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
      toast({
        title: 'Error',
        description: "Network error occurred",
        variant: "destructive",
      });
      setLeave_types([]);
      setTotalPages(0);
      setTotalRows(0);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeave_types(limit, page);
  }, [limit, page]);

  // Create or update role
  const handleSaveLeave_type = async () => {
    try {
      if (!currentLeave_type.leave_type?.trim()) {
        toast({
          title: 'Error',
          description: "Leave type name is required",
          variant: "destructive",
        });
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-types${isEditing ? `/${currentLeave_type.id}` : ''}`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          leave_type: currentLeave_type.leave_type.trim(),
          description: currentLeave_type.description?.trim() || '',
          payable: currentLeave_type.payable,
          annually_max: currentLeave_type.annually_max,
          ...(isEditing && { id: currentLeave_type.id })
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Operation failed: ${errorBody}`);
      }

      const result = await response.json();

      if (result.status) {
        toast({
          title: 'Success',
          description: isEditing ? "Leave type updated successfully" : "Leave type created successfully",
          variant: 'default',
        });
        fetchLeave_types(limit, page);
        setIsDialogOpen(false);
        setCurrentLeave_type({});
        setIsEditing(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || "Operation failed",
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving leave type:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : "Network error occurred",
        variant: 'destructive',
      });
    }
  };

  // Delete role
  const handleDeleteLeave_type = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-types/${id}`, {
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
          title: 'Success',
          description: "Leave type deleted successfully",
          variant: 'default',
        });
        fetchLeave_types(limit, page);
        setIsDeleteDialogOpen(false);
        setLeave_typeToDelete(null);
      } else {
        toast({
          title: 'Error',
          description: result.error || "Deletion failed",
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting leave type:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : "Network error occurred",
        variant: 'destructive',
      });
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    setCurrentLeave_type({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold w-full text-center sm:text-left">Leave Type Management</h1>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus size={16} /> Create Leave Type
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={leave_types}
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
            setCurrentLeave_type({});
            setIsEditing(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Role' : 'Create Role'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leave_type" className="text-right">
                Leave Type
              </Label>
              <Input
                id="leave_type"
                value={currentLeave_type.leave_type || ''}
                onChange={(e) =>
                  setCurrentLeave_type(prev => ({ ...prev, leave_type: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter leave type name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                rows={3}
                value={currentLeave_type.description || ''}
                onChange={(e) =>
                  setCurrentLeave_type(prev => ({ ...prev, description: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter leave type description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Annual Max
              </Label>
              <Input
                id='annual_max'
                type='number'
                value={currentLeave_type.annually_max || ''}
                onChange={(e) =>
                  setCurrentLeave_type(prev => ({ ...prev, annually_max: Number(e.target.value) }))
                }
                className="col-span-3"
              />
            </div>
            {/* switch for paid or nit paid */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payable" className="text-right">
                Payable
              </Label>
              <Switch
                id="payable"
                checked={currentLeave_type.payable}
                onCheckedChange={(checked) =>
                  setCurrentLeave_type(prev => ({ ...prev, payable: checked }))
                }
                className="col-span-3"
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
              onClick={handleSaveLeave_type} 
              disabled={!currentLeave_type.leave_type}
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
              This will permanently delete the leave type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => leave_typeToDelete && handleDeleteLeave_type(leave_typeToDelete.id.toString())}
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
