'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import { DateRange } from "react-day-picker"
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Plus } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils"
import dayjs from 'dayjs';

interface holiday {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface holidayPaginationResponse {
  data: {
    limit: number;
    page: number;
    data: holiday[];
    totalPages: number;
    total: number;
  };
  status: boolean;
  error?: string;
}

interface holidayManagementProps {
  session: any;
}

export default function HolidayManagement({ session }: holidayManagementProps) {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [holidays, setholidays] = useState<holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentholiday, setCurrentholiday] = useState<Partial<holiday>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [holidayToDelete, setholidayToDelete] = useState<holiday | null>(null);
  const [nameFilter, setNameFilter] = useState('');
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    setCurrentholiday(prev => ({ ...prev, start_date: dayjs(newDate?.from).format("DD-MM-YYYY") }))
    setCurrentholiday(prev => ({ ...prev, end_date: dayjs(newDate?.to).format("DD-MM-YYYY") }))
  }

  const columns = useMemo<ColumnDef<holiday>[]>(() => [
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
    // set start date and end date to same column
    {
      accessorKey: 'start_date',
      header: 'Start-End Date',
      cell: ({ row }) => {
        const { start_date, end_date } = row.original;
        return `${start_date} > ${end_date}`;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const holiday = row.original;

        const handleEdit = () => {
          setCurrentholiday(holiday);
          setIsEditing(true);
          setIsDialogOpen(true);
        };

        const handleDeleteConfirmation = () => {
          setholidayToDelete(holiday);
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

  // Fetch holidays
  const fetchholidays = async (limit: number = 10, page: number = 1, nameFilter: string = '') => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        ...(nameFilter && { name: nameFilter })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch holidays');
      }

      const result: holidayPaginationResponse = await response.json();

      if (result.status && result.data) {
        setholidays(result.data.data);
        setTotalPages(result.data.totalPages);
        setTotalRows(result.data.total);
        setCurrentPage(result.data.page);
      } else {
        toast.error(result.error || "Failed to fetch holidays");
        setholidays([]);
        setTotalPages(0);
        setTotalRows(0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error("Network error occurred");
      setholidays([]);
      setTotalPages(0);
      setTotalRows(0);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchholidays(limit, page, nameFilter);
  }, [limit, page, nameFilter]);

  // Create or update holiday
  const handleSaveholiday = async () => {
    try {
      if (!currentholiday.name?.trim()) {
        toast.error("holiday name is required");
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays${isEditing ? `/${currentholiday.id}` : ''}`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          name: currentholiday.name.trim(),
          description: currentholiday.description?.trim() || '',
          start_date: currentholiday.start_date,
          end_date: currentholiday.end_date,
          ...(isEditing && { id: currentholiday.id })
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Operation failed: ${errorBody}`);
      }

      const result = await response.json();

      if (result.status) {
        toast.success(isEditing ? "holiday updated successfully" : "holiday created successfully");
        fetchholidays(limit, page, nameFilter);
        setIsDialogOpen(false);
        setCurrentholiday({});
        setIsEditing(false);
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      console.error('Error saving holiday:', error);
      toast.error(error instanceof Error ? error.message : "Network error occurred");
    }
  };

  // Delete holiday
  const handleDeleteholiday = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/holidays/${id}`, {
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
        toast.success("holiday deleted successfully");
        fetchholidays(limit, page, nameFilter);
        setIsDeleteDialogOpen(false);
        setholidayToDelete(null);
      } else {
        toast.error(result.error || "Deletion failed");
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error(error instanceof Error ? error.message : "Network error occurred");
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    setCurrentholiday({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold w-full text-center sm:text-left">holiday Management</h1>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus size={16} /> Create holiday
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={holidays}
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
            setCurrentholiday({});
            setIsEditing(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit holiday' : 'Create holiday'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentholiday.name || ''}
                onChange={(e) =>
                  setCurrentholiday(prev => ({ ...prev, name: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter holiday name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={currentholiday.description || ''}
                onChange={(e) =>
                  setCurrentholiday(prev => ({ ...prev, description: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter holiday description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">
                Holiday Range
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={handleDateChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
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
              onClick={handleSaveholiday}
              disabled={!currentholiday.name}
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
              This will permanently delete the holiday.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => holidayToDelete && handleDeleteholiday(holidayToDelete.id.toString())}
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
