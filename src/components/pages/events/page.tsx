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
import { format, parse } from "date-fns"
import { Plus } from 'lucide-react';
import { cn } from "@/lib/utils"
import dayjs from 'dayjs';
import { events } from '@/components/model';
import { useToast } from '@/hooks/use-toast';


interface EventPaginationResponse {
  data: {
    limit: number;
    page: number;
    data: events[];
    totalPages: number;
    total: number;
  };
  status: boolean;
  error?: string;
}

interface eventManagementProps {
  session: any;
}

export default function EventManagement({ session }: eventManagementProps) {
  const { toast } = useToast()
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState<events[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentevent, setCurrentEvent] = useState<Partial<events>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<events | null>(null);
  const [nameFilter, setNameFilter] = useState('');
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    setCurrentEvent(prev => ({ ...prev, start_date: dayjs(newDate?.from).format("DD-MM-YYYY") }))
    if (!newDate?.to) {
      setCurrentEvent(prev => ({ ...prev, end_date: dayjs(newDate?.from).format("DD-MM-YYYY") }))
    } else {
      setCurrentEvent(prev => ({ ...prev, end_date: dayjs(newDate?.to).format("DD-MM-YYYY") }))
    }
  }

  useEffect(() => {
    if (date?.from && date?.to) {
      console.log(date);
      setCurrentEvent(prev => ({ ...prev, start_date: dayjs(date?.from).format("DD-MM-YYYY") }))
      setCurrentEvent(prev => ({ ...prev, end_date: dayjs(date?.to).format("DD-MM-YYYY") }))
    } else {
      setCurrentEvent(prev => ({ ...prev, start_date: format(new Date(), "dd-MM-yyyy"), end_date: format(new Date(), "dd-MM-yyyy") }))
    }
  }, [date])

  const columns = useMemo<ColumnDef<events>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'event_type',
      header: 'Event Type',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    // set start date and end date to same column
    {
      accessorKey: 'start',
      header: 'Time',
      cell: ({ row }) => {
        const { start, end } = row.original;
        return `${start} > ${end}`;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const event = row.original;

        const handleEdit = () => {
          setCurrentEvent(event);
          setIsEditing(true);
          setIsDialogOpen(true);
        };

        const handleDeleteConfirmation = () => {
          setEventToDelete(event);
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
  const fetchEvents = async (limit: number = 10, page: number = 1, nameFilter: string = '') => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        ...(nameFilter && { name: nameFilter })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const result: EventPaginationResponse = await response.json();

      if (result.status && result.data) {
        setEvents(result.data.data);
        setTotalPages(result.data.totalPages);
        setTotalRows(result.data.total);
        setCurrentPage(result.data.page);
      } else {
        toast({
          title: 'Error',
          description: result.error || "Failed to fetch events",
          variant: 'destructive',
        });
        setEvents([]);
        setTotalPages(0);
        setTotalRows(0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : "Network error occurred",
        variant: 'destructive',
      });
      setEvents([]);
      setTotalPages(0);
      setTotalRows(0);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(limit, page, nameFilter);
  }, [limit, page, nameFilter]);

  useEffect(() => {
    if (date) {
      setCurrentEvent(prev => ({ ...prev, start_date: dayjs(date?.from).format("DD-MM-YYYY") }))
      setCurrentEvent(prev => ({ ...prev, end_date: dayjs(date?.to).format("DD-MM-YYYY") }))
    }
  }, []);

  // Create or update Event
  const handleSaveEvent = async () => {
    try {
      if (!currentevent.name?.trim()) {
        toast({
          title: 'Error',
          description: "Event name is required",
          variant: 'destructive',
        });
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/events${isEditing ? `/${currentevent.id}` : ''}`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          name: currentevent.name.trim(),
          description: currentevent.description?.trim() || '',
          start_date: dayjs(date?.from).format("DD-MM-YYYY"),
          end_date: dayjs(date?.to).format("DD-MM-YYYY"),
          start: currentevent.start,
          end: currentevent.end,
          event_type: currentevent.event_type,
          date: currentevent.date,
          ...(isEditing && { id: currentevent.id })
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
          description: isEditing ? "Event updated successfully" : "Event created successfully",
          variant: 'default',
        });
        fetchEvents(limit, page, nameFilter);
        setIsDialogOpen(false);
        setCurrentEvent({});
        setIsEditing(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || "Operation failed",
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving Event:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : "Network error occurred",
        variant: 'destructive',
      });
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${id}`, {
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
          description: "Event deleted successfully",
          variant: 'default',
        });
        fetchEvents(limit, page, nameFilter);
        setIsDeleteDialogOpen(false);
        setEventToDelete(null);
      } else {
        toast({
          title: 'Error',
          description: result.error || "Deletion failed",
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting Event:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : "Network error occurred",
        variant: 'destructive',
      });
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    setCurrentEvent({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold w-full text-center sm:text-left">Event Management</h1>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus size={16} /> Create Event
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={events}
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
            setCurrentEvent({});
            setIsEditing(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Event' : 'Create Event'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentevent.name || ''}
                onChange={(e) =>
                  setCurrentEvent(prev => ({ ...prev, name: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter Event name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Event Type
              </Label>
              <Input
                id="name"
                value={currentevent.event_type || ''}
                onChange={(e) =>
                  setCurrentEvent(prev => ({ ...prev, event_type: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter Event name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start" className="text-right">
                Start
              </Label>
              <Input
                id="start"
                value={currentevent.start || ''}
                onChange={(e) =>
                  setCurrentEvent(prev => ({ ...prev, start: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter Event name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end" className="text-right">
                End
              </Label>
              <Input
                id="end"
                value={currentevent.end || ''}
                onChange={(e) =>
                  setCurrentEvent(prev => ({ ...prev, end: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter Event name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={currentevent.description || ''}
                onChange={(e) =>
                  setCurrentEvent(prev => ({ ...prev, description: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter Event description"
              />
            </div>
            {!isEditing ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_date" className="text-right">
                  Event Range
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
                            {format(date.from, "dd-MM-yyyy")} - {" "}
                            {format(date.to, "dd-MM-yyyy")}
                          </>
                        ) : (
                          format(date.from, "dd-MM-yyyy")
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
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_date" className="text-right">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon />
                      {currentevent.date ? format(parse(currentevent.date, "dd-MM-yyyy", new Date()), "dd-MM-yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dayjs(currentevent.date, "DD-MM-YYYY").toDate()}
                      onSelect={date => setCurrentEvent(prev => ({ ...prev, date: dayjs(date).format("DD-MM-YYYY") }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEvent}
              disabled={!currentevent.name}
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
              This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => eventToDelete && handleDeleteEvent(eventToDelete.id.toString())}
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
