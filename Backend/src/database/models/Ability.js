const mongoose = require("mongoose");

const abilitySchema = new mongoose.Schema(
    {
        pokemonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pokemon",
            required: true,
        },
        ability: { type: String, required: true },
        type: { type: String },
        damage: { type: Number },
        status: { type: String, default: "active" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Ability", abilitySchema);
