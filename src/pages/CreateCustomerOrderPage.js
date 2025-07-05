"use client"

import { useState, useContext } from "react"
import { createOrder } from "../services/ordersService"
import { AuthContext } from "../contexts/authContext"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Card,
  CardBody,
  Heading,
  Text,
  useColorModeValue,
  Container,
  useToast,
  Badge,
  IconButton,
  Tooltip,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react"
import AddressInputComponent from "../components/address-input-component"

export default function CreateCustomerOrderPage() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const toast = useToast()

  const [serviceType, setServiceType] = useState("Office")
  const [addressComponents, setAddressComponents] = useState({
    street: "",
    streetNumber: "",
    city: "Cluj-Napoca",
    apartmentNumber: "",
  })
  const [observation, setObservation] = useState("")
  const [items, setItems] = useState([{ type: "Carpet", length: "", width: "" }])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, purple.900, blue.900)",
  )
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  const handleItemChange = (idx, field, val) => {
    const next = [...items]
    next[idx][field] = val
    setItems(next)
  }

  const handleAddItem = () => setItems([...items, { type: "Carpet", length: "", width: "" }])

  const handleRemoveItem = (idx) => setItems(items.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    // Validation
    if (serviceType === "PickupDelivery") {
      if (!addressComponents.street?.trim()) {
        newErrors.street = "Street name is required"
      }
      if (!addressComponents.streetNumber?.trim()) {
        newErrors.streetNumber = "Street number is required"
      }
      if (!addressComponents.city?.trim()) {
        newErrors.city = "City is required"
      }
    }

    const formattedItems = items.map((it) => ({
      type: it.type,
      length: it.type === "Carpet" ? Number.parseFloat(it.length) || null : null,
      width: it.type === "Carpet" ? Number.parseFloat(it.width) || null : null,
    }))

    // Check for required carpet dimensions
    const invalidCarpets = formattedItems.filter((item) => item.type === "Carpet" && (!item.length || !item.width))
    if (invalidCarpets.length > 0) {
      toast({ status: "warning", title: "Please enter dimensions for all carpets" })
      return
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({ status: "warning", title: "Please fix the errors" })
      return
    }

    const newOrder = {
      customerId: user.sub,
      telephoneNumber: user.phone,
      serviceType,
      addressComponents:
        serviceType === "PickupDelivery"
          ? {
              street: addressComponents.street,
              streetNumber: addressComponents.streetNumber,
              city: addressComponents.city,
              apartmentNumber: addressComponents.apartmentNumber
                ? Number.parseInt(addressComponents.apartmentNumber)
                : null,
            }
          : null,
      observation,
      items: formattedItems,
    }

    setLoading(true)
    try {
      await createOrder(newOrder)
      toast({
        status: "success",
        title: "🎉 Order created successfully!",
        description: "Your laundry order has been submitted",
      })
      navigate("/my-orders")
    } catch (err) {
      console.error(err)
      toast({ status: "error", title: "Failed to create order", description: "Please try again" })
    } finally {
      setLoading(false)
    }
  }

  const getItemIcon = (type) => {
    switch (type) {
      case "Carpet":
        return "🏠"
      case "Blanket":
        return "🛏️"
      default:
        return "🧺"
    }
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="4xl" py={8}>
        {/* Header Section */}
        <Card mb={8} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={8}>
            <VStack spacing={6}>
              <HStack>
                <Text fontSize="3xl">🧺</Text>
                <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                  Create Your Order
                </Heading>
              </HStack>
              <Text color={textColor} fontSize="lg" textAlign="center">
                Tell us about your laundry needs and we'll take care of the rest
              </Text>
              <Button
                leftIcon={<Text fontSize="xl">←</Text>}
                onClick={() => navigate(-1)}
                colorScheme="blue"
                variant="ghost"
                size="lg"
                _hover={{ transform: "translateX(-4px)", transition: "all 0.2s" }}
                borderRadius="full"
                px={6}
              >
                Back
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Order Form */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={8}>
                {/* Service Type */}
                <FormControl>
                  <FormLabel color={textColor} fontWeight="bold" fontSize="lg">
                    🚚 Service Type
                  </FormLabel>
                  <Select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    size="lg"
                    borderRadius="xl"
                    bg="gray.50"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: "blue.400",
                      bg: "white",
                    }}
                    _hover={{ borderColor: "gray.300" }}
                  >
                    <option value="Office">🏢 Office Pickup</option>
                    <option value="PickupDelivery">🚚 Pickup & Delivery</option>
                  </Select>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Choose how you'd like us to handle your laundry
                  </Text>
                </FormControl>

                {/* Replace the old delivery address FormControl with: */}
                {serviceType === "PickupDelivery" && (
                  <AddressInputComponent
                    value={addressComponents}
                    onChange={(addressData) => {
                      setAddressComponents(addressData)
                      // Clear errors when user starts typing
                      if (errors.street || errors.streetNumber || errors.city) {
                        setErrors((prev) => ({
                          ...prev,
                          street: null,
                          streetNumber: null,
                          city: null,
                          apartmentNumber: null,
                        }))
                      }
                    }}
                    errors={{
                      street: errors.street,
                      streetNumber: errors.streetNumber,
                      city: errors.city,
                      apartmentNumber: errors.apartmentNumber,
                    }}
                    isRequired={true}
                  />
                )}

                {/* Special Notes */}
                <FormControl>
                  <FormLabel color={textColor} fontWeight="bold" fontSize="lg">
                    📝 Special Notes (Optional)
                  </FormLabel>
                  <Textarea
                    placeholder="Any special instructions or notes about your items..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    size="lg"
                    borderRadius="xl"
                    bg="gray.50"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: "blue.400",
                      bg: "white",
                    }}
                    _hover={{ borderColor: "gray.300" }}
                    rows={4}
                  />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Let us know about stains, fabric care preferences, or other details
                  </Text>
                </FormControl>

                <Divider />

                {/* Items Section */}
                <Box w="full">
                  <HStack justify="space-between" mb={6}>
                    <VStack align="start" spacing={1}>
                      <Heading size="lg" color={textColor}>
                        🧼 Your Items
                      </Heading>
                      <Text color="gray.500">Add all the items you want us to clean</Text>
                    </VStack>
                    <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </Badge>
                  </HStack>

                  <VStack spacing={4} align="stretch">
                    {items.map((item, idx) => (
                      <Card key={idx} bg="gray.50" borderRadius="xl" shadow="sm">
                        <CardBody p={6}>
                          <VStack spacing={4}>
                            <HStack justify="space-between" w="full">
                              <HStack>
                                <Text fontSize="xl">{getItemIcon(item.type)}</Text>
                                <Text fontWeight="bold" color={textColor}>
                                  Item #{idx + 1}
                                </Text>
                              </HStack>
                              {items.length > 1 && (
                                <Tooltip label="Remove Item">
                                  <IconButton
                                    icon={<Text fontSize="lg">🗑️</Text>}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleRemoveItem(idx)}
                                    borderRadius="full"
                                    _hover={{ transform: "scale(1.1)" }}
                                  />
                                </Tooltip>
                              )}
                            </HStack>

                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="bold" color={textColor}>
                                  Item Type
                                </FormLabel>
                                <Select
                                  value={item.type}
                                  onChange={(e) => handleItemChange(idx, "type", e.target.value)}
                                  borderRadius="lg"
                                  bg="white"
                                >
                                  <option value="Carpet">🏠 Carpet</option>
                                  <option value="Blanket">🛏️ Blanket</option>
                                </Select>
                              </FormControl>

                              {item.type === "Carpet" && (
                                <>
                                  <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold" color={textColor}>
                                      Length (m)
                                    </FormLabel>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      placeholder="2.5"
                                      value={item.length}
                                      onChange={(e) => handleItemChange(idx, "length", e.target.value)}
                                      borderRadius="lg"
                                      bg="white"
                                    />
                                  </FormControl>
                                  <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold" color={textColor}>
                                      Width (m)
                                    </FormLabel>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      placeholder="3.0"
                                      value={item.width}
                                      onChange={(e) => handleItemChange(idx, "width", e.target.value)}
                                      borderRadius="lg"
                                      bg="white"
                                    />
                                  </FormControl>
                                </>
                              )}
                            </SimpleGrid>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>

                  <Button
                    leftIcon={<Text fontSize="lg">➕</Text>}
                    onClick={handleAddItem}
                    variant="outline"
                    size="lg"
                    width="full"
                    mt={4}
                    borderRadius="xl"
                    borderWidth="2px"
                    borderStyle="dashed"
                    _hover={{
                      bg: "blue.50",
                      borderColor: "blue.400",
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                  >
                    Add Another Item
                  </Button>
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  width="full"
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  color="white"
                  _hover={{
                    bgGradient: "linear(to-r, blue.500, purple.600)",
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
                  py={8}
                  isLoading={loading}
                  loadingText="Creating order..."
                  leftIcon={<Text fontSize="xl">🚀</Text>}
                >
                  Create Order
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
