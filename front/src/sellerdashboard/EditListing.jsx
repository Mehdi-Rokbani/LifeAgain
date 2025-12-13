import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "./Dashboard";
import { toast } from "react-toastify";
import "./EditListing.css";

export default function EditListing() {
    const { id } = useParams();

    const [listing, setListing] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const isEditable = listing?.status === "available";

    // --------------------------------------------------
    // LOAD DATA
    // --------------------------------------------------
    useEffect(() => {
        const load = async () => {
            try {
                const l = await fetch(`http://localhost:5000/api/listings/${id}`);
                const listingData = await l.json();

                const i = await fetch(`http://localhost:5000/api/listings/listing/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                const imageData = await i.json();

                if (listingData.success) setListing(listingData.listing);
                if (imageData.success) setImages(imageData.images);
            } catch {
                toast.error("Erreur de chargement");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    // --------------------------------------------------
    // UPDATE FIELD
    // --------------------------------------------------
    const updateField = async (field, value) => {
        await fetch(`http://localhost:5000/api/listings/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ [field]: value }),
        });

        toast.success("Modification enregistrée");
    };

    // --------------------------------------------------
    // COVER IMAGE
    // --------------------------------------------------
    const updateCover = async (file) => {
        const formData = new FormData();
        formData.append("cover", file);

        const res = await fetch(`http://localhost:5000/api/listings/${id}/images/cover`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: formData,
        });

        const data = await res.json();
        if (data.success) {
            toast.success("Image de couverture mise à jour");
            window.location.reload();
        }
    };

    // --------------------------------------------------
    // ADD IMAGES
    // --------------------------------------------------
    const addImages = async (files) => {
        const formData = new FormData();
        [...files].forEach(f => formData.append("photos", f));

        const res = await fetch(`http://localhost:5000/api/listings/${id}/images`, {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: formData,
        });

        const data = await res.json();
        if (data.success) {
            toast.success("Images ajoutées");
            window.location.reload();
        }
    };

    // --------------------------------------------------
    // DELETE IMAGE
    // --------------------------------------------------
    const deleteImage = async (imageId) => {
        toast.info(
            <div>
                Supprimer cette image ?
                <div style={{ marginTop: 8 }}>
                    <button
                        className="btn danger small"
                        onClick={async () => {
                            await fetch(
                                `http://localhost:5000/api/listings/${id}/images/${imageId}`,
                                {
                                    method: "DELETE",
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                    },
                                }
                            );
                            toast.dismiss();
                            toast.success("Image supprimée");
                            setImages(images.filter(img => img._id !== imageId));
                        }}
                    >
                        Confirmer
                    </button>
                </div>
            </div>,
            { autoClose: false }
        );
    };

    if (loading || !listing) return <p>Chargement...</p>;

    const cover = images.find(i => i.isCover);
    const others = images.filter(i => !i.isCover);

    return (
        <DashboardLayout>
            <h1>Edit Listing</h1>

            {/* INFO CARD */}
            <div className="card">
                <label>Titre</label>
                <input
                    defaultValue={listing.title}
                    disabled={!isEditable}
                    onBlur={e => updateField("title", e.target.value)}
                />

                <label>Prix (TND)</label>
                <input
                    type="number"
                    defaultValue={listing.price}
                    disabled={!isEditable}
                    onBlur={e => updateField("price", e.target.value)}
                />

                <label>Description</label>
                <textarea
                    defaultValue={listing.description}
                    disabled={!isEditable}
                    onBlur={e => updateField("description", e.target.value)}
                />
            </div>

            {/* COVER */}
            <div className="card">
                <h3>Image de couverture</h3>

                {cover && (
                    <img
                        src={`http://localhost:5000${cover.url}`}
                        className="cover-image"
                    />
                )}

                <label className={`btn secondary ${!isEditable && "disabled"}`}>
                    Changer la couverture
                    <input
                        type="file"
                        hidden
                        disabled={!isEditable}
                        onChange={e => updateCover(e.target.files[0])}
                    />
                </label>
            </div>

            {/* GALLERY */}
            <div className="card">
                <h3>Images supplémentaires</h3>

                <div className="image-grid">
                    {others.map(img => (
                        <div key={img._id} className="image-card">
                            <img src={`http://localhost:5000${img.url}`} />
                            <button
                                className="btn danger small"
                                disabled={!isEditable}
                                onClick={() => deleteImage(img._id)}
                            >
                                Supprimer
                            </button>
                        </div>
                    ))}
                </div>

                <label className={`btn primary ${!isEditable && "disabled"}`}>
                    Ajouter des images
                    <input
                        type="file"
                        hidden
                        multiple
                        disabled={!isEditable}
                        onChange={e => addImages(e.target.files)}
                    />
                </label>
            </div>

            {!isEditable && (
                <p className="locked-info">
                    🔒 Cette annonce est <strong>{listing.status}</strong> — modification désactivée
                </p>
            )}
        </DashboardLayout>
    );
}
