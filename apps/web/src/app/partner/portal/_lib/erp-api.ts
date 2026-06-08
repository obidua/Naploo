// ERP client for partner portal — HR/Payroll/Expenses/Accounting/Daily statement.
import { api } from '@/lib/api';

export interface Employee {
  id: string; partner_id: string; user_id?: string;
  emp_code?: string; full_name: string;
  gender?: string; dob?: string; phone?: string; email?: string;
  address?: string; city?: string; state?: string; pincode?: string;
  designation?: string; department?: string;
  joined_at?: string; exited_at?: string;
  employment_type: string; status: string;
  pan?: string; aadhaar_last4?: string;
  bank_account?: string; bank_ifsc?: string; upi?: string;
  emergency_name?: string; emergency_phone?: string;
  photo_url?: string; notes?: string;
  current_gross?: string;
  days_present_this_month?: string;
}

export interface SalaryStructure {
  id: string; employee_id: string; effective_from: string;
  basic: string; hra: string; conveyance: string; medical: string;
  special: string; other_allow: string;
  pf_percent: string; esi_percent: string; professional_tax: string;
  gross_monthly: string; status: string;
}

export interface AttendanceLog {
  id: string; employee_id: string; date: string;
  check_in_at?: string; check_out_at?: string;
  status: string; hours_worked?: string; overtime_hrs: string;
  notes?: string;
  full_name?: string; emp_code?: string; designation?: string;
}

export interface SalaryPayment {
  id: string; employee_id: string; pay_period: string;
  days_worked: number; days_paid: number;
  basic: string; hra: string; allowances: string; overtime_pay: string; bonus: string;
  gross: string;
  pf_deducted: string; esi_deducted: string; tax_deducted: string; pt_deducted: string;
  loan_deducted: string; other_deduct: string; net_pay: string;
  status: string; paid_at?: string; payment_mode?: string; payment_ref?: string;
  full_name?: string; emp_code?: string;
}

export interface ExpenseCategory { id: string; slug: string; name: string; group_name: string }

export interface Expense {
  id: string; expense_date: string;
  category_id?: string; category_name?: string; group_name?: string;
  description: string;
  amount: string; gst_amount: string; total_amount: string;
  payment_mode: string; vendor_name?: string; invoice_no?: string;
  status: string; notes?: string;
}

export interface LedgerEntry {
  id: string; entry_date: string;
  ref_type?: string; description?: string;
  account_id?: string; code?: string; account_name?: string; account_type?: string;
  debit: string; credit: string;
}

export interface DailyStatement {
  partner_id: string; statement_date: string;
  room_revenue: number; pod_revenue: number; fnb_revenue: number;
  services_revenue: number; other_revenue: number; total_revenue: number;
  rooms_total: number; rooms_occupied?: number; occupancy_pct?: number;
  pods_total: number; pods_occupied?: number;
  bookings_total: number; arrivals: number; departures: number;
  walk_ins?: number; cancellations: number;
  cash_collected: number; card_collected: number; upi_collected: number;
  bank_collected: number; total_collected: number;
  total_expenses: number; cash_paid: number;
  cash_in_hand?: number; net_profit: number;
  closed_at?: string; notes?: string;
}

export const erpApi = {
  // Employees
  listEmployees: (status?: string) =>
    api.get<{ employees: Employee[] }>(`/api/v1/pms/employees${status ? '?status=' + status : ''}`),
  getEmployee: (id: string) =>
    api.get<{ employee: Employee; salaryStructures: SalaryStructure[]; attendance: AttendanceLog[]; payments: SalaryPayment[] }>(`/api/v1/pms/employees/${id}`),
  createEmployee: (input: Partial<Employee>) =>
    api.post<{ employee: Employee }>('/api/v1/pms/employees', input),
  updateEmployee: (id: string, input: Partial<Employee>) =>
    api.put<{ success: boolean }>(`/api/v1/pms/employees/${id}`, input),

  // Salary structure
  setSalaryStructure: (employeeId: string, input: Partial<SalaryStructure> & { effectiveFrom: string }) =>
    api.post<{ structure: SalaryStructure }>(`/api/v1/pms/employees/${employeeId}/salary-structure`, input),

  // Attendance
  getAttendance: (date?: string) =>
    api.get<{ attendance: AttendanceLog[]; date: string }>(`/api/v1/pms/attendance${date ? '?date=' + date : ''}`),
  recordAttendance: (input: { employeeId: string; date: string; checkInAt?: string; checkOutAt?: string; status?: string; hoursWorked?: number; overtimeHrs?: number; notes?: string }) =>
    api.post<{ log: AttendanceLog }>('/api/v1/pms/attendance', input),

  // Leaves
  listLeaves: () => api.get<{ leaves: any[] }>('/api/v1/pms/leaves'),
  createLeave: (input: { employeeId: string; kind?: string; fromDate: string; toDate: string; reason?: string }) =>
    api.post<{ leave: any }>('/api/v1/pms/leaves', input),
  updateLeave: (id: string, status: string) =>
    api.put<{ success: boolean }>(`/api/v1/pms/leaves/${id}`, { status }),

  // Salary payments
  listSalaryPayments: (period?: string) =>
    api.get<{ payments: SalaryPayment[] }>(`/api/v1/pms/salary-payments${period ? '?period=' + period : ''}`),
  generateSalary: (period: string) =>
    api.post<{ generated: number; period: string }>('/api/v1/pms/salary-payments/generate', { period }),
  markSalaryPaid: (id: string, paymentMode: string, paymentRef?: string) =>
    api.put<{ success: boolean }>(`/api/v1/pms/salary-payments/${id}`, { status: 'paid', paymentMode, paymentRef }),

  // Expenses
  listExpenseCategories: () =>
    api.get<{ categories: ExpenseCategory[] }>('/api/v1/pms/expense-categories'),
  listExpenses: (from?: string, to?: string) => {
    const q = [];
    if (from) q.push('from=' + from);
    if (to) q.push('to=' + to);
    return api.get<{ expenses: Expense[]; summary: { group_name: string; total: string }[]; from: string; to: string }>(`/api/v1/pms/expenses${q.length ? '?' + q.join('&') : ''}`);
  },
  createExpense: (input: { description: string; amount: number; categoryId?: string; expenseDate?: string; gstAmount?: number; paymentMode?: string; vendorName?: string; invoiceNo?: string; receiptUrl?: string; notes?: string }) =>
    api.post<{ expense: Expense }>('/api/v1/pms/expenses', input),
  approveExpense: (id: string) =>
    api.put<{ success: boolean }>(`/api/v1/pms/expenses/${id}/approve`, {}),
  deleteExpense: (id: string) =>
    api.delete<{ success: boolean }>(`/api/v1/pms/expenses/${id}`),

  // Accounting
  listAccounts: () => api.get<{ accounts: any[] }>('/api/v1/pms/chart-of-accounts'),
  getLedger: (from?: string, to?: string) => {
    const q = [];
    if (from) q.push('from=' + from);
    if (to) q.push('to=' + to);
    return api.get<{ entries: LedgerEntry[]; pnl: { type: string; net: string }[]; from: string; to: string }>(`/api/v1/pms/ledger${q.length ? '?' + q.join('&') : ''}`);
  },

  // Daily statement
  getDailyStatement: (date?: string) =>
    api.get<{ statement: DailyStatement; closed: boolean }>(`/api/v1/pms/daily-statement${date ? '?date=' + date : ''}`),
  closeDailyStatement: (statement: DailyStatement, notes?: string) =>
    api.post<{ success: boolean }>('/api/v1/pms/daily-statement/close', { date: statement.statement_date, statement, notes }),
  getStatementHistory: (limit?: number) =>
    api.get<{ history: DailyStatement[] }>(`/api/v1/pms/daily-statement/history${limit ? '?limit=' + limit : ''}`),
};

export function fmtINR(v: number | string): string {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
