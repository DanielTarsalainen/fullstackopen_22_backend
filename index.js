// Ottaa käyttöön Noden sisäänrakennetun web-palvelimen määrittelevän moduulin
// const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const Person = require("./models/person");
const { default: axios } = require("axios");

// lisää request -olion kenttään body ennen kuin routen käsittelijää kutsutaan
app.use(express.json());

app.use(cors());

// Expressin sisäänrakennettu middlware static, jolla saadaan näytettyä sivu index.html
app.use(express.static("build"));

// app.use(morgan(":method :url :status :res[name] - :response-time ms"));

// const generateId = () => {
//   return Math.floor(Math.random() * 10000000);
// };

app.use(
  morgan(function (tokens, req, res) {
    if (req.method === "POST") {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
        JSON.stringify(req.body),
      ].join(" ");
    } else {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
      ].join(" ");
    }
  })
);

app.get("/info", (req, res) => {
  const current_date = new Date();
  Person.count((err, count) => {
    res.send(
      `<p>Phonebook has info for ${count} people</p>
      ${current_date.toString()}`
    );
  });
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.number && !body.name) {
    return response.status(400).json({
      error: "both name and phonenumber are missing",
    });
  } else if (!body.name) {
    return response.status(400).json({
      error: "name is missing",
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: "phonenumber is missing",
    });
  }

  // if (savedPersons.find((person) => person === body)) {
  //   return response.status(400).json({
  //     error: `'${body.name}' is already in the phonebook`,
  //   });
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id).then((result) => {
    response.status(204).end();
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;

// Sitoo http palvelimen app kuuntelemaan porttiin 3001 tulevia HTTP-pyyntöjä
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// node . käynnistää interaktiivisen node-repl:in
// --save-dev tarkoittaa kehitysaikaista riippuvuutta
// hot reload = selaimen automaattinen päivitys -toiminnallisuus
