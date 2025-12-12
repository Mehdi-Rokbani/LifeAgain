import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "./Dashboard";
import React from "react";
export default function MyListings() {
    const [listings, setListings] = useState([]);

    useEffect(() => {
        const fetchListings = async () => {
            const res = await fetch("http://localhost:5000/api/listings/seller/me", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            const data = await res.json();
            if (data.success) setListings(data.listings);
        };

        fetchListings();
    }, []);

    return (
        <DashboardLayout>
            <h1>My Listings</h1>

            <table className="listings-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {listings.map(listing => (
                        <tr key={listing._id}>
                            <td>
                                <img
                                    src={`http://localhost:5000${listing.images[0]}`}
                                    className="thumb"
                                />
                            </td>

                            <td>{listing.title}</td>
                            <td>{listing.price} TND</td>
                            <td>{listing.status}</td>
                            <td>{listing.views}</td>

                            <td>
                                <Link to={`/dashboard/listings/${listing._id}/edit`} className="btn">
                                    Edit
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DashboardLayout>
    );
}
