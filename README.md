# 📦 Proyecto Backend de Facturación

Este proyecto es una API REST construida en **Node.js** destinada a la gestión de **clientes**, **facturas**, **propietarios** e **inmuebles**. Forma parte de un sistema completo desarrollado para un familiar.

---

## 🚀 Tecnologías utilizadas

- **Node.js** – Entorno de ejecución.
- **Express** – Framework para crear la API.
- **MySQL** – Base de datos relacional.
- **Express-validator** – Validación de datos del lado del servidor.
- **Postman** – Herramienta para probar los endpoints.
- **Estructura por capas** – Separación clara en controladores, servicios, repositorios y rutas.

---

## 🧱 Estructura del proyecto

```bash
src/
├── controllers/    # Controladores HTTP
├── db/             # Conexión a la base de datos
├── repository/     # Consultas SQL puras
├── routes/         # Definición de rutas Express
├── services/       # Lógica del negocio
├── utils/          # Utilidades y mensajes de error
├── validator/      # Validación de los datos
```

---

## ✅ Funcionalidades implementadas

- CRUD completo de:
    - Clientes
    - Propietarios
    - Facturas
    - Inmuebles
    - Login
- Búsquedas inteligentes:
    - Por NIF/NIE/CIF
    - Por nombre, apellidos, empresa
    - Por tipo de cliente: particular, autónomo, empresa
- Validaciones:
    - Validaciones con express-validator
    - Reglas especiales: si el cliente es empresa, company_name y CIF son obligatorios
- Normalización de datos:
    - Uso de trim() y toLowerCase() para evitar errores por mayúsculas o espacios
- Errores personalizados:
    - Centralizados en utils/msgError.js
- Comprobaciones extra:
    - Verificación de duplicados antes de crear o actualizar
- Seguridad:
    - Uso de parámetros preparados en las consultas SQL para evitar inyección

---

## ⚠️ Validaciones importantes

- Los campos name, lastname, identification y type_client son obligatorios.
- Si el tipo de cliente es empresa, el company_name y un CIF válido son obligatorios.
- Identificación puede ser:
    - DNI: 8 números + 1 letra (e.g. 12345678Z)
    - NIE: X/Y/Z + 7 números + 1 letra (e.g. X1234567A)
    - CIF: Letra + 7 números + letra o número final

---

## 🛠️ Pendiente por implementar

- Sistema de autenticación con JWT
- Roles de usuarios (admin)
- Generación de facturas en PDF (Frontend)
- Panel de administración para propietarios
- Sistema de copias de seguridad automáticas (base de datos)
- Subida del backend a producción en Railway
- Integración del frontend en Angular
- Mejorar logs de errores y estados HTTP


---

## 🧪 Pruebas

Puedes probar todos los endpoints usando Postman, asegurándote de que el servidor esté corriendo (`node index.js`) y la base de datos MySQL esté activa.

---

## 🧠 Buenas prácticas aplicadas

- Código limpio, separado por capas
- Rutas RESTful
- Manejo de errores y validaciones
- Reutilización de lógica (ej. sanitización y validaciones)
- Documentación y estructura mantenible

---

## 🧩 Requisitos mínimos para levantar el proyecto

- Node.js 20+
- MySQL o Docker con MySQL activo
- Archivo `.env` con las variables necesarias (puerto, host, user, password, database)
- Postman para probar rutas

---

## 🫶 Notas finales

Este proyecto surge como una solución real para digitalizar y organizar la facturación de un entorno cercano. Ha sido una oportunidad para aplicar y consolidar conocimientos en desarrollo backend, centrándose en la arquitectura por capas, validaciones robustas y una estructura mantenible.
El código está pensado para escalar fácilmente, integrar nuevas funcionalidades y facilitar la conexión con un frontend moderno en Angular.

---

**Desarrollado  por Endi**
