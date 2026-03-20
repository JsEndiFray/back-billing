import fs from 'fs';
import path from 'path';
import { AppError } from '../errors/AppError.js';

/**
 * Servicio para gestión de archivos PDF en almacenamiento local
 * CON ORGANIZACIÓN POR AÑO/MES
 */
export class LocalFileService {

    constructor() {
        this.uploadPath = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
        if (process.env.NODE_ENV !== 'test') {
            this.ensureUploadDirectory();
        }
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
     * @param {string} date - Fecha del gasto/factura (YYYY-MM-DD)
     * @param {string} type - Tipo: 'expenses' o 'invoices-received'
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

                // Ruta completa: {uploadPath}/expenses/2025/02/invoice-123_20250210.pdf
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
                fileId: relativePath,
                fileName: path.basename(relativePath),
                webViewLink: `/api/internal-expenses/files/${path.basename(relativePath)}`,
                webContentLink: `/api/internal-expenses/files/${path.basename(relativePath)}`,
                success: true,
                localPath: fullPath
            };

        } catch (error) {
            console.error('❌ Error guardando archivo:', error);
            throw new AppError('Error al guardar el archivo', 500);
        }
    }

    /**
     * Lee un archivo del almacenamiento local
     * @param {string} filePathOrName - Ruta relativa o nombre del archivo
     * @returns {Promise<Buffer>} Buffer del archivo
     */
    async downloadFile(filePathOrName) {
        try {
            const fullPath = path.join(this.uploadPath, filePathOrName);

            if (!fs.existsSync(fullPath)) {
                throw new AppError('Archivo no encontrado', 404);
            }

            return fs.readFileSync(fullPath);

        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error('❌ Error leyendo archivo:', error);
            throw new AppError('Error al leer el archivo', 500);
        }
    }

    /**
     * Elimina un archivo del almacenamiento local
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
            throw new AppError('Error al eliminar el archivo', 500);
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
                throw new AppError('Archivo no encontrado', 404);
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
            if (error instanceof AppError) throw error;
            console.error('Error obteniendo información del archivo:', error);
            throw new AppError('Error al obtener información del archivo', 500);
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
            throw new AppError('Error al listar los archivos', 500);
        }
    }

    /**
     * Verifica si un archivo existe
     * @param {string} filePathOrName - Ruta relativa o nombre del archivo
     * @returns {boolean} True si el archivo existe
     */
    fileExists(filePathOrName) {
        const filePath = path.join(this.uploadPath, filePathOrName);
        return fs.existsSync(filePath);
    }

    /**
     * Obtiene la ruta completa de un archivo
     * @param {string} filePathOrName - Ruta relativa o nombre del archivo
     * @returns {string} Ruta completa del archivo
     */
    getFilePath(filePathOrName) {
        return path.join(this.uploadPath, filePathOrName);
    }
}

// Instancia por defecto del servicio
export const localFileService = new LocalFileService();
