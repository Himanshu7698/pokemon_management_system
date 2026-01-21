import { useMutation, useQuery } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { createPockemonApi, PokemonListApi } from '../api';
import { toast } from 'sonner';

type AbilityForm = {
    ability: string;
    type: string;
    damage: string;
};

export default function Dashboard() {
    const [search, setSearch] = useState<string>("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);


    const [form, setForm] = useState({
        name: "",
        image: null as File | null,
        abilities: [
            { ability: "", type: "", damage: "" }
        ]
    });

    const { data, isLoading, refetch, isError } = useQuery({
        queryKey: ["listing-api", search],
        queryFn: PokemonListApi,
        enabled: false,
    });

    const response = data?.data;
    const isDetail = response?.type === "detail";
    const pokemon = response?.data;

    const handleSuggestionClick = (name: string) => {
        setSearch(name);
    };

    const { mutate } = useMutation({
        mutationKey: ["create-pockemon-with-ability"],
        mutationFn: createPockemonApi,
        onSuccess: (res: any) => {
            toast.success(res?.data?.message || "Pockemon create successfully");
            setShowCreateModal(false);
            resetForm();

        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create pockemon");
        }
    })

    const resetForm = () => {
        setForm({
            name: "",
            image: null,
            abilities: [{ ability: "", type: "", damage: "" }]
        });
    };

    const handleCreatePokemon = () => {
        if (!form.name.trim()) {
            toast.error("Pokemon name is required");
            return;
        }

        const formData = new FormData();
        formData.append("name", form.name);

        if (form.image) {
            formData.append("image", form.image);
        }

        const abilities = form.abilities.map(ab => ({
            ...ab,
            damage: Number(ab.damage)
        }));

        formData.append("abilities", JSON.stringify(abilities));

        mutate(formData);
    };


    const handleAbilityChange = (
        index: number,
        field: keyof AbilityForm,
        value: string
    ) => {
        const updated = [...form.abilities];
        updated[index][field] = value;
        setForm({ ...form, abilities: updated });
    };


    const addAbility = () => {
        setForm({
            ...form,
            abilities: [...form.abilities, { ability: "", type: "", damage: "" }]
        });
    };

    const removeAbility = (index: number) => {
        const updated = form.abilities.filter((_, i) => i !== index);
        setForm({ ...form, abilities: updated });
    };

    return (
        <Fragment>
            <div className="page-wrapper">
                <div className="container-fluid py-5">
                    <div className='custom-card rounded-4 align-items-center py-sm-5 py-3 px-sm-3 px-2'>
                        <h1 className="text-center mb-4 main-title fs-1" style={{ fontWeight: "800" }}>Aureate React Assignment Mockup</h1>
                        {/* Search Bar */}
                        <div className="row justify-content-center mb-1">
                            <div className="col-md-10 d-flex gap-2">
                                <input
                                    type="text"
                                    className="form-control custom-input shadow-sm"
                                    placeholder="Which pokemon?"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button
                                    className="btn btn-fetch"
                                    onClick={() => {
                                        if (search.trim()) {
                                            refetch();
                                        }
                                    }}
                                >
                                    Fetch!
                                </button>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="text-center mb-4">
                            <small className="text-muted">
                                Try{" "}
                                <span
                                    className="text-pink"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleSuggestionClick("Pikachu")}
                                >
                                    Pikachu
                                </span>
                                ,{" "}
                                <span
                                    className="text-pink"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleSuggestionClick("Charizard")}
                                >
                                    Charizard
                                </span>
                                , or{" "}
                                <span
                                    className="text-pink"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleSuggestionClick("Ninetales")}
                                >
                                    Ninetales
                                </span>
                                .
                            </small>
                        </div>

                        {/* Pokemon Card */}
                        <div className={`pokemon-card p-4 mx-auto ${response ? 'pokemon-card-filled ' : "pokemon-card-empty"}`}>
                            <h2 className="fw-bold mb-4">
                                {isLoading && `Loading ${search}...`}
                                {!isLoading && isDetail && pokemon.name}
                                {!isLoading && !isDetail && !isError && "No Pokemon Yet!"}
                                {isError && (
                                    <h2 className="fw-bold mb-2">
                                        Error! : <span className="text-muted">(xxx)</span>
                                    </h2>
                                )}
                                {!isError && (
                                    <span className="text-muted fs-5 ms-2">
                                        ({pokemon?.abilities?.length || 0})
                                    </span>
                                )}
                            </h2>

                            {/* Inner Image Box */}
                            <div className={`image-placeholder d-flex align-items-center justify-content-center mx-auto mb-4
                            ${response ? "pokemon-card-filled" : "pokemon-card-empty"
                                }
                            `}>
                                {isLoading && (
                                    <div className="loading-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                )}

                                {!isLoading && isDetail && (
                                    <div className='p-3 bg-white rounded-4'>
                                        <img
                                            src={`${import.meta.env.VITE_APP_API_Upload_URL}/uploads/${pokemon.image}`}
                                            alt={pokemon.name}
                                            className="img-fluid"
                                            style={{ cursor: "pointer" }}
                                            height="200px"
                                            width="200px"
                                            onClick={() => {
                                                setSelectedImage(`${import.meta.env.VITE_APP_API_Upload_URL}/uploads/${pokemon.image}`);
                                                setShowImageModal(true);
                                            }}
                                        />
                                    </div>
                                )}

                                {isError && (
                                    <div className="d-flex flex-column align-items-center px-3">
                                        <p className="mb-3 text-muted m-0">
                                            The pokemon <strong>"{search}"</strong> is not in the database.
                                        </p>

                                        <button
                                            className="btn btn-danger"
                                            onClick={() => refetch()}
                                            style={{ width: "100px" }}
                                        >
                                            Try again
                                        </button>

                                        <p className="small text-muted mt-3">
                                            This error was caught by the error boundary!
                                        </p>
                                    </div>
                                )}

                                {!isLoading && !isDetail && !isError && (
                                    <div className='d-flex flex-column'>
                                        <p className="text-muted mb-2">
                                            Please submit a<br />pokemon!
                                        </p>
                                        <div>
                                            <button
                                                className="btn btn-fetch mb-3"
                                                onClick={() => setShowCreateModal(true)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stats Table */}
                            <div className="stats-container mx-auto">
                                <div className={`row fw-bold text-dark border-bottom-pink pb-1 ${response ? 'pokemon-card-filled-ability' : 'pokemon-card-empty-ability'}`}>
                                    <div className="col">Ability</div>
                                    <div className="col">Type</div>
                                    <div className="col">Damage</div>
                                </div>

                                {!isLoading && isDetail && pokemon.abilities.map((ab: any) => (
                                    <div
                                        key={ab?._id}
                                        className={`row py-2 text-muted border-bottom-pink ${response ? 'pokemon-card-filled-ability' : 'pokemon-card-empty-ability'}`}
                                    >
                                        <div className="col">{ab?.ability}</div>
                                        <div className="col">{ab?.type}</div>
                                        <div className="col">{ab?.damage}</div>
                                    </div>
                                ))}

                                {!isLoading && !isDetail && (
                                    <div className={`row py-2 text-muted border-bottom-pink ${response ? 'pokemon-card-filled-ability' : 'pokemon-card-empty-ability'}`}>
                                        <div className="col">-</div>
                                        <div className="col">-</div>
                                        <div className="col">-</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content rounded-4">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Pokemon</h5>
                                <button className="btn-close" onClick={() => setShowCreateModal(false)} />
                            </div>

                            <div className="modal-body">
                                {/* Pokemon Name */}
                                <div className="mb-3">
                                    <label className="form-label">Pokemon Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder='Enter pockemon name'
                                    />
                                </div>

                                {/* Image */}
                                <div className="mb-3">
                                    <label className="form-label">Image</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        onChange={(e) =>
                                            setForm({ ...form, image: e.target.files?.[0] || null })
                                        }
                                    />
                                </div>

                                <hr />

                                {/* Abilities */}
                                <h6>Abilities</h6>
                                {form.abilities.map((ab, index) => (
                                    <div key={index} className="row g-2 mb-2 align-items-end">
                                        <div className="col">
                                            <input
                                                placeholder="Ability"
                                                className="form-control"
                                                value={ab.ability}
                                                onChange={(e) =>
                                                    handleAbilityChange(index, "ability", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="col">
                                            <input
                                                placeholder="Type"
                                                className="form-control"
                                                value={ab.type}
                                                onChange={(e) =>
                                                    handleAbilityChange(index, "type", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="col">
                                            <input
                                                type="number"
                                                placeholder="Damage"
                                                className="form-control"
                                                value={ab.damage}
                                                onChange={(e) =>
                                                    handleAbilityChange(index, "damage", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="col-auto">
                                            {form.abilities.length > 1 && (
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => removeAbility(index)}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <button className="btn btn-outline-primary mt-2" onClick={addAbility}>
                                    + Add Ability
                                </button>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="btn btn-success"
                                    onClick={handleCreatePokemon}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Show image */}
            {showImageModal && selectedImage && (
                <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.7)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 bg-transparent">
                            <div className="modal-body p-0 text-center">
                                <img
                                    src={selectedImage}
                                    alt="Pokemon"
                                    className="img-fluid rounded-4 shadow-lg"
                                    style={{ maxHeight: "80vh", objectFit: "contain" }}
                                />
                            </div>
                            <div className="modal-footer justify-content-center border-0 mt-0">
                                <button
                                    className="btn btn-light"
                                    onClick={() => setShowImageModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </Fragment>
    );
}