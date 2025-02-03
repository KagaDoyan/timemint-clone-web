'use client';

import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
import { CalendarIcon, Check, Import, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ShiftAssign, Shift, Employee } from '@/components/model';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import dayjs from 'dayjs';

interface ShiftAssignPaginationResponse {
  data: {
    limit: number;
    page: number;
    data: ShiftAssign[];
    totalPages: number;
    totalRows: number;
  };
  status: boolean;
  error?: string;
}

const requiredColumns = ["employee_id", "shift_id", "date"];

interface ShiftAssignManagementProps {
  session: any;
}

export default function ShiftAssignManagement({ session }: ShiftAssignManagementProps) {
  const { toast } = useToast()
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [shift_assigns, setshift_assigns] = useState<ShiftAssign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentshift_assign, setCurrentshift_assign] = useState<Partial<ShiftAssign>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [shift_assignToDelete, setshift_assignToDelete] = useState<ShiftAssign | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [failimport, setfailimport] = useState<string[]>([]);
  const [isFailDialogOpen, setFailDialogOpen] = useState(false);
  const [fileData, setFileData] = useState<ShiftAssign[]>([]);
  const [employeeopen, setEmployeeOpen] = React.useState(false)
  const [shiftopen, setShiftOpen] = React.useState(false)

  const [employees, setemployees] = useState<Employee[] | null>(null);
  const [shifts, setshifts] = useState<Shift[] | null>(null);
  const [date, setDate] = React.useState<Date>()


  const columns = useMemo<ColumnDef<ShiftAssign>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'employee.name',
      header: 'Employee',
      cell: ({ row }) => {
        const shift_assign = row.original;
        return `${shift_assign.employee?.name} (${shift_assign.employee?.department.name})`;
      }
    },
    {
      accessorKey: 'shift.name',
      header: 'Shift',
      cell: ({ row }) => {
        const shift_assign = row.original;
        const color = shift_assign.shift?.color || "#000"; // Default to black if color is undefined

        // Function to determine if a color is light or dark
        const isLightColor = (hexColor: string) => {
          const r = parseInt(hexColor.slice(1, 3), 16);
          const g = parseInt(hexColor.slice(3, 5), 16);
          const b = parseInt(hexColor.slice(5, 7), 16);
          // Calculate luminance
          const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          return luminance > 128; // Higher value means lighter color
        };

        const textColor = isLightColor(color) ? "text-black" : "text-white";

        return (
          <div
            className={`inline-block px-2 py-1 text-sm rounded ${textColor} text-opacity-80`}
            style={{ backgroundColor: color }}
          >
            {`${shift_assign.shift?.name} (${shift_assign.shift?.start_time} - ${shift_assign.shift?.end_time})`}
          </div>
        );
      }
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const shift_assign = row.original;

        const handleEdit = () => {
          setCurrentshift_assign(shift_assign);
          setIsEditing(true);
          setIsDialogOpen(true);
        };

        const handleDeleteConfirmation = () => {
          setshift_assignToDelete(shift_assign);
          setIsDeleteDialogOpen(true);
        };

        return (
          <ActionDropdown
            onEdit={handleEdit}
            onDelete={handleDeleteConfirmation}
          />
        );
      },
    },
    {
      accessorKey: 'employee',
      header: 'card-header',
      cell: ({ row }) => {
        const shift_assign = row.original;
        return (
          <div
            className={`inline-block px-2 py-1 text-sm rounded text-black text-opacity-80 text-center`}
          >
            {shift_assign.employee?.name} {shift_assign.employee?.department.name}
            <br />
            {shift_assign.shift?.name} {shift_assign.shift?.start_time} - {shift_assign.shift?.end_time}
            <br />
            {shift_assign.date}
          </div>
        );
      }
    }
  ], []);

  useEffect(() => {
    setCurrentshift_assign((prev) => ({ ...prev, date: dayjs(date).format('DD-MM-YYYY') }));
  },[date])

  // Fetch shift_assigns
  const fetchshift_assigns = async (limit: number = 10, page: number = 1) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shift-assign/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shift_assigns');
      }

      const result: ShiftAssignPaginationResponse = await response.json();

      if (result.status && result.data) {
        setshift_assigns(result.data.data);
        setTotalPages(result.data.totalPages);
        setTotalRows(result.data.totalRows);
        setCurrentPage(result.data.page);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch shift_assigns',
          variant: 'destructive',
        });
        setshift_assigns([]);
        setTotalPages(0);
        setTotalRows(0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching shift_assigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch shift_assigns',
        variant: 'destructive',
      });
      setshift_assigns([]);
      setTotalPages(0);
      setTotalRows(0);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/options`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      setemployees(data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive',
      });
      setemployees([]);
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shifts/options`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }

      const data = await response.json();
      setshifts(data.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch shifts',
        variant: 'destructive',
      });
      setshifts([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryStr = event.target?.result as string;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];

        const headers = data[0] as string[]; // Assume first row is the header
        const rows = data.slice(1); // Remaining rows are data

        // Validate headers
        const isValid = requiredColumns.every((col) => headers.includes(col));
        if (!isValid) {
          setFileData([]);
          return;
        }

        setFileData(
          rows.map((row) => {
            const rowObject: ShiftAssign = {
              id: 0,
              employee_id: Number(row[headers.indexOf("employee_id")]),
              shift_id: Number(row[headers.indexOf("shift_id")]),
              date: row[headers.indexOf("date")],
              employee: null,
              shift: null,
            };
            return rowObject;
          })
        );
      };
      reader.readAsBinaryString(file);
    }
  };

  useEffect(() => {
    fetchshift_assigns(limit, page);
  }, [limit, page]);

  useEffect(() => {
    fetchEmployees();
    fetchShifts();
  }, []);

  // Create or update shift_assign
  const handleSaveshift_assign = async () => {
    try {
      if (!currentshift_assign.date?.trim()) {
        toast({
          title: 'Error',
          description: 'shift_assign date is required',
          variant: 'destructive',
        })
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/shift-assign${isEditing ? `/${currentshift_assign.id}` : ''}`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          date: currentshift_assign.date,
          employee_id: currentshift_assign.employee_id,
          shift_id: currentshift_assign.shift_id,
          ...(isEditing && { id: currentshift_assign.id })
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
          description: isEditing ? "shift_assign updated successfully" : "shift_assign created successfully",
          variant: 'default',
        })
        fetchshift_assigns(limit, page);
        setIsDialogOpen(false);
        setCurrentshift_assign({});
        setIsEditing(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || "Operation failed",
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving shift_assign:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : "Network error occurred",
        variant: 'destructive',
      })
    }
  };

  // Delete shift_assign
  const handleDeleteshift_assign = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shift-assign/${id}`, {
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
          description: "shift_assign deleted successfully",
          variant: 'default',
        })
        fetchshift_assigns(limit, page);
        setIsDeleteDialogOpen(false);
        setshift_assignToDelete(null);
      } else {
        toast({
          title: 'Error',
          description: result.error || "Deletion failed",
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting shift_assign:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : "Network error occurred",
        variant: 'destructive',
      })
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    setCurrentshift_assign({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openImportDialog = () => {
    setIsImportDialogOpen(true);
  };

  const closeImportDialog = () => {
    setIsImportDialogOpen(false);
  };

  const handleImport = () => {
    // Implement import logic here
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shift-assign/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify(fileData)
    })
      .then(res => {
        if (res.ok) {
          //get data reponst with number of rows imported
          res.json().then(data => {
            const totalrecords = data.data.data.totalrecords
            const inserted = data.data.data.inserted
            const failed = data.data.data.failed
            // failures is []string
            const failures = data.data.data.failures
            setfailimport(failures)

            toast({
              title: 'Success',
              description: `Successfully imported ${inserted} records out of ${totalrecords} records.`,
            });

            fetchshift_assigns(limit, page);
            setIsImportDialogOpen(false);
            if (failed > 0) {
              setFailDialogOpen(true);
            }
          })
        } else {
          toast({
            title: 'Error',
            description: 'Failed to import shift_assign',
            variant: 'destructive',
          });
        }
      })
      .catch(error => {
        toast({
          title: 'Error',
          description: 'Failed to import shift_assign',
          variant: 'destructive',
        });
        setIsImportDialogOpen(false);
      })
  };

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold w-full text-center sm:text-left">Shift Assign Management</h1>
        <Button variant="secondary" onClick={openImportDialog} className="flex items-center gap-2">
          <Import size={16} /> Import
        </Button>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus size={16} /> Assign Employee
        </Button>
      </div>
      {/* filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Button className="text-sm" onClick={() => setIsFilterOpen(!isFilterOpen)} variant="ghost" >{isFilterOpen ? <Minus size={16} /> : <Plus size={16} />} Filters</Button>
        </div>
        {isFilterOpen && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Input
              type="search"
              placeholder="Search by Employee Name"
              value={currentshift_assign.date || ''}
              onChange={(e) =>
                setCurrentshift_assign((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              className="w-full sm:w-auto"
            />
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={shift_assigns}
        pageSize={limit}
        totalPages={totalPages}
        currentPage={page}
        onPageSizeChange={setLimit}
        onPageChange={setPage}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setCurrentshift_assign({});
            setIsEditing(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Assign Employee' : 'Assign Employee'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Shift Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
              <Label htmlFor="shift_id" className="text-right">
                Shift
              </Label>
              <div className="sm:col-span-2">
                <Popover open={shiftopen} onOpenChange={setShiftOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={shiftopen}
                      className="w-full justify-between"
                    >
                      {currentshift_assign.shift_id
                        ? shifts?.find((shift) => shift.id === currentshift_assign.shift_id)?.name + " (" + shifts?.find((shift) => shift.id === currentshift_assign.shift_id)?.start_time + " - " + shifts?.find((shift) => shift.id === currentshift_assign.shift_id)?.end_time + ")"
                        : "Select shift..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full sm:w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search shift..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No shift found.</CommandEmpty>
                        <CommandGroup>
                          {shifts?.map((shift) => (
                            <CommandItem
                              key={shift.id}
                              value={shift.id.toString()}
                              onSelect={(currentValue) => {
                                setCurrentshift_assign((prev) => ({
                                  ...prev,
                                  shift_id: Number(currentValue),
                                }));
                                setShiftOpen(false);
                              }}
                            >
                              {shift.name} ({shift.start_time} - {shift.end_time})
                              <Check
                                className={cn(
                                  "ml-auto",
                                  currentshift_assign.shift_id === shift.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Employee Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
              <Label htmlFor="employee_id" className="text-right">
                Employee
              </Label>
              <div className="sm:col-span-2">
                <Popover open={employeeopen} onOpenChange={setEmployeeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={employeeopen}
                      className="w-full justify-between"
                    >
                      {currentshift_assign.employee_id
                        ? employees?.find((employee) => employee.id === currentshift_assign.employee_id)?.name
                        : "Select employee..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full sm:w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search employee..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No employee found.</CommandEmpty>
                        <CommandGroup>
                          {employees?.map((employee) => (
                            <CommandItem
                              key={employee.id}
                              value={employee.id.toString()}
                              onSelect={(currentValue) => {
                                setCurrentshift_assign((prev) => ({
                                  ...prev,
                                  employee_id: Number(currentValue),
                                }));
                                setEmployeeOpen(false);
                              }}
                            >
                              {employee.name}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  currentshift_assign.employee_id === employee.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Date Input */}
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
              <Label htmlFor="date" className="text-right">
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
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
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
              onClick={handleSaveshift_assign}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isFailDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Failded Import
            </DialogTitle>
          </DialogHeader>
          <div className="items-center gap-4">
            {/* display failed string */}
            <Label htmlFor="failed" className="text-right">
              Failed
            </Label>
            <Textarea
              id="failed"
              rows={5}
              value={failimport.join('\n')}
              readOnly
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setFailDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* File Input */}
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />

            <span>Total Row: {fileData.length}</span>

            {/* Table to Display Data */}
            {fileData.length > 0 && (
              <div className="overflow-auto max-h-96 overflow-y-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead >Employee</TableHead>
                      <TableHead >Shift</TableHead>
                      <TableHead >Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fileData.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((cell, index) => {
                          if (Object.keys(row)[index] === "id") return null;
                          switch (Object.keys(row)[index]) {
                            case "employee_id":
                              //display employee name
                              const employee = employees?.find(e => e.id === cell)
                              return (
                                <TableCell key={cell}>{employee?.name} ({employee?.department.name})</TableCell>
                              )
                            case "shift_id":
                              //display shift name and time 
                              const shift = shifts?.find(s => s.id === cell)
                              return (
                                <TableCell key={cell}>{shift?.name} {shift?.start_time} - {shift?.end_time}</TableCell>
                              )
                            case "date":
                              return (
                                <TableCell key={cell}>{cell}</TableCell>
                              )
                          }
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={fileData.length === 0}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the shift_assign.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => shift_assignToDelete && handleDeleteshift_assign(shift_assignToDelete.id.toString())}
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
