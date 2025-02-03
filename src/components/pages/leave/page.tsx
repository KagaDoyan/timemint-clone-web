
'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useMemo, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils';
import { Calendar1 } from 'lucide-react';
import dayjs from 'dayjs';
import { Card } from '@/components/ui/card';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { LeaveReqest } from '@/components/model';

interface LeavePageProps {
    session: any
}



export interface Employee {
    id: number
    employee_no: string
    name: string
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
    const [formData, setFormData] = useState<Partial<LeaveReqestBody>>({})
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
    const [limit, setLimit] = useState(5);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [leaverequests, setLeaverequests] = useState<LeaveReqest[]>([])

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
    ], [])

    const HandleSubmit = async () => {
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
            toast.success(data.message)
            setFormData({})
            fetchLeaverequests()
        } else {
            toast.error(data.error || "Failed to submit leave request");
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
            toast.error(data.error || "Failed to fetch leave types");
        }
    }

    const fetchLeaverequests = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-requests/all?limit=${limit}&page=${page}`, {
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
            toast.error(data.error || "Failed to fetch leave requests");
        }
    }

    useEffect(() => {
        fetchLeaverequests()
        fetchLeaveTypes()
    }, [])

    return (
        <div className="flex flex-col gap-4 p-4 max-w-full overflow-auto">
            <div className="grid auto-rows-min gap-4">
                <Card className="rounded-xl bg-muted/30 p-6">
                    <div className="grid gap-4 py-4">
                        <h5 className="mb-4">Leave Request</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                            <Label htmlFor="leave_type" className="text-right">
                                Leave Type
                            </Label>
                            <Select
                                onValueChange={value => {
                                    setFormData(prev => ({ ...prev, leave_type_id: Number(value) }))
                                }}
                                defaultValue={formData.leave_type_id?.toString() || ''}
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
                                checked={formData.full_day}
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