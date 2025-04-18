//verifica los espacios y mayúsculas y minúsculas
export function sanitizeString(value) {
    if(!value || typeof value !== 'string') return '';
    return value.trim().toLowerCase();
}