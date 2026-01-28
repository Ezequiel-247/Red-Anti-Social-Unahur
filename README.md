# Red Anti-Social (UNAHUR) 

![Status](https://img.shields.io/badge/Status-En%20Desarrollo-green)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=flat&logo=sequelize&logoColor=white)

Proyecto de red social desarrollado para la **Tecnicatura Universitaria en Programación (UNAHUR)**. La plataforma permite una interacción dinámica entre usuarios mediante un sistema de publicaciones, gestión de imágenes y feedback social.

## Interfaz de la Aplicación
La plataforma cuenta con un diseño responsivo y moderno, enfocado en la experiencia de usuario (UX).

<div align="center">
  <div style="border: 1px solid #30363d; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.2); margin-bottom: 20px;">
    <img src="https://github.com/user-attachments/assets/951c31d0-fb5c-4e4c-8a5f-8708cc34d87f" width="100%" alt="Vista Principal de la App" />
  </div>
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/d24390f8-ccf8-4acc-a000-ceba5ac1a0fe" width="48%" style="border-radius: 10px; border: 1px solid #30363d;" />
  <img src="https://github.com/user-attachments/assets/d2f7ddef-269b-4f54-ae37-c2c5a69a03a4" width="48%" style="border-radius: 10px; border: 1px solid #30363d;" />
</div>

## Características Principales
- **Gestión de Usuarios:** Registro, login y validación de perfiles únicos.
- **Publicaciones Multimedia:** Sistema de posteos con soporte para múltiples imágenes (1:N).
- **Interacción Social:** Sistema de "Reacciones" (N:M) y Comentarios (1:N) vinculados tanto al usuario como al post.
- **Organización:** Clasificación de contenido mediante etiquetas utilizando tablas intermedias (N:M).

## Arquitectura de Datos (DER)
El modelo relacional fue diseñado para separar estrictamente la **autoría** de la **interacción**, permitiendo un sistema de reacciones escalable y eficiente.

<div align="center">
  <div style="background-color: #f6f8fa; padding: 20px; border-radius: 10px; border: 1px solid #30363d; display: inline-block;">
    <img src="https://github.com/user-attachments/assets/038692cd-56d3-4442-a900-9ed627d318cb" alt="Modelo de base de datos (DER)" width="100%" />
  </div>
</div>

## Stack Tecnológico

### Backend
- **Node.js & Express:** Servidor API RESTful.
- **Sequelize ORM:** Gestión y modelado de la base de datos relacional.
- **Bcrypt:** Seguridad y hash de contraseñas de hasta 100 caracteres.

### Frontend
- **Arquitectura Limpia:** Uso de JavaScript moderno, HTML5 y CSS3 para una interfaz fluida sin dependencias pesadas.

## Estructura del Repositorio
- `/Backend`: Modelos, controladores y configuración de la base de datos (Sequelize).
- `/Frontend`: Vistas y lógica del lado del cliente.

---
**Autor:** [Ezequiel](https://github.com/Ezequiel-247) <a href="https://www.linkedin.com/in/eduardo-ezequiel-ortiz-7815a526b/"><img src="https://img.shields.io/badge/-LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" height="20"></a>  
*Desarrollador Full Stack*.
