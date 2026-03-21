export const createEstateDTO = (data) => ({
    cadastral_reference: data.cadastral_reference?.trim().toUpperCase(),
    price: data.price,
    address: data.address?.trim(),
    postal_code: data.postal_code,
    location: data.location?.trim(),
    province: data.province?.trim(),
    country: data.country?.trim(),
    surface: data.surface,
});

export const updateEstateDTO = (data) => ({
    cadastral_reference: data.cadastral_reference?.trim().toUpperCase(),
    price: data.price,
    address: data.address?.trim(),
    postal_code: data.postal_code,
    location: data.location?.trim(),
    province: data.province?.trim(),
    country: data.country?.trim(),
    surface: data.surface,
});
