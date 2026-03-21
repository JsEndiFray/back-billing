// Campos que el cliente puede enviar al crear una factura emitida.
// NO incluye: id, invoice_number (auto), totales calculados, created_at.
export const createInvoiceIssuedDTO = (data) => ({
    clients_id: data.clients_id,
    owners_id: data.owners_id,
    estates_id: data.estates_id,
    invoice_date: data.invoice_date,
    due_date: data.due_date ?? null,
    tax_base: data.tax_base,
    iva: data.iva ?? 21,
    irpf: data.irpf ?? 0,
    ownership_percent: data.ownership_percent ?? 100,
    collection_status: data.collection_status ?? 'pending',
    collection_method: data.collection_method ?? 'transfer',
    collection_date: data.collection_date ?? null,
    collection_reference: data.collection_reference?.trim() ?? null,
    collection_notes: data.collection_notes?.trim() ?? null,
    is_proportional: data.is_proportional ?? false,
    start_date: data.start_date ?? null,
    end_date: data.end_date ?? null,
    corresponding_month: data.corresponding_month ?? null,
    is_refund: data.is_refund ?? false,
    original_invoice_id: data.original_invoice_id ?? null,
    pdf_path: data.pdf_path?.trim() ?? null,
    has_attachments: data.has_attachments ?? false,
    created_by: data.created_by ?? null,
});

export const updateInvoiceIssuedDTO = (data) => ({
    clients_id: data.clients_id,
    owners_id: data.owners_id,
    estates_id: data.estates_id,
    invoice_date: data.invoice_date,
    due_date: data.due_date ?? null,
    tax_base: data.tax_base,
    iva: data.iva,
    irpf: data.irpf,
    ownership_percent: data.ownership_percent,
    collection_status: data.collection_status,
    collection_method: data.collection_method,
    collection_date: data.collection_date ?? null,
    collection_reference: data.collection_reference?.trim() ?? null,
    collection_notes: data.collection_notes?.trim() ?? null,
    is_proportional: data.is_proportional,
    start_date: data.start_date ?? null,
    end_date: data.end_date ?? null,
    corresponding_month: data.corresponding_month ?? null,
});

export const collectionStatusDTO = (data) => ({
    collection_status: data.collection_status,
    collection_method: data.collection_method,
    collection_date: data.collection_date ?? null,
    collection_reference: data.collection_reference ?? null,
    collection_notes: data.collection_notes ?? null,
});

export const refundDTO = (data) => ({
    originalInvoiceId: data.originalInvoiceId,
});

export const dateRangeDTO = (data) => ({
    startDate: data.startDate,
    endDate: data.endDate,
});

export const proportionalDateRangeDTO = (data) => ({
    start_date: data.start_date,
    end_date: data.end_date,
});

export const proportionalSimulationDTO = (data) => ({
    tax_base: data.tax_base,
    iva: data.iva,
    irpf: data.irpf,
    start_date: data.start_date,
    end_date: data.end_date,
});
