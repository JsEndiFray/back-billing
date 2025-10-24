/**
 * @fileoverview Servicio para generar el Libro de IVA según estándares AEAT
 *
 * Genera los libros de registro de IVA en formatos oficiales:
 * - Libro de IVA Soportado (Facturas Recibidas)
 * - Libro de IVA Repercutido (Facturas Emitidas)
 * - Exportación a Excel/CSV según formato AEAT
 * - Cálculos automáticos de liquidación trimestral
 *
 * Conforme a:
 * - Real Decreto 1624/1992 (Reglamento del IVA)
 * - Formato electrónico AEAT actualizado 01-01-2025
 * - Orden HAC/773/2019
 *
 * @author Tu Nombre
 * @since 1.0.0
 */

import InvoicesReceivedService from './invoicesReceivedServices.js';
import InvoicesIssuedService from './invoicesIssuedServices.js';
import InternalExpensesService from './internalExpensesServices.js';
import CalculateHelper from '../shared/helpers/calculateTotal.js';
import OwnersRepository from "../repository/ownersRepository.js";

export default class VATBookService {

    // ==========================================
    // LIBRO DE IVA SOPORTADO (FACTURAS RECIBIDAS)
    // ==========================================

    /**
     * Genera el libro de IVA soportado (facturas recibidas) según formato AEAT
     * @param {number} year - Año fiscal
     * @param {number} quarter - Trimestre (1-4) o null para todo el año
     * @param {number} month - Mes específico (1-12) o null
     * @returns {Promise<Object>} Datos del libro de IVA soportado
     */
    static async generateVATSupportedBook(year, quarter = null, month = null) {
        // Validar parámetros
        const validation = CalculateHelper.validateDateParams(year, quarter, month);
        if (!validation.isValid) {
            throw new Error(validation.message);
        }

        // Obtener datos de facturas recibidas
        const invoicesReceived = await InvoicesReceivedService.getVATBookData(year, month);

        // Obtener datos de gastos internos
        const internalExpenses = await InternalExpensesService.getVATBookData(year, month);

        // Formatear según estándar AEAT
        const formattedEntries = CalculateHelper.formatVATSupportedEntries(invoicesReceived, internalExpenses);

        // Calcular totales
        const totals = CalculateHelper.calculateVATSupportedTotals(formattedEntries);

        // Filtrar por trimestre si se especifica
        const filteredEntries = quarter
            ? CalculateHelper.filterByQuarter(formattedEntries, quarter)
            : formattedEntries;

        return {
            bookType: 'CHARGED_VAT',
            bookCode: 'E', // R = Facturas Recibidas según AEAT
            year,
            quarter,
            month,
            period: CalculateHelper.generatePeriodDescription(year, quarter, month),
            entries: filteredEntries,
            totals,
            summary: CalculateHelper.generateVATSupportedSummary(filteredEntries),
            generatedAt: new Date().toISOString(),
            entryCount: filteredEntries.length
        };
    }

    // ==========================================
    // LIBRO DE IVA REPERCUTIDO (FACTURAS EMITIDAS)
    // ==========================================

    /**
     * Genera el libro de IVA repercutido (facturas emitidas) según formato AEAT
     * @param {number} year - Año fiscal
     * @param {number} quarter - Trimestre (1-4) o null para todo el año
     * @param {number} month - Mes específico (1-12) o null
     * @returns {Promise<Object>} Datos del libro de IVA repercutido
     */
    static async generateVATChargedBook(year, quarter = null, month = null) {
        // Validar parámetros
        const validation = CalculateHelper.validateDateParams(year, quarter, month);
        if (!validation.isValid) {
            throw new Error(validation.message);
        }

        // Obtener datos de facturas emitidas
        const invoicesIssued = await InvoicesIssuedService.getVATBookData(year, month);

        // Formatear según estándar AEAT
        const formattedEntries = CalculateHelper.formatVATChargedEntries(invoicesIssued);

        // Calcular totales
        const totals = CalculateHelper.calculateVATChargedTotals(formattedEntries);

        // Filtrar por trimestre si se especifica
        const filteredEntries = quarter
            ? CalculateHelper.filterByQuarter(formattedEntries, quarter)
            : formattedEntries;

        return {
            bookType: 'IVA_REPERCUTIDO',
            bookCode: 'E', // E = Facturas Expedidas según AEAT
            year,
            quarter,
            month,
            period: CalculateHelper.generatePeriodDescription(year, quarter, month),
            entries: filteredEntries,
            totals,
            summary: CalculateHelper.generateVATChargedSummary(filteredEntries),
            generatedAt: new Date().toISOString(),
            entryCount: filteredEntries.length
        };
    }

    // ==========================================
    // LIQUIDACIÓN TRIMESTRAL DE IVA
    // ==========================================

    /**
     * Genera la liquidación trimestral completa de IVA (Modelo 303)
     * @param {number} year - Año fiscal
     * @param {number} quarter - Trimestre (1-4)
     * @returns {Promise<Object>} Liquidación trimestral
     */
    static async generateQuarterlyVATLiquidation(year, quarter) {
        // Validar trimestre
        if (!quarter || quarter < 1 || quarter > 4) {
            throw new Error('Trimestre debe ser entre 1 y 4');
        }

        // Obtener ambos libros del trimestre
        const [supportedBook, chargedBook] = await Promise.all([
            this.generateVATSupportedBook(year, quarter),
            this.generateVATChargedBook(year, quarter)
        ]);

        // Calcular liquidación
        const liquidation = CalculateHelper.calculateVATLiquidation(supportedBook, chargedBook);

        return {
            year,
            quarter,
            period: `T${quarter} ${year}`,
            supportedBook,
            chargedBook,
            liquidation,
            generatedAt: new Date().toISOString()
        };
    }

    // ==========================================
    // LIBRO DE IVA POR PROPIETARIO
    // ==========================================

    /**
     * Genera un resumen consolidado del libro de IVA (emitidas, recibidas, gastos internos)
     * para cada propietario, incluyendo el reparto proporcional.
     * @param {number} year - Año fiscal.
     * @param {number} [quarter=null] - Trimestre (1-4) o null para todo el año.
     * @param {number} [month=null] - Mes específico (1-12) o null.
     * @returns {Promise<Object>} Datos consolidados del libro de IVA por propietario.
     */
    static async generateVATBookByOwner(year, quarter = null, month = null) {
        // 1. Validar parámetros de fecha
        const validation = CalculateHelper.validateDateParams(year, quarter, month);
        if (!validation.isValid) {
            throw new Error(validation.message);
        }

        // 2. Obtener todos los propietarios
        const allOwners = await OwnersRepository.getAll();

        // 3. Obtener todas las facturas y gastos (ya con info de owner/ownership_percent de los pasos anteriores)
        const [
            invoicesIssued,
            invoicesReceived,
            internalExpenses
        ] = await Promise.all([
            InvoicesIssuedService.getAllInvoicesIssued(),
            InvoicesReceivedService.getAllInvoicesReceived(),
            InternalExpensesService.getAllExpenses()
        ]);

        // 4. Delegar la lógica de consolidación y cálculo al helper
        const {summary_by_owner, overall_total} = CalculateHelper.calculateVATBookByOwner(
            invoicesIssued,
            invoicesReceived,
            internalExpenses,
            allOwners, // Pasar la lista completa de propietarios
            year,
            quarter,
            month
        );

        // 5. Construir el objeto de respuesta final
        return {
            bookType: 'IVA_CONSOLIDADO_POR_PROPIETARIO',
            year,
            quarter,
            month,
            period: CalculateHelper.generatePeriodDescription(year, quarter, month),
            summary_by_owner,
            overall_total,
            generatedAt: new Date().toISOString()
        };
    }

    // ==========================================
    // LIBRO CONSOLIDADO (PARA COMPONENTE FRONTEND)
    // ==========================================

    /**
     * Genera datos consolidados para el componente del libro de IVA
     * Combina: IVA soportado, repercutido y resumen por propietario
     * @param {number} year - Año fiscal
     * @param {number} [quarter=null] - Trimestre (1-4) o null
     * @param {number} [month=null] - Mes específico (1-12) o null
     * @returns {Promise<Object>} Datos consolidados
     */
    /**
     * Genera datos consolidados para el componente del libro de IVA
     */
    /**
     * Genera datos consolidados para el componente del libro de IVA
     * Devuelve solo los arrays de entries, sin objetos anidados
     */
    static async generateConsolidatedVATBook(year, quarter = null, month = null) {
        // Validar parámetros
        const validation = CalculateHelper.validateDateParams(year, quarter, month);
        if (!validation.isValid) {
            throw new Error(validation.message);
        }

        // Obtener los tres libros en paralelo
        const [supportedBook, chargedBook, byOwner] = await Promise.all([
            this.generateVATSupportedBook(year, quarter, month),
            this.generateVATChargedBook(year, quarter, month),
            this.generateVATBookByOwner(year, quarter, month)
        ]);

        return {
            supported: supportedBook.entries || [],
            charged: chargedBook.entries || [],
            summaryByOwner: byOwner.summary_by_owner || []
        };
    }


    // ==========================================
    // ESTADÍSTICAS ANUALES
    // ==========================================

    /**
     * Genera estadísticas anuales del libro de IVA
     * @param {number} year - Año fiscal
     * @returns {Promise<Object>} Estadísticas anuales
     */
    static async getAnnualVATStats(year) {
        // Obtener datos de los 4 trimestres
        const quarterlyData = await Promise.all([
            this.generateQuarterlyVATLiquidation(year, 1),
            this.generateQuarterlyVATLiquidation(year, 2),
            this.generateQuarterlyVATLiquidation(year, 3),
            this.generateQuarterlyVATLiquidation(year, 4)
        ]);

        // Calcular totales anuales
        const annualTotals = CalculateHelper.calculateAnnualTotals(quarterlyData);

        return {
            year,
            quarterlyData: quarterlyData.map(q => ({
                quarter: q.quarter,
                totalSupported: q.supportedBook.totals.cuotaIVADeducible,
                totalCharged: q.chargedBook.totals.totalCuotaIVA,
                balance: q.liquidation.netResult
            })),
            annualTotals,
            generatedAt: new Date().toISOString()
        };
    }

// ==========================================
// COMPARACIÓN TRIMESTRAL
// ==========================================

    /**
     * Compara trimestres del año (crecimiento)
     * @param {number} year - Año fiscal
     * @returns {Promise<Object>} Comparación trimestral
     */
    static async getQuarterlyVATComparison(year) {
        const stats = await this.getAnnualVATStats(year);

        // Calcular tasas de crecimiento
        const quarters = stats.quarterlyData.map((current, index) => {
            const previous = index > 0 ? stats.quarterlyData[index - 1] : null;
            const growthRate = previous
                ? ((current.totalCharged - previous.totalCharged) / previous.totalCharged) * 100
                : 0;

            return {
                ...current,
                growthRate: parseFloat(growthRate.toFixed(2))
            };
        });

        return {
            year,
            quarters,
            generatedAt: new Date().toISOString()
        };
    }

// ==========================================
// CONFIGURACIÓN
// ==========================================

    /**
     * Obtiene la configuración disponible del libro de IVA
     * @returns {Promise<Object>} Configuración
     */
    static async getVATBookConfig() {
        return {
            availableYears: CalculateHelper.getAvailableYears(),
            supportedFormats: ['Excel', 'PDF', 'CSV'],
            vatRates: [0, 4, 10, 21],
            bookTypes: ['supported', 'charged'],
            generatedAt: new Date().toISOString()
        };
    }

}