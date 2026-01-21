const Joi = require("joi");

exports.createPokemonSchema = Joi.object({
    name: Joi.string().required(),
    image: Joi.string().allow(""),
    status: Joi.string().valid("active", "inactive"),
});

exports.createAbilitySchema = Joi.object({
    pokemonId: Joi.string().required(),
    ability: Joi.string().required(),
    type: Joi.string(),
    damage: Joi.number(),
    status: Joi.string().valid("active", "inactive"),
});
