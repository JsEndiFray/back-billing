/**
 * Servicio básico para datos de empresa
 * Para exportación de libros de IVA AEAT
 */
export default class CompanyService {

    /**
     * Obtiene datos básicos de la empresa
     * TODO: En el futuro, estos datos deberían venir de una tabla 'company' en BD
     */
    static getCompanyData() {
        return {
            nif: process.env.COMPANY_NIF || "B12345678",
            name: process.env.COMPANY_NAME || "Tu Empresa SL",
            address: process.env.COMPANY_ADDRESS || "Calle Ejemplo 123",
            postal_code: process.env.COMPANY_POSTAL_CODE || "28001",
            city: process.env.COMPANY_CITY || "Madrid",
            province: process.env.COMPANY_PROVINCE || "Madrid",
            country: process.env.COMPANY_COUNTRY || "España"
        };
    }

    /**
     * Valida que los datos de empresa estén completos para AEAT
     */
    static validateCompanyData(companyData = null) {
        const data = companyData || this.getCompanyData();

        const requiredFields = ['nif', 'name'];
        const missingFields = requiredFields.filter(field => !data[field]);

        if (missingFields.length > 0) {
            return {
                isValid: false,
                message: `Campos obligatorios faltantes: ${missingFields.join(', ')}`
            };
        }

        // Validar formato NIF básico
        const nifRegex = /^[A-Z]\d{8}$|^\d{8}[A-Z]$/;
        if (!nifRegex.test(data.nif)) {
            return {
                isValid: false,
                message: "Formato de NIF inválido"
            };
        }

        return {
            isValid: true,
            message: "Datos de empresa válidos"
        };
    }
}