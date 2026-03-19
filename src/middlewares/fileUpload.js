import multer from 'multer';

// ==========================================
// CONFIGURACIÓN DE MULTER
// ==========================================

// Configuración de almacenamiento temporal en memoria
const storage = multer.memoryStorage();

// Filtro de archivos - solo PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos PDF'), false);
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
        files: 1 // Solo un archivo
    }
});

/**
 * Middleware para subir archivo de factura
 * Campo: 'invoice_file'
 */
export const uploadInvoiceFile = upload.single('invoice_file');

/**
 * Middleware de manejo de errores de multer
 */
export const handleUploadErrors = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'El archivo es demasiado grande. Máximo 10MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Solo se permite un archivo'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Campo de archivo inesperado'
            });
        }
    }

    if (error.message === 'Solo se permiten archivos PDF') {
        return res.status(400).json({
            error: 'Solo se permiten archivos PDF'
        });
    }

    next(error);
};
