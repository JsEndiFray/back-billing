-- ============================================================
-- Migración 009: tabla invoices_received
-- Facturas recibidas de proveedores.
-- Soporta auto-referencia para abonos (original_invoice_id).
-- Depende de: suppliers (006), estates (004), employee (005)
-- ============================================================

USE proyecto_facturas_dev;

CREATE TABLE IF NOT EXISTS invoices_received (
    id                   INT           AUTO_INCREMENT PRIMARY KEY,
    invoice_number       VARCHAR(50)   NOT NULL,
    our_reference        VARCHAR(50)   NULL,
    supplier_id          INT           NOT NULL,
    property_id          INT           NULL,
    invoice_date         DATE          NOT NULL,
    due_date             DATE          NULL,
    received_date        DATE          NULL,
    tax_base             DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    iva_percentage       DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
    iva_amount           DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    irpf_percentage      DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
    irpf_amount          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_amount         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    category             VARCHAR(100)  NULL,
    subcategory          VARCHAR(100)  NULL,
    description          TEXT          NULL,
    notes                TEXT          NULL,
    collection_status    VARCHAR(20)   NOT NULL DEFAULT 'pending',
    collection_method    VARCHAR(50)   NULL,
    collection_date      DATE          NULL,
    collection_reference VARCHAR(255)  NULL,
    collection_notes     TEXT          NULL,
    start_date           DATE          NULL,
    end_date             DATE          NULL,
    corresponding_month  VARCHAR(7)    NULL,
    is_proportional      TINYINT(1)    NOT NULL DEFAULT 0,
    is_refund            TINYINT(1)    NOT NULL DEFAULT 0,
    original_invoice_id  INT           NULL,
    pdf_path             VARCHAR(500)  NULL,
    has_attachments      TINYINT(1)    NOT NULL DEFAULT 0,
    created_by           INT           NULL,
    created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_invoice_number  (invoice_number),
    INDEX idx_supplier_id         (supplier_id),
    INDEX idx_property_id         (property_id),
    INDEX idx_invoice_date        (invoice_date),
    INDEX idx_collection_status   (collection_status),

    FOREIGN KEY (supplier_id)         REFERENCES suppliers(id),
    FOREIGN KEY (property_id)         REFERENCES estates(id) ON DELETE SET NULL,
    FOREIGN KEY (original_invoice_id) REFERENCES invoices_received(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by)          REFERENCES employee(id) ON DELETE SET NULL
);
