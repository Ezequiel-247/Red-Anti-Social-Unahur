# Red Anti-Social (UNAHUR) 🚀

![Status](https://img.shields.io/badge/Status-En%20Desarrollo-green)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=flat&logo=sequelize&logoColor=white)

Proyecto de red social desarrollado para la **Tecnicatura Universitaria en Programación (UNAHUR)**. La plataforma permite una interacción dinámica entre usuarios mediante un sistema de publicaciones, gestión de imágenes y feedback social.

## 📱 Interfaz de la Aplicación
La plataforma cuenta con un diseño responsivo y moderno, enfocado en la experiencia de usuario (UX).

<p align="center">
  <img src="https://github.com/user-attachments/assets/951c31d0-fb5c-4e4c-8a5f-8708cc34d87f" width="100%" alt="Vista Principal de la App" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/d24390f8-ccf8-4acc-a000-ceba5ac1a0fe" width="48%" />
  <img src="https://github.com/user-attachments/assets/d2f7ddef-269b-4f54-ae37-c2c5a69a03a4" width="48%" />
</p>

## 📌 Características Principales
- **Gestión de Usuarios:** Registro, login y validación de perfiles únicos.
- **Publicaciones Multimedia:** Sistema de posteos con soporte para múltiples imágenes (1:N).
- **Interacción Social:** Sistema de "Reacciones" (N:M) y Comentarios (1:N) vinculados tanto al usuario como al post.
- **Organización:** Clasificación de contenido mediante etiquetas mediante tablas intermedias (N:M).

## 📊 Arquitectura de Datos (DER)
El modelo relacional fue diseñado para separar estrictamente la **autoría** de la **interacción**, permitiendo un sistema de reacciones escalable y eficiente.

<p align="center">
  <img src="https://github.com/user-attachments/assets/038692cd-56d3-4442-a900-9ed627d318cb" alt="Modelo de base de datos (DER)" width="80%" />
</p>

## 🛠️ Stack Tecnológico

### Backend
- **Node.js & Express:** Servidor API RESTful.
- **Sequelize ORM:** Gestión y modelado de la base de datos relacional.
- **Bcrypt:** Seguridad y hash de contraseñas de hasta 100 caracteres.

### Frontend
- **Arquitectura Limpia:** Uso de JavaScript moderno, HTML5 y CSS3 para una interfaz fluida sin dependencias pesadas.

## 📂 Estructura del Repositorio
- `/Backend`: Modelos, controladores y configuración de la base de datos (Sequelize).
- `/Frontend`: Vistas y lógica del lado del cliente.

---
**Autor:** [Ezequiel](https://github.com/Ezequiel-247) 🇦🇷  
*Desarrollador Full Stack enfocado en Backend*.
