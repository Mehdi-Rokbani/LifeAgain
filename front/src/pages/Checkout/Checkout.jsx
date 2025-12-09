import React, { useState } from 'react';
import { usePanier } from '../../context/PanierContext';
import { useNavigate } from 'react-router-dom';
import commandeService from '../../services/commandeService'; // ← AJOUTE
import './Checkout.css';

const Checkout = () => {
    const { panier, totalPrice, itemCount, loadPanier } = usePanier();
    const navigate = useNavigate();
    const userId = "690fc01ccbb891b31ec1df69";

    const [billingDetails, setBillingDetails] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        country: 'Tunisia',
        streetAddress: '',
        city: '',
        province: '',
        zipCode: '',
        phone: '',
        email: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false); // ← AJOUTE

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBillingDetails(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!billingDetails.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!billingDetails.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!billingDetails.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
        if (!billingDetails.city.trim()) newErrors.city = 'Town / City is required';
        if (!billingDetails.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
        if (!billingDetails.phone.trim()) newErrors.phone = 'Phone is required';
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!billingDetails.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(billingDetails.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ⭐ FONCTION CORRIGÉE
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert('Please fill in all required fields');
            return;
        }

        if (itemCount === 0) {
            alert('Your cart is empty!');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('📦 Envoi de la commande...');
            console.log('Billing Details:', billingDetails);
            console.log('Payment Method:', paymentMethod);

            // ⭐ APPEL API POUR CRÉER LA COMMANDE
            const result = await commandeService.createCommandeFromPanier(
                userId,
                billingDetails,
                paymentMethod
            );

            console.log('✅ Commande créée:', result);

            // ⭐ RECHARGE LE PANIER (il sera vide maintenant)
            await loadPanier();

            // Affiche le succès avec le numéro de commande
            alert(`Order placed successfully! 🎉\n\nOrder Number: ${result.commande.orderNumber}\n\nThank you for your purchase!`);
            
            // Petit délai avant la redirection
            setTimeout(() => {
                navigate('/shop');
            }, 500);

        } catch (error) {
            console.error('❌ Erreur:', error);
            alert(`Error placing order: ${error.message || 'Something went wrong'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (itemCount === 0) {
        return (
            <div className="checkout-empty">
                <h2>Your cart is empty</h2>
                <p>Add some products before checking out</p>
                <button onClick={() => navigate('/shop')} className="btn-shop">
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-hero">
                <h1>Checkout</h1>
                <p className="breadcrumb">
                    <span>Home</span> &gt; <span>Checkout</span>
                </p>
            </div>

            <div className="checkout-container">
                <div className="billing-section">
                    <h2>Billing details</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={billingDetails.firstName}
                                    onChange={handleChange}
                                    className={errors.firstName ? 'error' : ''}
                                    disabled={isSubmitting}
                                />
                                {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
                            </div>
                            <div className="form-group">
                                <label>Last Name *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={billingDetails.lastName}
                                    onChange={handleChange}
                                    className={errors.lastName ? 'error' : ''}
                                    disabled={isSubmitting}
                                />
                                {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Company Name (Optional)</label>
                            <input
                                type="text"
                                name="companyName"
                                value={billingDetails.companyName}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label>Country / Region *</label>
                            <select
                                name="country"
                                value={billingDetails.country}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            >
                                <option value="Tunisia">Tunisia</option>
                                <option value="Algeria">Algeria</option>
                                <option value="Morocco">Morocco</option>
                                <option value="Libya">Libya</option>
                                <option value="Egypt">Egypt</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Street address *</label>
                            <input
                                type="text"
                                name="streetAddress"
                                value={billingDetails.streetAddress}
                                onChange={handleChange}
                                placeholder="House number and street name"
                                className={errors.streetAddress ? 'error' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.streetAddress && <span className="error-msg">{errors.streetAddress}</span>}
                        </div>

                        <div className="form-group">
                            <label>Town / City *</label>
                            <input
                                type="text"
                                name="city"
                                value={billingDetails.city}
                                onChange={handleChange}
                                className={errors.city ? 'error' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.city && <span className="error-msg">{errors.city}</span>}
                        </div>

                        <div className="form-group">
                            <label>Province</label>
                            <select
                                name="province"
                                value={billingDetails.province}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            >
                                <option value="">Select Province</option>
                                <option value="Tunis">Tunis</option>
                                <option value="Sfax">Sfax</option>
                                <option value="Sousse">Sousse</option>
                                <option value="Ariana">Ariana</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>ZIP code *</label>
                            <input
                                type="text"
                                name="zipCode"
                                value={billingDetails.zipCode}
                                onChange={handleChange}
                                className={errors.zipCode ? 'error' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.zipCode && <span className="error-msg">{errors.zipCode}</span>}
                        </div>

                        <div className="form-group">
                            <label>Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={billingDetails.phone}
                                onChange={handleChange}
                                className={errors.phone ? 'error' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.phone && <span className="error-msg">{errors.phone}</span>}
                        </div>

                        <div className="form-group">
                            <label>Email address *</label>
                            <input
                                type="email"
                                name="email"
                                value={billingDetails.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.email && <span className="error-msg">{errors.email}</span>}
                        </div>
                    </form>
                </div>

                <div className="order-summary">
                    <div className="summary-card">
                        <div className="summary-header">
                            <span>Product</span>
                            <span>Subtotal</span>
                        </div>

                        <div className="summary-items">
                            {panier?.items.map((item) => (
                                <div key={item._id} className="summary-item">
                                    <span className="item-name">
                                        {item.product?.title || 'Product'} × {item.quantity}
                                    </span>
                                    <span className="item-price">
                                        {(item.price * item.quantity).toFixed(2)} TND
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{totalPrice.toFixed(2)} TND</span>
                        </div>

                        <div className="summary-row total">
                            <span>Total</span>
                            <span className="total-price">{totalPrice.toFixed(2)} TND</span>
                        </div>

                        <div className="payment-methods">
                            <div className="payment-option">
                                <input
                                    type="radio"
                                    id="bank"
                                    name="payment"
                                    value="bank"
                                    checked={paymentMethod === 'bank'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="bank">
                                    <strong>Direct Bank Transfer</strong>
                                    <p>Make your payment directly into our bank account. Please use your Order ID as the payment reference.</p>
                                </label>
                            </div>

                            <div className="payment-option">
                                <input
                                    type="radio"
                                    id="cash"
                                    name="payment"
                                    value="cash"
                                    checked={paymentMethod === 'cash'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="cash">Cash On Delivery</label>
                            </div>
                        </div>

                        <p className="privacy-policy">
                            Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our <a href="/privacy">privacy policy</a>.
                        </p>

                        <button 
                            type="submit" 
                            className="btn-place-order"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : 'Place order'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="checkout-features">
                <div className="feature">
                    <span className="feature-icon">🏆</span>
                    <div>
                        <h4>High Quality</h4>
                        <p>Crafted from top materials</p>
                    </div>
                </div>
                <div className="feature">
                    <span className="feature-icon">✅</span>
                    <div>
                        <h4>Warranty Protection</h4>
                        <p>Over 2 years</p>
                    </div>
                </div>
                <div className="feature">
                    <span className="feature-icon">🚚</span>
                    <div>
                        <h4>Free Shipping</h4>
                        <p>Order over 150 $</p>
                    </div>
                </div>
                <div className="feature">
                    <span className="feature-icon">💬</span>
                    <div>
                        <h4>24 / 7 Support</h4>
                        <p>Dedicated support</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;