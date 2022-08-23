const express = require('express')
const joyas = require('./data/joyas.js')
const app = express()
app.listen(3000, () => console.log('http://localhost:3000/'))

app.get('/', (req, res) => {
  res.send('Está funcionando')
})

/*1.- Crear una ruta para la devolución de todas las joyas aplicando HATEOAS. */
const HATEOASV1 = () =>
joyas.map((g) => {
    return {
      name: g.name,
      url: `http://localhost:3000/joyas/${g.id}`,
      
    };
  });
  
  app.get("/api/v1/joyas", (req, res) => {
    res.send({
      joyas: HATEOASV1(),
    });
  });

  console.log("PUNTO 1).- V1--->"+"http://localhost:3000/api/v1/joyas")

  /* 2. Hacer una segunda versión de la API que ofrezca los mismos datos pero con los nombres de las propiedades diferentes. */
  const HATEOASV2 = () =>
  joyas.map((g) => {
    return {
      joyas: g.name,
      src: `http://localhost:3000/joyas/${g.id}`,
    };
  });

  app.get("/api/v2/joyas", (req, res) => {
    res.send({
      joyas: HATEOASV2(),
    });
  });
  console.log("PUNTO 2).- V2--->"+"http://localhost:3000/api/v2/joyas")

  /* 3. La API REST debe poder ofrecer una ruta con la que se puedan filtrar las joyas por categoría. (1.5 puntos) */

  const filtroBycategory = (category) => {
  return joyas.filter((g) => g.category === category);
};

app.get("/api/v2/category/:category", (req, res) => {
  const { category } = req.params;
  
  const joyasBycategory = filtroBycategory(category);

  res.send({
    cant: joyasBycategory.length,
    joyas: joyasBycategory,
  });
});
console.log("PUNTO 3).- Filtrar por categoría -->"+"http://localhost:3000/api/v2/category/aros")


/* 4. Crear una ruta que permita el filtrado por campos de una joya a consultar. (2 puntos) */

const fieldsSelect = (joya, fields) => {
  for (propiedad in joya) {
    if (!fields.includes(propiedad)) delete joya[propiedad];
  }

  return joya;
};

app.get("/api/v2/joyas/:id", (req, res) => {
  const { id } = req.params;
  const { fields } = req.query;
  const joya = joyas.find((g) => g.id == id);

  if (fields) return res.send({
    joya: fieldsSelect(joya, fields.split(","))
  });

  res.send({ joya });
});

console.log("PUNTO 4).- filtrar campos -->"+"http://localhost:3000/api/v2/joyas/1?fields=id,name,category,metal")

/* 5. Crear una ruta que devuelva como payload un JSON con un mensaje de error cuando
el usuario consulte el id de una joya que no exista. (0.5 puntos) */

app.get("/api/v3/joya/:id", (req, res) => {
  const { id } = req.params;
  const { fields } = req.query;
  const joya = joyas.find((g) => g.id == id);
  if (!joya) {
    return res.status(404).send({
      error: "404 Not Found",
      message: "Joya no encontrada",
    });
  }

  if (fields) return res.send({
    joya: fieldsSelect(joya, fields.split(","))
  });

  res.send({ joya });
});

console.log("PUNTO 5).- Prueba de payload con error: http://localhost:3000/api/v3/joya/8 ")

/* 6. Permitir hacer paginación de las joyas usando Query Strings. (1.5 punto) */


const HATEOASV4 = () =>
  joyas.map((g) => {
    return {
      joya: g.name,
      url: `http://localhost:3000/api/v4/joyas/${g.id}`,
    };
  });


app.get("/api/v4/joyas", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = /* parseInt(req.query.limit) || joyas.length */ 2;

  const start = (page * limit) - limit;
  const end = page * limit;

  const data = HATEOASV4().slice(start, end);

  const nextPage = page + 1;
  const previousPage = page - 1;
  const hasNextPage = ((nextPage * limit) - limit) < joyas.length;
  const hasPreviousPage = previousPage > 0;

  const url = 'http://localhost:3000/api/v4/joyas';

  return res.send({
    count: data.length,
    next: hasNextPage ? `${url}?page=${nextPage}&limit=${limit}` : null,
    previous: hasPreviousPage ? `${url}?page=${previousPage}&limit=${limit}` : null,
    results: data,
  });
});

console.log("PUNTO 6).- Realizando paginación http://localhost:3000/api/v4/joyas")

/* 7. Permitir hacer ordenamiento de las joyas según su valor de forma ascendente o
descendente usando Query Strings. (1.5 punto) */

const orderValues = (order) => {
  if (order == "asc") return joyas.sort((a, b) => (a.value > b.value ? 1 : -1));
  if (order == "desc") return joyas.sort((a, b) => (a.value < b.value ? 1 : -1));
  return false;
};

app.get("/api/v5/joyas", (req, res) => {
  const { order } = req.query;
  if (order == "asc" || order == "desc") {
    return res.send(orderValues(order));
  }
  res.send({ joyas: HATEOASV2() });
});

console.log("PUNTO 7).- Orden ascendente y descendente A) Ascendente: http://localhost:3000/api/v5/joyas?order=asc || B) Descendente: http://localhost:3000/api/v5/joyas?order=desc")
