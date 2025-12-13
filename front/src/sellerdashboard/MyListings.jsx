import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "./Dashboard";
import { toast } from "react-toastify";
import "./MyListings.css";

export default function MyListings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    // --------------------------------------------------
    // LOAD SELLER LISTINGS
    // --------------------------------------------------
    const loadListings = async () => {
        try {
            const res = await fetch(
                "http://localhost:5000/api/listings/seller/me",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const data = await res.json();
            if (data.success) {
                setListings(data.listings);
            }
        } catch {
            toast.error("Erreur chargement annonces");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadListings();
    }, []);

    // --------------------------------------------------
    // DELETE LISTING (TOAST CONFIRM)
    // --------------------------------------------------
    const handleDelete = (id) => {
        toast.info(
            <div>
                <p style={{ marginBottom: 8 }}>
                    ⚠️ Supprimer définitivement cette annonce ?
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        className="btn danger small"
                        onClick={async () => {
                            try {
                                const res = await fetch(
                                    `http://localhost:5000/api/listings/${id}`,
                                    {
                                        method: "DELETE",
                                        headers: {
                                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                                        },
                                    }
                                );

                                const data = await res.json();
                                if (!data.success) throw new Error();

                                setListings((prev) =>
                                    prev.filter((l) => l._id !== id)
                                );

                                toast.dismiss();
                                toast.success("Annonce supprimée");
                            } catch {
                                toast.error("Suppression échouée");
                            }
                        }}
                    >
                        Confirmer
                    </button>

                    <button
                        className="btn secondary small"
                        onClick={() => toast.dismiss()}
                    >
                        Annuler
                    </button>
                </div>
            </div>,
            { autoClose: false }
        );
    };

    if (loading) return <p>Chargement...</p>;

    return (
        <DashboardLayout>
            <h1>My Listings</h1>

            {listings.length === 0 ? (
                <p>Aucune annonce</p>
            ) : (
                <div className="table-wrapper">
                    <table className="listings-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Titre</th>
                                <th>Prix</th>
                                <th>Statut</th>
                                <th>Vues</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {listings.map((listing) => {
                                const isAvailable = listing.status === "available";

                                return (
                                    <tr key={listing._id}>
                                        <td>
                                            {listing.images?.[0] ? (
                                                <img
                                                    src={`http://localhost:5000${listing.images[0]}`}
                                                    alt=""
                                                    className="listing-thumb"
                                                />
                                            ) : (
                                                <div className="no-thumb">—</div>
                                            )}
                                        </td>

                                        <td>{listing.title}</td>

                                        <td>
                                            <strong>{listing.price} TND</strong>
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${listing.status}`}
                                            >
                                                {listing.status}
                                            </span>
                                        </td>

                                        <td>{listing.views}</td>

                                        <td>
                                            <div className="actions">
                                                <Link
                                                    to={`/dashboard/listings/${listing._id}/edit`}
                                                    className="btn primary small"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    className="btn danger small"
                                                    disabled={!isAvailable}
                                                    onClick={() => handleDelete(listing._id)}
                                                    title={
                                                        !isAvailable
                                                            ? "Impossible de supprimer une annonce vendue"
                                                            : ""
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}
