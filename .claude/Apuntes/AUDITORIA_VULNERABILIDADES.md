# Auditoría de dependencias (npm audit) — notas para aprender

Fecha: 2026-07-24
Contexto: apareció este mensaje al hacer `npm install` en un deploy de Render:
```
47 vulnerabilities (2 low, 6 moderate, 38 high, 1 critical)
```

## ¿Qué es `npm audit`?

Cada vez que corrés `npm install`, npm compara automáticamente **todas** las dependencias
que terminaste instalando (las tuyas + las de tus dependencias, + las de las dependencias
de tus dependencias... el árbol completo) contra una base de datos pública de vulnerabilidades
conocidas (CVEs), mantenida por GitHub Advisory Database.

No es algo que "rompimos" nosotros ni algo exclusivo de este proyecto — es un chequeo estándar
de npm, y aparece en prácticamente cualquier proyecto Node con más de un puñado de dependencias.

## Primer filtro importante: `dependencies` vs `devDependencies`

El número que tira `npm install` por default (47) suma **todo**, incluyendo paquetes que
solo se usan en tu máquina para desarrollar/testear (`devDependencies`, ej: `nodemon`, `jest`),
que **nunca corren en el servidor de producción**. Esos son mucho menos urgentes.

Para ver solo lo que realmente corre en producción:
```bash
npm audit --omit=dev
```
En este proyecto, eso bajó el número de 47 a **23**.

## Qué hicimos

Corrimos el modo seguro:
```bash
npm audit fix
```
Este comando **solo** actualiza paquetes dentro de rangos de versión compatibles según
[semver](https://semver.org/) (parches y versiones menores) — no debería romper nada de tu código,
porque no cambia versiones "mayores" (las que sí pueden traer cambios de API incompatibles).

Resultado: de 23 vulnerabilidades en producción bajamos a **10**, sin tocar `package.json`
(solo se actualizó `package-lock.json` con las versiones exactas resueltas).

## Las que quedaron pendientes (a propósito)

Las 10 restantes solo se resuelven con:
```bash
npm audit fix --force
```
Este modo **sí** puede instalar versiones mayores con cambios incompatibles. En este caso,
npm proponía:

1. **`tar` → arreglar instalando `sqlite3@6.0.1`** (breaking change). `sqlite3` solo se usa
   para la base local de desarrollo (en producción usamos Postgres vía `DATABASE_URL`), así
   que no es urgente y el riesgo de romper el entorno local no vale la pena todavía.
2. **`uuid` → arreglar instalando `sequelize@3.30.0`** (breaking change). Esto es lo más
   importante de esta lista: **degradaría Sequelize de la versión 6.x actual a la 3.x**,
   una API completamente distinta de hace varios años. Aceptar este fix a ciegas rompería
   toda la capa de acceso a datos de la app. **Lección clave: `npm audit fix --force` puede
   proponer downgrades absurdos con tal de "resolver" una vulnerabilidad — siempre hay que
   leer qué versión va a instalar antes de aceptarlo, nunca correrlo a ciegas.**

## Vulnerabilidades relevantes que sí se resolvieron

Estas ya no aparecen después del `npm audit fix`:

| Paquete | Severidad | Qué era el problema |
|---|---|---|
| `body-parser` | moderada | Denegación de servicio (DoS) con URL-encoding mal validado |
| `brace-expansion` | alta | ReDoS (regex que puede colgar el proceso con un input armado a propósito) |
| `js-yaml` | alta | DoS por complejidad cuadrática al parsear YAML con alias repetidos |
| `minimatch` | alta | Varios ReDoS |
| `multer` | alta | Varios DoS al subir archivos (relevante: es lo que usa la feature de avatar) |
| `path-to-regexp` | alta | ReDoS en el ruteo de Express |
| `sequelize` | alta | Inyección SQL vía casteo de columnas JSON |
| `validator` | alta | Bypass en la validación de URLs |
| `dottie`, `joi`, `ip-address` | moderada | Prototype pollution / XSS en casos puntuales |

## Ideas para más adelante

- Correr `npm audit` de vez en cuando (no hace falta que sea en cada commit), sobre todo antes
  de un deploy importante.
- Si algún día quieren resolver lo de `sequelize`/`uuid` en serio, la forma correcta no es
  `--force` a ciegas: es ir al [advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq),
  ver si Sequelize 6 ya tiene una versión más nueva que actualizó `uuid` internamente sin
  bajar de versión mayor, y actualizar Sequelize dentro del rango 6.x en vez de aceptar la
  sugerencia automática de npm.
- Lo mismo aplica siempre: **"hay un fix disponible" no significa "aplicalo sin mirar"**,
  sobre todo cuando el fix es con `--force`.