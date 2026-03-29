/**
 * Tareas de mantenimiento periódico del servidor.
 *
 * Actualmente gestiona:
 *  - Limpieza diaria de refresh_tokens expirados o revocados.
 *
 * Llamar a startScheduler() una sola vez al arrancar el servidor.
 */

import RefreshTokenRepository from '../repository/refreshTokenRepository.js';

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas

export function startScheduler() {
    // Limpieza inicial al arrancar (elimina tokens acumulados de ejecuciones previas)
    RefreshTokenRepository.cleanExpired()
        .then(() => console.log('[scheduler] Limpieza inicial de tokens completada'))
        .catch(err => console.error('[scheduler] Error en limpieza inicial:', err.message));

    // Limpieza periódica cada 24 horas
    setInterval(async () => {
        try {
            await RefreshTokenRepository.cleanExpired();
            console.log('[scheduler] Limpieza periódica de tokens completada');
        } catch (err) {
            console.error('[scheduler] Error en limpieza periódica:', err.message);
        }
    }, CLEANUP_INTERVAL_MS);
}
