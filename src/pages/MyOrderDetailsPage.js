// src/pages/MyOrderDetailsPage.js
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Button
} from '@chakra-ui/react';

export default function MyOrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://localhost:7223/api/orders/my/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(r => {
      if (!r.ok) throw new Error('Not found');
      return r.json();
    })
    .then(setOrder)
    .catch(() => navigate('/my-orders'));
  }, [id, navigate]);

  if (!order) return <Text>Loading…</Text>;

  return (
    <Box p={6}>
      <Button mb={4} onClick={() => navigate(-1)}>← Back</Button>
      <Heading size="lg" mb={2}>Order #{order.id}</Heading>
      <Text>Status: {order.status}</Text>
      <Text>Received: {new Date(order.receivedDate).toLocaleDateString()}</Text>
      {order.completedDate && (
        <Text>Completed: {new Date(order.completedDate).toLocaleDateString()}</Text>
      )}
      {order.serviceType === 'PickupDelivery' && (
        <Text>Address: {order.deliveryAddress}</Text>
      )}
      {order.observation && <Text>Notes: {order.observation}</Text>}

      <Heading size="md" mt={6} mb={2}>Items</Heading>
      <Table variant="simple">
        <Thead><Tr><Th>Type</Th><Th>Dimensions</Th><Th>Price</Th></Tr></Thead>
        <Tbody>
          {order.items.map(item => (
            <Tr key={item.id}>
              <Td>{item.type}</Td>
              <Td>
                {item.length && item.width
                  ? `${item.length}×${item.width}`
                  : '—'}
              </Td>
              <Td>{item.price} RON</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Heading size="md" mt={4}>
        Total: {order.items.reduce((sum, i) => sum + i.price, 0)} RON
      </Heading>
    </Box>
  );
}
