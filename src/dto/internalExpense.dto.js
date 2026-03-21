// Campos que el cliente puede enviar al crear un gasto interno.
// NOT incluye: id, iva_amount/total_amount (calculados), created_at, updated_at, approval_date.
export const createExpenseDTO = (data) => ({
    expense_date: data.expense_date,
    category: data.category?.trim(),
    subcategory: data.subcategory?.trim() ?? null,
    description: data.description?.trim(),
    amount: data.amount,
    iva_percentage: data.iva_percentage ?? 21,
    is_deductible: data.is_deductible ?? true,
    supplier_name: data.supplier_name?.trim() ?? null,
    supplier_nif: data.supplier_nif?.trim().toUpperCase() ?? null,
    supplier_address: data.supplier_address?.trim() ?? null,
    payment_method: data.payment_method ?? 'card',
    receipt_number: data.receipt_number?.trim() ?? null,
    receipt_date: data.receipt_date ?? null,
    pdf_path: data.pdf_path?.trim() ?? null,
    has_attachments: data.has_attachments ?? false,
    property_id: data.property_id ?? null,
    project_code: data.project_code?.trim() ?? null,
    cost_center: data.cost_center?.trim() ?? null,
    notes: data.notes?.trim() ?? null,
    is_recurring: data.is_recurring ?? false,
    recurrence_period: data.recurrence_period ?? null,
    next_occurrence_date: data.next_occurrence_date ?? null,
    status: data.status ?? 'pending',
    created_by: data.created_by?.trim() ?? null,
    approved_by: data.approved_by?.trim() ?? null,
});

export const updateExpenseDTO = (data) => ({
    expense_date: data.expense_date,
    category: data.category?.trim(),
    subcategory: data.subcategory?.trim() ?? null,
    description: data.description?.trim(),
    amount: data.amount,
    iva_percentage: data.iva_percentage,
    is_deductible: data.is_deductible,
    supplier_name: data.supplier_name?.trim() ?? null,
    supplier_nif: data.supplier_nif?.trim().toUpperCase() ?? null,
    supplier_address: data.supplier_address?.trim() ?? null,
    payment_method: data.payment_method,
    receipt_number: data.receipt_number?.trim() ?? null,
    receipt_date: data.receipt_date ?? null,
    pdf_path: data.pdf_path?.trim() ?? null,
    has_attachments: data.has_attachments,
    property_id: data.property_id ?? null,
    project_code: data.project_code?.trim() ?? null,
    cost_center: data.cost_center?.trim() ?? null,
    notes: data.notes?.trim() ?? null,
    is_recurring: data.is_recurring,
    recurrence_period: data.recurrence_period ?? null,
    next_occurrence_date: data.next_occurrence_date ?? null,
});

export const expenseDateRangeDTO = (data) => ({
    startDate: data.startDate,
    endDate: data.endDate,
});

export const advancedSearchDTO = (data) => ({
    category: data.category,
    status: data.status,
    supplier_name: data.supplier_name,
    start_date: data.start_date,
    end_date: data.end_date,
    min_amount: data.min_amount,
    max_amount: data.max_amount,
    is_deductible: data.is_deductible,
    property_id: data.property_id,
});

export const approvalDTO = (data) => ({
    approved_by: data.approved_by,
});

export const expenseStatusDTO = (data) => ({
    status: data.status,
    approved_by: data.approved_by,
});

export const validateDateRangeDTO = (data) => ({
    start_date: data.start_date,
    end_date: data.end_date,
});

export const simulationDTO = (data) => ({
    amount: data.amount,
    iva_percentage: data.iva_percentage,
});
