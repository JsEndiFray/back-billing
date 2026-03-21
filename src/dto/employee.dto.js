export const createEmployeeDTO = (data) => ({
    name: data.name?.trim(),
    lastname: data.lastname?.trim(),
    email: data.email?.trim().toLowerCase(),
    identification: data.identification?.trim().toUpperCase(),
    phone: data.phone,
    address: data.address?.trim(),
    postal_code: data.postal_code,
    location: data.location?.trim(),
    province: data.province?.trim(),
    country: data.country?.trim(),
});

export const updateEmployeeDTO = (data) => ({
    name: data.name?.trim(),
    lastname: data.lastname?.trim(),
    email: data.email?.trim().toLowerCase(),
    identification: data.identification?.trim().toUpperCase(),
    phone: data.phone,
    address: data.address?.trim(),
    postal_code: data.postal_code,
    location: data.location?.trim(),
    province: data.province?.trim(),
    country: data.country?.trim(),
});
