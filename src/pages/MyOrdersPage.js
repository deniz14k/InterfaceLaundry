// src/pages/MyOrdersPage.js
import { useEffect, useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Heading, Box } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://localhost:7223/api/orders/my', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(r => r.json())
    .then(setOrders);
  }, []);

  return (
    <Box p={6}>
      <Heading mb={4}>My Orders</Heading>
      <Table variant="striped" cursor="pointer">
        <Thead>
          <Tr>
            <Th>Order ID</Th>
            <Th>Status</Th>
            <Th>Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map(o => (
            <Tr
              key={o.id}
              onClick={() => navigate(`/my-orders/${o.id}`)}
              _hover={{ bg: 'gray.100' }}
            >
              <Td>#{o.id}</Td>
              <Td>{o.status}</Td>
              <Td>{o.items.reduce((sum, i) => sum + i.price, 0)}</Td>
            </Tr>
          ))}
          {orders.length === 0 && (
            <Tr><Td colSpan={3}><em>No orders found</em></Td></Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
