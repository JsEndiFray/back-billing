export const ErrorCodes = {
    //ETIQUETAS
    //GLOBAL
    GLOBAL_SERVER_ERROR: 'GLOBAL_SERVER_ERROR',
    GLOBAL_NOT_FOUND: 'GLOBAL_NOT_FOUND',
    GLOBAL_INVALID_ID: 'GLOBAL_INVALID_ID',
    GLOBAL_VALIDATION_ERROR: 'GLOBAL_VALIDATION_ERROR',
    GLOBAL_UNAUTHORIZED: 'GLOBAL_UNAUTHORIZED',
    GLOBAL_FORBIDDEN: 'GLOBAL_FORBIDDEN',
    GLOBAL_DATA: 'GLOBAL_DATA',
    GLOBAL_SEARCH_ERROR: 'GLOBAL_SEARCH_ERROR',
    GLOBAL_ERROR_UPDATE: 'GLOBAL_ERROR_UPDATE',
    GLOBAL_ERROR_DELETE: 'GLOBAL_ERROR_DELETE',
    GLOBAL_ERROR_CREATE: 'ERROR_CREATE',
    GLOBAL_CREATE: 'GLOBAL_CREATE',
    GLOBAL_UPDATE: 'GLOBAL_UPDATE',
    GLOBAL_DELETE: 'GLOBAL_DELETE',

    //BILLS
    BILL_DUPLICATE: 'BILL_DUPLICATE',
    BILL_NOT_FOUND: 'BILL_NOT_FOUND',
    BILL_CREATE_ERROR: 'BILL_CREATE_ERROR',
    BILL_PDF_ERROR: 'BILL_PDF_ERROR',
    BILL_ABONO_NOT_FOUND: 'BILL_ABONO_NOT_FOUND',
    BILL_ID_REQUIRED: 'BILL_ID_REQUIRED',
    BILL_ABONO_ERROR: 'BILL_ABONO_ERROR',
    BILL_ABONO_OK: 'BILL_ABONO_OK',

    //CLIENTS
    CLIENT_TYPE: 'CLIENT_TYPE',
    CLIENT_DUPLICATE: 'CLIENT_DUPLICATE',
    CLIENT_INVALID_COMPANY: 'CLIENT_INVALID_COMPANY',
    CLIENT_NOT_FOUND: 'CLIENT_NOT_FOUND',
    CLIENT_NAME_REQUIRED: 'CLIENT_NAME_REQUIRED',
    CLIENT_NAME_LASTNAME_REQUIRED: 'CLIENT_NAME_LASTNAME_REQUIRED',
    CLIENT_ID_REQUIRED: 'CLIENT_ID_REQUIRED',

    //ESTATES
    ESTATE_DUPLICATE: 'ESTATE_DUPLICATE',
    ESTATE_NOT_FOUND: 'ESTATE_NOT_FOUND',
    ESTATE_REFERENCE_REQUIRED: 'ESTATE_REFERENCE_REQUIRED',

    //ESTATES-OWNERS
    ESTATE_OWNER_DUPLICATE: 'ESTATE_OWNER_DUPLICATE',

    //OWNERS
    OWNER_DUPLICATE: 'OWNER_DUPLICATE',
    OWNER_NOT_FOUND: 'OWNER_NOT_FOUND',

    //USERS
    USER_LOGIN: 'USER_LOGIN',
    USER_EMAIL_INVALID: 'USER_EMAIL_INVALID',
    USER_PHONE_INVALID: 'USER_PHONE_INVALID',
    USER_DUPLICATE: 'USER_DUPLICATE',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_CREDENTIALS_INVALID: 'USER_CREDENTIALS_INVALID',
    USER_TOKEN_EXPIRED: 'USER_TOKEN_EXPIRED',
    USER_RENOVATE_TOKEN: 'RENOVATE_TOKEN',


};

// Mensajes para cada código de error
export const ErrorMessages = {
    //GLOBAL
    [ErrorCodes.GLOBAL_SERVER_ERROR]: 'Error interno del servidor. Por favor, inténtelo de nuevo más tarde.',
    [ErrorCodes.GLOBAL_NOT_FOUND]: 'No se encontró el recurso solicitado.',
    [ErrorCodes.GLOBAL_INVALID_ID]: 'El ID proporcionado no es válido.',
    [ErrorCodes.GLOBAL_VALIDATION_ERROR]: 'Error de validación: verifique que los datos sean correctos.',
    [ErrorCodes.GLOBAL_UNAUTHORIZED]: 'No autorizado. Inicie sesión para acceder a este recurso.',
    [ErrorCodes.GLOBAL_FORBIDDEN]: 'No tiene permisos para realizar esta acción.',
    [ErrorCodes.GLOBAL_DATA]: 'Los datos registrados son:',
    [ErrorCodes.GLOBAL_SEARCH_ERROR]: 'Error en la búsqueda.',
    [ErrorCodes.GLOBAL_ERROR_UPDATE]: 'Error al actualizar',
    [ErrorCodes.GLOBAL_ERROR_DELETE]: 'Error al eliminar',
    [ErrorCodes.GLOBAL_ERROR_CREATE]: 'Error al crear',
    [ErrorCodes.GLOBAL_CREATE]: 'Creado correctamente.',
    [ErrorCodes.GLOBAL_UPDATE]: 'Actualizado correctamente.',
    [ErrorCodes.GLOBAL_DELETE]: 'Eliminado correctamente.',

    //BILLS
    [ErrorCodes.BILL_DUPLICATE]: 'Ya existe una factura con este número en el sistema.',
    [ErrorCodes.BILL_NOT_FOUND]: 'No se encontró la factura solicitada.',
    [ErrorCodes.BILL_CREATE_ERROR]: 'No se pudo crear la factura. Ya existe una para este propietario en el mismo mes y año.',
    [ErrorCodes.BILL_PDF_ERROR]: 'Error al generar el documento PDF de la factura.',
    [ErrorCodes.BILL_ABONO_NOT_FOUND]: 'No se encontró el abono solicitado.',
    [ErrorCodes.BILL_ID_REQUIRED]: 'Se requiere el ID de la factura original para crear un abono.',
    [ErrorCodes.BILL_ABONO_ERROR]: 'No se pudo crear el abono. Verifique que la factura original exista y no sea ya un abono.',
    [ErrorCodes.BILL_ABONO_OK]: 'Abono creado correctamente.',

    //CLIENTS
    [ErrorCodes.CLIENT_TYPE]: 'Tipo de cliente no válido.',
    [ErrorCodes.CLIENT_DUPLICATE]: 'Ya existe un cliente con esta identificación en el sistema.',
    [ErrorCodes.CLIENT_INVALID_COMPANY]: 'Nombre de la empresa no valido.',
    [ErrorCodes.CLIENT_NOT_FOUND]: 'No se encontró el cliente solicitado.',
    [ErrorCodes.CLIENT_NAME_REQUIRED]: 'El nombre del cliente es obligatorio.',
    [ErrorCodes.CLIENT_NAME_LASTNAME_REQUIRED]: 'Debes proporcionar al menos nombre o apellidos para buscar.',
    [ErrorCodes.CLIENT_ID_REQUIRED]: 'El identificador (NIF/NIE/CIF) del cliente es obligatorio.',

    //ESTATES
    [ErrorCodes.ESTATE_DUPLICATE]: 'Ya existe un inmueble registrado con la misma referencia catastral.',
    [ErrorCodes.ESTATE_NOT_FOUND]: 'No se encontró el inmueble solicitado.',
    [ErrorCodes.ESTATE_REFERENCE_REQUIRED]: 'La referencia catastral es un campo obligatorio.',

    //ESTATES-OWNERS
    [ErrorCodes.ESTATE_OWNER_DUPLICATE]: 'Ya existe esta relación entre propietario e inmueble.',

    //OWNERS
    [ErrorCodes.OWNER_DUPLICATE]: 'Ya existe un propietario registrado con este NIF.',
    [ErrorCodes.OWNER_NOT_FOUND]: 'No se encontró el propietario solicitado.',

    //Users
    [ErrorCodes.USER_LOGIN]: 'Login correcto.',
    [ErrorCodes.USER_EMAIL_INVALID]: 'El formato del correo electrónico no es válido.',
    [ErrorCodes.USER_PHONE_INVALID]: 'El número de teléfono debe tener al menos 9 dígitos.',
    [ErrorCodes.USER_DUPLICATE]: 'Ya existe un usuario con este nombre en el sistema.',
    [ErrorCodes.USER_NOT_FOUND]: 'Usuario no encontrado.',
    [ErrorCodes.USER_CREDENTIALS_INVALID]: 'Las credenciales proporcionadas no son válidas. Verifique su usuario y contraseña.',
    [ErrorCodes.USER_TOKEN_EXPIRED]: 'Sesión inválida o expirada. Por favor, inicie sesión nuevamente.',
    [ErrorCodes.USER_RENOVATE_TOKEN]: 'Tokens renovados exitosamente.',

};

// Mapeo de códigos de error a códigos HTTP
export const ErrorHttpCodes = {
    //GLOBAL
    [ErrorCodes.GLOBAL_SERVER_ERROR]: 500,
    [ErrorCodes.GLOBAL_NOT_FOUND]: 404,
    [ErrorCodes.GLOBAL_INVALID_ID]: 400,
    [ErrorCodes.GLOBAL_VALIDATION_ERROR]: 400,
    [ErrorCodes.GLOBAL_UNAUTHORIZED]: 401,
    [ErrorCodes.GLOBAL_FORBIDDEN]: 403,
    [ErrorCodes.GLOBAL_DATA]: 200,
    [ErrorCodes.GLOBAL_SEARCH_ERROR]: 400,
    [ErrorCodes.GLOBAL_ERROR_UPDATE]: 400,
    [ErrorCodes.GLOBAL_ERROR_DELETE]: 400,
    [ErrorCodes.GLOBAL_CREATE]: 200,
    [ErrorCodes.GLOBAL_UPDATE]: 200,
    [ErrorCodes.GLOBAL_DELETE]: 200,

    //BILLS
    [ErrorCodes.BILL_DUPLICATE]: 409,
    [ErrorCodes.BILL_NOT_FOUND]: 404,
    [ErrorCodes.BILL_CREATE_ERROR]: 409,
    [ErrorCodes.BILL_PDF_ERROR]: 500,
    [ErrorCodes.BILL_ABONO_NOT_FOUND]: 404,
    [ErrorCodes.BILL_ID_REQUIRED]: 400,
    [ErrorCodes.BILL_ABONO_ERROR]: 400,
    [ErrorCodes.BILL_ABONO_OK]: 200,

    //CLIENTS
    [ErrorCodes.CLIENT_TYPE]: 400,
    [ErrorCodes.CLIENT_DUPLICATE]: 409,
    [ErrorCodes.CLIENT_INVALID_COMPANY]: 400,
    [ErrorCodes.CLIENT_NOT_FOUND]: 404,
    [ErrorCodes.CLIENT_NAME_REQUIRED]: 400,
    [ErrorCodes.CLIENT_NAME_LASTNAME_REQUIRED]: 400,
    [ErrorCodes.CLIENT_ID_REQUIRED]: 400,

    //ESTATES
    [ErrorCodes.ESTATE_DUPLICATE]: 409,
    [ErrorCodes.ESTATE_NOT_FOUND]: 404,
    [ErrorCodes.ESTATE_REFERENCE_REQUIRED]: 400,

    //ESTATES-OWNERS
    [ErrorCodes.ESTATE_OWNER_DUPLICATE]: 409,

    //OWNERS
    [ErrorCodes.OWNER_DUPLICATE]: 409,
    [ErrorCodes.OWNER_NOT_FOUND]: 404,

    //USERS
    [ErrorCodes.USER_LOGIN]: 200,
    [ErrorCodes.USER_EMAIL_INVALID]: 400,
    [ErrorCodes.USER_PHONE_INVALID]: 400,
    [ErrorCodes.USER_DUPLICATE]: 409, // Conflict
    [ErrorCodes.USER_NOT_FOUND]: 404,
    [ErrorCodes.USER_CREDENTIALS_INVALID]: 401,
    [ErrorCodes.USER_TOKEN_EXPIRED]: 401,
    [ErrorCodes.USER_RENOVATE_TOKEN]: 402,


};