-- ============================================================
-- Migración 008: tabla invoices_issued
-- Facturas emitidas a clientes (alquileres, etc.).
-- Soporta auto-referencia para abonos (original_invoice_id).
-- Depende de: estates (004), owners (003), clients (002), employee (005)
-- ============================================================

USE proyecto_facturas_dev;

CREATE TABLE IF NOT EXISTS invoices_issued (
    id                   INT           AUTO_INCREMENT PRIMARY KEY,
    invoice_number       VARCHAR(50)   NOT NULL,
    estates_id           INT           NOT NULL,
    owners_id            INT           NOT NULL,
    clients_id           INT           NOT NULL,
    ownership_percent    DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
    invoice_date         DATE          NOT NULL,
    due_date             DATE          NULL,
    tax_base             DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    iva                  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    irpf                 DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total                DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    is_refund            TINYINT(1)    NOT NULL DEFAULT 0,
    original_invoice_id  INT           NULL,
    collection_status    VARCHAR(20)   NOT NULL DEFAULT 'pending',
    collection_method    VARCHAR(50)   NULL DEFAULT 'transfer',
    collection_date      DATE          NULL,
    collection_reference VARCHAR(255)  NULL,
    collection_notes     TEXT          NULL,
    start_date           DATE          NULL,
    end_date             DATE          NULL,
    corresponding_month  VARCHAR(7)    NULL,
    is_proportional      TINYINT(1)    NOT NULL DEFAULT 0,
    pdf_path             VARCHAR(500)  NULL,
    has_attachments      TINYINT(1)    NOT NULL DEFAULT 0,
    created_by           INT           NULL,
    created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_invoice_number  (invoice_number),
    INDEX idx_estates_id          (estates_id),
    INDEX idx_owners_id           (owners_id),
    INDEX idx_clients_id          (clients_id),
    INDEX idx_invoice_date        (invoice_date),
    INDEX idx_collection_status   (collection_status),

    FOREIGN KEY (estates_id)          REFERENCES estates(id),
    FOREIGN KEY (owners_id)           REFERENCES owners(id),
    FOREIGN KEY (clients_id)          REFERENCES clients(id),
    FOREIGN KEY (original_invoice_id) REFERENCES invoices_issued(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by)          REFERENCES employee(id) ON DELETE SET NULL
);
