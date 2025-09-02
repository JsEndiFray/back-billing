import CadastralService from '../services/cadastralService.js';

/**
 * Controlador para validación de referencias catastrales
 */
export default class CadastralController {

    /**
     * Valida una referencia catastral consultando el Catastro oficial
     * GET /api/cadastral/validate/:reference
     */
    static async validateCadastralReference(req, res) {
        try {
            const { reference } = req.params;

            // Validación básica del parámetro
            if (!reference || typeof reference !== 'string' || reference.trim() === '') {
                return res.status(400).json({
                    isValid: false,
                    message: 'Referencia catastral requerida',
                    error: 'missing_parameter'
                });
            }

            // Limpiar el parámetro
            const cleanReference = reference.trim().toUpperCase();

            // Validar usando el servicio
            const result = await CadastralService.validate(cleanReference);

            // Log para debugging
            console.log(`Validación catastral - ${cleanReference}: ${result.isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);

            // Respuesta exitosa (200 tanto para válida como inválida)
            return res.status(200).json(result);

        } catch (error) {
            console.error('Error en CadastralController.validateCadastralReference:', error);

            return res.status(500).json({
                isValid: true,
                message: 'Error interno del servidor. Formato válido por defecto.',
                error: 'server_error'
            });
        }
    }

    /**
     * Endpoint para verificar si el servicio está funcionando
     * GET /api/cadastral/health
     */
    static async healthCheck(req, res) {
        try {
            return res.status(200).json({
                status: 'ok',
                service: 'Cadastral Validation Service',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Service unavailable'
            });
        }
    }
}