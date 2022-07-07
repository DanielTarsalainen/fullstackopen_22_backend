const mongoose = require("mongoose");
// eslint-disable-next-line no-undef
const url = process.env.MONGODB_URI;

console.log("connecting to", url);

mongoose
  .connect(url)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\d{2}-\d{7}$/.test(v) || /^\d{3}-\d{8}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    minlength: 8,
    required: [true, "User phone number required"],
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    // id ensimmäiseksi oliossa
    returnedObject = Object.assign(
      { id: returnedObject._id.toString() },
      returnedObject
    );
    delete returnedObject._id;
    delete returnedObject.__v;
    return returnedObject;
  },
});

// Modelit ovat konstruktoriffunktioita, jotka luovat paramterien perusteell js olioita
module.exports = mongoose.model("Person", personSchema);
