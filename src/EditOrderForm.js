"use client"

import { useState, useEffect } from "react"
import { updateOrder } from "./services/ordersService"
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
  Flex,
  Spinner,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  Divider,
} from "@chakra-ui/react"
import AddressInputComponent from "./components/address-input-component"

export default function EditOrderForm({ order, onUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    customerId: "",
    telephoneNumber: "",
    serviceType: "Office",
    addressComponents: {
      street: "",
      streetNumber: "",
      city: "Cluj-Napoca",
      apartmentNumber: "",
    },
    observation: "",
    status: "Pending",
    items: [{ type: "Carpet", length: "", width: "", price: 0 }],
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const toast = useToast()

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")
  const inputBg = useColorModeValue("gray.50", "gray.700")

  useEffect(() => {
    if (order) {
      // Parse existing delivery address back to components
      const addressComponents = {
        street: "",
        streetNumber: "",
        city: "Cluj-Napoca",
        apartmentNumber: order.apartmentNumber || "",
      }

      if (order.deliveryAddress) {
        // Try to parse "Strada Lunii 22, Cluj-Napoca, Romania" format
        const parts = order.deliveryAddress.split(", ")
        if (parts.length >= 2) {
          const streetPart = parts[0] // "Strada Lunii 22"
          const city = parts[1] // "Cluj-Napoca"

          // Split street name and number
          const streetMatch = streetPart.match(/^(.+)\s+(\d+[A-Za-z]*)$/)
          if (streetMatch) {
            addressComponents.street = streetMatch[1] // "Strada Lunii"
            addressComponents.streetNumber = streetMatch[2] // "22"
          } else {
            addressComponents.street = streetPart
          }
          addressComponents.city = city
        }
      }

      setFormData({
        customerId: order.customerId || "",
        telephoneNumber: order.telephoneNumber || "",
        serviceType: order.serviceType || "Office",
        addressComponents,
        observation: order.observation || "",
        status: order.status || "Pending",
        items: order.items?.length > 0 ? order.items : [{ type: "Carpet", length: "", width: "", price: 0 }],
      })
    }
  }, [order])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleItemChange = (idx, field, value) => {
    const newItems = [...formData.items]
    newItems[idx][field] = value
    setFormData((prev) => ({ ...prev, items: newItems }))
  }

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { type: "Carpet", length: "", width: "", price: 0 }],
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

    if (!formData.customerId.trim()) {
      newErrors.customerId = "Customer ID is required"
    }

    if (!formData.telephoneNumber.trim()) {
      newErrors.telephoneNumber = "Phone number is required"
    }

    if (formData.serviceType === "PickupDelivery") {
      if (!formData.addressComponents.street?.trim()) {
        newErrors.street = "Street name is required for pickup & delivery service"
      }
      if (!formData.addressComponents.streetNumber?.trim()) {
        newErrors.streetNumber = "Street number is required for pickup & delivery service"
      }
      if (!formData.addressComponents.city?.trim()) {
        newErrors.city = "City is required for pickup & delivery service"
      }
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

    // Format items
    const formattedItems = formData.items.map((item) => ({
      ...item,
      length: item.type === "Carpet" ? Number.parseFloat(item.length) || null : null,
      width: item.type === "Carpet" ? Number.parseFloat(item.width) || null : null,
      price: Number.parseFloat(item.price) || 0,
    }))

    const updatedOrder = {
      id: order.id,
      customerId: formData.customerId,
      telephoneNumber: formData.telephoneNumber,
      receivedDate: order.receivedDate,
      status: formData.status,
      serviceType: formData.serviceType,
      addressComponents:
        formData.serviceType === "PickupDelivery"
          ? {
              street: formData.addressComponents.street,
              streetNumber: formData.addressComponents.streetNumber,
              city: formData.addressComponents.city,
              apartmentNumber: formData.addressComponents.apartmentNumber
                ? Number.parseInt(formData.addressComponents.apartmentNumber)
                : null,
            }
          : null,
      observation: formData.observation,
      items: formattedItems,
    }

    setLoading(true)
    try {
      await updateOrder(order.id, updatedOrder)
      toast({
        status: "success",
        title: "🎉 Order updated successfully!",
        description: "All changes have been saved",
      })
      onUpdated()
    } catch (error) {
      console.error(error)
      toast({
        status: "error",
        title: "Failed to update order",
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "yellow"
      case "ready":
        return "blue"
      case "completed":
        return "green"
      case "cancelled":
        return "red"
      default:
        return "gray"
    }
  }

  if (!order) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
          <Text fontSize="lg" fontWeight="medium">
            Loading order details...
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <VStack spacing={8}>
          {/* Customer Information */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl" w="full">
            <CardBody p={6}>
              <VStack spacing={6}>
                <HStack w="full">
                  <Text fontSize="xl">👤</Text>
                  <Heading size="md" color={textColor}>
                    Customer Information
                  </Heading>
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
                          borderColor: errors.customerId ? "red.400" : "blue.400",
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
                          borderColor: errors.telephoneNumber ? "red.400" : "blue.400",
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

          {/* Order Details */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl" w="full">
            <CardBody p={6}>
              <VStack spacing={6}>
                <HStack w="full">
                  <Text fontSize="xl">📋</Text>
                  <Heading size="md" color={textColor}>
                    Order Details
                  </Heading>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                  <FormControl>
                    <FormLabel color={textColor} fontWeight="bold">
                      🚚 Service Type
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
                        borderColor: "blue.400",
                        bg: "white",
                      }}
                      _hover={{ borderColor: "gray.300" }}
                    >
                      <option value="Office">🏢 Office Pickup</option>
                      <option value="PickupDelivery">🚚 Pickup & Delivery</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textColor} fontWeight="bold">
                      📊 Status
                    </FormLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      bg={inputBg}
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{
                        borderColor: "blue.400",
                        bg: "white",
                      }}
                      _hover={{ borderColor: "gray.300" }}
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Ready">📦 Ready</option>
                      <option value="Completed">✅ Completed</option>
                      <option value="Cancelled">❌ Cancelled</option>
                    </Select>
                    <HStack mt={2}>
                      <Text fontSize="sm" color="gray.500">
                        Current status:
                      </Text>
                      <Badge colorScheme={getStatusColor(formData.status)} px={2} py={1} borderRadius="full">
                        {formData.status}
                      </Badge>
                    </HStack>
                  </FormControl>
                </SimpleGrid>

                {formData.serviceType === "PickupDelivery" && (
                  <AddressInputComponent
                    value={formData.addressComponents}
                    onChange={(addressData) => handleInputChange("addressComponents", addressData)}
                    errors={{
                      street: errors.street,
                      streetNumber: errors.streetNumber,
                      city: errors.city,
                      apartmentNumber: errors.apartmentNumber,
                    }}
                    isRequired={true}
                  />
                )}

                <FormControl>
                  <FormLabel color={textColor} fontWeight="bold">
                    📝 Special Notes
                  </FormLabel>
                  <Textarea
                    value={formData.observation}
                    onChange={(e) => handleInputChange("observation", e.target.value)}
                    placeholder="Any special instructions or observations..."
                    size="lg"
                    borderRadius="lg"
                    bg={inputBg}
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{
                      borderColor: "blue.400",
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
                      Order Items
                    </Heading>
                  </HStack>
                  <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                    {formData.items.length} item{formData.items.length !== 1 ? "s" : ""}
                  </Badge>
                </HStack>

                <VStack spacing={4} w="full">
                  {formData.items.map((item, idx) => (
                    <Card key={idx} bg="gray.50" borderRadius="lg" shadow="sm" w="full">
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

                          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} w="full">
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold" color={textColor}>
                                Type
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

                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold" color={textColor}>
                                Price (RON)
                              </FormLabel>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                                placeholder="0.00"
                                borderRadius="lg"
                                bg="white"
                                size="sm"
                              />
                            </FormControl>
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
                  _hover={{
                    bg: "blue.50",
                    borderColor: "blue.400",
                    transform: "translateY(-1px)",
                  }}
                  transition="all 0.2s"
                >
                  Add Another Item
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl" w="full">
            <CardBody p={6}>
              <VStack spacing={4}>
                <Divider />
                <Flex justify="space-between" align="center" gap={4} direction={{ base: "column", md: "row" }} w="full">
                  <HStack>
                    <Text fontSize="lg">💰</Text>
                    <Text fontWeight="bold" color={textColor}>
                      Total:{" "}
                      {formData.items.reduce((sum, item) => sum + (Number.parseFloat(item.price) || 0), 0).toFixed(2)}{" "}
                      RON
                    </Text>
                  </HStack>

                  <HStack spacing={4}>
                    <Button
                      onClick={onCancel}
                      variant="outline"
                      size="lg"
                      borderRadius="lg"
                      _hover={{
                        bg: "gray.50",
                        transform: "translateY(-1px)",
                      }}
                      transition="all 0.2s"
                      leftIcon={<Text fontSize="lg">❌</Text>}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      bgGradient="linear(to-r, blue.400, purple.500)"
                      color="white"
                      _hover={{
                        bgGradient: "linear(to-r, blue.500, purple.600)",
                        transform: "translateY(-2px)",
                        shadow: "lg",
                      }}
                      _active={{
                        transform: "translateY(0)",
                      }}
                      transition="all 0.2s"
                      borderRadius="lg"
                      fontWeight="bold"
                      isLoading={loading}
                      loadingText="Saving..."
                      leftIcon={<Text fontSize="lg">💾</Text>}
                    >
                      Save Changes
                    </Button>
                  </HStack>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </form>
    </Box>
  )
}
