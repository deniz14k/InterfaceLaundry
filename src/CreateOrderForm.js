"use client"

import { useState, useContext } from "react"
import { createOrder } from "./services/ordersService"
import { AuthContext } from "./contexts/authContext"
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
  useToast,
  Badge,
  IconButton,
  Tooltip,
  SimpleGrid,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  Divider,
} from "@chakra-ui/react"

export default function CreateOrderForm({ onOrderCreated }) {
  const { user } = useContext(AuthContext)

  const [formData, setFormData] = useState({
    customerId: "",
    telephoneNumber: "",
    serviceType: "Office",
    deliveryAddress: "",
    observation: "",
    items: [{ type: "Carpet", length: "", width: "" }],
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const toast = useToast()

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")
  const inputBg = useColorModeValue("gray.50", "gray.700")

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleItemChange = (idx, field, val) => {
    const next = [...formData.items]
    next[idx][field] = val
    setFormData((prev) => ({ ...prev, items: next }))
  }

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { type: "Carpet", length: "", width: "" }],
    }))
  }

  const handleRemoveItem = (idx) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== idx),
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Staff validation
    if (user.role !== "Customer") {
      if (!formData.customerId.trim()) {
        newErrors.customerId = "Customer ID is required"
      }
      if (!formData.telephoneNumber.trim()) {
        newErrors.telephoneNumber = "Phone number is required"
      }
    }

    if (formData.serviceType === "PickupDelivery" && !formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Delivery address is required for pickup & delivery service"
    }

    // Validate carpet dimensions
    formData.items.forEach((item, idx) => {
      if (item.type === "Carpet") {
        if (!item.length || Number.parseFloat(item.length) <= 0) {
          newErrors[`item_${idx}_length`] = "Length is required for carpets"
        }
        if (!item.width || Number.parseFloat(item.width) <= 0) {
          newErrors[`item_${idx}_width`] = "Width is required for carpets"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        status: "warning",
        title: "Please fix the errors",
        description: "Check the highlighted fields and try again",
      })
      return
    }

    const formattedItems = formData.items.map((it) => ({
      type: it.type,
      length: it.type === "Carpet" ? Number.parseFloat(it.length) || null : null,
      width: it.type === "Carpet" ? Number.parseFloat(it.width) || null : null,
    }))

    const newOrder = {
      // for Customers, pull from JWT; for staff, use form values
      customerId: user.role === "Customer" ? user.nameid : formData.customerId,
      telephoneNumber: user.role === "Customer" ? user.name : formData.telephoneNumber,
      serviceType: formData.serviceType,
      deliveryAddress: formData.serviceType === "PickupDelivery" ? formData.deliveryAddress : null,
      observation: formData.observation,
      status: "Pending",
      items: formattedItems,
    }

    setLoading(true)
    try {
      await createOrder(newOrder)
      toast({
        status: "success",
        title: "🎉 Order created successfully!",
        description: "Your new order has been submitted",
      })
      onOrderCreated()
    } catch (err) {
      console.error(err)
      toast({
        status: "error",
        title: "Failed to create order",
        description: "Please try again or contact support",
      })
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
    <Box>
      <form onSubmit={handleSubmit}>
        <VStack spacing={8}>
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <HStack>
              <Text fontSize="3xl">✨</Text>
              <Heading size="xl" bgGradient="linear(to-r, teal.400, blue.500)" bgClip="text">
                Create New Order
              </Heading>
            </HStack>
            <Text color={textColor} fontSize="lg">
              {user.role === "Customer" ? "Tell us about your laundry needs" : "Create an order for a customer"}
            </Text>
          </VStack>

          {/* Customer Information - Staff Only */}
          {user.role !== "Customer" && (
            <Card bg={cardBg} shadow="lg" borderRadius="xl" w="full">
              <CardBody p={6}>
                <VStack spacing={6}>
                  <HStack w="full">
                    <Text fontSize="xl">👔</Text>
                    <Heading size="md" color={textColor}>
                      Customer Information
                    </Heading>
                    <Badge colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="xs">
                      Staff Only
                    </Badge>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                    <FormControl isInvalid={errors.customerId}>
                      <FormLabel color={textColor} fontWeight="bold">
                        Customer ID
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Text fontSize="lg">🆔</Text>
                        </InputLeftElement>
                        <Input
                          value={formData.customerId}
                          onChange={(e) => handleInputChange("customerId", e.target.value)}
                          placeholder="Enter customer ID"
                          size="lg"
                          borderRadius="lg"
                          bg={inputBg}
                          border="2px solid"
                          borderColor={errors.customerId ? "red.300" : "gray.200"}
                          _focus={{
                            borderColor: errors.customerId ? "red.400" : "teal.400",
                            bg: "white",
                          }}
                          _hover={{ borderColor: errors.customerId ? "red.300" : "gray.300" }}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.customerId}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.telephoneNumber}>
                      <FormLabel color={textColor} fontWeight="bold">
                        📞 Phone Number
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Text fontSize="lg">📱</Text>
                        </InputLeftElement>
                        <Input
                          value={formData.telephoneNumber}
                          onChange={(e) => handleInputChange("telephoneNumber", e.target.value)}
                          placeholder="Enter phone number"
                          size="lg"
                          borderRadius="lg"
                          bg={inputBg}
                          border="2px solid"
                          borderColor={errors.telephoneNumber ? "red.300" : "gray.200"}
                          _focus={{
                            borderColor: errors.telephoneNumber ? "red.400" : "teal.400",
                            bg: "white",
                          }}
                          _hover={{ borderColor: errors.telephoneNumber ? "red.300" : "gray.300" }}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.telephoneNumber}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Service Details */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl" w="full">
            <CardBody p={6}>
              <VStack spacing={6}>
                <HStack w="full">
                  <Text fontSize="xl">🚚</Text>
                  <Heading size="md" color={textColor}>
                    Service Details
                  </Heading>
                </HStack>

                <FormControl>
                  <FormLabel color={textColor} fontWeight="bold" fontSize="lg">
                    Service Type
                  </FormLabel>
                  <Select
                    value={formData.serviceType}
                    onChange={(e) => handleInputChange("serviceType", e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    bg={inputBg}
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: "teal.400",
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

                {formData.serviceType === "PickupDelivery" && (
                  <FormControl isInvalid={errors.deliveryAddress}>
                    <FormLabel color={textColor} fontWeight="bold">
                      📍 Delivery Address
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Text fontSize="lg">🏠</Text>
                      </InputLeftElement>
                      <Input
                        value={formData.deliveryAddress}
                        onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                        placeholder="Enter full delivery address"
                        size="lg"
                        borderRadius="lg"
                        bg={inputBg}
                        border="2px solid"
                        borderColor={errors.deliveryAddress ? "red.300" : "gray.200"}
                        _focus={{
                          borderColor: errors.deliveryAddress ? "red.400" : "teal.400",
                          bg: "white",
                        }}
                        _hover={{ borderColor: errors.deliveryAddress ? "red.300" : "gray.300" }}
                      />
                    </InputGroup>
                    <FormErrorMessage>{errors.deliveryAddress}</FormErrorMessage>
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel color={textColor} fontWeight="bold">
                    📝 Special Notes (Optional)
                  </FormLabel>
                  <Textarea
                    value={formData.observation}
                    onChange={(e) => handleInputChange("observation", e.target.value)}
                    placeholder="Any special instructions, stains to note, or care preferences..."
                    size="lg"
                    borderRadius="lg"
                    bg={inputBg}
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: "teal.400",
                      bg: "white",
                    }}
                    _hover={{ borderColor: "gray.300" }}
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Items Section */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl" w="full">
            <CardBody p={6}>
              <VStack spacing={6}>
                <HStack justify="space-between" w="full">
                  <HStack>
                    <Text fontSize="xl">🧼</Text>
                    <Heading size="md" color={textColor}>
                      Your Items
                    </Heading>
                  </HStack>
                  <Badge colorScheme="teal" px={3} py={1} borderRadius="full" fontSize="sm">
                    {formData.items.length} item{formData.items.length !== 1 ? "s" : ""}
                  </Badge>
                </HStack>

                <VStack spacing={4} w="full">
                  {formData.items.map((item, idx) => (
                    <Card key={idx} bg="teal.50" borderRadius="lg" shadow="sm" w="full">
                      <CardBody p={4}>
                        <VStack spacing={4}>
                          <HStack justify="space-between" w="full">
                            <HStack>
                              <Text fontSize="lg">{getItemIcon(item.type)}</Text>
                              <Text fontWeight="bold" color={textColor}>
                                Item #{idx + 1}
                              </Text>
                            </HStack>
                            {formData.items.length > 1 && (
                              <Tooltip label="Remove Item">
                                <IconButton
                                  icon={<Text fontSize="sm">🗑️</Text>}
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
                                size="sm"
                              >
                                <option value="Carpet">🏠 Carpet</option>
                                <option value="Blanket">🛏️ Blanket</option>
                              </Select>
                            </FormControl>

                            {item.type === "Carpet" && (
                              <>
                                <FormControl isInvalid={errors[`item_${idx}_length`]}>
                                  <FormLabel fontSize="sm" fontWeight="bold" color={textColor}>
                                    Length (m)
                                  </FormLabel>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={item.length}
                                    onChange={(e) => handleItemChange(idx, "length", e.target.value)}
                                    placeholder="2.5"
                                    borderRadius="lg"
                                    bg="white"
                                    size="sm"
                                    borderColor={errors[`item_${idx}_length`] ? "red.300" : "gray.200"}
                                  />
                                  <FormErrorMessage fontSize="xs">{errors[`item_${idx}_length`]}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={errors[`item_${idx}_width`]}>
                                  <FormLabel fontSize="sm" fontWeight="bold" color={textColor}>
                                    Width (m)
                                  </FormLabel>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={item.width}
                                    onChange={(e) => handleItemChange(idx, "width", e.target.value)}
                                    placeholder="3.0"
                                    borderRadius="lg"
                                    bg="white"
                                    size="sm"
                                    borderColor={errors[`item_${idx}_width`] ? "red.300" : "gray.200"}
                                  />
                                  <FormErrorMessage fontSize="xs">{errors[`item_${idx}_width`]}</FormErrorMessage>
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
                  borderRadius="lg"
                  borderWidth="2px"
                  borderStyle="dashed"
                  borderColor="teal.300"
                  color="teal.600"
                  _hover={{
                    bg: "teal.50",
                    borderColor: "teal.400",
                    transform: "translateY(-1px)",
                  }}
                  transition="all 0.2s"
                >
                  Add Another Item
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Submit Button */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl" w="full">
            <CardBody p={6}>
              <VStack spacing={4}>
                <Divider />
                <Button
                  type="submit"
                  size="lg"
                  width="full"
                  bgGradient="linear(to-r, teal.400, blue.500)"
                  color="white"
                  _hover={{
                    bgGradient: "linear(to-r, teal.500, blue.600)",
                    transform: "translateY(-2px)",
                    shadow: "xl",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s"
                  borderRadius="lg"
                  fontWeight="bold"
                  fontSize="lg"
                  py={8}
                  isLoading={loading}
                  loadingText="Creating order..."
                  leftIcon={<Text fontSize="xl">🚀</Text>}
                >
                  Create Order
                </Button>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Your order will be reviewed and processed within 24 hours
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </form>
    </Box>
  )
}
