export const createUserDTO = (data) => ({
    username: data.username,
    password: data.password,
    email: data.email,
    phone: data.phone,
    role: data.role,
});

export const updateUserDTO = (data) => ({
    username: data.username,
    password: data.password,
    email: data.email,
    phone: data.phone,
    role: data.role,
});
