# API de Gestión Administrativa y Facturación

## 1. Descripción del Proyecto

Este proyecto es una **API RESTful** robusta y segura desarrollada en **Node.js** con **Express**, diseñada para actuar como el backend de un completo sistema de gestión administrativa y financiera. La aplicación está especialmente orientada a la administración de inmuebles y negocios que operan bajo la **normativa fiscal española**.

La API gestiona de forma centralizada todas las operaciones críticas del negocio, incluyendo clientes, propietarios, inmuebles, proveedores y empleados. Su núcleo funcional se centra en un potente sistema de facturación que maneja tanto las **facturas emitidas** a clientes como las **facturas recibidas** de proveedores y los **gastos internos**, asegurando un control financiero preciso.

Una de sus características más destacadas es el módulo de cumplimiento fiscal, que permite la generación automática de **Libros de Registro de IVA** (Soportado y Repercutido) y la exportación de los mismos en el formato oficial de la **AEAT**, facilitando así la presentación de declaraciones trimestrales.

## 2. Características Principales

La API cuenta con un amplio abanico de funcionalidades diseñadas para automatizar y centralizar la gestión del negocio:

### 🔹 Seguridad y Acceso
* **Autenticación JWT**: Implementa una estrategia de `AccessToken` (corta duración) y `RefreshToken` (larga duración) para un acceso seguro y persistente.
* **Autorización por Roles (RBAC)**: Define roles de usuario (`admin`, `employee`) para restringir el acceso a endpoints específicos, garantizando que solo el personal autorizado pueda realizar operaciones críticas.
* **Rate Limiting**: Protege la API contra ataques de fuerza bruta y abuso, con límites más estrictos en las rutas de autenticación.
* **Seguridad de Cabeceras HTTP**: Utiliza `helmet` para configurar cabeceras de seguridad que protegen contra ataques comunes como XSS y clickjacking.
* **Política de CORS**: Configurada para permitir peticiones únicamente desde el frontend autorizado.
* **Hashing de Contraseñas**: Almacena las contraseñas de los usuarios de forma segura utilizando `bcrypt`.

### 🔹 Gestión de Entidades (CRUD)
* **Clientes**: Gestión completa de clientes, diferenciando entre `particular`, `autonomo` y `empresa`, con lógica para manejar relaciones jerárquicas (empresa-administrador).
* **Propietarios**: CRUD para los propietarios de los inmuebles.
* **Inmuebles (Estates)**: Gestión de propiedades, utilizando la **referencia catastral** como identificador único y validándola contra el algoritmo oficial español.
* **Proveedores (SuppliersInterface)**: CRUD para proveedores, con soporte para borrado lógico (activación/desactivación) y validación de NIF/CIF.
* **Empleados**: Gestión de los empleados de la empresa.
* **Relación Inmueble-Propietario**: Permite asignar múltiples propietarios a un inmueble, especificando el **porcentaje de propiedad (%)** de cada uno, clave para el reparto de costes e ingresos.

### 🔹 Módulo de Facturación y Finanzas
* **Facturas Emitidas**: Ciclo completo de facturación a clientes, incluyendo:
  * Generación automática de números de factura secuenciales (`FACT-XXXX`).
  * Cálculo de impuestos (IVA, IRPF).
  * Creación de **abonos** (facturas rectificativas) con valores negativos.
  * Gestión detallada de estados de **cobro**.
* **Facturas Recibidas**: Seguimiento de facturas de proveedores, con:
  * Generación de referencias internas (`FR-XXXX`).
  * Categorización de gastos.
  * Gestión de estados de **pago**.
* **Gastos Internos**: Módulo para registrar gastos que no son facturas formales (ej. material de oficina, dietas), con un **flujo de aprobación** (`pendiente` -> `aprobado` -> `pagado`).
* **Facturación Proporcional**: Capacidad para calcular importes de facturas y gastos basados en un rango de días específico dentro de un mes.

### 🔹 Cumplimiento Fiscal y Reportes (AEAT)
* **Libro de Registro de IVA**:
  * Generación del **Libro de IVA Soportado** (a partir de facturas recibidas y gastos internos deducibles).
  * Generación del **Libro de IVA Repercutido** (a partir de facturas emitidas).
* **Liquidación Trimestral**: Cálculo automático del resultado de la liquidación trimestral de IVA (Modelo 303), indicando si el resultado es a ingresar o a devolver.
* **Exportación a Excel (Formato AEAT)**: Genera y permite la descarga de los libros de IVA en un archivo `.xls` que cumple con el formato requerido por la Agencia Tributaria española.
* **Consolidado por Propietario**: Funcionalidad avanzada que genera un informe fiscal consolidado para cada propietario, repartiendo proporcionalmente los ingresos y gastos en función de su porcentaje de propiedad.
* **Estadísticas y Analíticas**: Endpoints para obtener resúmenes, estadísticas y comparativas anuales/mensuales de ingresos, gastos e impuestos.

### 🔹 Utilidades Adicionales
* **Generación de PDFs**: Creación de documentos PDF para facturas, abonos y comprobantes de gastos.
* **Validación de Datos**: Sistema de validación robusto con `express-validator` para todos los datos de entrada, asegurando la integridad de la información.

## 3. Arquitectura y Tech Stack

La API está construida siguiendo el patrón de diseño **Controlador - Servicio - Repositorio**, lo que garantiza una clara separación de responsabilidades y facilita la mantenibilidad y escalabilidad del código.

* **Controlador**: Recibe las peticiones HTTP, valida la entrada (a través de middlewares) y delega la lógica de negocio al servicio correspondiente.
* **Servicio**: Contiene la lógica de negocio principal. Orquesta las operaciones, realiza cálculos, aplica reglas de negocio y decide a qué métodos del repositorio llamar.
* **Repositorio**: Es la única capa que interactúa directamente con la base de datos. Abstrae las consultas SQL y devuelve los datos al servicio.

### Tech Stack
* **Backend**: Node.js, Express.js
* **Base de Datos**: MySQL
* **Autenticación**: JSON Web Tokens (JWT)
* **Seguridad**: `bcrypt`, `helmet`, `express-rate-limit`, `cors`
* **Validación**: `express-validator`
* **Documentación API**: Swagger (OpenAPI 3.0) con `swagger-ui-express`
* **Generación de PDFs**: `pdfkit`
* **Logging**: `morgan`

## 4. Documentación de la API

La API está completamente documentada utilizando **Swagger (OpenAPI 3.0)**. Una vez que el servidor esté en funcionamiento, puedes acceder a la documentación interactiva en la siguiente ruta:

`/api-docs`

Desde esta interfaz, podrás ver todos los endpoints disponibles, sus parámetros, los esquemas de datos de entrada y salida, y probarlos directamente desde el navegador.

## 5. Guía de Instalación y Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el proyecto en un entorno de desarrollo local.

### Prerrequisitos
* **Node.js** (versión 18.x o superior)
* **npm** (o un gestor de paquetes compatible)
* Una instancia de **MySQL** en ejecución.

### Pasos de Instalación

1.  **Clonar el repositorio**:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO>
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar la Base de Datos**:
  * Asegúrate de que tu servidor MySQL esté funcionando.
  * Crea una base de datos para el proyecto (ej: `gestion_api`).
  * Ejecuta los scripts SQL necesarios para crear las tablas y, si los hay, insertar datos iniciales.

4.  **Configurar las Variables de Entorno**:
  * En la raíz del proyecto, crea un archivo llamado `.env`.
  * Copia el contenido del archivo `.env.example` (si existe) o añade las siguientes variables con tus propios valores:

    ```env
    # Configuración de la Base de Datos
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=tu_contraseña_de_mysql
    DB_PORT=3306
    DB_DATABASE=gestion_api

    # Secretos para JWT (usa valores largos y aleatorios)
    JWT_SECRET=tu_secreto_muy_largo_para_access_tokens
    JWT_REFRESH_SECRET=tu_otro_secreto_muy_largo_para_refresh_tokens

    # URL del Frontend (para la configuración de CORS)
    FRONTEND_URL=http://localhost:4200

    # Datos de la Empresa (para reportes AEAT)
    COMPANY_NIF=B12345678
    COMPANY_NAME=Nombre de Tu Empresa S.L.
    COMPANY_ADDRESS=Calle Ejemplo 123
    COMPANY_POSTAL_CODE=28001
    COMPANY_CITY=Madrid
    COMPANY_PROVINCE=Madrid
    COMPANY_COUNTRY=España
    ```

5.  **Ejecutar la aplicación**:
    ```bash
    npm start
    ```
    El servidor se iniciará, por lo general, en el puerto `3600` (o el que se haya configurado).

## 6. Estructura de Endpoints de la API

La API está organizada en torno a los siguientes recursos principales, todos bajo el prefijo `/api`:

* `/auth`: Endpoints para **login** y **renovación de tokens**.
* `/users`: Gestión de los **usuarios** del sistema.
* `/employees`: Gestión de **empleados**.
* `/clients`: Gestión de **clientes**.
* `/owners`: Gestión de **propietarios**.
* `/estates`: Gestión de **inmuebles**.
* `/estate-owners`: Gestión de la **relación N:M entre inmuebles y propietarios**.
* `/suppliers`: Gestión de **proveedores**.
* `/invoices-issued`: Gestión de **facturas emitidas**.
* `/invoices-received`: Gestión de **facturas recibidas**.
* `/internal-expenses`: Gestión de **gastos internos**.
* `/vat-book`: Endpoints para la generación de **libros de IVA y reportes fiscales**.

Para ver el detalle completo de cada endpoint, consulta la [documentación de Swagger](#4-documentación-de-la-api).