// Ottaa käyttöön Noden sisäänrakennetun web-palvelimen määrittelevän moduulin
// const http = require("http");

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

// Expressin sisäänrakennettu middlware static, jolla saadaan näytettyä sivu index.html
app.use(express.static("build"));
app.use(cors());

// app.use(morgan(":method :url :status :res[name] - :response-time ms"));

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

// lisää request -olion kenttään body ennen kuin routen käsittelijää kutsutaan
app.use(express.json());

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

//json on tässä tapauksessa merkkijono

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  const current_date = new Date();

  res.send(
    `<p>Phonebook has info for ${persons.length} people</p>
    ${current_date.toString()}`
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

// Taulukko muuttuu yksittäisiksi numeroiksi array destructuringin ansiosta
const generateId = () => {
  return Math.floor(Math.random() * 10000000);
};

app.post("/api/persons", (request, response) => {
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

  const soughtPerson = persons.find((n) => n.name === body.name);

  if (soughtPerson) {
    return response.status(400).json({
      error: `'${body.name}' is already in the phonebook`,
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;

// Sitoo http palvelimen app kuuntelemaan porttiin 3001 tulevia HTTP-pyyntöjä
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// node . käynnistää interaktiivisen node-repl:in
// --save-dev tarkoittaa kehitysaikaista riippuvuutta
// hot reload = selaimen automaattinen päivitys -toiminnallisuus
