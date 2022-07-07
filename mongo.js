/* eslint-disable no-undef */
const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit();
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack22:${password}@cluster0.ovoum.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

// Modelit ovat konstruktoriffunktioita, jotka luovat paramterien perusteell js olioita
const Person = mongoose.model("Person", personSchema);

const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
});

const argumentObj = process.argv;

if (argumentObj.length === 3) {
  console.log("phonebook:");
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person.name + " " + person.number);
    });
    mongoose.connection.close();
  });
} else if (argumentObj.length === 5) {
  person.save().then(() => {
    console.log("note saved!");
    mongoose.connection.close();
  });
}
