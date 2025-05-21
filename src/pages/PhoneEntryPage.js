// src/pages/PhoneEntryPage.js
import { useState } from 'react';
import { sendOtp }   from '../services/otpService';
import { useNavigate } from 'react-router-dom';
import { Box, Input, Button, Heading, useToast } from '@chakra-ui/react';

export default function PhoneEntryPage() {
  const [phone, setPhone] = useState('');
  const navigate          = useNavigate();
  const toast             = useToast();

  const handleSend = async () => {
    try {
      await sendOtp(phone);
      toast({ status: 'success', title: 'Code sent!' });
      // pass the phone on to the next page
      navigate('/verify-code', { state: { phone } });
    } catch {
      toast({ status: 'error', title: 'Failed to send code' });
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={12} p={6} borderWidth="1px" borderRadius="md">
      <Heading size="md" mb={4}>Sign in with Phone</Heading>
      <Input
        mb={3}
        placeholder="+40740012345"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Button colorScheme="teal" width="full" onClick={handleSend}>
        Send Code
      </Button>
    </Box>
  );
}
