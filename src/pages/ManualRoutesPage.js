import { useEffect, useState } from "react"
import { getEligibleOrders, createRoute, autoGenerateRoute } from "../services/RouteService"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Heading,
  Input,
  Checkbox,
  useColorModeValue,
  Container,
  Flex,
  Badge,
  useToast,
  Divider,
  FormControl,
  FormLabel,
  CheckboxGroup,
  Stack,
} from "@chakra-ui/react"

export default function ManualRoutesPage() {
  const [eligibleOrders, setEligibleOrders] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [driverName, setDriverName] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const navigate = useNavigate()
  const toast = useToast()

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  useEffect(() => {
    getEligibleOrders()
      .then(setEligibleOrders)
      .catch((e) => {
        console.error(e)
        toast({ status: "error", title: "Failed to load eligible orders" })
      })
  }, [])

  // Auto generation
  const handleAuto = async () => {
    if (!driverName.trim()) {
      toast({ status: "warning", title: "Please enter driver name" })
      return
    }
    try {
      const { id: routeId } = await autoGenerateRoute({ date, driverName })
      toast({ status: "success", title: "🚀 Route generated automatically!" })
      navigate(`/driver/route/${routeId}`)
    } catch (e) {
      toast({ status: "error", title: "Auto generation failed: " + e.message })
    }
  }

  // Manual creation
  const handleManual = async () => {
    if (selectedIds.length < 1) {
      toast({ status: "warning", title: "Please select at least one order" })
      return
    }
    if (!driverName.trim()) {
      toast({ status: "warning", title: "Please enter driver name" })
      return
    }
    try {
      const { id: routeId } = await createRoute({ driverName, orderIds: selectedIds })
      toast({ status: "success", title: "✨ Route created successfully!" })
      navigate(`/driver/route/${routeId}`)
    } catch (e) {
      toast({ status: "error", title: "Manual creation failed: " + e.message })
    }
  }

  // Toggle selection
  const toggle = (id) => setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="6xl" py={8}>
        {/* Header Section */}
        <Card mb={8} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={8}>
            <VStack spacing={4} textAlign="center">
              <HStack>
                <Text fontSize="4xl">🛠️</Text>
                <Heading size="2xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                  Route Builder
                </Heading>
              </HStack>
              <Text color={textColor} fontSize="lg">
                Create delivery routes automatically or manually select orders
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Auto Generation Section */}
        <Card mb={8} bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <VStack spacing={6}>
              <HStack>
                <Text fontSize="2xl">🚀</Text>
                <Heading size="lg" color="green.500">
                  Automatic Route Generation
                </Heading>
              </HStack>
              

              <HStack spacing={6} wrap="wrap" justify="center">
                <FormControl maxW="200px">
                  <FormLabel color={textColor} fontWeight="bold">
                    📅 Route Date
                  </FormLabel>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    borderRadius="xl"
                    bg="white"
                    size="lg"
                  />
                </FormControl>

                <FormControl maxW="250px">
                  <FormLabel color={textColor} fontWeight="bold">
                    👨‍✈️ Driver Name
                  </FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter driver name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    borderRadius="xl"
                    bg="white"
                    size="lg"
                  />
                </FormControl>
              </HStack>

              <Button
                leftIcon={<Text fontSize="xl">🤖</Text>}
                colorScheme="green"
                size="lg"
                onClick={handleAuto}
                bgGradient="linear(to-r, green.400, green.600)"
                _hover={{
                  bgGradient: "linear(to-r, green.500, green.700)",
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
                borderRadius="full"
                px={10}
                py={6}
                fontSize="lg"
                fontWeight="bold"
                isDisabled={!driverName.trim()}
              >
                Generate Smart Route
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Divider my={8} />

        {/* Manual Creation Section */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <VStack spacing={6}>
              <HStack>
                <Text fontSize="2xl">✍️</Text>
                <Heading size="lg" color="blue.500">
                  Manual Route Creation
                </Heading>
              </HStack>
              <Text color={textColor} textAlign="center">
                Handpick specific orders to create a custom route
              </Text>

              {/* Driver Name Input */}
              <FormControl maxW="400px">
                <FormLabel color={textColor} fontWeight="bold" textAlign="center">
                  👨‍✈️ Driver Name
                </FormLabel>
                <Input
                  type="text"
                  placeholder="Enter driver name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  borderRadius="xl"
                  bg="white"
                  size="lg"
                  textAlign="center"
                />
              </FormControl>

              {/* Orders Selection */}
              <Box w="full">
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    📦 Available Orders ({eligibleOrders.length})
                  </Text>
                  <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                    {selectedIds.length} selected
                  </Badge>
                </HStack>

                {eligibleOrders.length === 0 ? (
                  <Card bg="gray.50" borderRadius="xl" borderWidth="2px" borderStyle="dashed" borderColor="gray.300">
                    <CardBody p={8} textAlign="center">
                      <VStack spacing={3}>
                        <Text fontSize="4xl">📭</Text>
                        <Text fontSize="lg" color="gray.600" fontWeight="medium">
                          No eligible orders available
                        </Text>
                        <Text color="gray.500">All orders are already assigned to routes or completed</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ) : (
                  <Card bg="gray.50" borderRadius="xl" maxH="400px" overflowY="auto">
                    <CardBody p={6}>
                      <CheckboxGroup value={selectedIds} onChange={setSelectedIds}>
                        <Stack spacing={4}>
                          {eligibleOrders.map((order) => (
                            <Card
                              key={order.id}
                              bg="white"
                              shadow="sm"
                              borderRadius="lg"
                              _hover={{ shadow: "md", transform: "translateY(-1px)" }}
                              transition="all 0.2s"
                            >
                              <CardBody p={4}>
                                <Flex justify="space-between" align="center">
                                  <HStack spacing={4}>
                                    <Checkbox
                                      value={order.id.toString()}
                                      isChecked={selectedIds.includes(order.id)}
                                      onChange={() => toggle(order.id)}
                                      colorScheme="blue"
                                      size="lg"
                                    />
                                    <VStack align="start" spacing={1}>
                                      <HStack>
                                        <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
                                          #{order.id}
                                        </Badge>
                                        <Text fontWeight="bold" color={textColor}>
                                          {order.customerName || `Customer #${order.customerId}`}
                                        </Text>
                                      </HStack>
                                      <Text color="gray.500" fontSize="sm">
                                        📍 {order.deliveryAddress}
                                      </Text>
                                      <Text color="gray.500" fontSize="sm">
                                        📞 {order.telephoneNumber}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                                    💰 {order.price || "N/A"} RON
                                  </Badge>
                                </Flex>
                              </CardBody>
                            </Card>
                          ))}
                        </Stack>
                      </CheckboxGroup>
                    </CardBody>
                  </Card>
                )}
              </Box>

              {/* Create Button */}
              <Button
                leftIcon={<Text fontSize="xl">🎯</Text>}
                colorScheme="blue"
                size="lg"
                onClick={handleManual}
                bgGradient="linear(to-r, blue.400, blue.600)"
                _hover={{
                  bgGradient: "linear(to-r, blue.500, blue.700)",
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
                borderRadius="full"
                px={10}
                py={6}
                fontSize="lg"
                fontWeight="bold"
                isDisabled={selectedIds.length === 0 || !driverName.trim()}
              >
                Create Custom Route ({selectedIds.length} orders)
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
