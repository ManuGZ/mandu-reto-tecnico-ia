# target-app

Aplicación Angular con datos de prueba. Es el **objetivo del harness**: el código
que `/make-feature` debe leer, entender y modificar para implementar los features
solicitados.

## Requisitos

- Node >= 18
- npm >= 9

## Ejecución

```bash
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

## Estructura

```
src/app/
├── models/
│   └── person.model.ts      # Interfaz Person y tipo Area
├── data/
│   └── people.data.ts       # 18 personas con todos sus campos
├── services/
│   └── people.service.ts    # Acceso a los datos
└── pages/
    └── directory/
        ├── directory.ts     # Componente de directorio (tabla base)
        ├── directory.html
        └── directory.css
```

## Modelo de datos

Cada `Person` tiene: `id`, `name`, `area`, `role`, `email`, `hireDate` (ISO), `manager`.

Las áreas disponibles son: `Tecnología`, `Producto`, `Personas`, `Comercial`, `Finanzas`.

## Estado actual

La tabla muestra nombre, área y rol de todas las personas. Los features de filtrado
y detalle son los que el harness debe implementar.
