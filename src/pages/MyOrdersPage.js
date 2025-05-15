import { useEffect, useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Heading } from '@chakra-ui/react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('https://localhost:7223/api/orders/my', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(setOrders);
  }, []);

  return (
    <>
      <Heading size="lg" mb={4}>My Orders</Heading>
      <Table variant="striped">
        <Thead><Tr><Th>ID</Th><Th>Status</Th><Th>Total</Th></Tr></Thead>
        <Tbody>
          {orders.map(o=>(
            <Tr key={o.id}>
              <Td>{o.id}</Td><Td>{o.status}</Td><Td>{o.totalPrice}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
}
