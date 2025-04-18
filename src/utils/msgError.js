//mensajes de errores
export const ErrorMessage = {
    GLOBAL: {
        NO_DATA: 'No hay ningún dato registrado.',
        DATA: 'Los datos registrados son:',
        INTERNAL: 'Error interno del servidor.',
        INVALID_ID: 'El ID proporcionado no es válido.',
        SEARCH_ERROR: 'Error en la búsqueda.',
        DUPLICATE: 'Ya existe un registro con estos datos.',
        UNAUTHORIZED: 'No autorizado para realizar esta acción.',
        ERROR_VALIDATE: 'Error de validación.',
        CREATE: 'Creado correctamente.',
    },
    CLIENTS: {
        TYPE: 'Tipo de cliente no válido.',
        NOT_FOUND: 'Cliente no existe.',
        DUPLICATE: 'Ya existe un cliente con esta identificación.',
        CREATE_ERROR: 'No se pudo crear el cliente.',
        UPDATE_ERROR: 'No se pudo actualizar el cliente.',
        DELETE_ERROR: 'No se pudo eliminar el cliente.',
        INVALID_COMPANY: 'Nombre de la empresa no valido.',
        NAME_REQUIRED: 'El nombre es obligatorio.',
        NAME_LASTNAME_REQUIRED: 'Debes proporcionar al menos nombre o apellidos para buscar.',
        ID_REQUIRED: 'El identificador (NIF/NIE/CIF) es obligatorio.',
        ID_INVALID: 'El ID proporcionado no es válido.',
        UPDATE_OK: 'Actualizado correctamente.',
        DELETE_OK: 'Eliminado correctamente.'

    },
    ESTATES: {
        NOT_FOUND: 'Inmueble no encontrado.',
        DUPLICATE: 'Ya existe un inmueble con esa referencia catastral.',
        CREATE_ERROR: 'No se pudo crear el inmueble.',
        UPDATE_ERROR: 'No se pudo actualizar el inmueble.',
        DELETE_ERROR: 'No se pudo eliminar el inmueble.',
        REFERENCE_CADASTRAL: 'La referencia del catastro es obligatorio.'
    },

    OWNERS: {
        DUPLICATE: 'Ya existe un propietario con este NIF.',
        CREATE_ERROR: 'No se pudo crear el propietario.',
        UPDATE_ERROR: 'No se pudo actualizar el propietario.',
        DELETE_ERROR: 'No se pudo eliminar el propietario.',
    },

    TAXES: {
        NOT_FOUND: 'Factura no encontrada.',
        DUPLICATE: 'Ya existe una factura con ese número.',
        CREATE_ERROR: 'No se pudo crear la factura.',
        UPDATE_ERROR: 'No se pudo actualizar la factura.',
        DELETE_ERROR: 'No se pudo eliminar la factura.',
    },


}