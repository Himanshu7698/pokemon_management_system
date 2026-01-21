const Pokemon = require("../database/models/pokemon");
const Ability = require("../database/models/Ability");
const { createPokemonSchema } = require("../validation/index");

// Main-api
exports.getPokemonList = async (req, res) => {
    try {
        const { search } = req.query;

        if (!search) {
            const list = await Pokemon.find()
                .select("name image status")
                .sort({ name: 1 });

            return res.json({
                type: "list",
                data: list
            });
        }

        const searchText = search.trim();

        const exactPokemon = await Pokemon.findOne({
            name: { $regex: `^${searchText}$`, $options: "i" }
        }).lean();

        if (exactPokemon) {
            const abilities = await Ability.find({
                pokemonId: exactPokemon._id
            });

            return res.json({
                type: "detail",
                data: {
                    ...exactPokemon,
                    abilities
                }
            });
        }

        const list = await Pokemon.find({
            name: { $regex: searchText, $options: "i" }
        })
            .select("name image status")
            .sort({ name: 1 });

        if (!list.length) {
            return res.status(404).json({
                message: "Pokemon not found"
            });
        }

        return res.json({
            type: "list",
            data: list
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createPokemonWithAbilities = async (req, res) => {
    try {
        const { name, abilities } = req.body;

        // 1. Check pokemon exists
        const exists = await Pokemon.findOne({
            name: new RegExp(`^${name}$`, "i")
        });

        if (exists) {
            return res.status(400).json({
                message: "Pokemon already exists"
            });
        }

        // 2. Create pokemon
        const pokemon = await Pokemon.create({
            name,
            image: req.file ? req.file.filename : "",
        });

        // 3. Parse abilities
        let parsedAbilities = [];
        if (abilities) {
            parsedAbilities = JSON.parse(abilities);
        }

        if (!Array.isArray(parsedAbilities) || parsedAbilities.length === 0) {
            return res.status(201).json({
                message: "Pokemon created (no abilities)",
                data: { pokemon, abilities: [] }
            });
        }

        // 4. Remove duplicate abilities (case-insensitive)
        const uniqueMap = new Map();

        parsedAbilities.forEach(ab => {
            const key = ab.ability.toLowerCase().trim();
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, ab);
            }
        });

        const uniqueAbilities = Array.from(uniqueMap.values());

        // 5. Insert abilities
        const createdAbilities = await Ability.insertMany(
            uniqueAbilities.map(ab => ({
                pokemonId: pokemon._id,
                ability: ab.ability,
                type: ab.type,
                damage: Number(ab.damage),
            }))
        );

        return res.status(201).json({
            message: "Pokemon and abilities created successfully",
            data: {
                pokemon,
                abilities: createdAbilities,
            },
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


// Create Pokemon
exports.createPokemon = async (req, res) => {
    try {
        const { error, value } = createPokemonSchema.validate(req.body);
        if (error)
            return res.status(400).json({ message: error.message });

        const name = value.name.toLowerCase();

        const existingPokemon = await Pokemon.findOne({ name });
        if (existingPokemon) {
            return res.status(409).json({
                message: "Pokemon with this name already exists"
            });
        }

        const pokemon = await Pokemon.create({
            ...value,
            name,
            image: req.file ? req.file.filename : ""
        });

        res.status(201).json({
            message: "Pokemon created",
            pokemon
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all Pokemon
exports.getAllPokemon = async (req, res) => {
    const data = await Pokemon.find();
    res.json(data);
};

// Get Pokemon by name (Search API)
exports.getPokemonByName = async (req, res) => {
    const { name } = req.params;

    const pokemon = await Pokemon.findOne({
        name: { $regex: `^${name}$`, $options: "i" }
    }).lean();

    if (!pokemon)
        return res.status(404).json({ message: "Pokemon not found" });

    const abilities = await Ability.find({ pokemonId: pokemon._id });

    res.json({ ...pokemon, abilities });
};


// Update Pokemon
exports.updatePokemon = async (req, res) => {
    const pokemon = await Pokemon.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    if (!pokemon)
        return res.status(404).json({ message: "Pokemon not found" });

    res.json({ message: "Pokemon updated", pokemon });
};

// Delete Pokemon
exports.deletePokemon = async (req, res) => {
    await Ability.deleteMany({ pokemonId: req.params.id });
    await Pokemon.findByIdAndDelete(req.params.id);

    res.json({ message: "Pokemon deleted" });
};



