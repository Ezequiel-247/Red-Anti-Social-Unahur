# Red Anti-Social (UNAHUR) 🚀

![Status](https://img.shields.io/badge/Status-En%20Desarrollo-green)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=flat&logo=sequelize&logoColor=white)

Este es un proyecto de red social desarrollado como parte de la formación en la Universidad Nacional de Hurlingham (UNAHUR). La plataforma permite a los usuarios interactuar a través de publicaciones, imágenes, comentarios y reacciones.

## 📌 Características
- **Gestión de Usuarios:** Registro, login y perfiles únicos.
- **Publicaciones:** Sistema de posteos con soporte para imágenes.
- **Interacción:** Sistema de "Reacciones" (N:M) y Comentarios (1:N).
- **Etiquetado:** Organización de contenido mediante etiquetas (N:M).

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** & **Express** para el servidor API REST.
- **Sequelize ORM** para la gestión de la base de datos.
- **Bcrypt** para la encriptación de contraseñas.
- **Dotenv** para la gestión de variables de entorno.

### Frontend
- **JavaScript** (Vanilla/Modern) para la lógica de cliente.
- **CSS3** para el diseño y estilos.
- **HTML5** para la estructura de la interfaz.

## 📊 Arquitectura de Datos (DER)
El siguiente diagrama representa la estructura de nuestra base de datos, destacando la separación entre la autoría de publicaciones y las interacciones de los usuarios.

![Diagrama Entidad-Relación](./Diagrama_sin_título.drawio.png)

## 🚀 Instalación y Configuración
<img width="1011" height="472" alt="Modelo_de_base_de_datos(DER)" src="https://github.com/user-attachments/assets/038692cd-56d3-4442-a900-9ed627d318cb" />

### 1. Clonar el repositorio
```bash
git clone [https://github.com/Ezequiel-247/Red-Anti-Social-Unahur.git](https://github.com/Ezequiel-247/Red-Anti-Social-Unahur.git)
cd Red-Anti-Social-Unahur
