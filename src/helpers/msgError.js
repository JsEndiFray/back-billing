//mensajes de errores
export const ErrorMessage = {
    GLOBAL: {
        NO_DATA: 'No hay ningún dato registrado.',
        DATA: 'Los datos registrados son:',
        INTERNAL: 'Error interno del servidor.',
        INVALID_ID: 'El ID proporcionado no es válido.',
        SEARCH_ERROR: 'Error en la búsqueda.',
        ERROR_UPDATE: 'Error al actualizar',
        ERROR_DELETE: 'Error al eliminar',
        ERROR_CREATE: 'Error al crear',
        ERROR_VALIDATE: 'Error de validación.',
        UNAUTHORIZED: 'No autorizado para realizar esta acción.',
        CREATE: 'Creado correctamente.',
        UPDATE: 'Actualizado correctamente.',
        DELETE: 'Eliminado correctamente.',
        NOT_FOUND: 'No tiene datos registrados.',
    },
    CLIENTS: {
        TYPE: 'Tipo de cliente no válido.',
        NOT_FOUND: 'Cliente no existe.',
        DUPLICATE: 'Ya existe un cliente con esta identificación.',
        INVALID_COMPANY: 'Nombre de la empresa no valido.',
        NAME_REQUIRED: 'El nombre es obligatorio.',
        NAME_LASTNAME_REQUIRED: 'Debes proporcionar al menos nombre o apellidos para buscar.',
        ID_REQUIRED: 'El identificador (NIF/NIE/CIF) es obligatorio.',

    },
    ESTATES: {
        NOT_FOUND: 'Inmueble no encontrado.',
        DUPLICATE: 'Ya existe un inmueble con esa referencia catastral.',
        REFERENCE_CADASTRAL: 'La referencia del catastro es obligatorio.',
    },

    OWNERS: {
        DUPLICATE: 'Ya existe un propietario con este NIF.',


    },

    BILLS: {
        NOT_FOUND: 'Factura no encontrada.',
        DUPLICATE: 'Ya existe una factura con ese número.',
        ERROR_CREATE: 'Error al crear factura con el mismo propietario mes y año.',
    },
    USERS: {
        INVALID_CREDENTIALS: 'Las credenciales no son validas.',
        LOGIN: 'Login correcto.',
        DUPLICATE: 'Ya existe un usuario con el nombre.',
    },
    ESTATE_OWNERS: {
        DUPLICATE: 'Ya existe datos registrados.',
    },
}