// Campos que el cliente puede enviar al crear una factura recibida.
// NOT incluye: id, totales calculados, created_at.
export const createInvoiceReceivedDTO = (data) => ({
    invoice_number: data.invoice_number?.trim(),
    supplier_id: data.supplier_id,
    invoice_date: data.invoice_date,
    due_date: data.due_date ?? null,
    received_date: data.received_date ?? null,
    tax_base: data.tax_base,
    iva_percentage: data.iva_percentage ?? 21,
    irpf_percentage: data.irpf_percentage ?? 0,
    category: data.category,
    subcategory: data.subcategory?.trim() ?? null,
    description: data.description?.trim(),
    notes: data.notes?.trim() ?? null,
    payment_status: data.payment_status ?? 'pending',
    payment_method: data.payment_method ?? 'transfer',
    payment_date: data.payment_date ?? null,
    payment_reference: data.payment_reference?.trim() ?? null,
    payment_notes: data.payment_notes?.trim() ?? null,
    is_proportional: data.is_proportional ?? false,
    start_date: data.start_date ?? null,
    end_date: data.end_date ?? null,
    corresponding_month: data.corresponding_month ?? null,
    property_id: data.property_id ?? null,
    our_reference: data.our_reference?.trim() ?? null,
    pdf_path: data.pdf_path?.trim() ?? null,
    has_attachments: data.has_attachments ?? false,
});

export const updateInvoiceReceivedDTO = (data) => ({
    invoice_number: data.invoice_number?.trim(),
    supplier_id: data.supplier_id,
    invoice_date: data.invoice_date,
    due_date: data.due_date ?? null,
    received_date: data.received_date ?? null,
    tax_base: data.tax_base,
    iva_percentage: data.iva_percentage,
    irpf_percentage: data.irpf_percentage,
    category: data.category,
    subcategory: data.subcategory?.trim() ?? null,
    description: data.description?.trim(),
    notes: data.notes?.trim() ?? null,
    payment_status: data.payment_status,
    payment_method: data.payment_method,
    payment_date: data.payment_date ?? null,
    payment_reference: data.payment_reference?.trim() ?? null,
    payment_notes: data.payment_notes?.trim() ?? null,
    is_proportional: data.is_proportional,
    start_date: data.start_date ?? null,
    end_date: data.end_date ?? null,
    corresponding_month: data.corresponding_month ?? null,
    property_id: data.property_id ?? null,
    our_reference: data.our_reference?.trim() ?? null,
    pdf_path: data.pdf_path?.trim() ?? null,
    has_attachments: data.has_attachments,
});

export const paymentStatusDTO = (data) => ({
    payment_status: data.payment_status,
    payment_method: data.payment_method,
    payment_date: data.payment_date ?? null,
    payment_reference: data.payment_reference ?? null,
    payment_notes: data.payment_notes ?? null,
});

export const receivedRefundDTO = (data) => ({
    originalInvoiceId: data.originalInvoiceId,
    refundReason: data.refundReason?.trim() ?? null,
});

export const receivedDateRangeDTO = (data) => ({
    startDate: data.startDate,
    endDate: data.endDate,
});

export const receivedProportionalDateRangeDTO = (data) => ({
    start_date: data.start_date,
    end_date: data.end_date,
});

export const receivedProportionalSimulationDTO = (data) => ({
    tax_base: data.tax_base,
    iva_percentage: data.iva_percentage,
    irpf_percentage: data.irpf_percentage,
    start_date: data.start_date,
    end_date: data.end_date,
});
