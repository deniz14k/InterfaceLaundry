import { Flex, Spacer, Button, Text } from '@chakra-ui/react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/authContext';  // match your file’s casing
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Flex bg="gray.700" color="white" p={3} align="center">
      {/* App title */}
      <Text fontWeight="bold">🧺 Laundry App</Text>


      {/* Greet the customer by name */}
      {user?.role === 'Customer' && (
        <Text ml={4}>Hello, {user.name}!</Text>
      )}


      {/* Always available */}
      {!user && (
      <Button size="sm" variant="ghost" onClick={() => navigate('/phone-login')}>
        Phone OTP
      </Button>
            )}


      
      {user?.role === 'Customer' && (
        <Button
        size="sm"
        variant="ghost"
        onClick={() => navigate('/create-order')}
        >
        New Order
        </Button>
            )}


      {/* 👔 Staff-only “Orders” link */}
      {user && user.role !== 'Customer' && (
        <Button size="sm" variant="ghost" onClick={() => navigate('/')}>
          Orders
        </Button>
      )}

      {/* 👤 Customer-only “My Orders” link */}
      {user && user.role === 'Customer' && (
        <Button size="sm" variant="ghost" onClick={() => navigate('/my-orders')}>
          My Orders
        </Button>
      )}

      <Spacer />

      {/* Authentication controls */}
      {user ? (
        <>
          <Text mr={4}>{user.email}</Text>
          <Button
            size="sm"
            colorScheme="orange"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Log out
          </Button>
        </>
      ) : (
        <Button size="sm" onClick={() => navigate('/login')}>
          Sign in
        </Button>
      )}
    </Flex>
  );
}
