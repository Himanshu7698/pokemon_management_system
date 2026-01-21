const Ability = require("../database/models/Ability");
const { createAbilitySchema } = require("../validation/index");

exports.createAbility = async (req, res) => {
    try {
        const { error, value } = createAbilitySchema.validate(req.body);
        if (error)
            return res.status(400).json({ message: error.message });

        const abilityName = value.ability.toLowerCase();

        const exists = await Ability.findOne({
            pokemonId: value.pokemonId,
            ability: abilityName,
        });

        if (exists) {
            return res.status(409).json({
                message: "This ability already exists for this Pokemon"
            });
        }

        const ability = await Ability.create({
            ...value,
            ability: abilityName,
        });

        res.status(201).json({
            message: "Ability created",
            ability
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: "This ability already exists for this Pokemon"
            });
        }
        res.status(500).json({ message: err.message });
    }
};

exports.getAbilitiesByPokemon = async (req, res) => {
    const abilities = await Ability.find({ pokemonId: req.params.pokemonId });
    res.json(abilities);
};

exports.deleteAbility = async (req, res) => {
    await Ability.findByIdAndDelete(req.params.id);
    res.json({ message: "Ability deleted" });
};
