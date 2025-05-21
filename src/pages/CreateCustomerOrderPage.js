// src/pages/CreateCustomerOrderPage.js
import React, { useState, useContext } from 'react';
import { createOrder }           from '../services/ordersService';
import { AuthContext }           from '../contexts/authContext';  // lowercase a
import { useNavigate }           from 'react-router-dom';

export default function CreateCustomerOrderPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [serviceType, setServiceType]     = useState('Office');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [observation, setObservation]     = useState('');
  const [items, setItems] = useState([
    { type: 'Carpet', length: '', width: '' }
  ]);

  const handleItemChange = (idx, field, val) => {
    const next = [...items];
    next[idx][field] = val;
    setItems(next);
  };

  const handleAddItem = () =>
    setItems([...items, { type: 'Carpet', length: '', width: '' }]);

  const handleRemoveItem = (idx) =>
    setItems(items.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedItems = items.map((it) => ({
      type: it.type,
      length: it.type === 'Carpet' ? parseFloat(it.length) : null,
      width:  it.type === 'Carpet' ? parseFloat(it.width)  : null,
    }));

    // Build payload using user.sub and user.phone from JWT
    const newOrder = {
      customerId:      user.sub,
      telephoneNumber: user.phone,
      serviceType,
      deliveryAddress: serviceType === 'PickupDelivery'
                        ? deliveryAddress
                        : null,
      observation,
      status: 'Pending',
      items: formattedItems,
    };

    try {
      await createOrder(newOrder);
      alert('Order created!');
      navigate('/my-orders');
    } catch (err) {
      console.error(err);
      alert('Failed to create order.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Order</h2>

      <label>
        Service Type
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
        >
          <option value="Office">Office</option>
          <option value="PickupDelivery">Pickup & Delivery</option>
        </select>
      </label>

      {serviceType === 'PickupDelivery' && (
        <label>
          Delivery Address
          <input
            type="text"
            placeholder="Address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
          />
        </label>
      )}

      <label>
        Observation (optional)
        <textarea
          placeholder="Notes…"
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
        />
      </label>

      <h4>Items</h4>
      {items.map((item, idx) => (
        <div key={idx}>
          <select
            value={item.type}
            onChange={(e) =>
              handleItemChange(idx, 'type', e.target.value)
            }
          >
            <option value="Carpet">Carpet</option>
            <option value="Blanket">Blanket</option>
          </select>

          {item.type === 'Carpet' && (
            <>
              <input
                type="number"
                placeholder="Length"
                value={item.length}
                onChange={(e) =>
                  handleItemChange(idx, 'length', e.target.value)
                }
                required
              />
              <input
                type="number"
                placeholder="Width"
                value={item.width}
                onChange={(e) =>
                  handleItemChange(idx, 'width', e.target.value)
                }
                required
              />
            </>
          )}

          <button
            type="button"
            onClick={() => handleRemoveItem(idx)}
          >
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={handleAddItem}>
        Add Item
      </button>

      <br/><br/>
      <button type="submit">Create Order</button>
    </form>
  );
}
