'use client';

import React, { useEffect, useState } from "react";
import { Shift } from "@/components/model";
import * as XLSX from "xlsx";

interface ShiftReportPageProps {
  session: any;
}

const ShiftReportPage: React.FC<ShiftReportPageProps> = ({ session }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shifts/report`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      });
      if (!response.ok) {
        setShifts([]);
        setFilteredShifts([]);
        return
      }
      const data = await response.json();
      setShifts(data.data);
      setFilteredShifts(data.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = shifts?.filter((shift) =>
      shift.name.toLowerCase().includes(query) ||
      shift.description.toLowerCase().includes(query)
    );
    setFilteredShifts(filtered);
  };

  const handleExport = () => {
    const worksheetData = filteredShifts?.map((shift) => ({
      "ID": shift.id,
      "Shift Name": shift.name,
      "Description": shift.description,
      "Start Time": shift.start_time,
      "End Time": shift.end_time,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees Report");

    XLSX.writeFile(workbook, "employees_report.xlsx");
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-6">Shift Report</h1>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by name, email, or department"
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/2"
        />
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

      {/* Employees Table */}
      {filteredShifts.length > 0 ? (
        <div className="overflow-x-auto border border-gray-300 rounded-lg shadow">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Shift Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Start Time</th>
                <th className="px-4 py-2">End Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts?.map((shift) => (
                <tr key={shift.id} className="border-t">
                  <td className="px-4 py-2">{shift.id}</td>
                  <td className="px-4 py-2">{shift.name}</td>
                  <td className="px-4 py-2">{shift.description}</td>
                  <td className="px-4 py-2">{shift.start_time}</td>
                  <td className="px-4 py-2">{shift.end_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No shifts found.</p>
      )}
    </div>
  );
};

export default ShiftReportPage;
