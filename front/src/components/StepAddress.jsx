import { useState } from "react";
import { tunisiaLocations } from "../data/tunisiaLocations";
import "../assets/styles/stepAddress.css";

export default function StepAddress({ next }) {
    const [street, setStreet] = useState("");
    const [postalCode, setPostalCode] = useState("");

    const [governorate, setGovernorate] = useState("");
    const [city, setCity] = useState("");

    const handleGovernorateChange = (e) => {
        setGovernorate(e.target.value);
        setCity(""); // reset city
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const addressData = {
            street,
            governorate,
            city,
            postalCode,
        };

        console.log("Address:", addressData);

        next();
    };

    return (
        <form onSubmit={handleSubmit} className="step-form">

            <h2 className="step-title">Add Your Address</h2>

            <input
                type="text"
                className="onboarding-input"
                placeholder="hayy (optional)"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
            />

            {/* Governorate */}
            <select
                className="onboarding-input"
                value={governorate}
                onChange={handleGovernorateChange}
            >
                <option value="">Select Wilaya</option>
                {Object.keys(tunisiaLocations).map((g) => (
                    <option key={g} value={g}>{g}</option>
                ))}
            </select>

            {/* City */}
            <select
                className="onboarding-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!governorate}
            >
                <option value="">
                    {governorate ? "Select motamdiaa" : "Select wilaya first"}
                </option>

                {governorate &&
                    tunisiaLocations[governorate].map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
            </select>

            {/* Postal code */}
            <input
                type="text"
                className="onboarding-input"
                placeholder="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
            />

            <button type="submit" className="onboarding-btn">Continue</button>
        </form>
    );
}
