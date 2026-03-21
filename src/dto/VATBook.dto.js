export const vatBookExportDTO = (data) => ({
    bookType: data.bookType,
    year: data.year,
    quarter: data.quarter ?? null,
    month: data.month ?? null,
    companyData: data.companyData ?? null,
});

export const vatBookPDFDTO = (data) => ({
    year: data.year,
    quarter: data.quarter ?? null,
    month: data.month ?? null,
    bookType: data.bookType,
});

export const validateCompanyDTO = (data) => ({
    companyData: data.companyData ?? null,
});
