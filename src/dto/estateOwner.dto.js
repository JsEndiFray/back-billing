export const createEstateOwnerDTO = (data) => ({
    estate_id: data.estate_id,
    owner_id: data.owner_id,
    ownership_percentage: data.ownership_percentage,
});

export const updateEstateOwnerDTO = (data) => ({
    ownership_percentage: data.ownership_percentage,
});
