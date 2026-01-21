const mongoose = require("mongoose");

const pokemonSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        image: { type: String, default: "" },
        status: { type: String, default: "active" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Pokemon", pokemonSchema);
