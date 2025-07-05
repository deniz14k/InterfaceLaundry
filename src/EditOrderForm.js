"use client"

import { useState, useEffect } from "react"
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
  Divider,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  SimpleGrid,
  Flex,
  Tooltip,
} from "@chakra-ui/react"
import { updateOrder, parseAddressComponents } from "./services/ordersService"
import { itemProgressService } from "./services/itemProgressService"
import AddressInputComponent from "./components/address-input-component"

export default function EditOrderForm({ order, onOrderUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    id: "",
    customerId: "",
    telephoneNumber: "",
    receivedDate: "",
    status: "",
    serviceType: "Office",
    observation: "",
    // Address components
    deliveryCity: "",
    deliveryStreet: "",
    deliveryStreetNumber: "",
    apartmentNumber: "",
    items: [],
  })

  const [itemCount, setItemCount] = useState(1)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")

  // Initialize form data when order prop changes
  useEffect(() => {
    if (order) {
      // Parse existing address into components
      const addressComponents = parseAddressComponents(order.deliveryAddress, order.apartmentNumber)

      // Load completion status from localStorage
      const items = order.items || []
      const itemsWithCompletion = items.map((item, index) => ({
        ...item,
        isCompleted: itemProgressService.isItemCompleted(order.id, index),
      }))

      setFormData({
        id: order.id,
        customerId: order.customerId || "",
        telephoneNumber: order.telephoneNumber || "",
        receivedDate: order.receivedDate ? new Date(order.receivedDate).toISOString().slice(0, 16) : "",
        status: order.status || "Pending",
        serviceType: order.serviceType || "Office",
        observation: order.observation || "",
        deliveryCity: addressComponents.deliveryCity,
        deliveryStreet: addressComponents.deliveryStreet,
        deliveryStreetNumber: addressComponents.deliveryStreetNumber,
        apartmentNumber: addressComponents.apartmentNumber,
        items:
          itemsWithCompletion.length > 0
            ? itemsWithCompletion
            : [{ type: "Carpet", length: "", width: "", price: 0, isCompleted: false }],
      })

      setItemCount(itemsWithCompletion.length > 0 ? itemsWithCompletion.length : 1)
    }
  }, [order])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleAddressChange = (addressData) => {
    setFormData((prev) => ({
      ...prev,
      deliveryCity: addressData.city,
      deliveryStreet: addressData.street,
      deliveryStreetNumber: addressData.streetNumber,
      apartmentNumber: addressData.apartmentNumber,
    }))

    // Clear address-related errors
    setErrors((prev) => ({
      ...prev,
      deliveryCity: "",
      deliveryStreet: "",
      deliveryStreetNumber: "",
    }))
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
          length: "",
          width: "",
          price: 0,
          isCompleted: false,
        })
      }
    } else if (value < currentItems.length) {
      // Remove excess items
      currentItems.splice(value)
    }

    setFormData((prev) => ({ ...prev, items: currentItems }))
  }

  const addItem = () => {
    const newCount = itemCount + 1
    setItemCount(newCount)
    handleItemCountChange(newCount)
  }

  const updateItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData((prev) => ({ ...prev, items: newItems }))
      setItemCount(newItems.length)
    }
  }

  const handleItemCompletionToggle = (index) => {
    const newItems = [...formData.items]
    newItems[index].isCompleted = !newItems[index].isCompleted
    setFormData((prev) => ({ ...prev, items: newItems }))

    // Save to localStorage immediately
    itemProgressService.updateItemCompletion(order.id, index, newItems[index].isCompleted)

    // Show toast feedback
    toast({
      title: newItems[index].isCompleted ? "✅ Item marked as completed!" : "⏳ Item marked as pending",
      status: newItems[index].isCompleted ? "success" : "info",
      duration: 2000,
      isClosable: true,
    })
  }

  const markAllItemsCompleted = () => {
    const newItems = formData.items.map((item) => ({ ...item, isCompleted: true }))
    setFormData((prev) => ({ ...prev, items: newItems }))

    // Save all to localStorage
    itemProgressService.markAllCompleted(order.id, formData.items.length)

    toast({
      title: "🎉 All items marked as completed!",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.customerId.trim()) {
      newErrors.customerId = "Customer name is required"
    }

    if (!formData.telephoneNumber.trim()) {
      newErrors.telephoneNumber = "Phone number is required"
    } else if (!/^(\+40|0)[0-9]{9}$/.test(formData.telephoneNumber.replace(/\s/g, ""))) {
      newErrors.telephoneNumber = "Please enter a valid Romanian phone number"
    }

    if (!formData.receivedDate) {
      newErrors.receivedDate = "Received date is required"
    }

    if (formData.serviceType === "PickupDelivery") {
      if (!formData.deliveryCity.trim()) {
        newErrors.deliveryCity = "City is required for delivery"
      }
      if (!formData.deliveryStreet.trim()) {
        newErrors.deliveryStreet = "Street is required for delivery"
      }
      if (!formData.deliveryStreetNumber.trim()) {
        newErrors.deliveryStreetNumber = "Street number is required for delivery"
      }
    }

    if (formData.items.length === 0) {
      newErrors.items = "At least one item is required"
    }

    // Validate each item
    formData.items.forEach((item, index) => {
      if (item.type === "Carpet") {
        if (!item.length || item.length <= 0) {
          newErrors[`item_${index}_length`] = "Length is required for carpets"
        }
        if (!item.width || item.width <= 0) {
          newErrors[`item_${index}_width`] = "Width is required for carpets"
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
        title: "Validation Error",
        description: "Please fix the errors in the form",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        ...formData,
        // Ensure apartment number is sent as integer or null
        apartmentNumber: formData.apartmentNumber ? Number.parseInt(formData.apartmentNumber) : null,
      }

      await updateOrder(formData.id, orderData)

      // Save final completion states to localStorage
      formData.items.forEach((item, index) => {
        itemProgressService.updateItemCompletion(order.id, index, item.isCompleted)
      })

      toast({
        title: "Success! 🎉",
        description: `Order #${formData.id} updated successfully!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      if (onOrderUpdated) {
        onOrderUpdated()
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
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

  const getCompletedItemsCount = () => {
    return formData.items.filter((item) => item.isCompleted).length
  }

  const getCompletionPercentage = () => {
    if (formData.items.length === 0) return 0
    return Math.round((getCompletedItemsCount() / formData.items.length) * 100)
  }

  if (!order) {
    return (
      <Card bg={cardBg} shadow="xl" borderRadius="2xl">
        <CardBody p={8} textAlign="center">
          <Text color={textColor}>Loading order data...</Text>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
      <CardBody p={8}>
        <VStack spacing={6} align="stretch">
          {/* Header with Progress */}
          <Card bg="blue.50" borderRadius="lg" borderWidth="2px" borderColor="blue.200">
            <CardBody p={4}>
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Text fontSize="xl">✏️</Text>
                    <Heading size="lg" color="blue.600">
                      Edit Order #{order.id}
                    </Heading>
                  </HStack>
                  <Text fontSize="sm" color="blue.500">
                    Track and manage item completion
                  </Text>
                </VStack>

                <VStack align="end" spacing={2}>
                  <Text fontSize="lg" fontWeight="bold" color="blue.700">
                    {getCompletedItemsCount()}/{formData.items.length} completed
                  </Text>
                  <Badge
                    colorScheme={
                      getCompletionPercentage() === 100 ? "green" : getCompletionPercentage() >= 50 ? "yellow" : "red"
                    }
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                  >
                    {getCompletionPercentage()}% done
                  </Badge>
                </VStack>
              </Flex>
            </CardBody>
          </Card>

          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {/* Customer Information */}
              <Box>
                <Heading size="md" mb={4} color={textColor}>
                  👤 Customer Information
                </Heading>
                <VStack spacing={4}>
                  <FormControl isInvalid={errors.customerId}>
                    <FormLabel color={textColor}>Customer Name</FormLabel>
                    <Input
                      value={formData.customerId}
                      onChange={(e) => handleInputChange("customerId", e.target.value)}
                      placeholder="Enter customer name"
                      size="lg"
                      borderRadius="xl"
                    />
                    <FormErrorMessage>{errors.customerId}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.telephoneNumber}>
                    <FormLabel color={textColor}>Phone Number</FormLabel>
                    <Input
                      value={formData.telephoneNumber}
                      onChange={(e) => handleInputChange("telephoneNumber", e.target.value)}
                      placeholder="+40 123 456 789"
                      size="lg"
                      borderRadius="xl"
                    />
                    <FormErrorMessage>{errors.telephoneNumber}</FormErrorMessage>
                  </FormControl>
                </VStack>
              </Box>

              <Divider />

              {/* Order Details */}
              <Box>
                <Heading size="md" mb={4} color={textColor}>
                  📋 Order Details
                </Heading>
                <VStack spacing={4}>
                  <FormControl isInvalid={errors.receivedDate}>
                    <FormLabel color={textColor}>Received Date</FormLabel>
                    <Input
                      type="datetime-local"
                      value={formData.receivedDate}
                      onChange={(e) => handleInputChange("receivedDate", e.target.value)}
                      size="lg"
                      borderRadius="xl"
                    />
                    <FormErrorMessage>{errors.receivedDate}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textColor}>Status</FormLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      size="lg"
                      borderRadius="xl"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Ready">Ready</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textColor}>Service Type</FormLabel>
                    <Select
                      value={formData.serviceType}
                      onChange={(e) => handleInputChange("serviceType", e.target.value)}
                      size="lg"
                      borderRadius="xl"
                    >
                      <option value="Office">Office Pickup</option>
                      <option value="PickupDelivery">Pickup & Delivery</option>
                    </Select>
                  </FormControl>
                </VStack>
              </Box>

              {/* Address Section - Only for Pickup & Delivery */}
              {formData.serviceType === "PickupDelivery" && (
                <>
                  <Divider />
                  <Box>
                    <Heading size="md" mb={4} color={textColor}>
                      📍 Delivery Address
                    </Heading>
                    <AddressInputComponent
                      value={{
                        city: formData.deliveryCity,
                        street: formData.deliveryStreet,
                        streetNumber: formData.deliveryStreetNumber,
                        apartmentNumber: formData.apartmentNumber,
                      }}
                      onChange={handleAddressChange}
                      errors={{
                        city: errors.deliveryCity,
                        street: errors.deliveryStreet,
                        streetNumber: errors.deliveryStreetNumber,
                      }}
                    />
                  </Box>
                </>
              )}

              <Divider />

              {/* Items Section */}
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md" color={textColor}>
                    📦 Items ({formData.items.length})
                  </Heading>
                  <HStack spacing={2}>
                    <Button
                      leftIcon={<Text fontSize="sm">🎯</Text>}
                      onClick={markAllItemsCompleted}
                      colorScheme="green"
                      size="sm"
                      borderRadius="full"
                      variant="outline"
                    >
                      Mark All Done
                    </Button>
                    <Button
                      leftIcon={<Text fontSize="lg">➕</Text>}
                      onClick={addItem}
                      colorScheme="blue"
                      size="sm"
                      borderRadius="full"
                    >
                      Add Item
                    </Button>
                  </HStack>
                </HStack>

                {/* Quick Item Count Input */}
                <Card bg="blue.50" borderRadius="lg" mb={4} borderWidth="2px" borderColor="blue.200">
                  <CardBody p={4}>
                    <HStack justify="center" spacing={4}>
                      <Text color="blue.600" fontWeight="medium">
                        Quick adjust item count:
                      </Text>
                      <NumberInput
                        value={itemCount}
                        onChange={(valueString, valueNumber) => handleItemCountChange(valueNumber || 1)}
                        min={1}
                        max={20}
                        size="md"
                        w="120px"
                      >
                        <NumberInputField
                          borderRadius="lg"
                          bg="white"
                          border="2px solid"
                          borderColor="blue.300"
                          _focus={{ borderColor: "blue.500" }}
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper color="blue.500" />
                          <NumberDecrementStepper color="blue.500" />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>
                  </CardBody>
                </Card>

                {errors.items && (
                  <Text color="red.500" fontSize="sm" mb={4}>
                    {errors.items}
                  </Text>
                )}

                <VStack spacing={4}>
                  {formData.items.map((item, index) => (
                    <Card
                      key={index}
                      w="full"
                      bg={item.isCompleted ? "green.50" : "gray.50"}
                      borderRadius="xl"
                      borderWidth="2px"
                      borderColor={item.isCompleted ? "green.200" : "gray.200"}
                    >
                      <CardBody p={4}>
                        <VStack spacing={3}>
                          <HStack justify="space-between" w="full">
                            <HStack spacing={3}>
                              <Checkbox
                                isChecked={item.isCompleted}
                                onChange={() => handleItemCompletionToggle(index)}
                                colorScheme="green"
                                size="lg"
                              />
                              <Text fontSize="lg">{getItemIcon(item.type)}</Text>
                              <Text fontWeight="bold" color={textColor}>
                                Item #{index + 1}
                              </Text>
                              {item.isCompleted && (
                                <Badge colorScheme="green" px={2} py={1} borderRadius="full" fontSize="xs">
                                  ✅ Completed
                                </Badge>
                              )}
                            </HStack>
                            {formData.items.length > 1 && (
                              <Tooltip label="Remove Item">
                                <IconButton
                                  icon={<Text fontSize="sm">🗑️</Text>}
                                  onClick={() => removeItem(index)}
                                  colorScheme="red"
                                  size="sm"
                                  borderRadius="full"
                                  variant="ghost"
                                />
                              </Tooltip>
                            )}
                          </HStack>

                          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3} w="full">
                            <FormControl>
                              <FormLabel fontSize="sm">Type</FormLabel>
                              <Select
                                value={item.type}
                                onChange={(e) => updateItem(index, "type", e.target.value)}
                                size="md"
                                borderRadius="lg"
                                bg="white"
                              >
                                <option value="Carpet">🏠 Carpet</option>
                                <option value="Blanket">🛏️ Blanket</option>
                                <option value="Pillow">🛌 Pillow</option>
                              </Select>
                            </FormControl>

                            {item.type === "Carpet" && (
                              <>
                                <FormControl isInvalid={errors[`item_${index}_length`]}>
                                  <FormLabel fontSize="sm">Length (m)</FormLabel>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={item.length}
                                    onChange={(e) =>
                                      updateItem(index, "length", Number.parseFloat(e.target.value) || "")
                                    }
                                    placeholder="2.5"
                                    size="md"
                                    borderRadius="lg"
                                    bg="white"
                                  />
                                  <FormErrorMessage>{errors[`item_${index}_length`]}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors[`item_${index}_width`]}>
                                  <FormLabel fontSize="sm">Width (m)</FormLabel>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={item.width}
                                    onChange={(e) =>
                                      updateItem(index, "width", Number.parseFloat(e.target.value) || "")
                                    }
                                    placeholder="3.0"
                                    size="md"
                                    borderRadius="lg"
                                    bg="white"
                                  />
                                  <FormErrorMessage>{errors[`item_${index}_width`]}</FormErrorMessage>
                                </FormControl>
                              </>
                            )}

                            <FormControl>
                              <FormLabel fontSize="sm">Price (RON)</FormLabel>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => updateItem(index, "price", Number.parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                size="md"
                                borderRadius="lg"
                                bg="white"
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
                          <Text color="gray.500">No items added yet</Text>
                          <Text fontSize="sm" color="gray.400">
                            Click "Add Item" to get started
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </Box>

              <Divider />

              {/* Special Notes */}
              <Box>
                <Heading size="md" mb={4} color={textColor}>
                  📝 Special Notes
                </Heading>
                <FormControl>
                  <Textarea
                    value={formData.observation}
                    onChange={(e) => handleInputChange("observation", e.target.value)}
                    placeholder="Any special instructions or notes..."
                    size="lg"
                    borderRadius="xl"
                    rows={3}
                  />
                </FormControl>
              </Box>

              {/* Submit Buttons */}
              <HStack spacing={4}>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="Updating Order..."
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
                  💾 Update Order
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
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </form>
        </VStack>
      </CardBody>
    </Card>
  )
}
