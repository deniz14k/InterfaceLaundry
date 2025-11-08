"use client"

import { useState } from "react"
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
  Text,
  useToast,
  Card,
  CardBody,
  Heading,
  Badge,
  IconButton,
  useColorModeValue,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  SimpleGrid,
  Tooltip,
} from "@chakra-ui/react"
import { createOrder } from "./services/ordersService"
import AddressInputComponent from "./components/address-input-component"

export default function CreateOrderForm({ onOrderCreated, onCancel }) {
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
    items: [{ type: "Carpet", length: 1, width: 1, price: 0, isMeasured: false }],
  })

  const [itemCount, setItemCount] = useState(1)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const handleItemCountChange = (value) => {
    setItemCount(value)

    // Adjust items array to match the count
    const currentItems = [...formData.items]

    if (value > currentItems.length) {
      // Add new items
      const itemsToAdd = value - currentItems.length
      for (let i = 0; i < itemsToAdd; i++) {
        currentItems.push({
          type: "Carpet",
          length: 1, // Set default 1x1 measurements
          width: 1,
          price: 0,
          isMeasured: false, // Add measured tracking
        })
      }
    } else if (value < currentItems.length) {
      // Remove excess items
      currentItems.splice(value)
    }

    setFormData((prev) => ({ ...prev, items: currentItems }))
  }

  const handleItemChange = (idx, field, value) => {
    const newItems = [...formData.items]
    newItems[idx] = { ...newItems[idx], [field]: value }

    if (field === "type") {
      if (value === "Blanket") {
        // Fixed price rule
        if (formData.serviceType === "PickupDelivery") newItems[idx].price = 50
        else newItems[idx].price = 45
        // Dimensions not applicable
        newItems[idx].length = null
        newItems[idx].width = null
      } else if (value === "Carpet") {
        // Keep dimensions editable; optional: reset price so it can be calculated later
        newItems[idx].price = newItems[idx].price || 0
      } else {
        // Other future types: default safe values
        newItems[idx].length = null
        newItems[idx].width = null
        newItems[idx].price = newItems[idx].price || 0
      }
    }

    setFormData((prev) => ({ ...prev, items: newItems }))
  }

  const handleAddItem = () => {
    const newCount = itemCount + 1
    setItemCount(newCount)
    handleItemCountChange(newCount)
  }

  const handleRemoveItem = (idx) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== idx)
      setFormData((prev) => ({ ...prev, items: newItems }))
      setItemCount(newItems.length)
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

    /* Validate carpet dimensions
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
        */

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

    const newOrder = {
      customerId: formData.customerId,
      telephoneNumber: formData.telephoneNumber,
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

    setIsSubmitting(true)
    try {
      await createOrder(newOrder)
      toast({
        status: "success",
        title: "🎉 Order created successfully!",
        description: "The new order has been added to the system",
      })
      onOrderCreated()
    } catch (error) {
      console.error(error)
      /*toast({
        status: "error",
        title: "Failed to create order",
        description: "Please try again or contact support",
      })*/
    } finally {
      setIsSubmitting(false)
    }
  }

  const getItemIcon = (type) => {
    switch (type) {
      case "Carpet":
        return "🏠"
      case "Blanket":
        return "🛏️"
      case "Pillow":
        return "🛌"
      default:
        return "🧺"
    }
  }

  const PREDEFINED_MEASUREMENTS = [
    { length: 3, width: 2, label: "3x2" },
    { length: 1.5, width: 2.3, label: "1.5x2.3" },
    { length: 1.7, width: 2.5, label: "1.7x2.5" },
    { length: 0.8, width: 1.5, label: "0.8x1.5" },
    { length: 1, width: 1, label: "1x1" },
  ]

  const applyPredefinedMeasurement = (idx, length, width) => {
    const newItems = [...formData.items]
    newItems[idx] = { ...newItems[idx], length, width }
    setFormData((prev) => ({ ...prev, items: newItems }))
  }

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <VStack spacing={8}>
          {/* Header */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl" w="full">
            <CardBody p={6}>
              <HStack>
                <Text fontSize="xl">➕</Text>
                <Heading size="md" color={textColor}>
                  Create New Order
                </Heading>
                <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                  {formData.items.length} item{formData.items.length !== 1 ? "s" : ""}
                </Badge>
              </HStack>
            </CardBody>
          </Card>

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
                    <FormErrorMessage>{errors.customerId}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.telephoneNumber}>
                    <FormLabel color={textColor} fontWeight="bold">
                      📞 Phone Number
                    </FormLabel>
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
                    <Text fontSize="xl">📦</Text>
                    <Heading size="md" color={textColor}>
                      Items ({formData.items.length})
                    </Heading>
                  </HStack>
                  <Button
                    leftIcon={<Text fontSize="lg">➕</Text>}
                    onClick={handleAddItem}
                    colorScheme="blue"
                    size="sm"
                    borderRadius="full"
                    bgGradient="linear(to-r, blue.400, blue.600)"
                    _hover={{
                      bgGradient: "linear(to-r, blue.500, blue.700)",
                      transform: "translateY(-2px)",
                      shadow: "lg",
                    }}
                    transition="all 0.2s"
                  >
                    Add Item
                  </Button>
                </HStack>

                {/* Quick Item Count Input */}
                <Card bg="blue.50" borderRadius="lg" w="full" borderWidth="2px" borderColor="blue.200">
                  <CardBody p={4}>
                    <HStack justify="center" spacing={4}>
                      <Text color="blue.600" fontWeight="bold">
                        ⚡ Quick Setup - Number of Items:
                      </Text>
                      <NumberInput
                        value={itemCount}
                        onChange={(valueString, valueNumber) => handleItemCountChange(valueNumber || 1)}
                        min={1}
                        max={20}
                        size="md"
                        w="140px"
                      >
                        <NumberInputField
                          borderRadius="lg"
                          bg="white"
                          border="2px solid"
                          borderColor="blue.300"
                          _focus={{ borderColor: "blue.500" }}
                          fontWeight="bold"
                          textAlign="center"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper color="blue.500" />
                          <NumberDecrementStepper color="blue.500" />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text fontSize="sm" color="blue.500">
                        (1-20 items)
                      </Text>
                    </HStack>
                  </CardBody>
                </Card>

                <VStack spacing={4} w="full">
                  {formData.items.map((item, idx) => (
                    <Card
                      key={idx}
                      w="full"
                      bg="gray.50"
                      borderRadius="xl"
                      borderWidth="2px"
                      borderColor="gray.200"
                      _hover={{
                        borderColor: "blue.300",
                        shadow: "md",
                        transform: "translateY(-1px)",
                      }}
                      transition="all 0.2s"
                    >
                      <CardBody p={4}>
                        <VStack spacing={4}>
                          <HStack justify="space-between" w="full">
                            <HStack spacing={3}>
                              <Text fontSize="lg">{getItemIcon(item.type)}</Text>
                              <Text fontWeight="bold" color={textColor}>
                                Item #{idx + 1}
                              </Text>
                              <Badge colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="xs">
                                {item.type}
                              </Badge>
                            </HStack>
                            {formData.items.length > 1 && (
                              <Tooltip label="Remove Item">
                                <IconButton
                                  icon={<Text fontSize="sm">🗑️</Text>}
                                  onClick={() => handleRemoveItem(idx)}
                                  colorScheme="red"
                                  size="sm"
                                  borderRadius="full"
                                  variant="ghost"
                                  _hover={{
                                    bg: "red.100",
                                    transform: "scale(1.1)",
                                  }}
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
                                size="md"
                                borderRadius="lg"
                                bg="white"
                                border="2px solid"
                                borderColor="gray.200"
                                _focus={{ borderColor: "blue.400" }}
                              >
                                <option value="Carpet">🏠 Carpet</option>
                                <option value="Blanket">🛏️ Blanket</option>
                                <option value="Pillow">🛌 Pillow</option>
                              </Select>
                            </FormControl>

                            {item.type === "Carpet" && (
                              <>
                                <FormControl isInvalid={errors[`item_${idx}_length`]}>
                                  <FormLabel fontSize="sm" fontWeight="bold" color={textColor}>
                                    📏 Length (m)
                                  </FormLabel>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={item.length}
                                    onChange={(e) => handleItemChange(idx, "length", e.target.value)}
                                    placeholder="2.5"
                                    size="md"
                                    borderRadius="lg"
                                    bg="white"
                                    border="2px solid"
                                    borderColor={errors[`item_${idx}_length`] ? "red.300" : "gray.200"}
                                    _focus={{
                                      borderColor: errors[`item_${idx}_length`] ? "red.400" : "blue.400",
                                    }}
                                  />
                                  <FormErrorMessage>{errors[`item_${idx}_length`]}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors[`item_${idx}_width`]}>
                                  <FormLabel fontSize="sm" fontWeight="bold" color={textColor}>
                                    📐 Width (m)
                                  </FormLabel>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={item.width}
                                    onChange={(e) => handleItemChange(idx, "width", e.target.value)}
                                    placeholder="3.0"
                                    size="md"
                                    borderRadius="lg"
                                    bg="white"
                                    border="2px solid"
                                    borderColor={errors[`item_${idx}_width`] ? "red.300" : "gray.200"}
                                    _focus={{
                                      borderColor: errors[`item_${idx}_width`] ? "red.400" : "blue.400",
                                    }}
                                  />
                                  <FormErrorMessage>{errors[`item_${idx}_width`]}</FormErrorMessage>
                                </FormControl>

                                <FormControl colSpan={{ base: 1, md: 2 }}>
                                  <FormLabel fontSize="sm" fontWeight="bold" color={textColor}>
                                    ⚡ Quick Select
                                  </FormLabel>
                                  <HStack spacing={1} wrap="wrap">
                                    {PREDEFINED_MEASUREMENTS.map((measurement) => (
                                      <Tooltip key={measurement.label} label={`Set to ${measurement.label}m`}>
                                        <Button
                                          size="xs"
                                          variant={
                                            item.length === measurement.length && item.width === measurement.width
                                              ? "solid"
                                              : "outline"
                                          }
                                          colorScheme={
                                            item.length === measurement.length && item.width === measurement.width
                                              ? "blue"
                                              : "gray"
                                          }
                                          onClick={() =>
                                            applyPredefinedMeasurement(idx, measurement.length, measurement.width)
                                          }
                                          borderRadius="full"
                                          fontSize="xs"
                                          px={2}
                                          py={1}
                                          fontWeight="bold"
                                        >
                                          {measurement.label}
                                        </Button>
                                      </Tooltip>
                                    ))}
                                  </HStack>
                                </FormControl>
                              </>
                            )}

                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="bold" color={textColor}>
                                💰 Price (RON)
                              </FormLabel>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                                placeholder="0.00"
                                size="md"
                                borderRadius="lg"
                                bg="white"
                                border="2px solid"
                                borderColor="gray.200"
                                _focus={{ borderColor: "blue.400" }}
                                isReadOnly={item.type === "Blanket"}
                              />
                            </FormControl>
                          </SimpleGrid>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}

                  {formData.items.length === 0 && (
                    <Card w="full" bg="gray.50" borderRadius="xl" borderWidth="2px" borderStyle="dashed">
                      <CardBody p={8} textAlign="center">
                        <VStack spacing={3}>
                          <Text fontSize="4xl">📦</Text>
                          <Text color="gray.500" fontWeight="medium">
                            No items added yet
                          </Text>
                          <Text fontSize="sm" color="gray.400">
                            Use the number input above or click "Add Item" to get started
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Submit Buttons */}
          <HStack spacing={4} w="full">
            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingText="Creating Order..."
              colorScheme="blue"
              size="lg"
              borderRadius="full"
              bgGradient="linear(to-r, blue.400, blue.600)"
              _hover={{
                bgGradient: "linear(to-r, blue.500, blue.700)",
                transform: "translateY(-2px)",
                shadow: "xl",
              }}
              transition="all 0.2s"
              py={6}
              fontSize="lg"
              fontWeight="bold"
              flex={1}
            >
              🚀 Create Order
            </Button>

            <Button
              onClick={onCancel}
              variant="outline"
              colorScheme="gray"
              size="lg"
              borderRadius="full"
              py={6}
              fontSize="lg"
              fontWeight="bold"
              flex={1}
              _hover={{
                bg: "gray.100",
                transform: "translateY(-2px)",
                shadow: "md",
              }}
              transition="all 0.2s"
            >
              Cancel
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  )
}
