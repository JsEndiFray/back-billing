/**
 * Servicio para validación de referencias catastrales
 * Consulta la API oficial del Catastro español desde el backend
 */
export default class CadastralService {

    /**
     * Valida formato de referencia catastral española (20 caracteres alfanuméricos)
     */
    static validateCadastralReferenceFormat(refCat) {
        if (!refCat || typeof refCat !== 'string') return false;
        const cleanRef = refCat.trim().toUpperCase();
        if (cleanRef.length !== 20) return false;
        return /^[0-9A-Z]{20}$/i.test(cleanRef);
    }

    /**
     * Valida existencia real de referencia catastral
     */
    static async validateCadastralReferenceExists(refCat) {
        try {
            // 1. Validar formato primero
            if (!this.validateCadastralReferenceFormat(refCat)) {
                return {
                    isValid: false,
                    message: 'La referencia catastral debe tener exactamente 20 caracteres alfanuméricos'
                };
            }

            const cleanRef = refCat.trim().toUpperCase();

            // 2. Consultar API del Catastro
            const apiUrl = `https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPRC?Provincia=&Municipio=&RC=${cleanRef}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/xml, text/xml, */*',
                    'User-Agent': 'Mozilla/5.0 (compatible; CadastralValidator/1.0)'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                return {
                    isValid: true,
                    message: 'Formato válido. No se pudo verificar existencia (error de conexión)'
                };
            }

            const xmlText = await response.text();

            // 3. Parsear respuesta XML (Node.js no tiene DOMParser nativo)
            // Por ahora, búsqueda simple de texto
            if (xmlText.includes('<err') && xmlText.includes('des=')) {
                const errorMatch = xmlText.match(/des="([^"]*)"/);
                const errorDesc = errorMatch ? errorMatch[1] : 'Error desconocido';

                if (errorDesc.includes('No se ha encontrado') ||
                    errorDesc.includes('no encontrada') ||
                    errorDesc.includes('inexistente')) {
                    return {
                        isValid: false,
                        message: 'La referencia catastral no existe en el registro oficial del Catastro'
                    };
                }
            }

            // 4. Verificar si hay datos válidos
            if (xmlText.includes('<coord') && xmlText.includes('<ldt')) {
                return { isValid: true };
            }

            return {
                isValid: false,
                message: 'La referencia catastral no tiene datos válidos en el Catastro'
            };

        } catch (error) {
            console.error('Error validando referencia catastral:', error.message);

            if (error.name === 'AbortError') {
                return {
                    isValid: true,
                    message: 'Formato válido. Timeout consultando el Catastro'
                };
            }

            return {
                isValid: true,
                message: 'Formato válido. No se pudo verificar existencia (problema técnico)'
            };
        }
    }

    /**
     * Método principal para el controlador
     */
    static async validate(cadastralReference) {
        const startTime = Date.now();
        const result = await this.validateCadastralReferenceExists(cadastralReference);
        const duration = Date.now() - startTime;

        return {
            ...result,
            cadastral_reference: cadastralReference?.trim().toUpperCase(),
            validation_time: `${duration}ms`
        };
    }
}