import React, { useEffect, useState } from 'react';
import { getAllOrders, getFilteredOrders, deleteOrder } from '../services/ordersService';
import { useNavigate } from 'react-router-dom';
import OrderFilters from '../OrderFilters';
import {
  Box,
  Heading,
  Button,
  Checkbox,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,     // Chakra's toast notification
} from '@chakra-ui/react';



function OrdersPage() {



  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const navigate = useNavigate();
  const toast = useToast(); // For showing success/error messages

  // Load orders
  const loadOrders = () => {
    getAllOrders()
      .then(setOrders)
      .catch(console.error);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter callback
  const handleFilter = (filters) => {
    getFilteredOrders(filters)
      .then(setOrders)
      .catch(() => toast({ status: 'error', title: 'Failed to filter orders' }));
    setSelectedOrders([]);
  };

  // Toggle selection for individual order
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Select / Deselect all currently visible orders
  const toggleSelectAll = () => {
    const allVisibleIds = orders.map((o) => o.id);
    const allSelected = allVisibleIds.every((id) => selectedOrders.includes(id));

    if (allSelected) {
      setSelectedOrders((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedOrders((prev) => [...new Set([...prev, ...allVisibleIds])]);
    }
  };

  // Bulk update
  const handleBulkUpdate = () => {
    if (!newStatus || selectedOrders.length === 0) {
      toast({ status: 'warning', title: 'Select a status and orders first' });
      return;
    }

    const updates = selectedOrders.map((id) => ({
      id,
      status: newStatus,
    }));

    const token = localStorage.getItem('token');

    fetch(`https://localhost:7223/api/orders/bulk-update`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(updates),
      })

      .then((res) => {
        if (!res.ok) throw new Error('Bulk update failed');
        return res.text();
      })
      .then(() => {
        toast({ status: 'success', title: 'Status updated!' });
        setSelectedOrders([]);
        setNewStatus('');
        loadOrders();
      })
      .catch((err) => toast({ status: 'error', title: err.message }));
  };

  return (

    
    
    <Box p={6}>
      <Heading as="h2" size="lg" mb={4}>
        🧺 All Orders
      </Heading>

      

      {/* New Order Button */}
      <Button colorScheme="teal" onClick={() => navigate('/create')} mb={4}>
        + New Order
      </Button>

      

      {/* Filter Section */}
      <OrderFilters onFilter={handleFilter} />

      {/* Bulk Update Controls */}
      <Box display="flex" alignItems="center" mt={4}>
        <Checkbox
          isChecked={
            orders.length > 0 &&
            orders.every((o) => selectedOrders.includes(o.id))
          }
          onChange={toggleSelectAll}
        >
          Select All
        </Checkbox>

        <Select
          placeholder="-- Set Status --"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          width="150px"
          ml={4}
        >
          <option value="Pending">Pending</option>
          <option value="Ready">Ready</option>
        </Select>

        <Button colorScheme="blue" ml={4} onClick={handleBulkUpdate}>
          Update Status
        </Button>
      </Box>

      {/* Orders Table */}
      <Table variant="striped" colorScheme="gray" mt={6}>
        
        <Thead>
          <Tr>
            <Th></Th>
            <Th>Order ID</Th>
            <Th>Customer ID</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((order) => (
            <Tr key={order.id}>
              <Td>
                <Checkbox
                  isChecked={selectedOrders.includes(order.id)}
                  onChange={() => toggleOrderSelection(order.id)}
                />
              </Td>
              <Td>#{order.id}</Td>
              <Td>{order.customerId}</Td>
              <Td>{order.status}</Td>
              <Td>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => navigate(`/order/${order.id}`)}
                  mr={2}
                >
                  Details
                </Button>
                <Button
                  size="sm"
                  colorScheme="yellow"
                  onClick={() => navigate(`/edit/${order.id}`)}
                  mr={2}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => {
                    if (window.confirm('Delete this order?')) {
                      deleteOrder(order.id).then(loadOrders);
                    }
                  }}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
          {orders.length === 0 && (
            <Tr>
              <Td colSpan={5}>
                <em>No orders found</em>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
}

export default OrdersPage;
