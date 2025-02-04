'use client';

import React, { useEffect, useState } from "react";
import { Employee } from "@/components/model";
import * as XLSX from "xlsx";

interface EmployeeReportPageProps {
  session: any;
}

const EmployeeReportPage: React.FC<EmployeeReportPageProps> = ({ session }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/report`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      });
      const data = await response.json();
      setEmployees(data.data);
      setFilteredEmployees(data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = employees.filter((employee) =>
      employee.name.toLowerCase().includes(query) ||
      employee.employee_no.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.phone.toLowerCase().includes(query) ||
      employee.position.toLowerCase().includes(query) ||
      employee.department.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
  };

  const handleExport = () => {
    const worksheetData = filteredEmployees.map((employee) => ({
      "Employee No": employee.employee_no,
      Name: employee.name,
      Email: employee.email,
      Phone: employee.phone,
      Position: employee.position,
      Department: employee.department,
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
      <h1 className="text-2xl font-bold mb-6">Employee Report</h1>

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
      {filteredEmployees.length > 0 ? (
        <div className="overflow-x-auto border border-gray-300 rounded-lg shadow">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Employee No</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Position</th>
                <th className="px-4 py-2">Department</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-t">
                  <td className="px-4 py-2">{employee.id}</td>
                  <td className="px-4 py-2">{employee.employee_no}</td>
                  <td className="px-4 py-2">{employee.name}</td>
                  <td className="px-4 py-2">{employee.email}</td>
                  <td className="px-4 py-2">{employee.phone}</td>
                  <td className="px-4 py-2">{employee.position}</td>
                  <td className="px-4 py-2">{employee.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No employees found.</p>
      )}
    </div>
  );
};

export default EmployeeReportPage;
