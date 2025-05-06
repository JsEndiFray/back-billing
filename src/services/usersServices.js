import UsersRepository from "../repository/usersRepository.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

process.loadEnvFile();

export default class UserService {

    //login
    static async login(username, password) {
        const user = await UsersRepository.findByUsername(username);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const token = jwt.sign({
                id: user.id, username: user.username, role: user.role
            }, process.env.JWT_SECRET, {expiresIn: '1h'}
        );
        return token;
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
        return userId[0] || null;
    }

    //MÉTODOS CREATE UPDATE DELETE

    //crear el usuario
    static async createUser(user) {

        const existsUsername = await UsersRepository.findByUsername(user.username);
        if (existsUsername) return {duplicated: 'username'};

        const existsEmail = await UsersRepository.findByEmail(user.email);
        if (existsEmail) return {duplicated: 'email'};

        const existsPhone = await UsersRepository.findByPhone(user.phone);
        if (existsPhone) return {duplicated: 'phone'};

        // Hash contraseña
        user.password = await bcrypt.hash(user.password, 10);

        const created = await UsersRepository.create(user);
        if (!created) return null;

        return {id: created};
    }

    //update el usuario
    static async updateUser(id, data) {
        if (!id || isNaN(Number(id))) return null;

        const existing = await UsersRepository.findById(id);
        if (!existing) return null;

        // Hash contraseña
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const updated = await UsersRepository.update({id, ...data});
        if(!updated) return null;

        return {id, ...data};
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