import React, { useEffect, useState, useMemo } from "react";
import { usePanier } from "../../context/PanierContext";
import { useNavigate } from "react-router-dom";
import { useAddress } from "../../hooks/useAddress";
import commandeService from "../../services/commandeService";
import { toast } from "react-toastify";
import Header from "../../components/Header";
import "./Checkout.css";

const Checkout = () => {
    const { panier, totalPrice, itemCount, loadPanier } = usePanier();
    const { getAddresses } = useAddress();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState("");

    const [billingDetails, setBillingDetails] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
    });

    const [loading, setLoading] = useState(false);

    // --------------------------------------------------
    // LOAD USER ADDRESSES
    // --------------------------------------------------
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await getAddresses();
                setAddresses(Array.isArray(res) ? res : []);
            } catch {
                setAddresses([]);
            }
        };

        fetchAddresses();
    }, []);

    // --------------------------------------------------
    // WARN IF PANIER AUTO-CLEANED
    // --------------------------------------------------
    useEffect(() => {
        if (panier && panier.items?.length === 0) {
            toast.info("Some items were removed because they are no longer available");
        }
    }, [panier]);

    // --------------------------------------------------
    // BILLING INPUT CHANGE
    // --------------------------------------------------
    const handleBillingChange = (e) => {
        const { name, value } = e.target;
        setBillingDetails((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // --------------------------------------------------
    // CHECK IF CHECKOUT IS POSSIBLE
    // --------------------------------------------------
    const canCheckout = useMemo(() => {
        return panier && panier.items && panier.items.length > 0;
    }, [panier]);

    // --------------------------------------------------
    // SUBMIT ORDER
    // --------------------------------------------------
    const handleSubmit = async () => {
        if (!canCheckout) {
            toast.error("Your cart is empty or invalid");
            return;
        }

        const selectedAddr = addresses.find((a) => a._id === selectedAddress);

        if (!selectedAddr) {
            toast.error("Please select a delivery address");
            return;
        }

        if (
            !billingDetails.firstName ||
            !billingDetails.lastName ||
            !billingDetails.phone ||
            !billingDetails.email
        ) {
            toast.error("Billing details incomplete");
            return;
        }

        const billingToSend = {
            firstName: billingDetails.firstName,
            lastName: billingDetails.lastName,
            phone: billingDetails.phone,
            email: billingDetails.email,
            streetAddress: selectedAddr.street,
            city: selectedAddr.city,
            zipCode: String(selectedAddr.postalCode),
            country: selectedAddr.country || "Tunisia",
        };

        setLoading(true);

        try {
            await commandeService.createCommandeFromPanier(
                billingToSend,
                "cash"
            );

            await loadPanier();

            toast.success("Order placed successfully 🎉");
            setTimeout(() => navigate("/shop"), 1500);

        } catch (err) {
            toast.error(err?.message || "Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // EMPTY CART STATE
    // --------------------------------------------------
    if (!panier || itemCount === 0) {
        return (
            <div className="checkout-empty">
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate("/shop")}>Go to shop</button>
            </div>
        );
    }

    // --------------------------------------------------
    // UI
    // --------------------------------------------------
    return (
        <>
            <Header></Header>
            <div className="checkout-page">
                <h1 className="checkout-title">Checkout</h1>

                <div className="checkout-container">
                    {/* BILLING */}
                    <div className="billing-section">
                        <h2>Billing details</h2>

                        <input
                            name="firstName"
                            placeholder="First name"
                            value={billingDetails.firstName}
                            onChange={handleBillingChange}
                        />

                        <input
                            name="lastName"
                            placeholder="Last name"
                            value={billingDetails.lastName}
                            onChange={handleBillingChange}
                        />

                        <input
                            name="phone"
                            placeholder="Phone"
                            value={billingDetails.phone}
                            onChange={handleBillingChange}
                        />

                        <input
                            name="email"
                            placeholder="Email"
                            value={billingDetails.email}
                            onChange={handleBillingChange}
                        />

                        <h3>Delivery address</h3>
                        <select
                            value={selectedAddress}
                            onChange={(e) => setSelectedAddress(e.target.value)}
                        >
                            <option value="">Select address</option>
                            {addresses.map((addr) => (
                                <option key={addr._id} value={addr._id}>
                                    {addr.street}, {addr.city}, {addr.country}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SUMMARY */}
                    <div className="order-summary">
                        <h3>Order summary</h3>

                        {panier.items.map((item) => (
                            <div key={item._id} className="summary-item">
                                <span>
                                    {item.product?.title} × {item.quantity}
                                </span>
                                <span>
                                    {(item.price ?? item.product?.price ?? 0).toFixed(2)} TND
                                </span>
                            </div>
                        ))}

                        <div className="summary-total">
                            <strong>Total</strong>
                            <strong>{totalPrice.toFixed(2)} TND</strong>
                        </div>

                        <div className="payment-box">
                            <strong>Payment method</strong>
                            <p>💵 Cash on delivery</p>
                        </div>

                        <button
                            className="btn-place-order"
                            onClick={handleSubmit}
                            disabled={loading || !canCheckout}
                        >
                            {loading ? "Processing..." : "Place order"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;
