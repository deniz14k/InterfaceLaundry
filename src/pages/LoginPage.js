import { useState, useContext } from 'react';
import { AuthContext }       from '../contexts/authContext';  // lowercase a
import { useNavigate }       from 'react-router-dom';
import { jwtDecode }         from 'jwt-decode';
import {
  Box,
  Input,
  Button,
  Heading,
  useToast,
} from '@chakra-ui/react';

const API_BASE_URL = 'https://localhost:7223';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login }               = useContext(AuthContext);
  const toast                   = useToast();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/Account/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const { token } = await res.json();

      // store token in context + localStorage
      login(token);

      // decode the token to inspect the role claim
      const decoded = jwtDecode(token);
      const role = decoded[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];

      toast({ status: 'success', title: 'Signed in' });

      // redirect based on role
      if (role === 'Customer') {
        navigate('/my-orders');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast({ status: 'error', title: err.message });
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={20} p={6} borderWidth="1px" borderRadius="lg">
      <Heading size="md" mb={4}>Sign In</Heading>
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Email"
          mb={3}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          mb={3}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button colorScheme="teal" type="submit" width="full">
          Login
        </Button>
      </form>
    </Box>
  );
}
