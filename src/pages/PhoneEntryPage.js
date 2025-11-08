"use client"

import { useState } from "react"
import { sendOtp } from "../services/otpService"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Input,
  Button,
  Heading,
  useToast,
  Card,
  CardBody,
  VStack,
  Text,
  useColorModeValue,
  Container,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  HStack,
  Divider,
} from "@chakra-ui/react"

export default function PhoneEntryPage() {
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  const handleSend = async () => {
    
    if (!phone.trim()) {
      toast({ status: "warning", title: "Please enter your phone number" })
      return
    }

    setLoading(true)
    try {
      await sendOtp(phone)
      toast({
        status: "success",
        title: "📱 Code sent!",
        description: "Check your phone for the verification code",
      })
      navigate("/verify-code", { state: { phone } })
    } catch (error) {
      toast({
        status: "error",
        title: "Failed to send code",
        description: "Please check your phone number and try again",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend()
    }
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center" p={4}>
      <Container maxW="md">
        <Card bg={cardBg} shadow="2xl" borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={10}>
            <VStack spacing={8}>
              {/* Header */}
              <VStack spacing={4} textAlign="center">
                <Box bg="green.500" p={4} borderRadius="2xl" bgGradient="linear(to-r, green.400, teal.500)" shadow="lg">
                  <Text fontSize="3xl" color="white">
                    📱
                  </Text>
                </Box>
                <VStack spacing={2}>
                  <Heading size="xl" bgGradient="linear(to-r, green.400, teal.500)" bgClip="text">
                    Phone Verification
                  </Heading>
                  <Text color={textColor} fontSize="lg" textAlign="center">
                    Enter your phone number to receive a verification code
                  </Text>
                </VStack>
              </VStack>

              {/* Phone Input Form */}
              <Box w="full">
                <VStack spacing={6}>
                  <FormControl>
                    <FormLabel color={textColor} fontWeight="bold" fontSize="lg">
                      📞 Phone Number
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" h="60px">
                        <Text fontSize="xl">🌍</Text>
                      </InputLeftElement>
                      <Input
                        type="tel"
                        placeholder="0740012345"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyPress={handleKeyPress}
                        size="lg"
                        h="60px"
                        borderRadius="xl"
                        bg="gray.50"
                        border="2px solid"
                        borderColor="gray.200"
                        fontSize="lg"
                        _focus={{
                          borderColor: "green.400",
                          bg: "white",
                          shadow: "0 0 0 1px var(--chakra-colors-green-400)",
                        }}
                        _hover={{ borderColor: "gray.300" }}
                      />
                    </InputGroup>
                  </FormControl>

                  <Button
                    size="lg"
                    width="full"
                    bgGradient="linear(to-r, green.400, teal.500)"
                    color="white"
                    _hover={{
                      bgGradient: "linear(to-r, green.500, teal.600)",
                      transform: "translateY(-2px)",
                      shadow: "xl",
                    }}
                    _active={{
                      transform: "translateY(0)",
                    }}
                    transition="all 0.2s"
                    borderRadius="xl"
                    fontWeight="bold"
                    fontSize="lg"
                    py={6}
                    onClick={handleSend}
                    isLoading={loading}
                    loadingText="Sending code..."
                    leftIcon={<Text fontSize="lg">🚀</Text>}
                  >
                    Send Verification Code
                  </Button>
                </VStack>
              </Box>

              <Divider />

              {/* Alternative Options */}
              <VStack spacing={4} w="full">
                <Text color="gray.500" fontSize="sm">
                  Prefer email login?
                </Text>
                <Button
                  variant="outline"
                  size="lg"
                  width="full"
                  onClick={() => navigate("/login")}
                  borderRadius="xl"
                  borderWidth="2px"
                  _hover={{
                    bg: "blue.50",
                    borderColor: "blue.400",
                    transform: "translateY(-1px)",
                  }}
                  transition="all 0.2s"
                  leftIcon={<Text fontSize="lg">📧</Text>}
                >
                  Sign in with Email
                </Button>
              </VStack>

              {/* Security Note */}
              <Box bg="blue.50" p={4} borderRadius="xl" w="full">
                <HStack spacing={3}>
                  <Text fontSize="lg">🔒</Text>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="blue.700">
                      Secure & Private
                    </Text>
                    <Text fontSize="xs" color="blue.600">
                      Your phone number is encrypted and never shared with third parties
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
