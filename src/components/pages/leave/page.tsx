
'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useMemo, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { cn } from '@/lib/utils';
import { Calendar1, Check, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';
import { Card } from '@/components/ui/card';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { LeaveReqest } from '@/components/model';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/components/model';

interface LeavePageProps {
    session: any
}

interface LeaveReqestBody {
    employee_id: number
    leave_type_id: number
    start_date: Date
    end_date: Date
    reason: string
    full_day: boolean
}

interface LeavePaginationResponse {
    data: {
        limit: number;
        page: number;
        data: LeaveReqest[];
        totalPages: number;
        totalRows: number;
    };
    status: boolean;
    error?: string;
}


type LeaveType = {
    id: number
    leave_type: string
}

export default function LeavePage({ session }: LeavePageProps) {
    const { toast } = useToast()
    const [formData, setFormData] = useState<Partial<LeaveReqestBody>>({})
    const [employee, setEmployee] = useState<Employee[]>([])
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
    const [limit, setLimit] = useState(5);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [leaverequests, setLeaverequests] = useState<LeaveReqest[]>([])
    const [isAdminForm, setAdminForm] = useState(false)
    const [openEmployee, setOpenEmployee] = useState(false);
    const [empFilter, setEmpFilter] = useState<number | null>(null);

    const columns = useMemo<ColumnDef<LeaveReqest>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
        },
        {
            accessorKey: 'employee',
            header: 'Employee',
            cell: ({ row }) => {
                const { employee } = row.original;
                return employee.name;
            },
        },
        {
            accessorKey: 'leave_type',
            header: 'Leave Type',
            cell: ({ row }) => {
                const { leave_type } = row.original;
                return leave_type.leave_type;
            },
        },
        {
            accessorKey: 'leave_date',
            header: 'Leave Date',
            cell: ({ row }) => {
                const { start_date, end_date } = row.original;
                return `${start_date} - ${end_date}`;
            },
        },
        {
            accessorKey: 'reason',
            header: 'Reason',
        },
        {
            accessorKey: 'full_day',
            header: 'Full Day',
            cell: ({ row }) => {
                const { full_day } = row.original;
                return full_day ? 'full day' : 'half day';
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const { status } = row.original;

                // Determine Tailwind classes based on status
                const colorClass =
                    status === 'approved'
                        ? 'bg-green-500 text-white'
                        : status === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-yellow-500 text-black';

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
            accessorKey: 'status',
            header: 'card-header',
            cell: ({ row }) => {
                const leave_request = row.original;
                const colorClass =
                    leave_request.status === 'approved'
                        ? 'bg-green-500 text-white'
                        : leave_request.status === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-yellow-500 text-black';

                return (
                    <div className=" p-2 space-y-1 gap-4">
                        <div className="text-lg">{leave_request.employee.name} | {leave_request.leave_type.leave_type}</div>
                        <div className="text-sm text-gray-600">Leave Date: {leave_request.start_date} - {leave_request.end_date}</div>
                        <div
                            className={`py-1 px-3 rounded-full text-center ${colorClass}`}
                        >
                            {leave_request.status}
                        </div>
                    </div>
                )
            }
        }
    ], [])

    const HandleSubmit = async () => {
        if (!isAdminForm) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-requests/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify({
                    leave_type_id: formData.leave_type_id,
                    start_date: dayjs(formData.start_date).format('DD-MM-YYYY'),
                    end_date: dayjs(formData.end_date).format('DD-MM-YYYY'),
                    reason: formData.reason,
                    full_day: formData.full_day,
                })
            })
            const data = await response.json()
            if (response.ok) {
                toast({
                    title: 'Success',
                    description: "Leave request submitted successfully",
                })
                setFormData({})
                fetchLeaverequests()
            } else {
                toast({
                    title: 'Error',
                    description: data.error || "Failed to submit leave request",
                    variant: "destructive",
                })
            }
        } else {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-requests/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify({
                    leave_type_id: formData.leave_type_id,
                    start_date: dayjs(formData.start_date).format('DD-MM-YYYY'),
                    end_date: dayjs(formData.end_date).format('DD-MM-YYYY'),
                    reason: formData.reason,
                    full_day: formData.full_day,
                    employee_id: formData.employee_id
                })
            })
            const data = await response.json()
            if (response.ok) {
                toast({
                    title: 'Success',
                    description: "Leave request submitted successfully",
                })
                setFormData({})
                fetchLeaverequests()
            } else {
                toast({
                    title: 'Error',
                    description: data.error || "Failed to submit leave request",
                    variant: "destructive",
                })
            }
        }
    }

    const fetchEmployees = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/options`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.accessToken}`,
            }
        })
        const data = await response.json()
        if (response.ok) {
            setEmployee(data.data)
        } else {
            toast({
                title: 'Error',
                description: data.error || "Failed to fetch employees",
                variant: "destructive",
            })
        }
    }

    const fetchLeaveTypes = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-types/all?limit=100&page=1`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.accessToken}`,
            }
        })
        const data = await response.json()
        if (response.ok) {
            setLeaveTypes(data.data.data)
        } else {
            toast({
                title: 'Error',
                description: data.error || "Failed to fetch leave types",
                variant: "destructive",
            })
        }
    }

    const fetchLeaverequests = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-requests/all?limit=${limit}&page=${page}${!isAdminForm ? `&empID=${session.user.id}` : ''}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.accessToken}`,
            }
        })
        const data = await response.json()
        if (response.ok) {
            setLeaverequests(data.data.data)
            setTotalPages(data.data.totalPages)
            setTotalRows(data.data.totalRows)
        } else {
            toast({
                title: 'Error',
                description: data.error || "Failed to fetch leave requests",
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        fetchLeaverequests()
        fetchLeaveTypes()
        fetchEmployees()
    }, [])

    useEffect(() => {
        fetchLeaverequests()
    }, [page, limit, isAdminForm])

    return (
        <div className="flex flex-col gap-4 p-4 max-w-full overflow-auto">
            <div className="grid auto-rows-min gap-4">
                <Card className="rounded-xl bg-muted/30 p-6">
                    <div className={`grid gap-4 py-4`}>
                        <div className={`grid grid-cols-1 sm:grid-cols-4 items-center gap-4 ${session?.user?.roles[0] === 'USER' && `hidden`}`}>
                            <div className="flex items-center sm:col-span-3">
                                <Switch
                                    id="admin_form_switch"
                                    checked={isAdminForm}
                                    onCheckedChange={(checked) => setAdminForm(checked)}
                                    className={cn(
                                        "transition-colors",
                                        isAdminForm ? "bg-blue-500" : "bg-gray-500"
                                    )}
                                    aria-label="Toggle Admin Form"
                                />
                                <span className="ml-2">
                                    {isAdminForm ? "Admin Mode" : "User Mode"}
                                </span>
                            </div>
                        </div>
                        <h4>{isAdminForm ? "Admin Create Leave" : "Request Leave"}</h4>
                        <div className={`grid grid-cols-1 sm:grid-cols-4 items-center gap-4 ${!isAdminForm ? 'hidden' : 'block'}`}>
                            <Label htmlFor="employee" className="text-right">Employee</Label>
                            <Popover open={openEmployee} onOpenChange={setOpenEmployee}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                    >
                                        {formData.employee_id
                                            ? employee.find((e) => e.id === formData.employee_id)?.name || "Select an Employee"
                                            : "Select an Employee"}
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-2">
                                    <Command>
                                        <CommandInput placeholder="Search employee..." />
                                        <CommandList>
                                            <CommandEmpty>No employees found</CommandEmpty>
                                            <CommandGroup>
                                                {employee.map((emp) => (
                                                    <CommandItem
                                                        key={emp.id}
                                                        onSelect={() => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                employee_id: emp.id,
                                                            }));
                                                            setOpenEmployee(false); // Close popover after selection
                                                        }}
                                                    >
                                                        {emp.name}
                                                        {formData.employee_id === emp.id && (
                                                            <Check className="ml-auto h-4 w-4 text-green-500" />
                                                        )}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="leave_type" className="text-right">
                                Leave Type
                            </Label>
                            <Select
                                onValueChange={value => {
                                    setFormData(prev => ({ ...prev, leave_type_id: Number(value) }))
                                }}
                                value={formData.leave_type_id?.toString() || ''}
                            >
                                <SelectTrigger className="sm:col-span-3">
                                    <SelectValue placeholder="Select a leave type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveTypes.map(leaveType => (
                                        <SelectItem key={leaveType.id} value={leaveType.id.toString()}>
                                            {leaveType.leave_type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="reason" className="text-right">
                                Reason
                            </Label>
                            <Textarea
                                id="reason"
                                rows={3}
                                className="sm:col-span-3"
                                placeholder="Enter leave reason"
                                value={formData.reason || ""}
                                onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="start_date" className="text-right">Leave Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full sm:w-[240px] justify-start text-left font-normal",
                                            !formData.start_date && "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar1 />
                                        {formData.start_date ? format(formData.start_date, "dd-MM-yyyy") : <span>DD-MM-YYYY</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.start_date}
                                        onSelect={date => setFormData(prev => ({ ...prev, start_date: date }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="end_date" className="text-right">Leave End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full sm:w-[240px] justify-start text-left font-normal",
                                            !formData.end_date && "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar1 />
                                        {formData.end_date ? format(formData.end_date, "dd-MM-yyyy") : <span>DD-MM-YYYY</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.end_date}
                                        onSelect={date => setFormData(prev => ({ ...prev, end_date: date }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="full_day" className="text-right">Full Day</Label>
                            <Switch
                                id="full_day"
                                checked={formData.full_day ? true : false}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({ ...prev, full_day: checked }))
                                }
                                className="sm:col-span-3"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button onClick={HandleSubmit}>
                                Submit Leave
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="flex-1 rounded-xl bg-muted/50 p-4 max-w-full overflow-auto">
                <DataTable
                    columns={columns}
                    data={leaverequests}
                    currentPage={page}
                    pageSize={limit}
                    totalPages={totalPages}
                    onPageSizeChange={setLimit}
                    onPageChange={setPage}
                />
            </div>
        </div>
    )
}