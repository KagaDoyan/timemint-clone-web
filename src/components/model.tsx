export interface Shift {
    id: number
    name: string
    description: string
    start_time: string
    end_time: string
    color: string
    // department_id: number
    // department: Department
    created_at: string
    updated_at: string
}

export interface Department {
    id: number
    name: string
    created_at: string
    updated_at: string
}

export interface Leave_type {
    id: number;
    leave_type: string;
    description: string;
    payable: boolean;
    annually_max: number;
}

export interface Employee {
    id: number;
    employee_no: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    position: string;
    role_id: number;
    role: Role;
    department_id: number;
    department: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
}

export interface ShiftAssign {
    id: number;
    employee_id: number;
    employee: Employee | null;
    shift_id: number;
    shift: Shift | null;
    date: string;
    created_by_user: Employee | null;
}

export interface LeaveReqest {
    id: number
    employee_id: number
    employee: Employee
    leave_type_id: number
    leave_type: LeaveType
    start_date: string
    end_date: string
    reason: string
    status: string
    full_day: boolean
    created_at: string
    updated_at: string
    reviewer_id: number
    reviewer: Employee
    remark: string
}

export interface LeaveType {
    id: number
    leave_type: string
    description: string
    payable: boolean
    annually_max: number
}

/**
 * Represents an event with details such as name, description,
 * start date, and end date.
 */
export interface events {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    start: string
    end: string
    date: string
    event_type: string
}