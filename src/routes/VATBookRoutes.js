import express from 'express';
import VATBookController from '../controllers/VATBookController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';

/**
 * @swagger
 * tags:
 *   name: Libro de IVA
 *   description: API para gestión y generación de libros de registro de IVA según normativa AEAT
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     LibroIVASoportado:
 *       type: object
 *       properties:
 *         bookType:
 *           type: string
 *           enum: [IVA_SOPORTADO]
 *           description: Tipo de libro de IVA
 *         bookCode:
 *           type: string
 *           enum: [R]
 *           description: Código AEAT (R = Facturas Recibidas)
 *         year:
 *           type: integer
 *           description: Año fiscal
 *         quarter:
 *           type: integer
 *           nullable: true
 *           minimum: 1
 *           maximum: 4
 *           description: Trimestre específico o null
 *         month:
 *           type: integer
 *           nullable: true
 *           minimum: 1
 *           maximum: 12
 *           description: Mes específico o null
 *         period:
 *           type: string
 *           description: Descripción del período
 *         entries:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EntradaIVA'
 *           description: Entradas del libro (facturas recibidas y gastos internos)
 *         totals:
 *           $ref: '#/components/schemas/TotalesIVASoportado'
 *         summary:
 *           type: object
 *           description: Resumen del libro
 *         entryCount:
 *           type: integer
 *           description: Número total de entradas
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de generación
 *       example:
 *         bookType: "IVA_SOPORTADO"
 *         bookCode: "R"
 *         year: 2024
 *         quarter: 1
 *         period: "T1 2024 (Enero-Marzo)"
 *         entryCount: 45
 *         generatedAt: "2024-07-30T12:00:00.000Z"
 *
 *     LibroIVARepercutido:
 *       type: object
 *       properties:
 *         bookType:
 *           type: string
 *           enum: [IVA_REPERCUTIDO]
 *           description: Tipo de libro de IVA
 *         bookCode:
 *           type: string
 *           enum: [E]
 *           description: Código AEAT (E = Facturas Expedidas)
 *         year:
 *           type: integer
 *           description: Año fiscal
 *         quarter:
 *           type: integer
 *           nullable: true
 *           minimum: 1
 *           maximum: 4
 *           description: Trimestre específico o null
 *         month:
 *           type: integer
 *           nullable: true
 *           minimum: 1
 *           maximum: 12
 *           description: Mes específico o null
 *         period:
 *           type: string
 *           description: Descripción del período
 *         entries:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EntradaIVA'
 *           description: Entradas del libro (facturas emitidas)
 *         totals:
 *           $ref: '#/components/schemas/TotalesIVARepercutido'
 *         summary:
 *           type: object
 *           description: Resumen del libro
 *         entryCount:
 *           type: integer
 *           description: Número total de entradas
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de generación
 *       example:
 *         bookType: "IVA_REPERCUTIDO"
 *         bookCode: "E"
 *         year: 2024
 *         quarter: 1
 *         period: "T1 2024 (Enero-Marzo)"
 *         entryCount: 32
 *         generatedAt: "2024-07-30T12:00:00.000Z"
 *
 *     EntradaIVA:
 *       type: object
 *       description: Entrada individual del libro de IVA (factura o gasto)
 *       properties:
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha de la operación
 *         numeroFactura:
 *           type: string
 *           description: Número de factura o referencia
 *         tercero:
 *           type: string
 *           description: Nombre del proveedor o cliente
 *         cifNif:
 *           type: string
 *           description: CIF/NIF del tercero
 *         concepto:
 *           type: string
 *           description: Descripción de la operación
 *         baseImponible:
 *           type: number
 *           format: decimal
 *           description: Base imponible
 *         tipoIVA:
 *           type: number
 *           format: decimal
 *           enum: [0, 4, 10, 21]
 *           description: Tipo de IVA aplicado
 *         cuotaIVA:
 *           type: number
 *           format: decimal
 *           description: Cuota de IVA
 *         total:
 *           type: number
 *           format: decimal
 *           description: Total de la operación
 *         claveOperacion:
 *           type: string
 *           enum: ['01', '02', '03']
 *           description: Clave de operación AEAT
 *       example:
 *         fecha: "2024-01-15"
 *         numeroFactura: "F-2024-001"
 *         tercero: "Electricidad Pérez S.L."
 *         cifNif: "B12345678"
 *         concepto: "Materiales eléctricos"
 *         baseImponible: 100.00
 *         tipoIVA: 21
 *         cuotaIVA: 21.00
 *         total: 121.00
 *         claveOperacion: "01"
 *
 *     TotalesIVASoportado:
 *       type: object
 *       properties:
 *         baseImponibleTotal:
 *           type: number
 *           format: decimal
 *           description: Suma total de bases imponibles
 *         cuotaIVADeducible:
 *           type: number
 *           format: decimal
 *           description: Total de IVA deducible
 *         totalFacturas:
 *           type: number
 *           format: decimal
 *           description: Total de todas las operaciones
 *         desgloseIVA:
 *           type: object
 *           properties:
 *             iva0:
 *               type: number
 *               format: decimal
 *               description: Cuota IVA 0%
 *             iva4:
 *               type: number
 *               format: decimal
 *               description: Cuota IVA 4%
 *             iva10:
 *               type: number
 *               format: decimal
 *               description: Cuota IVA 10%
 *             iva21:
 *               type: number
 *               format: decimal
 *               description: Cuota IVA 21%
 *       example:
 *         baseImponibleTotal: 5000.00
 *         cuotaIVADeducible: 1050.00
 *         totalFacturas: 6050.00
 *         desgloseIVA:
 *           iva0: 0.00
 *           iva4: 0.00
 *           iva10: 105.00
 *           iva21: 945.00
 *
 *     TotalesIVARepercutido:
 *       type: object
 *       properties:
 *         baseImponibleTotal:
 *           type: number
 *           format: decimal
 *           description: Suma total de bases imponibles
 *         totalCuotaIVA:
 *           type: number
 *           format: decimal
 *           description: Total de IVA repercutido
 *         totalFacturas:
 *           type: number
 *           format: decimal
 *           description: Total de todas las operaciones
 *         desgloseIVA:
 *           type: object
 *           properties:
 *             iva0:
 *               type: number
 *               format: decimal
 *               description: Cuota IVA 0%
 *             iva4:
 *               type: number
 *               format: decimal
 *               description: Cuota IVA 4%
 *             iva10:
 *               type: number
 *               format: decimal
 *               description: Cuota IVA 10%
 *             iva21:
 *               type: number
 *               format: decimal
 *               description: Cuota IVA 21%
 *       example:
 *         baseImponibleTotal: 8000.00
 *         totalCuotaIVA: 1680.00
 *         totalFacturas: 9680.00
 *         desgloseIVA:
 *           iva0: 0.00
 *           iva4: 0.00
 *           iva10: 168.00
 *           iva21: 1512.00
 *
 *     LibroIVACompleto:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             period:
 *               type: string
 *               description: Período del libro
 *             totalEntries:
 *               type: integer
 *               description: Total de entradas combinadas
 *             vatSummary:
 *               type: object
 *               properties:
 *                 totalVATSupported:
 *                   type: number
 *                   format: decimal
 *                   description: Total IVA soportado
 *                 totalVATCharged:
 *                   type: number
 *                   format: decimal
 *                   description: Total IVA repercutido
 *                 netVATPosition:
 *                   type: number
 *                   format: decimal
 *                   description: Posición neta de IVA (positivo=a pagar, negativo=a devolver)
 *         supportedBook:
 *           $ref: '#/components/schemas/LibroIVASoportado'
 *         chargedBook:
 *           $ref: '#/components/schemas/LibroIVARepercutido'
 *       example:
 *         summary:
 *           period: "T1 2024"
 *           totalEntries: 77
 *           vatSummary:
 *             totalVATSupported: 1050.00
 *             totalVATCharged: 1680.00
 *             netVATPosition: 630.00
 *
 *     LiquidacionTrimestral:
 *       type: object
 *       properties:
 *         year:
 *           type: integer
 *           description: Año fiscal
 *         quarter:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           description: Trimestre
 *         period:
 *           type: string
 *           description: Descripción del período
 *         supportedBook:
 *           $ref: '#/components/schemas/LibroIVASoportado'
 *         chargedBook:
 *           $ref: '#/components/schemas/LibroIVARepercutido'
 *         liquidation:
 *           type: object
 *           properties:
 *             importeResultado:
 *               type: number
 *               format: decimal
 *               description: Importe a pagar (positivo) o devolver (negativo)
 *             resultadoLiquidacion:
 *               type: string
 *               enum: [A_PAGAR, A_DEVOLVER, SIN_ACTIVIDAD]
 *               description: Resultado de la liquidación
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de generación
 *       example:
 *         year: 2024
 *         quarter: 1
 *         period: "T1 2024"
 *         liquidation:
 *           importeResultado: 630.00
 *           resultadoLiquidacion: "A_PAGAR"
 *         generatedAt: "2024-07-30T12:00:00.000Z"
 *
 *     LibroIVAPorPropietario:
 *       type: object
 *       properties:
 *         bookType:
 *           type: string
 *           enum: [IVA_CONSOLIDADO_POR_PROPIETARIO]
 *           description: Tipo de libro consolidado
 *         year:
 *           type: integer
 *           description: Año fiscal
 *         quarter:
 *           type: integer
 *           nullable: true
 *           description: Trimestre o null
 *         month:
 *           type: integer
 *           nullable: true
 *           description: Mes o null
 *         period:
 *           type: string
 *           description: Descripción del período
 *         summary_by_owner:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               owner_id:
 *                 type: integer
 *                 description: ID del propietario
 *               owner_name:
 *                 type: string
 *                 description: Nombre del propietario
 *               ownership_percentage:
 *                 type: number
 *                 format: decimal
 *                 description: Porcentaje de propiedad
 *               vat_supported:
 *                 type: number
 *                 format: decimal
 *                 description: IVA soportado asignado proporcionalmente
 *               vat_charged:
 *                 type: number
 *                 format: decimal
 *                 description: IVA repercutido asignado proporcionalmente
 *               net_position:
 *                 type: number
 *                 format: decimal
 *                 description: Posición neta del propietario
 *           description: Resumen por cada propietario
 *         overall_total:
 *           type: object
 *           properties:
 *             total_vat_supported:
 *               type: number
 *               format: decimal
 *               description: Total IVA soportado
 *             total_vat_charged:
 *               type: number
 *               format: decimal
 *               description: Total IVA repercutido
 *             total_net_position:
 *               type: number
 *               format: decimal
 *               description: Posición neta total
 *           description: Totales generales
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de generación
 *       example:
 *         bookType: "IVA_CONSOLIDADO_POR_PROPIETARIO"
 *         year: 2024
 *         quarter: 1
 *         period: "T1 2024"
 *         summary_by_owner:
 *           - owner_id: 1
 *             owner_name: "Juan Pérez"
 *             ownership_percentage: 50.00
 *             vat_supported: 525.00
 *             vat_charged: 840.00
 *             net_position: 315.00
 *           - owner_id: 2
 *             owner_name: "María García"
 *             ownership_percentage: 50.00
 *             vat_supported: 525.00
 *             vat_charged: 840.00
 *             net_position: 315.00
 *         overall_total:
 *           total_vat_supported: 1050.00
 *           total_vat_charged: 1680.00
 *           total_net_position: 630.00
 *         generatedAt: "2024-07-30T12:00:00.000Z"
 *
 *     EstadisticasIVAAnual:
 *       type: object
 *       properties:
 *         year:
 *           type: integer
 *           description: Año de las estadísticas
 *         summary:
 *           type: object
 *           properties:
 *             totalVATSupported:
 *               type: number
 *               format: decimal
 *               description: Total IVA soportado anual
 *             totalVATCharged:
 *               type: number
 *               format: decimal
 *               description: Total IVA repercutido anual
 *             netVATPosition:
 *               type: number
 *               format: decimal
 *               description: Posición neta anual
 *             totalInvoicesReceived:
 *               type: integer
 *               description: Total facturas recibidas
 *             totalInvoicesIssued:
 *               type: integer
 *               description: Total facturas emitidas
 *         quarterlyBreakdown:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               quarter:
 *                 type: integer
 *               period:
 *                 type: string
 *               vatToPayOrRefund:
 *                 type: number
 *                 format: decimal
 *               status:
 *                 type: string
 *                 enum: [A_PAGAR, A_DEVOLVER, SIN_ACTIVIDAD]
 *           description: Resumen trimestral
 *         supportedVATBreakdown:
 *           type: object
 *           description: Desglose IVA soportado por tipos
 *         chargedVATBreakdown:
 *           type: object
 *           description: Desglose IVA repercutido por tipos
 *       example:
 *         year: 2024
 *         summary:
 *           totalVATSupported: 4200.00
 *           totalVATCharged: 6720.00
 *           netVATPosition: 2520.00
 *           totalInvoicesReceived: 180
 *           totalInvoicesIssued: 128
 *         quarterlyBreakdown:
 *           - quarter: 1
 *             period: "T1 2024"
 *             vatToPayOrRefund: 630.00
 *             status: "A_PAGAR"
 *
 *     ComparacionTrimestral:
 *       type: object
 *       properties:
 *         year:
 *           type: integer
 *           description: Año de la comparación
 *         quarterlyComparison:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               quarter:
 *                 type: integer
 *               period:
 *                 type: string
 *               invoicesReceived:
 *                 type: integer
 *               invoicesIssued:
 *                 type: integer
 *               vatSupported:
 *                 type: number
 *                 format: decimal
 *               vatCharged:
 *                 type: number
 *                 format: decimal
 *               netPosition:
 *                 type: number
 *                 format: decimal
 *           description: Comparación trimestral
 *       example:
 *         year: 2024
 *         quarterlyComparison:
 *           - quarter: 1
 *             period: "T1 2024"
 *             invoicesReceived: 45
 *             invoicesIssued: 32
 *             vatSupported: 1050.00
 *             vatCharged: 1680.00
 *             netPosition: 630.00
 *
 *     ConfiguracionLibroIVA:
 *       type: object
 *       properties:
 *         availableYears:
 *           type: array
 *           items:
 *             type: integer
 *           description: Años disponibles para consulta
 *         quarters:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               value:
 *                 type: integer
 *               label:
 *                 type: string
 *               months:
 *                 type: array
 *                 items:
 *                   type: integer
 *           description: Trimestres y sus meses
 *         bookTypes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *               label:
 *                 type: string
 *               code:
 *                 type: string
 *           description: Tipos de libro disponibles
 *         exportFormats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *               label:
 *                 type: string
 *           description: Formatos de exportación
 *         vatRates:
 *           type: array
 *           items:
 *             type: number
 *           description: Tipos de IVA disponibles
 *         operationKeys:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Claves de operación AEAT
 *       example:
 *         availableYears: [2020, 2021, 2022, 2023, 2024, 2025]
 *         quarters:
 *           - value: 1
 *             label: "T1 (Ene-Mar)"
 *             months: [1, 2, 3]
 *         bookTypes:
 *           - value: "supported"
 *             label: "IVA Soportado (Facturas Recibidas)"
 *             code: "R"
 *           - value: "charged"
 *             label: "IVA Repercutido (Facturas Emitidas)"
 *             code: "E"
 *         exportFormats:
 *           - value: "json"
 *             label: "JSON"
 *           - value: "excel"
 *             label: "Excel AEAT"
 *         vatRates: [0, 4, 10, 21]
 *         operationKeys:
 *           "01": "Operación general"
 *           "02": "Abono/Rectificativa"
 *           "03": "Operación exenta"
 *
 *     DatosEmpresa:
 *       type: object
 *       required:
 *         - nif
 *         - name
 *       properties:
 *         nif:
 *           type: string
 *           pattern: '^[A-Z]\\d{8}$|^\\d{8}[A-Z]$'
 *           description: NIF de la empresa (formato español)
 *         name:
 *           type: string
 *           description: Nombre de la empresa
 *         address:
 *           type: string
 *           description: Dirección de la empresa
 *         postalCode:
 *           type: string
 *           description: Código postal
 *         city:
 *           type: string
 *           description: Ciudad
 *       example:
 *         nif: "B12345678"
 *         name: "Mi Empresa S.L."
 *         address: "Calle Mayor 123"
 *         postalCode: "28001"
 *         city: "Madrid"
 *
 *     ExportacionExcel:
 *       type: object
 *       required:
 *         - bookType
 *         - year
 *         - companyData
 *       properties:
 *         bookType:
 *           type: string
 *           enum: [supported, charged]
 *           description: Tipo de libro a exportar
 *         year:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *           description: Año fiscal
 *         quarter:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           description: Trimestre específico (opcional, mutuamente excluyente con month)
 *         month:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           description: Mes específico (opcional, mutuamente excluyente con quarter)
 *         companyData:
 *           $ref: '#/components/schemas/DatosEmpresa'
 *       example:
 *         bookType: "supported"
 *         year: 2024
 *         quarter: 1
 *         companyData:
 *           nif: "B12345678"
 *           name: "Mi Empresa S.L."
 *           address: "Calle Mayor 123"
 *           postalCode: "28001"
 *           city: "Madrid"
 *
 *     RespuestaEstandar:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *         message:
 *           type: string
 *           description: Mensaje descriptivo del resultado
 *         data:
 *           type: object
 *           description: Datos de respuesta (estructura varía según endpoint)
 *         error:
 *           type: string
 *           description: Mensaje de error detallado (solo en desarrollo)
 *       example:
 *         success: true
 *         message: "Libro de IVA soportado generado correctamente"
 *         data: {}
 */

const router = express.Router()

    // ==========================================
    // LIBROS INDIVIDUALES (Soportado y Repercutido)
    // ==========================================

    /**
     * @swagger
     * /vat-book/supported/{year}:
     *   get:
     *     summary: Obtiene el libro de IVA soportado (facturas recibidas y gastos internos)
     *     tags: [Libro de IVA]
     *     parameters:
     *       - in: path
     *         name: year
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 2020
     *           maximum: 2030
     *         description: Año fiscal
     *         example: 2024
     *       - in: query
     *         name: quarter
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 4
     *         description: Trimestre específico (1-4). Mutuamente excluyente con month
     *         example: 1
     *       - in: query
     *         name: month
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 12
     *         description: Mes específico (1-12). Mutuamente excluyente con quarter
     *         example: 3
     *     responses:
     *       200:
     *         description: Libro de IVA soportado generado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/LibroIVASoportado'
     *       400:
     *         description: Año requerido y debe ser válido
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "Año requerido y debe ser válido"
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     */
    .get('/charged/:year', auth, role(['admin', 'employee']), VATBookController.getVATChargedBook)

    /**
     * @swagger
     * /vat-book/complete/{year}:
     *   get:
     *     summary: Obtiene ambos libros de IVA (soportado y repercutido) consolidados
     *     tags: [Libro de IVA]
     *     parameters:
     *       - in: path
     *         name: year
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 2020
     *           maximum: 2030
     *         description: Año fiscal
     *         example: 2024
     *       - in: query
     *         name: quarter
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 4
     *         description: Trimestre específico (1-4). Mutuamente excluyente con month
     *         example: 1
     *       - in: query
     *         name: month
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 12
     *         description: Mes específico (1-12). Mutuamente excluyente con quarter
     *         example: 3
     *     responses:
     *       200:
     *         description: Libros de IVA completos generados correctamente
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/LibroIVACompleto'
     *       400:
     *         description: Año requerido y debe ser válido
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "Año requerido y debe ser válido"
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     */
    .get('/complete/:year', auth, role(['admin', 'employee']), VATBookController.getCompleteVATBooks)

    // ==========================================
    // LIBRO CONSOLIDADO POR PROPIETARIO
    // ==========================================

    /**
     * @swagger
     * /vat-book/by-owner/{year}:
     *   get:
     *     summary: Obtiene el libro de IVA consolidado por cada propietario
     *     description: |
     *       Genera un libro consolidado (facturas emitidas, recibidas y gastos internos)
     *       distribuido proporcionalmente entre todos los propietarios según su porcentaje de propiedad.
     *
     *       **Nota:** Actualmente accesible para admin y employee.
     *       Se recomienda crear un endpoint `/by-owner/me` específico para que los clientes
     *       puedan ver únicamente sus propios datos fiscales.
     *     tags: [Libro de IVA]
     *     parameters:
     *       - in: path
     *         name: year
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 2020
     *           maximum: 2030
     *         description: Año fiscal
     *         example: 2024
     *       - in: query
     *         name: quarter
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 4
     *         description: Trimestre específico (1-4). Mutuamente excluyente con month
     *         example: 1
     *       - in: query
     *         name: month
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 12
     *         description: Mes específico (1-12). Mutuamente excluyente con quarter
     *         example: 3
     *     responses:
     *       200:
     *         description: Libro de IVA por propietario generado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/LibroIVAPorPropietario'
     *       400:
     *         description: Año requerido y debe ser un número válido
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     *                     message:
     *                       example: "Año requerido y debe ser un número válido."
     *       500:
     *         description: Error interno del servidor al generar el libro de IVA por propietario
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     *                     message:
     *                       example: "Error interno del servidor al generar el libro de IVA por propietario."
     */
    .get('/by-owner/:year', auth, role(['admin', 'employee']), VATBookController.getVATBookByOwner)

    // ==========================================
    // LIQUIDACIÓN TRIMESTRAL
    // ==========================================

    /**
     * @swagger
     * /vat-book/liquidation/{year}/{quarter}:
     *   get:
     *     summary: Genera la liquidación trimestral de IVA (Modelo 303)
     *     tags: [Libro de IVA]
     *     parameters:
     *       - in: path
     *         name: year
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 2020
     *           maximum: 2030
     *         description: Año fiscal
     *         example: 2024
     *       - in: path
     *         name: quarter
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 4
     *         description: Trimestre (1-4)
     *         example: 1
     *     responses:
     *       200:
     *         description: Liquidación trimestral generada correctamente
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/LiquidacionTrimestral'
     *                     message:
     *                       example: "Liquidación T1 2024 generada correctamente"
     *       400:
     *         description: Año requerido y válido, trimestre debe ser entre 1 y 4
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               examples:
     *                 año_invalido:
     *                   value: "Año requerido y debe ser válido"
     *                 trimestre_invalido:
     *                   value: "Trimestre debe ser entre 1 y 4"
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     */
    .get('/liquidation/:year/:quarter', auth, role(['admin', 'employee']), VATBookController.getQuarterlyVATLiquidation)

    // ==========================================
    // EXPORTACIÓN Y DESCARGA DE EXCEL
    // ==========================================

    /**
     * @swagger
     * /vat-book/export/excel:
     *   post:
     *     summary: Exporta el libro de IVA al formato Excel oficial AEAT
     *     tags: [Libro de IVA]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ExportacionExcel'
     *           example:
     *             bookType: "supported"
     *             year: 2024
     *             quarter: 1
     *             companyData:
     *               nif: "B12345678"
     *               name: "Mi Empresa S.L."
     *               address: "Calle Mayor 123"
     *               postalCode: "28001"
     *               city: "Madrid"
     *     responses:
     *       200:
     *         description: Datos preparados para exportación a Excel
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     message:
     *                       example: "Datos preparados para exportación a Excel"
     *                     data:
     *                       type: object
     *                       description: Datos formateados para Excel AEAT
     *       400:
     *         description: Errores de validación en los datos de entrada
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     *                     message:
     *                       examples:
     *                         - "bookType, year y companyData son obligatorios"
     *                         - "bookType debe ser 'supported' o 'charged'"
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     */
    .post('/export/excel', auth, role(['admin', 'employee']), VATBookController.exportVATBookToExcel)

    /**
     * @swagger
     * /vat-book/download/excel:
     *   get:
     *     summary: Descarga el libro de IVA en formato Excel AEAT (mediante query parameters)
     *     description: Descarga directa desde navegador usando parámetros de URL. Usa datos de empresa por defecto.
     *     tags: [Libro de IVA]
     *     parameters:
     *       - in: query
     *         name: bookType
     *         required: true
     *         schema:
     *           type: string
     *           enum: [supported, charged]
     *         description: Tipo de libro a descargar
     *         example: supported
     *       - in: query
     *         name: year
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 2020
     *           maximum: 2030
     *         description: Año fiscal
     *         example: 2024
     *       - in: query
     *         name: quarter
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 4
     *         description: Trimestre específico (opcional, mutuamente excluyente con month)
     *         example: 1
     *       - in: query
     *         name: month
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 12
     *         description: Mes específico (opcional, mutuamente excluyente con quarter)
     *         example: 3
     *     responses:
     *       200:
     *         description: Archivo Excel descargado correctamente
     *         content:
     *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
     *             schema:
     *               type: string
     *               format: binary
     *         headers:
     *           Content-Disposition:
     *             schema:
     *               type: string
     *               example: 'attachment; filename="LibroIVA_Soportado_2024_T1.xlsx"'
     *       400:
     *         description: Parámetros de consulta inválidos
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     *                     message:
     *                       examples:
     *                         - "bookType debe ser 'supported' o 'charged'. Ejemplo: ?bookType=supported"
     *                         - "Año requerido y debe ser válido. Ejemplo: ?year=2024"
     *       500:
     *         description: Error enviando archivo para descarga
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     *                     message:
     *                       example: "Error enviando archivo para descarga"
     *   post:
     *     summary: Descarga el libro de IVA en formato Excel AEAT (mediante request body)
     *     description: Descarga desde aplicaciones frontend con datos de empresa personalizados.
     *     tags: [Libro de IVA]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ExportacionExcel'
     *           example:
     *             bookType: "charged"
     *             year: 2024
     *             quarter: 2
     *             companyData:
     *               nif: "B12345678"
     *               name: "Mi Empresa S.L."
     *               address: "Calle Mayor 123"
     *               postalCode: "28001"
     *               city: "Madrid"
     *     responses:
     *       200:
     *         description: Archivo Excel descargado correctamente
     *         content:
     *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
     *             schema:
     *               type: string
     *               format: binary
     *         headers:
     *           Content-Disposition:
     *             schema:
     *               type: string
     *               example: 'attachment; filename="LibroIVA_Repercutido_2024_T2.xlsx"'
     *       400:
     *         description: Datos de request body inválidos
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     */
    .all('/download/excel', auth, role(['admin', 'employee']), VATBookController.downloadVATBookExcel)

    // ==========================================
    // ESTADÍSTICAS Y ANÁLISIS
    // ==========================================

    /**
     * @swagger
     * /vat-book/stats/{year}:
     *   get:
     *     summary: Obtiene estadísticas anuales de IVA
     *     tags: [Libro de IVA]
     *     parameters:
     *       - in: path
     *         name: year
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 2020
     *           maximum: 2030
     *         description: Año fiscal para las estadísticas
     *         example: 2024
     *     responses:
     *       200:
     *         description: Estadísticas de IVA generadas correctamente
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     message:
     *                       example: "Estadísticas de IVA 2024 generadas correctamente"
     *                     data:
     *                       $ref: '#/components/schemas/EstadisticasIVAAnual'
     *       400:
     *         description: Año requerido y debe ser válido
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "Año requerido y debe ser válido"
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     */
    .get('/stats/:year', auth, role(['admin', 'employee']), VATBookController.getAnnualVATStats)

    /**
     * @swagger
     * /vat-book/comparison/{year}:
     *   get:
     *     summary: Obtiene comparación trimestral del año
     *     tags: [Libro de IVA]
     *     parameters:
     *       - in: path
     *         name: year
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 2020
     *           maximum: 2030
     *         description: Año fiscal para la comparación
     *         example: 2024
     *     responses:
     *       200:
     *         description: Comparación trimestral generada correctamente
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     message:
     *                       example: "Comparación trimestral generada correctamente"
     *                     data:
     *                       $ref: '#/components/schemas/ComparacionTrimestral'
     *       400:
     *         description: Año requerido y debe ser válido
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "Año requerido y debe ser válido"
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     */
    .get('/comparison/:year', auth, role(['admin', 'employee']), VATBookController.getQuarterlyComparison)

    // ==========================================
    // CONFIGURACIÓN Y UTILIDADES
    // ==========================================

    /**
     * @swagger
     * /vat-book/config:
     *   get:
     *     summary: Obtiene la configuración disponible para el libro de IVA
     *     tags: [Libro de IVA]
     *     responses:
     *       200:
     *         description: Configuración del libro de IVA
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     message:
     *                       example: "Configuración del libro de IVA"
     *                     data:
     *                       $ref: '#/components/schemas/ConfiguracionLibroIVA'
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     *                     message:
     *                       example: "Error interno del servidor"
     */
    .get('/config', auth, role(['admin', 'employee']), VATBookController.getVATBookConfig)

    /**
     * @swagger
     * /vat-book/validate-company:
     *   post:
     *     summary: Valida datos de empresa para exportación AEAT
     *     tags: [Libro de IVA]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - companyData
     *             properties:
     *               companyData:
     *                 $ref: '#/components/schemas/DatosEmpresa'
     *           example:
     *             companyData:
     *               nif: "B12345678"
     *               name: "Mi Empresa S.L."
     *               address: "Calle Mayor 123"
     *               postalCode: "28001"
     *               city: "Madrid"
     *     responses:
     *       200:
     *         description: Datos de empresa válidos
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     message:
     *                       example: "Datos de empresa válidos"
     *                     data:
     *                       type: object
     *                       properties:
     *                         isValid:
     *                           type: boolean
     *                           example: true
     *                         validatedFields:
     *                           type: array
     *                           items:
     *                             type: string
     *                           example: ["nif", "name"]
     *       400:
     *         description: Errores de validación
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     *                     message:
     *                       examples:
     *                         - "Datos de empresa requeridos"
     *                         - "Campos obligatorios faltantes: nif, name"
     *                         - "Formato de NIF inválido"
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/RespuestaEstandar'
     *                 - type: object
     *                   properties:
     *                     success:
     *                       example: false
     *                     message:
     *                       example: "Error interno del servidor"
     */
    .post('/validate-company', auth, role(['admin', 'employee']), VATBookController.validateCompanyData)


export default router;

/**
 * EJEMPLOS DE USO DEL LIBRO DE IVA:
 *
 * // Obtener libro de IVA soportado del primer trimestre 2024
 * GET /api/vat-book/supported/2024?quarter=1
 *
 * // Obtener libro de IVA repercutido de marzo 2024
 * GET /api/vat-book/charged/2024?month=3
 *
 * // Obtener ambos libros del año completo 2024
 * GET /api/vat-book/complete/2024
 *
 * // Generar liquidación del segundo trimestre 2024
 * GET /api/vat-book/liquidation/2024/2
 *
 * // Obtener libro consolidado por propietarios del primer trimestre
 * GET /api/vat-book/by-owner/2024?quarter=1
 *
 * // Exportar libro soportado a Excel (preparar datos)
 * POST /api/vat-book/export/excel
 * Body: {
 *   "bookType": "supported",
 *   "year": 2024,
 *   "quarter": 1,
 *   "companyData": {
 *     "nif": "B12345678",
 *     "name": "Mi Empresa S.L.",
 *     "address": "Calle Mayor 123",
 *     "postalCode": "28001",
 *     "city": "Madrid"
 *   }
 * }
 *
 * // Descargar Excel directamente desde navegador
 * GET /api/vat-book/download/excel?bookType=charged&year=2024&quarter=2
 *
 * // Descargar Excel desde aplicación con datos personalizados
 * POST /api/vat-book/download/excel
 * Body: {
 *   "bookType": "charged",
 *   "year": 2024,
 *   "quarter": 2,
 *   "companyData": {
 *     "nif": "B12345678",
 *     "name": "Mi Empresa S.L."
 *   }
 * }
 *
 * // Obtener estadísticas anuales de IVA
 * GET /api/vat-book/stats/2024
 *
 * // Comparar trimestres del año
 * GET /api/vat-book/comparison/2024
 *
 * // Obtener configuración del sistema
 * GET /api/vat-book/config
 *
 * // Validar datos de empresa antes de exportar
 * POST /api/vat-book/validate-company
 * Body: {
 *   "companyData": {
 *     "nif": "B12345678",
 *     "name": "Mi Empresa S.L."
 *   }
 * }
 *
 * NOTAS IMPORTANTES:
 * - Los parámetros quarter y month son mutuamente excluyentes en todos los endpoints
 * - Si no se especifica quarter ni month, se devuelve el año completo
 * - Las descargas de Excel limpian archivos temporales automáticamente después de 5 segundos
 * - Todos los endpoints requieren autenticación y roles admin/employee
 * - El endpoint /by-owner actualmente es solo para admin/employee, se recomienda crear /by-owner/me para clientes
 * - Las fechas siguen el formato ISO 8601 (YYYY-MM-DD)
 * - Los importes siguen el estándar contable español (2 decimales)
 * - La exportación Excel cumple con el formato oficial AEAT vigente
 * - Los tipos de IVA soportados son: 0%, 4%, 10% y 21%
 * - Las claves de operación AEAT: 01 (general), 02 (rectificativa), 03 (exenta)
 * - El formato NIF acepta tanto empresas (letra+8dígitos) como autónomos (8dígitos+letra)
 */