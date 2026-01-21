const express = require('express');
const route = express.Router();
const upload = require("../middleware/upload");
const { deletePokemon, updatePokemon, getPokemonByName, getAllPokemon, createPokemon, getPokemonList, createPokemonWithAbilities } = require('../controllers/pokemonController');
const { createAbility, getAbilitiesByPokemon, deleteAbility } = require('../controllers/abilityController');

// This is main api create and listing
route.get("/list", getPokemonList);
route.post("/pokemon-with-ability", upload.single("image"), createPokemonWithAbilities);

// This is table through manage
// Pokemon
route.post("/pokemon", upload.single("image"), createPokemon);
route.get("/pokemon", getAllPokemon);
route.get("/pokemon/:name", getPokemonByName);
route.put("/pokemon/:id", updatePokemon);
route.delete("/pokemon/:id", deletePokemon);

// Ability
route.post("/ability", createAbility);
route.get("/ability/:pokemonId", getAbilitiesByPokemon);
route.delete("/ability/:id", deleteAbility);

module.exports = route;