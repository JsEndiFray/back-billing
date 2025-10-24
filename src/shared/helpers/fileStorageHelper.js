import path from 'path';
import fs from 'fs';

/**
 * Servicio para gestionar almacenamiento organizado de archivos
 */

const BASE_UPLOAD_DIR = 'uploads';

/**
 * Genera ruta organizada para un archivo
 *
 * @param {string} date - Fecha del registro (YYYY-MM-DD)
 * @param {number} id - ID del registro
 * @param {string} originalName - Nombre original del archivo
 * @param {string} type - Tipo: 'expenses' o 'invoices-received'
 * @returns {string} Ruta relativa: expenses/2025/02/expense_123_20250210.pdf
 */
export function generateOrganizedPath(date, id, originalName, type) {
    // Parsear fecha (YYYY-MM-DD)
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // 01, 02, etc.

    // Extraer extensión del archivo original
    const fileExt = path.extname(originalName); // .pdf

    // Construir nombre único: expense_123_20250210.pdf
    const timestamp = dateObj.toISOString().split('T')[0].replace(/-/g, ''); // 20250210
    const fileName = `${type.replace('/', '-')}_${id}_${timestamp}${fileExt}`;

    // Construir ruta: expenses/2025/02/expense_123_20250210.pdf
    const relativePath = path.join(type, year.toString(), month, fileName);

    return relativePath;
}

/**
 * Crea los directorios necesarios si no existen
 *
 * @param {string} filePath - Ruta completa del archivo
 */
export function ensureDirectoryExists(filePath) {
    const directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        console.log(`✅ Directorio creado: ${directory}`);
    }
}

/**
 * Obtiene la ruta completa física del archivo
 *
 * @param {string} relativePath - Ruta relativa guardada en BD
 * @returns {string} Ruta completa física
 */
export function getFullPath(relativePath) {
    return path.join(BASE_UPLOAD_DIR, relativePath);
}

/**
 * Elimina un archivo si existe
 *
 * @param {string} relativePath - Ruta relativa del archivo
 * @returns {boolean} true si se eliminó, false si no existía
 */
export function deleteFile(relativePath) {
    try {
        const fullPath = getFullPath(relativePath);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`🗑️ Archivo eliminado: ${relativePath}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`❌ Error al eliminar archivo: ${error.message}`);
        return false;
    }
}