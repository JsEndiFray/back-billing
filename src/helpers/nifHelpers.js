export const validate = (id) => {
    if (!id || typeof id !== 'string' || id.trim().length === 0) return false;

    const cleanId = id.trim().toUpperCase();

    const nifRegex = /^[0-9]{8}[A-Z]$/;
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
    const cifRegex = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/;

    return nifRegex.test(cleanId) || nieRegex.test(cleanId) || cifRegex.test(cleanId);
};