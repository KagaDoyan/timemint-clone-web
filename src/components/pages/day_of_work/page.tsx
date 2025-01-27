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

interface DayOfWork {
  id: number;
  day: string;    
  start_time: string;
  end_time: string;
  is_work_day: boolean;
  created_at: string;
  updated_at: string;
}

interface DayOfWorkPaginationResponse {
  data: {
    limit: number;
    page: number;
    rows: DayOfWork[];
    totalPages: number;
    totalRows: number;
  };
  status: boolean;
  error?: string;
}

interface DayOfWorkPageProps {
  session: any;
}

export default function DayOfWork({ session }: DayOfWorkPageProps) {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [dayOfWorks, setDayOfWorks] = useState<DayOfWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDayOfWork, setCurrentDayOfWork] = useState<Partial<DayOfWork>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dayOfWorkToDelete, setDayOfWorkToDelete] = useState<DayOfWork | null>(null);

  const columns = useMemo<ColumnDef<DayOfWork>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'day',
      header: 'Day',
    },
    {
      accessorKey: 'start_time',
      header: 'Start Time',
    },
    {
      accessorKey: 'end_time',
      header: 'End Time',
    },
    {
      accessorKey: 'is_work_day',
      header: 'Work Day',
      cell: ({ getValue }) => getValue() ? 'Yes' : 'No'
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const dayOfWork = row.original;

        const handleEdit = () => {
          setCurrentDayOfWork(dayOfWork);
          setIsEditing(true);
          setIsDialogOpen(true);
        };

        const handleDeleteConfirmation = () => {
          setDayOfWorkToDelete(dayOfWork);
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
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/day-of-works/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch day of work records');
      }

      const responseData: DayOfWorkPaginationResponse = await res.json();

      if (responseData.status && responseData.data) {
        setDayOfWorks(responseData.data.rows);
        setTotalPages(responseData.data.totalPages);
        setTotalRows(responseData.data.totalRows);
        setCurrentPage(responseData.data.page);
      } else {
        setDayOfWorks([]);
        setTotalPages(0);
        setTotalRows(0);
      }
    } catch (error) {
      console.error('Error fetching day of work records:', error);
      setDayOfWorks([]);
      setTotalPages(0);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit, page]);

  const handleSaveDayOfWork = async () => {
    try {
      if (!currentDayOfWork.day) {
        toast.error("Day is required");
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/day-of-works${isEditing ? `/${currentDayOfWork.id}` : ''}`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          day: currentDayOfWork.day,
          start_time: currentDayOfWork.start_time,
          end_time: currentDayOfWork.end_time,
          is_work_day: currentDayOfWork.is_work_day ?? true,
          ...(isEditing && { id: currentDayOfWork.id })
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Operation failed: ${errorBody}`);
      }

      const result = await response.json();

      if (result.status) {
        toast.success(isEditing ? "Day of work record updated" : "Day of work record created");
        setIsDialogOpen(false);
        fetchData(); // Refresh the data
      } else {
        toast.error(result.error || "Failed to save day of work record");
      }
    } catch (error) {
      console.error('Error saving day of work record:', error);
      toast.error("Failed to save day of work record");
    }
  };

  const handleDeleteDayOfWork = async () => {
    if (!dayOfWorkToDelete) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/day-of-works/${dayOfWorkToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Deletion failed: ${errorBody}`);
      }

      const result = await response.json();

      if (result.status) {
        toast.success("Day of work record deleted");
        setIsDeleteDialogOpen(false);
        fetchData(); // Refresh the data
      } else {
        toast.error(result.error || "Failed to delete day of work record");
      }
    } catch (error) {
      console.error('Error deleting day of work record:', error);
      toast.error("Failed to delete day of work record");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Day of Work Records</h1>
        <Button onClick={() => {
          setCurrentDayOfWork({});
          setIsEditing(false);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Day of Work
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={dayOfWorks} 
        pageSize={limit}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Day of Work' : 'Add Day of Work'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">Day</Label>
              <Input 
                id="day" 
                value={currentDayOfWork.day || ''} 
                onChange={(e) => setCurrentDayOfWork(prev => ({ ...prev, day: e.target.value }))} 
                className="col-span-3" 
                placeholder="Enter day"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_time" className="text-right">Start Time</Label>
              <Input 
                id="start_time" 
                type="time" 
                pattern="[0-9]{2}:[0-9]{2}"
                value={currentDayOfWork.start_time || ''} 
                onChange={(e) => setCurrentDayOfWork(prev => ({ ...prev, start_time: e.target.value }))} 
                className="col-span-3" 
                placeholder="HH:MM"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_time" className="text-right">End Time</Label>
              <Input 
                id="end_time" 
                type="time" 
                pattern="[0-9]{2}:[0-9]{2}"
                value={currentDayOfWork.end_time || ''} 
                onChange={(e) => setCurrentDayOfWork(prev => ({ ...prev, end_time: e.target.value }))} 
                className="col-span-3" 
                placeholder="HH:MM"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_work_day" className="text-right">Work Day</Label>
              <input 
                id="is_work_day" 
                type="checkbox" 
                checked={currentDayOfWork.is_work_day ?? true} 
                onChange={(e) => setCurrentDayOfWork(prev => ({ ...prev, is_work_day: e.target.checked }))} 
                className="col-span-3" 
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDayOfWork}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the day of work record for {dayOfWorkToDelete?.day}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDayOfWork}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
