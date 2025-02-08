'use client';
import React, { useState } from "react";
import EmployeeReportPage from "./pages/employee_report";
import ShiftReportPage from "./pages/shift_report";
import ShiftAssignmentReportPage from "./pages/shift_assignment";
import LeaveReportPage from "./pages/leave_report";

interface ReportPageProps {
    session: any
}
const ReportPage: React.FC<ReportPageProps> = ({ session }) => {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = ["Leaves", "Assigned Shifts", "Shifts", "Employees"];
    const reportContent = [
        <LeaveReportPage session={session} />,
        <ShiftAssignmentReportPage session={session} />,
        <ShiftReportPage session={session} />,
        <EmployeeReportPage session={session} />,
    ];

    return (
        <div className="p-4 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-2xl font-bold mb-6 text-center">Report Dashboard</h1>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-gray-300 mb-4">
                {tabs?.map((tab, index) => (
                    <button
                        key={index}
                        className={`flex-1 text-center py-2 px-4 cursor-pointer ${activeTab === index
                            ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
                            : "text-gray-500 hover:text-blue-500"
                            }`}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 bg-white border border-gray-300 rounded-lg shadow">
                {reportContent[activeTab]}
            </div>
        </div>
    );
};

export default ReportPage;
