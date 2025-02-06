'use client';

import React, { useEffect, useState } from "react";
import { LeaveReqest } from "@/components/model";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker";

interface LeaveReportPageProps {
  session: any;
}

const LeaveReportPage: React.FC<LeaveReportPageProps> = ({ session }) => {
  const [leaves, setLeaves] = useState<LeaveReqest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Build the URL with query parameters for the date range if provided.
      const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave-requests/report`);
      if (date?.from) url.searchParams.append("start", format(date.from, 'yyyy-MM-dd'));
      if (date?.to) url.searchParams.append("end", format(date.to, 'yyyy-MM-dd'));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      });
      if (!response.ok) {
        setLeaves([]);
        return;
      }
      const data = await response.json();
      setLeaves(data.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date?.from, date?.to]);


  const handleExport = () => {
    const worksheetData = leaves.map((leave) => ({
      "ID": leave.id,
      "Leave Type": leave.leave_type?.leave_type,
      "Description": leave.reason,
      "Start": leave.start_date,
      "End": leave.end_date,
      "Name": leave.employee?.name,
      "Email": leave.employee?.email,
      "Phone": leave.employee?.phone,
      "Status": leave.status,
      "Approved By": leave.reviewer?.name
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Report");

    XLSX.writeFile(workbook, "leave_report.xlsx");
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Skeleton placeholder for table rows
  const SkeletonRow = () => (
    <tr className="border-t animate-pulse">
      {Array(10)
        .fill(0)
        .map((_, index) => (
          <td key={index} className="px-4 py-2">
            <div className="h-4 bg-gray-300 rounded"></div>
          </td>
        ))}
    </tr>
  );

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-6">Leave Report</h1>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Date Range Inputs */}
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
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <button
          onClick={handleExport}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
        >
          Export
        </button>
        <button
          onClick={handleRefresh}
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600"
        >
          Refresh
        </button>
      </div>

      {/* Shifts Table */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg shadow">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Start Time</th>
              <th className="px-4 py-2">End Time</th>
              <th className="px-4 py-2">Employee Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Approved By</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Render 5 skeleton rows while loading
              Array.from({ length: 5 }).map((_, idx) => <SkeletonRow key={idx} />)
            ) : leaves?.length > 0 ? (
              leaves.map((leave) => (
                <tr key={leave.id} className="border-t">
                  <td className="px-4 py-2">{leave.id}</td>
                  <td className="px-4 py-2">{leave.leave_type?.leave_type}</td>
                  <td className="px-4 py-2">{leave.reason}</td>
                  <td className="px-4 py-2">{leave.start_date}</td>
                  <td className="px-4 py-2">{leave.end_date}</td>
                  <td className="px-4 py-2">{leave.employee?.name}</td>
                  <td className="px-4 py-2">{leave.employee?.email}</td>
                  <td className="px-4 py-2">{leave.employee?.phone}</td>
                  <td className="px-4 py-2">{leave.status}</td>
                  <td className="px-4 py-2">{leave.reviewer?.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-2 text-center text-gray-500">
                  No leaves found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveReportPage;
