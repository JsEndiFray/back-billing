import multer from 'multer';
import fs from 'fs';
import path from 'path';

/**
 * Servicio unificado para manejo de archivos PDF de facturas
 * Combina middleware de multer y gestión de almacenamiento local
 * Reemplaza la funcionalidad de Google Drive con almacenamiento local
 */

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

// ==========================================
// SERVICIO DE ALMACENAMIENTO LOCAL
// ==========================================

/**
 * Servicio para gestión de archivos PDF en almacenamiento local
 * Maneja subida, descarga, eliminación y gestión de archivos de facturas
 */
/**
 * Servicio para gestión de archivos PDF en almacenamiento local
 * CON ORGANIZACIÓN POR AÑO/MES
 */
export class LocalFileService {

    constructor() {
        this.uploadPath = '/app/uploads';
        this.ensureUploadDirectory();
    }

    /**
     * Asegura que el directorio de uploads existe
     */
    ensureUploadDirectory() {
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
            console.log(`✅ Directorio de uploads creado: ${this.uploadPath}`);
        }
    }

    /**
     * Genera ruta organizada por año/mes
     * @param {string} date - Fecha en formato YYYY-MM-DD
     * @param {string} type - Tipo: 'expenses' o 'invoices-received'
     * @returns {string} Ruta relativa: expenses/2025/02
     */
    generateOrganizedPath(date, type) {
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        return path.join(type, year.toString(), month);
    }

    /**
     * Sube un archivo PDF al almacenamiento local CON ORGANIZACIÓN
     * @param {Buffer} fileBuffer - Buffer del archivo
     * @param {string} fileName - Nombre original del archivo
     * @param {string} invoiceNumber - Número de factura para organizar
     * @param {string} date - Fecha del gasto/factura (YYYY-MM-DD) - NUEVO PARÁMETRO
     * @param {string} type - Tipo: 'expenses' o 'invoices-received' - NUEVO PARÁMETRO
     * @returns {Promise<Object>} Información del archivo guardado
     */
    async uploadInvoiceFile(fileBuffer, fileName, invoiceNumber, date = null, type = 'expenses') {
        try {
            let relativePath;
            let fullPath;

            // SI HAY FECHA → Usar organización por año/mes
            if (date) {
                // Generar carpeta: expenses/2025/02
                const organizedFolder = this.generateOrganizedPath(date, type);

                // Crear nombre único
                const timestamp = new Date(date).toISOString().split('T')[0].replace(/-/g, '');
                const safeInvoiceNumber = invoiceNumber.replace(/[/\\?%*:|"<>]/g, '-');
                const fileExtension = path.extname(fileName) || '.pdf';
                const uniqueFileName = `${safeInvoiceNumber}_${timestamp}${fileExtension}`;

                // Ruta relativa: expenses/2025/02/invoice-123_20250210.pdf
                relativePath = path.join(organizedFolder, uniqueFileName);

                // Ruta completa: /app/uploads/expenses/2025/02/invoice-123_20250210.pdf
                fullPath = path.join(this.uploadPath, relativePath);

                // Crear directorios si no existen
                const directory = path.dirname(fullPath);
                if (!fs.existsSync(directory)) {
                    fs.mkdirSync(directory, { recursive: true });
                    console.log(`✅ Directorio creado: ${directory}`);
                }
            }
            // SI NO HAY FECHA → Usar método antiguo (compatibilidad con archivos viejos)
            else {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const safeInvoiceNumber = invoiceNumber.replace(/[/\\?%*:|"<>]/g, '-');
                const fileExtension = path.extname(fileName) || '.pdf';
                const uniqueFileName = `${safeInvoiceNumber}_${timestamp}${fileExtension}`;

                relativePath = uniqueFileName;
                fullPath = path.join(this.uploadPath, uniqueFileName);
            }

            // Guardar archivo en disco
            fs.writeFileSync(fullPath, fileBuffer);

            console.log(`✅ Archivo guardado: ${relativePath}`);

            return {
                fileId: relativePath,  // ⬅️ AHORA GUARDA LA RUTA RELATIVA EN BD
                fileName: path.basename(relativePath),
                webViewLink: `/api/internal-expenses/files/${path.basename(relativePath)}`,
                webContentLink: `/api/internal-expenses/files/${path.basename(relativePath)}`,
                success: true,
                localPath: fullPath
            };

        } catch (error) {
            console.error('❌ Error guardando archivo:', error);
            throw new Error(`Error al guardar archivo: ${error.message}`);
        }
    }

    /**
     * Lee un archivo del almacenamiento local
     * ACTUALIZADO: Acepta tanto rutas relativas como nombres simples
     * @param {string} filePathOrName - Ruta relativa o nombre del archivo
     * @returns {Promise<Buffer>} Buffer del archivo
     */
    async downloadFile(filePathOrName) {
        try {
            const fullPath = path.join(this.uploadPath, filePathOrName);

            if (!fs.existsSync(fullPath)) {
                throw new Error('Archivo no encontrado');
            }

            return fs.readFileSync(fullPath);

        } catch (error) {
            console.error('❌ Error leyendo archivo:', error);
            throw new Error(`Error al leer archivo: ${error.message}`);
        }
    }

    /**
     * Elimina un archivo del almacenamiento local
     * ACTUALIZADO: Acepta tanto rutas relativas como nombres simples
     * @param {string} filePathOrName - Ruta relativa o nombre del archivo
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async deleteFile(filePathOrName) {
        try {
            const fullPath = path.join(this.uploadPath, filePathOrName);

            if (!fs.existsSync(fullPath)) {
                console.warn(`⚠️ Archivo no encontrado para eliminar: ${filePathOrName}`);
                return false;
            }

            fs.unlinkSync(fullPath);
            console.log(`🗑️ Archivo eliminado: ${filePathOrName}`);
            return true;

        } catch (error) {
            console.error('❌ Error eliminando archivo:', error);
            throw new Error(`Error al eliminar archivo: ${error.message}`);
        }
    }

    /**
     * Obtiene información de un archivo
     * @param {string} fileName - Nombre del archivo
     * @returns {Promise<Object>} Información del archivo
     */
    async getFileInfo(fileName) {
        try {
            const filePath = path.join(this.uploadPath, fileName);

            if (!fs.existsSync(filePath)) {
                throw new Error('Archivo no encontrado');
            }

            const stats = fs.statSync(filePath);

            return {
                id: fileName,
                name: fileName,
                size: stats.size,
                createdTime: stats.birthtime.toISOString(),
                modifiedTime: stats.mtime.toISOString(),
                webViewLink: `/api/invoices-received/files/${fileName}`,
                localPath: filePath
            };

        } catch (error) {
            console.error('Error obteniendo información del archivo:', error);
            throw new Error(`Error al obtener información: ${error.message}`);
        }
    }

    /**
     * Lista todos los archivos en el directorio de uploads
     * @returns {Promise<Array>} Lista de archivos con su información
     */
    async listFiles() {
        try {
            const files = fs.readdirSync(this.uploadPath);
            const fileInfoPromises = files
                .filter(file => file.endsWith('.pdf'))
                .map(file => this.getFileInfo(file));

            return await Promise.all(fileInfoPromises);

        } catch (error) {
            console.error('Error listando archivos:', error);
            throw new Error(`Error al listar archivos: ${error.message}`);
        }
    }

    /**
     * Verifica si un archivo existe
     * ACTUALIZADO: Acepta tanto rutas relativas como nombres simples
     * @param {string} filePathOrName - Ruta relativa o nombre del archivo
     * @returns {boolean} True si el archivo existe
     */
    fileExists(filePathOrName) {
        const filePath = path.join(this.uploadPath, filePathOrName);
        return fs.existsSync(filePath);
    }

    /**
     * Obtiene la ruta completa de un archivo
     * ACTUALIZADO: Acepta tanto rutas relativas como nombres simples
     * @param {string} filePathOrName - Ruta relativa o nombre del archivo
     * @returns {string} Ruta completa del archivo
     */
    getFilePath(filePathOrName) {
        return path.join(this.uploadPath, filePathOrName);
    }
}

// Crear instancia por defecto del servicio
export const localFileService = new LocalFileService();