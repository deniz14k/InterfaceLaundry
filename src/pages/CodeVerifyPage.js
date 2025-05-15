import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { Box, Input, Button, useToast, Heading, Text } from '@chakra-ui/react';
import { AuthContext } from '../contexts/authContext';
import { verifyOtp } from '../services/otpService';

export default function CodeVerifyPage() {
  const { state } = useLocation();          // phone passed from prev page
  const [code, setCode] = useState('');
  const { login } = useContext(AuthContext);
  const toast = useToast();
  const nav = useNavigate();

  const handleVerify = async () => {
    try {
      const { token } = await verifyOtp(state.phone, code);
      login(token);                         // stores JWT
      toast({ status: 'success', title: 'Signed in' });
      nav('/my-orders');
    } catch (e) {
      toast({ status: 'error', title: e.message });
    }
  };

  if (!state?.phone) return <Text>Phone missing</Text>;

  return (
    <Box maxW="sm" mx="auto" mt={24} p={6} borderWidth="1px" borderRadius="md">
      <Heading size="md" mb={4}>Enter code</Heading>
      <Input placeholder="123456" value={code}
             onChange={e=>setCode(e.target.value)} mb={3}/>
      <Button colorScheme="teal" width="full" onClick={handleVerify}>
        Verify
      </Button>
    </Box>
  );
}
