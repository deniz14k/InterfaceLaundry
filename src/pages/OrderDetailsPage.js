"use client"

import { useEffect, useState } from "react"
import { getOrderById } from "../services/ordersService"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Flex,
  useToast,
} from "@chakra-ui/react"

import QRCode from "qrcode"

function OrderDetailsPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
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
    getOrderById(id)
      .then(setOrder)
      .catch(() => {
        alert("Failed to load order.")
        navigate(-1)
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "⏳"
      case "ready":
        return "📦"
      case "completed":
        return "✅"
      case "cancelled":
        return "❌"
      default:
        return "📋"
    }
  }

// Function to print individual item label
  const printItemLabel = async () => {
    try {
      // Generate QR code for order details URL
      const orderDetailsUrl = `${window.location.origin}/orders/${order.id}`
      const qrCodeDataUrl = await QRCode.toDataURL(orderDetailsUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })

      const itemCount = order.items?.length || 0
      const labelId = `${order.id}/${itemCount}`

      // Create label content optimized for 7cm x 8cm
      const labelContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Item Label - ${labelId}</title>
        <style>
          @page {
            size: 7cm 8cm;
            margin: 0.3cm;
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0.2cm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 7.4cm;
            box-sizing: border-box;
          }
          .label-container {
            text-align: center;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 0.3cm;
            box-sizing: border-box;
          }
          .header {
            font-size: 12px;
            font-weight: bold;
            color: #333;
            margin-bottom: 0.2cm;
          }
          .order-info {
            font-size: 24px;
            font-weight: bold;
            color: #000;
            margin: 0.3cm 0;
            letter-spacing: 1px;
          }
          .qr-code {
            margin: 0.2cm 0;
          }
          .qr-code img {
            width: 3cm;
            height: 3cm;
          }
          .footer {
            font-size: 10px;
            color: #666;
            margin-top: 0.2cm;
          }
          .service-type {
            font-size: 11px;
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 4px;
            margin: 0.1cm 0;
          }
          @media print { 
            body { margin: 0; }
            .label-container { border: 2px solid #333; }
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="header">🧺 LAUNDRYPRO</div>
          
          <div class="order-info">${labelId}</div>
          
          <div class="service-type">${order.serviceType}</div>
          
          <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="QR Code for Order ${order.id}" />
          </div>
          
          <div class="footer">
            <div>Customer: #${order.customerId}</div>
            <div>${new Date(order.receivedDate).toLocaleDateString()}</div>
          </div>
        </div>
      </body>
      </html>
    `

      const printWindow = window.open("", "_blank")
      printWindow.document.write(labelContent)
      printWindow.document.close()
      printWindow.print()

      toast({
        status: "success",
        title: "🏷️ Label ready!",
        description: `Item label for ${labelId} sent to printer`,
      })
    } catch (error) {
      console.error("Error generating label:", error)
      toast({
        status: "error",
        title: "❌ Label error",
        description: "Failed to generate item label",
      })
    }
  }




  if (loading) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" />
          <Text fontSize="lg" fontWeight="medium" color={textColor}>
            Loading order details...
          </Text>
        </VStack>
      </Box>
    )
  }

  if (!order) return null

  const totalPrice = order.items?.reduce((sum, item) => sum + item.price, 0) || order.totalPrice || 0

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="6xl" py={8}>
        {/* Header Section */}
        <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <Box h="4px" bgGradient="linear(to-r, blue.400, purple.400, pink.400)" />
          <CardBody p={8}>
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={5}>
                <HStack>
                  <Text fontSize="3xl">📄</Text>
                  <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                    Order #{order.orderNumber}

                  </Heading>
                </HStack>


<Button
                  leftIcon={<Text fontSize="xl"></Text>}
                  colorScheme="blue"
                  size="lg"
                 onClick={() => navigate(`/edit/${order.id}`)}
                  borderRadius="full"
                  px={8}
                  py={4}
                  fontSize="lg"
                  fontWeight="bold"
                >
                  Edit Order 
                </Button>

                <HStack>
                  <Badge
                    colorScheme={getStatusColor(order.status)}
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    {getStatusIcon(order.status)} {order.status}
                  </Badge>
                </HStack>
              </VStack>

              <VStack align="end" spacing={2}>
                <Stat textAlign="right">
                  <StatLabel color={textColor}>Total Amount</StatLabel>
                  <StatNumber fontSize="3xl" color="green.500" fontWeight="bold">
                    {totalPrice.toFixed(2)} RON
                  </StatNumber>
                </Stat>
              </VStack>
            </Flex>

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
              Back to Orders
            </Button>
          </CardBody>
        </Card>

        {/* Order Information */}
        <Card mb={6} bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <HStack mb={6}>
              <Text fontSize="2xl">ℹ️</Text>
              <Heading size="lg">Order Information</Heading>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" color="blue.500">
                  👤 Customer ID
                </Text>
                <Text color={textColor} fontSize="lg">
                  #{order.customerId}
                </Text>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" color="green.500">
                  📞 Phone Number
                </Text>
                <Text color={textColor} fontSize="lg">
                  {order.telephoneNumber}
                </Text>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" color="purple.500">
                  🧼 Service Type
                </Text>
                <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                  {order.serviceType}
                </Badge>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" color="blue.500">
                  📅 Received Date
                </Text>
                <Text color={textColor} fontSize="lg">
                  {new Date(order.receivedDate).toLocaleString()}
                </Text>
              </VStack>

              {order.completedDate && (
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold" color="green.500">
                    ✅ Completed Date
                  </Text>
                  <Text color={textColor} fontSize="lg">
                    {new Date(order.completedDate).toLocaleString()}
                  </Text>
                </VStack>
              )}

              {order.serviceType === "PickupDelivery" && order.deliveryAddress && (
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold" color="orange.500">
                    📍 Delivery Address
                  </Text>
                  <VStack align="start" spacing={1}>
                    <Text color={textColor} fontSize="lg">
                      {order.deliveryAddress}
                    </Text>
                    {order.apartmentNumber && (
                      <Badge colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="sm">
                        🏢 Apartment {order.apartmentNumber}
                      </Badge>
                    )}
                  </VStack>
                </VStack>
              )}
            </SimpleGrid>

            {order.observation && (
              <>
                <Divider my={6} />
                <VStack align="start" spacing={3}>
                  <Text fontWeight="bold" color="orange.500" fontSize="lg">
                    📝 Special Notes
                  </Text>
                  <Box bg="orange.50" p={4} borderRadius="xl" borderLeft="4px solid" borderColor="orange.400" w="full">
                    <Text color={textColor} fontSize="lg">
                      {order.observation}
                    </Text>
                  </Box>
                </VStack>
              </>
            )}
          </CardBody>
        </Card>

        {/* Items Section */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <HStack mb={6}>
              <Text fontSize="2xl">🧼</Text>
              <Heading size="lg">Laundry Items ({order.items?.length || 0})</Heading>
            </HStack>

            {order.items && order.items.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple" size="lg">
                  <Thead>
                    <Tr bg="gray.50">
                      <Th fontSize="md" color="gray.600">
                        Item Type
                      </Th>
                      <Th fontSize="md" color="gray.600">
                        Dimensions
                      </Th>
                      <Th fontSize="md" color="gray.600" isNumeric>
                        Price (RON)
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {order.items.map((item, idx) => (
                      <Tr
                        key={idx}
                        _hover={{
                          bg: "blue.50",
                          transform: "scale(1.01)",
                          transition: "all 0.2s",
                        }}
                      >
                        <Td>
                          <HStack>
                            <Text fontSize="lg">👕</Text>
                            <Text fontWeight="medium" color={textColor}>
                              {item.type}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          {item.length && item.width ? (
                            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                              {item.length} × {item.width}
                            </Badge>
                          ) : (
                            <Text color="gray.400">Standard Size</Text>
                          )}
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="bold" color="green.500" fontSize="lg">
                            {item.price.toFixed(2)} RON
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box textAlign="center" py={8}>
                <VStack spacing={3}>
                  <Text fontSize="4xl">📦</Text>
                  <Text fontSize="lg" color="gray.500">
                    No items found for this order
                  </Text>
                </VStack>
              </Box>
            )}

            <Divider my={6} />
            <Flex justify="space-between" align="center">
              <Text fontSize="xl" fontWeight="bold" color={textColor}>
                Total Amount:
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                💰 {totalPrice.toFixed(2)} RON
              </Text>
            </Flex>
          </CardBody>
        </Card>

        {/* Enhanced Print Options Panel */}
        <Card mt={6} bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={6}>
            <VStack spacing={6}>
              <HStack>
                <Text fontSize="xl">🖨️</Text>
                <Heading size="md" color={textColor}>
                  Print Options
                </Heading>
              </HStack>



              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} w="full">
                <Button
                  leftIcon={<Text fontSize="lg">📄</Text>}
                  colorScheme="blue"
                  size="lg"
                  onClick={() => {
                    // Create a clean print version
                    const printContent = `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>Order #${order.id} - LaundryPro</title>
                        <style>
                          body { font-family: Arial, sans-serif; margin: 20px; }
                          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                          .section { margin-bottom: 20px; }
                          .label { font-weight: bold; color: #333; }
                          .value { margin-left: 10px; }
                          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                          th { background-color: #f2f2f2; }
                          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
                          @media print { body { margin: 0; } }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1>🧺 LaundryPro</h1>
                          <h2>Order #${order.orderNumber}</h2>
                          <p>Premium Laundry Service</p>
                        </div>
                        
                        <div class="section">
                          <h3>📋 Order Information</h3>
                          <p><span class="label">Customer ID:</span><span class="value">#${order.customerId}</span></p>
                          <p><span class="label">Phone:</span><span class="value">${order.telephoneNumber}</span></p>
                          <p><span class="label">Status:</span><span class="value">${order.status}</span></p>
                          <p><span class="label">Service Type:</span><span class="value">${order.serviceType}</span></p>
                          <p><span class="label">Received:</span><span class="value">${new Date(order.receivedDate).toLocaleString()}</span></p>
                          ${order.completedDate ? `<p><span class="label">Completed:</span><span class="value">${new Date(order.completedDate).toLocaleString()}</span></p>` : ""}
                          ${order.deliveryAddress ? `<p><span class="label">Delivery Address:</span><span class="value">${order.deliveryAddress}${order.apartmentNumber ? ` (Apt. ${order.apartmentNumber})` : ""}</span></p>` : ""}
                          ${order.observation ? `<p><span class="label">Notes:</span><span class="value">${order.observation}</span></p>` : ""}
                        </div>
                        
                        <div class="section">
                          <h3>🧼 Items (${order.items?.length || 0})</h3>
                          <table>
                            <thead>
                              <tr>
                                <th>Item Type</th>
                                <th>Dimensions</th>
                                <th>Price (RON)</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${
                                order.items
                                  ?.map(
                                    (item) => `
                                <tr>
                                  <td>${item.type}</td>
                                  <td>${item.length && item.width ? `${item.length} × ${item.width}` : "Standard Size"}</td>
                                  <td>${item.price.toFixed(2)} RON</td>
                                </tr>
                              `,
                                  )
                                  .join("") || '<tr><td colspan="3">No items</td></tr>'
                              }
                            </tbody>
                          </table>
                        </div>
                        
                        <div class="total">
                          💰 Total Amount: ${totalPrice.toFixed(2)} RON
                        </div>
                        
                        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
                          <p>Thank you for choosing LaundryPro!</p>
                          <p>Printed on ${new Date().toLocaleString()}</p>
                        </div>
                      </body>
                      </html>
                    `

                    const printWindow = window.open("", "_blank")
                    printWindow.document.write(printContent)
                    printWindow.document.close()
                    printWindow.print()
                  }}
                  borderRadius="xl"
                  px={6}
                  py={4}
                  fontSize="md"
                  fontWeight="bold"
                  _hover={{
                    transform: "translateY(-2px)",
                    shadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Full Order
                </Button>

                <Button
                  leftIcon={<Text fontSize="lg">🧾</Text>}
                  colorScheme="green"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    // Create a receipt-style print
                    const receiptContent = `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>Receipt #${order.id}</title>
                        <style>
                          body { font-family: 'Courier New', monospace; margin: 20px; max-width: 400px; }
                          .receipt { border: 2px dashed #333; padding: 20px; }
                          .center { text-align: center; }
                          .line { border-bottom: 1px dashed #333; margin: 10px 0; }
                          .item-row { display: flex; justify-content: space-between; margin: 5px 0; }
                          .total { font-weight: bold; font-size: 16px; margin-top: 15px; }
                          @media print { body { margin: 0; } }
                        </style>
                      </head>
                      <body>
                        <div class="receipt">
                          <div class="center">
                            <h2>🧺 LAUNDRYPRO</h2>
                            <p>Premium Laundry Service</p>
                            <div class="line"></div>
                          </div>
                          
                          <p><strong>Order #:</strong> ${order.id}</p>
                          <p><strong>Customer:</strong> #${order.customerId}</p>
                          <p><strong>Phone:</strong> ${order.telephoneNumber}</p>
                          <p><strong>Date:</strong> ${new Date(order.receivedDate).toLocaleDateString()}</p>
                          <p><strong>Status:</strong> ${order.status}</p>
                          
                          <div class="line"></div>
                          
                          <h3>ITEMS:</h3>
                          ${
                            order.items
                              ?.map(
                                (item) => `
                            <div class="item-row">
                              <span>${item.type}${item.length && item.width ? ` (${item.length}×${item.width})` : ""}</span>
                              <span>${item.price.toFixed(2)} RON</span>
                            </div>
                          `,
                              )
                              .join("") || "<p>No items</p>"
                          }
                          
                          <div class="line"></div>
                          
                          <div class="item-row total">
                            <span>TOTAL:</span>
                            <span>${totalPrice.toFixed(2)} RON</span>
                          </div>
                          
                          <div class="line"></div>
                          
                          <div class="center">
                            <p>Thank you for your business!</p>
                            <p style="font-size: 12px;">Printed: ${new Date().toLocaleString()}</p>
                          </div>
                        </div>
                      </body>
                      </html>
                    `

                    const printWindow = window.open("", "_blank")
                    printWindow.document.write(receiptContent)
                    printWindow.document.close()
                    printWindow.print()
                  }}
                  borderRadius="xl"
                  px={6}
                  py={4}
                  fontSize="md"
                  fontWeight="bold"
                  _hover={{
                    bg: "green.50",
                    transform: "translateY(-2px)",
                    shadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Receipt Style
                </Button>

                <Button
                  leftIcon={<Text fontSize="lg">📋</Text>}
                  colorScheme="purple"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const summaryText = `
ORDER SUMMARY - LaundryPro
========================

Order #: ${order.id}
Customer: #${order.customerId}
Phone: ${order.telephoneNumber}
Status: ${order.status}
Service: ${order.serviceType}
${order.deliveryAddress ? `Address: ${order.deliveryAddress}${order.apartmentNumber ? ` (Apt. ${order.apartmentNumber})` : ""}` : ""}
Received: ${new Date(order.receivedDate).toLocaleString()}
${order.completedDate ? `Completed: ${new Date(order.completedDate).toLocaleString()}` : ""}

ITEMS (${order.items?.length || 0}):
${
  order.items
    ?.map(
      (item, idx) =>
        `${idx + 1}. ${item.type}${item.length && item.width ? ` (${item.length}×${item.width})` : ""} - ${item.price.toFixed(2)} RON`,
    )
    .join("\n") || "No items"
}

TOTAL: ${totalPrice.toFixed(2)} RON

${order.observation ? `Notes: ${order.observation}` : ""}

Generated: ${new Date().toLocaleString()}
                    `.trim()

                    navigator.clipboard.writeText(summaryText)
                    toast({
                      status: "success",
                      title: "📋 Summary copied!",
                      description: "Order summary copied to clipboard",
                    })
                  }}
                  borderRadius="xl"
                  px={6}
                  py={4}
                  fontSize="md"
                  fontWeight="bold"
                  _hover={{
                    bg: "purple.50",
                    transform: "translateY(-2px)",
                    shadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Copy Summary
                </Button>

                <Button
                  leftIcon={<Text fontSize="lg">📧</Text>}
                  colorScheme="orange"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const emailSubject = `Order #${order.id} - LaundryPro`
                    const emailBody = `
Hello,

Here are the details for Order #${order.orderNumber}:

Customer: #${order.customerId}
Phone: ${order.telephoneNumber}
Status: ${order.status}
Service Type: ${order.serviceType}
${order.deliveryAddress ? `Delivery Address: ${order.deliveryAddress}${order.apartmentNumber ? ` (Apartment ${order.apartmentNumber})` : ""}` : ""}

Items (${order.items?.length || 0}):
${
  order.items
    ?.map(
      (item, idx) =>
        `${idx + 1}. ${item.type}${item.length && item.width ? ` (${item.length}×${item.width})` : ""} - ${item.price.toFixed(2)} RON`,
    )
    .join("\n") || "No items"
}

Total Amount: ${totalPrice.toFixed(2)} RON

${order.observation ? `Special Notes: ${order.observation}` : ""}

Best regards,
LaundryPro Team
                    `.trim()

                    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
                    window.open(mailtoLink)
                  }}
                  borderRadius="xl"
                  px={6}
                  py={4}
                  fontSize="md"
                  fontWeight="bold"
                  _hover={{
                    bg: "orange.50",
                    transform: "translateY(-2px)",
                    shadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Email Details
                </Button>
              </SimpleGrid>

{/* New Print Item Label Button */}
                <Button
                  leftIcon={<Text fontSize="lg">🏷️</Text>}
                  colorScheme="teal"
                  size="lg"
                  onClick={printItemLabel}
                  borderRadius="xl"
                  px={6}
                  py={4}
                  fontSize="md"
                  fontWeight="bold"
                  _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                  transition="all 0.2s"
                >
                  Print Item Label
                </Button>

              <Text fontSize="sm" color="gray.500" textAlign="center">
                Choose your preferred format for printing or sharing order details
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}

export default OrderDetailsPage
