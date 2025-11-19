import React from "react";
import "./Panier.css";

export default function Panier({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="mini-panier-item">
      <img src={item.product.images?.[0]} alt={item.product.title} />
      <div>
        <h4>{item.product.title}</h4>
        <p>{item.price} TND</p>
        <div>
          <button onClick={() => onDecrease(item.product._id)}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => onIncrease(item.product._id)}>+</button>
          <button onClick={() => onRemove(item.product._id)}>Remove</button>
        </div>
      </div>
    </div>
  );
}
