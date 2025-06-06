import UsersRepository from "../repository/usersRepository.js";
import bcrypt from 'bcrypt';
import {generateAccessToken, generateRefreshToken, verifyToken} from "../middlewares/tokenManager.js";

process.loadEnvFile();

export default class UserService {

    //login modificado con tokens de acceso y refresco
    static async login(username, password) {
        const user = await UsersRepository.findByUsername(username);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // Usar las funciones del TokenManager
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return {
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            },
            accessToken,
            refreshToken
        };
    }

    static async refreshToken(refreshToken) {
        if (!refreshToken) return null;

        // Usar la función verifyToken del TokenManager
        const decoded = verifyToken(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );

        if (!decoded) return null;

        const user = await UsersRepository.findById(decoded.id);
        if (!user || user.length === 0) return null;

        const userData = Array.isArray(user) ? user[0] : user;

        // Usar las funciones del TokenManager
        const newAccessToken = generateAccessToken(userData);
        const newRefreshToken = generateRefreshToken(userData);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }


    //obtener todos los usuarios registrados
    static async getAllUsers() {
        return await UsersRepository.getAll();
    }

    //métodos de búsquedas

    //búsqueda por username
    static async getUsername(username) {
        if (!username) return null;

        const user = await UsersRepository.findByUsername(username);
        return user || null;
    }

    //búsqueda por email
    static async getUserEmail(email) {
        if (!email) return null;
        const userEmail = await UsersRepository.findByEmail(email);
        return userEmail || null;
    }

    //búsqueda por phone
    static async getUserPhone(phone) {
        if (!phone) return null;
        const userPhone = await UsersRepository.findByPhone(phone);
        return userPhone || null;
    }

    //búsqueda por ID
    static async getUserId(id) {
        if (!id || isNaN(Number(id))) return null;
        const userId = await UsersRepository.findById(id);
        console.log(id, userId)
        return userId || null;
    }

    //MÉTODOS CREATE UPDATE DELETE

    //crear el usuario
    static async createUser(user) {
        //Limpiar y transformar datos
        const userData = {
            username: user.username.toLowerCase().trim(),
            password: user.password.trim(),
            email: user.email.toLowerCase().trim(),
            phone: user.phone.trim(),
            role: user.role.trim(),
        }
        const existsUsername = await UsersRepository.findByUsername(userData.username);
        if (existsUsername) return {duplicated: 'username'};

        const existsEmail = await UsersRepository.findByEmail(userData.email);
        if (existsEmail) return {duplicated: 'email'};

        const existsPhone = await UsersRepository.findByPhone(userData.phone);
        if (existsPhone) return {duplicated: 'phone'};

        // Hash contraseña
        userData.password = await bcrypt.hash(userData.password, 10);

        const created = await UsersRepository.create(userData);
        if (!created) return null;

        return userData;
    }

    //update el usuario
    static async updateUser(id, data) {
        // Validación: ID debe existir y ser numérico
        if (!id || isNaN(Number(id))) return null;
        //Limpiar y transformar datos
        const cleanUserData = {
            id: id,
            username: data.username.toLowerCase().trim(),
            password: data.password.trim(),
            email: data.email.toLowerCase().trim(),
            phone: data.phone.trim(),
            role: data.role.trim(),
        }

        // Buscar el usuario actual en la base de datos
        const existing = await UsersRepository.findById(id);
        if (!existing) return null; // No existe el usuario con ese ID

        // Verificar si se cambia el username y si está duplicado
        if (cleanUserData.username && cleanUserData.username !== existing.username) {
            const existingUsername = await UsersRepository.findByUsername(cleanUserData.username);
            if (existingUsername) return {duplicated: 'username'};
        }

        // Verificar si se cambia el email y si está duplicado
        if (cleanUserData.email && cleanUserData.email !== existing.email) {
            const existingEmail = await UsersRepository.findByEmail(data.email);
            if (existingEmail) return {duplicated: 'email'};
        }

        // Verificar si se cambia el teléfono y si está duplicado
        if (cleanUserData.phone && cleanUserData.phone !== existing.phone) {
            const existingPhone = await UsersRepository.findByPhone(cleanUserData.phone);
            if (existingPhone) return {duplicated: 'phone'};
        }

        // Si hay nueva contraseña, hacer hash
        if (cleanUserData.password) {
            cleanUserData.password = await bcrypt.hash(cleanUserData.password, 10);
        }

        // Ejecutar el UPDATE con los nuevos datos
        const updated = await UsersRepository.update(cleanUserData);
        if (!updated) return null;

        // Devolver el resultado del update
        return cleanUserData;
    }

    // Eliminar usuario
    static async deleteUser(id) {
        if (!id || isNaN(Number(id))) return null;

        const existing = await UsersRepository.findById(id);
        if (!existing) return null;

        const result = await UsersRepository.delete(id);
        return result > 0;
    }


}

