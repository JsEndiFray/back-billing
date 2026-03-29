-- ============================================================
-- Migración 010: tabla internal_expenses
-- Gastos internos de la empresa (sin factura de proveedor).
-- Soporta gastos recurrentes, aprobación y adjuntos.
-- Depende de: estates (004), employee (005)
-- ============================================================

USE proyecto_facturas_dev;

CREATE TABLE IF NOT EXISTS internal_expenses (
    id                   INT           AUTO_INCREMENT PRIMARY KEY,
    expense_date         DATE          NOT NULL,
    category             VARCHAR(100)  NULL,
    subcategory          VARCHAR(100)  NULL,
    description          TEXT          NULL,
    amount               DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    iva_percentage       DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
    iva_amount           DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_amount         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    is_deductible        TINYINT(1)    NOT NULL DEFAULT 1,
    supplier_name        VARCHAR(255)  NULL,
    supplier_nif         VARCHAR(20)   NULL,
    supplier_address     VARCHAR(500)  NULL,
    payment_method       VARCHAR(50)   NULL,
    receipt_number       VARCHAR(100)  NULL,
    receipt_date         DATE          NULL,
    pdf_path             VARCHAR(500)  NULL,
    has_attachments      TINYINT(1)    NOT NULL DEFAULT 0,
    property_id          INT           NULL,
    project_code         VARCHAR(50)   NULL,
    cost_center          VARCHAR(100)  NULL,
    notes                TEXT          NULL,
    is_recurring         TINYINT(1)    NOT NULL DEFAULT 0,
    recurrence_period    VARCHAR(20)   NULL,
    next_occurrence_date DATE          NULL,
    created_by           INT           NULL,
    status               VARCHAR(20)   NOT NULL DEFAULT 'pending',
    approved_by          INT           NULL,
    approval_date        DATE          NULL,
    created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_expense_date (expense_date),
    INDEX idx_property_id  (property_id),
    INDEX idx_status       (status),

    FOREIGN KEY (property_id) REFERENCES estates(id)   ON DELETE SET NULL,
    FOREIGN KEY (created_by)  REFERENCES employee(id)  ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES employee(id)  ON DELETE SET NULL
);
