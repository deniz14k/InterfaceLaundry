// src/pages/CodeVerifyPage.js
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/authContext';
import { verifyOtp }   from '../services/otpService';
import {
  Box,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  Text,
  useToast,
} from '@chakra-ui/react';

export default function CodeVerifyPage() {
  const { state }    = useLocation();
  const phone        = state?.phone;            // ← this must come from PhoneEntryPage
  const { login }    = useContext(AuthContext);
  const navigate     = useNavigate();
  const toast        = useToast();

  const [code, setCode] = useState('');
  // load any previously saved name so we only ask once
  const nameKey         = `otp_name_${phone}`;
  const savedName       = localStorage.getItem(nameKey) || '';
  const [name, setName] = useState(savedName);
  const needsName       = !savedName;

  useEffect(() => {
    if (!phone) {
      // if someone hits /verify-code directly
      navigate('/phone-login');
    }
  }, [phone, navigate]);

  const handleVerify = async () => {
    if (needsName && !name.trim()) {
      toast({ status: 'warning', title: 'Please enter your name' });
      return;
    }
    try {
      const { token } = await verifyOtp(phone, code, name);
      // store name so we never ask again
      if (needsName) localStorage.setItem(nameKey, name);
      login(token);
      toast({ status: 'success', title: `Welcome, ${name}!` });
      navigate('/my-orders');
    } catch (err) {
      toast({ status: 'error', title: err.message });
    }
  };

  if (!phone) return null; // redirecting above

  return (
    <Box maxW="sm" mx="auto" mt={12} p={6} borderWidth="1px" borderRadius="md">
      <Heading size="md" mb={4}>Verify Code</Heading>

      <FormControl mb={4} isRequired>
        <FormLabel>6-digit Code</FormLabel>
        <Input
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </FormControl>

      {needsName ? (
        <FormControl mb={4} isRequired>
          <FormLabel>Your Name</FormLabel>
          <Input
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>
      ) : (
        <Text mb={4}>
          Welcome back, <strong>{savedName}</strong>!
        </Text>
      )}

      <Button colorScheme="teal" width="full" onClick={handleVerify}>
        Verify &amp; Sign In
      </Button>
    </Box>
  );
}
