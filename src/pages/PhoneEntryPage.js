import { useState } from 'react';
import { Box, Input, Button, useToast, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { sendOtp } from '../services/otpService';

export default function PhoneEntryPage() {
  const [phone, setPhone] = useState('');
  const toast = useToast();
  const nav = useNavigate();

  const handleSend = async () => {
    try {
      await sendOtp(phone);
      toast({ status: 'success', title: 'Code sent!' });
      nav('/verify-code', { state: { phone } });
    } catch (e) {
      toast({ status: 'error', title: e.message });
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={24} p={6} borderWidth="1px" borderRadius="md">
      <Heading size="md" mb={4}>Phone sign-in</Heading>
      <Input placeholder="+40740012345"
             value={phone} onChange={e=>setPhone(e.target.value)} mb={3}/>
      <Button colorScheme="teal" width="full" onClick={handleSend}>
        Send code
      </Button>
    </Box>
  );
}
