"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Clock, Check, X, CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { addDays, format } from "date-fns";
import { Employee, LeaveReqest } from "@/components/model";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import dayjs from "dayjs";
import { Textarea } from "@/components/ui/textarea";
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

interface LeaveApprovalPageProps {
    session: any;
}

function LeaveApprovalPage({ session }: LeaveApprovalPageProps) {
    const { toast } = useToast();
    const [statusFilter, setStatusFilter] = useState<string | null>("pending");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 7),
    });
    const [data, setData] = useState<LeaveReqest[]>([]);
    const [currentdata, setCurrentdata] = useState<Partial<LeaveReqest>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [pending, setPending] = useState(0);
    const [approved, setApproved] = useState(0);
    const [rejected, setRejected] = useState(0);
    const [employee, setEmployee] = useState<Employee[]>([]);
    const [empFilter, setEmpFilter] = useState<number | null>(null);
    const [openEmployee, setOpenEmployee] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    
    const [rejectionRemark, setRejectionRemark] = useState('');
    const colomns = useMemo<ColumnDef<LeaveReqest>[]>(() => [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "employee",
            header: "Employee Name",
            cell: ({ row }) => {
                const { employee } = row.original;
                return (
                    <div className="flex items-center">
                        <div className="mr-2">{employee?.name}</div>
                        <div className="mr-2">({employee?.department})</div>
                    </div>
                );
            },
        },
        {
            accessorKey: "leave_type",
            header: "Leave Type",
            cell: ({ row }) => {
                const { leave_type } = row.original;
                return (
                    <div className="flex items-center">
                        <div className="mr-2">{leave_type.leave_type}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: "start_date",
            header: "Leave Date",
            cell: ({ row }) => {
                const { start_date, end_date } = row.original;
                return (
                    <div className="flex items-center">
                        <CalendarIcon className="mr-2 size-4" />
                        {start_date} to {end_date}
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const { status } = row.original;

                const colorClass =
                    status === "approved"
                        ? "bg-green-500 text-white"
                        : status === "rejected"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-500 text-black";

                return (
                    <div
                        className={`inline-block px-3 py-1 rounded-md text-sm font-semibold capitalize ${colorClass}`}
                    >
                        {status}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const leave = row.original;

                const handleEdit = () => {
                    setCurrentdata(leave);
                    setIsDialogOpen(true);
                };

                return (
                    <ActionDropdown
                        onEdit={handleEdit}
                        onDelete={() => {
                            toast({
                                title: "Cannot delete request",
                                description: "You cannot delete this request",
                                variant: "destructive",
                            });
                        }}
                    />
                );
            },
        },
    ], []);

    const HandleSubmitRejection = async () => {
        if (!rejectionRemark) {
            toast({
                title: "Rejection remark is required",
                description: "Please enter a rejection remark",
                variant: "destructive",
            });
            return;
        }
        if (currentdata) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-requests/${currentdata.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify({
                    leave_request_id: currentdata.id,
                    status: 'rejected',
                    remark: rejectionRemark,
                })
            });
            const data = await response.json();
            if (response.ok) {
                toast({
                    title: "Leave request rejected",
                    description: `Leave request for ${currentdata.employee?.name} has been rejected`,
                });
                setRejectDialogOpen(false);
                setRejectionRemark('');
                fetchData();
            } else {
                toast({
                    title: "Failed to reject leave request",
                    description: data.error || "Failed to reject leave request",
                    variant: "destructive",
                })
            }
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/options`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch employees");
            }

            const data = await response.json();
            setEmployee(data.data || []);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchData = async (limit: number = 10, page: number = 1) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-requests/all?limit=${limit}&page=${page}&status=${statusFilter}&from=${dayjs(dateRange?.from).format("DD-MM-YYYY")}&to=${dayjs(dateRange?.to).format("DD-MM-YYYY")}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
            });
            const data = await response.json();
            setData(data.data.data || []);
            setTotalPages(data.data.totalPages);
            setTotalRows(data.data.totalRows);
            setPending(data.data.totalPending);
            setApproved(data.data.totalApproved);
            setRejected(data.data.totalRejected);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch leave requests",
                variant: "destructive",
            });
        }
    };

    const handleApprove = async () => {
        // Implement the logic for approving the leave request
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-requests/${currentdata.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.accessToken}`,
            },
            body: JSON.stringify({
                leave_request_id: currentdata.id,
                status: 'approved',
                remark: '',
            })
        })
            .then(response => response.json())
            .then(data => {
                toast({
                    title: "Leave Request Approved",
                    description: "The leave request has been approved.",
                    variant: "default",
                });
                setIsDialogOpen(false);
                fetchData();
        }).catch(error => {
            toast({
                title: "Error",
                description: "Failed to approve leave request",
                variant: "destructive",
            });
        })
    };

    const handleReject = async () => {
        // Implement the logic for rejecting the leave request
        toast({
            title: "Leave Request Rejected",
            description: "The leave request has been rejected.",
            variant: "destructive",
        });
        setIsDialogOpen(false);
    };

    useEffect(() => {
        fetchData(limit, page);
    }, [limit, page, dateRange, statusFilter]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    return (
        <div className="p-4 sm:p-6 flex flex-col gap-6">
            {/* Date Range Picker */}
            <div className="p-4 shadow-lg rounded-lg bg-white border border-gray-200">
                <label className="block text-gray-700 font-semibold mb-2">Filter by Date Range:</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                                        {format(dateRange.to, "dd/MM/yyyy")}
                                    </>
                                ) : (
                                    format(dateRange.from, "dd/MM/yyyy")
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
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>

                {/* Employee Filter Combobox */}
                <label className="block text-gray-700 font-semibold mb-2 mt-4">Filter by Employee:</label>
                <Popover open={openEmployee} onOpenChange={setOpenEmployee}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openEmployee}
                            className="w-full justify-between"
                        >
                            {empFilter
                                ? employee.find((employee) => employee.id === empFilter)?.name
                                : "Select employee..."}
                            <ChevronDown className="opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandInput placeholder="Search employee..." className="h-9" />
                            <CommandList>
                                <CommandEmpty>No employee found.</CommandEmpty>
                                <CommandGroup>
                                    {employee.map((employee) => (
                                        <CommandItem
                                            key={employee.id}
                                            value={employee.id.toString()}
                                            onSelect={(currentValue) => {
                                                setEmpFilter(Number(currentValue) === empFilter ? null : Number(currentValue));
                                                setOpenEmployee(false)
                                            }}
                                        >
                                            {employee.employee_no} {employee.name} ({employee.department})
                                            <Check
                                                className={cn(
                                                    "ml-auto",
                                                    empFilter === employee.id ? "opacity-100" : "opacity-0"
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

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filter Blocks */}
                <div className="flex flex-col space-y-4 md:w-1/4">
                    {[
                        { key: "Pending", icon: <Clock className="text-yellow-500 w-6 h-6" />, label: "Pending", count: pending },
                        { key: "Approved", icon: <Check className="text-green-500 w-6 h-6" />, label: "Approved", count: approved },
                        { key: "Rejected", icon: <X className="text-red-500 w-6 h-6" />, label: "Rejected", count: rejected },
                    ].map(({ key, icon, label, count }) => (
                        <button
                            key={key}
                            className="flex items-center justify-between p-4 shadow-lg rounded-lg bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none"
                            onClick={() => setStatusFilter(label)}
                        >
                            <div className="flex items-center space-x-3">
                                {icon}
                                <span className="text-gray-900 font-semibold">{label}</span>
                            </div>
                            <span className="text-lg font-bold text-gray-800">{count}</span>
                        </button>
                    ))}
                </div>

                {/* Data Table */}
                <div className="flex-grow bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">Leave Approval ({statusFilter || "All"})</h2>
                    <DataTable
                        data={data}
                        columns={colomns}
                        pageSize={limit}
                        totalPages={totalPages}
                        currentPage={page}
                        onPageChange={setPage}
                        onPageSizeChange={setLimit}
                    />
                </div>
            </div>

            {/* Leave Request Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white p-6 rounded-lg shadow-xl max-w-lg mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-800">Leave Request Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mb-6">
                        <div>
                            <strong className="text-gray-600">Employee:</strong>
                            <p className="text-gray-800">{currentdata?.employee?.name}</p>
                        </div>
                        <div>
                            <strong className="text-gray-600">Leave Type:</strong>
                            <p className="text-gray-800">{currentdata?.leave_type?.leave_type}</p>
                        </div>
                        <div>
                            <strong className="text-gray-600">Reason:</strong>
                            <p className="text-gray-800">{currentdata?.reason}</p>
                        </div>
                        <div>
                            <strong className="text-gray-600">Leave Date:</strong>
                            <p className="text-gray-800">{currentdata?.start_date} to {currentdata?.end_date}</p>
                        </div>
                        <div>
                            <strong className="text-gray-600">Status:</strong><br />
                            <div
                                className={`inline-block px-2 py-2 rounded-md text-white capitalize
                        ${currentdata?.status === "pending" ? "bg-yellow-500" :
                                        currentdata?.status === "approved" ? "bg-green-500" :
                                            currentdata?.status === "rejected" ? "bg-red-500" :
                                                "bg-gray-400"}`}
                            >
                                {currentdata?.status}
                            </div>
                        </div>
                    </div>
                    {currentdata?.status === "pending" && (
                        <div className="flex space-x-4">
                            <Button
                                variant="destructive"
                                onClick={() => setRejectDialogOpen(true)}
                                className="px-6 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-200"
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={handleApprove}
                                className="px-6 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200"
                            >
                                Approve
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action can not be revert!.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex space-x-4">
                        <Textarea
                            value={rejectionRemark}
                            onChange={(e) => setRejectionRemark(e.target.value)}
                            placeholder="Enter reason for rejection"
                            rows={4}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => HandleSubmitRejection()}
                            disabled={rejectionRemark === ""}
                        >
                            Reject
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action can not be revert!.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex space-x-4">
                        <Textarea
                            value={rejectionRemark}
                            onChange={(e) => setRejectionRemark(e.target.value)}
                            placeholder="Enter reason for rejection"
                            rows={4}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => (handleApprove)}
                            disabled={rejectionRemark === ""}
                        >
                            Approve
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}

export default LeaveApprovalPage;
