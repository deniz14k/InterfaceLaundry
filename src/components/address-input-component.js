"use client"

import { useState, useEffect } from "react"
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Card,
  CardBody,
  Heading,
  Text,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Badge,
  FormErrorMessage,
} from "@chakra-ui/react"

// Romanian cities for the dropdown
const ROMANIAN_CITIES = [
  "Cluj-Napoca",
  "București",
  "Timișoara",
  "Iași",
  "Constanța",
  "Craiova",
  "Brașov",
  "Galați",
  "Ploiești",
  "Oradea",
  "Brăila",
  "Arad",
  "Pitești",
  "Sibiu",
  "Bacău",
  "Târgu Mureș",
  "Baia Mare",
  "Buzău",
  "Botoșani",
  "Satu Mare",
  "Râmnicu Vâlcea",
  "Drobeta-Turnu Severin",
  "Suceava",
  "Piatra Neamț",
  "Târgu Jiu",
  "Tulcea",
  "Focșani",
  "Bistrița",
  "Reșița",
  "Alba Iulia",
]

export default function AddressInputComponent({ value = {}, onChange, errors = {}, isRequired = false }) {
  const [addressData, setAddressData] = useState({
    street: value.street || "",
    streetNumber: value.streetNumber || "",
    city: value.city || "Târgu Mureș",
    apartmentNumber: value.apartmentNumber || "",
  })

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.700", "gray.200")
  const inputBg = useColorModeValue("gray.50", "gray.700")

  useEffect(() => {
    setAddressData({
      street: value.street || "",
      streetNumber: value.streetNumber || "",
      city: value.city || "Târgu Mureș",
      apartmentNumber: value.apartmentNumber || "",
    })
  }, [value])

  const handleChange = (field, newValue) => {
    const updated = { ...addressData, [field]: newValue }
    setAddressData(updated)

    // Call parent onChange with the updated data
    onChange(updated)
  }

  const getFullAddress = () => {
    if (!addressData.street || !addressData.streetNumber || !addressData.city) {
      return ""
    }
    return `${addressData.street} ${addressData.streetNumber}, ${addressData.city}, Romania`
  }

  return (
    <Card bg={cardBg} shadow="md" borderRadius="xl" border="2px solid" borderColor="blue.200">
      <CardBody p={6}>
        <VStack spacing={6}>
          {/* Header */}
          <HStack w="full">
            <Text fontSize="xl">🏠</Text>
            <Heading size="md" color={textColor}>
              Adresa de livrare
            </Heading>
            {isRequired && (
              <Badge colorScheme="red" px={2} py={1} borderRadius="full" fontSize="xs">
                Required
              </Badge>
            )}
          </HStack>

          {/* Address Fields */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
            {/* Street Name */}
            <FormControl isInvalid={errors.street} isRequired={isRequired}>
              <FormLabel color={textColor} fontWeight="bold" fontSize="sm">
                🛣️ Strada
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Text fontSize="sm">📍</Text>
                </InputLeftElement>
                <Input
                  value={addressData.street}
                  onChange={(e) => handleChange("street", e.target.value)}
                  placeholder="e.g., Strada Lunii"
                  size="lg"
                  borderRadius="lg"
                  bg={inputBg}
                  border="2px solid"
                  borderColor={errors.street ? "red.300" : "gray.200"}
                  _focus={{
                    borderColor: errors.street ? "red.400" : "blue.400",
                    bg: "white",
                  }}
                  _hover={{ borderColor: errors.street ? "red.300" : "gray.300" }}
                />
              </InputGroup>
              <FormErrorMessage>{errors.street}</FormErrorMessage>
            </FormControl>

            {/* Street Number */}
            <FormControl isInvalid={errors.streetNumber} isRequired={isRequired}>
              <FormLabel color={textColor} fontWeight="bold" fontSize="sm">
                🔢 Numarul Strazii
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Text fontSize="sm">#️⃣</Text>
                </InputLeftElement>
                <Input
                  value={addressData.streetNumber}
                  onChange={(e) => handleChange("streetNumber", e.target.value)}
                  placeholder="e.g., 22"
                  size="lg"
                  borderRadius="lg"
                  bg={inputBg}
                  border="2px solid"
                  borderColor={errors.streetNumber ? "red.300" : "gray.200"}
                  _focus={{
                    borderColor: errors.streetNumber ? "red.400" : "blue.400",
                    bg: "white",
                  }}
                  _hover={{ borderColor: errors.streetNumber ? "red.300" : "gray.300" }}
                />
              </InputGroup>
              <FormErrorMessage>{errors.streetNumber}</FormErrorMessage>
            </FormControl>

            {/* City */}
            <FormControl isInvalid={errors.city} isRequired={isRequired}>
              <FormLabel color={textColor} fontWeight="bold" fontSize="sm">
                🏙️ Oras
              </FormLabel>
              <Select
                value={addressData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                size="lg"
                borderRadius="lg"
                bg={inputBg}
                border="2px solid"
                borderColor={errors.city ? "red.300" : "gray.200"}
                _focus={{
                  borderColor: errors.city ? "red.400" : "blue.400",
                  bg: "white",
                }}
                _hover={{ borderColor: errors.city ? "red.300" : "gray.300" }}
              >
                {ROMANIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.city}</FormErrorMessage>
            </FormControl>

            {/* Apartment Number */}
            <FormControl isInvalid={errors.apartmentNumber}>
              <FormLabel color={textColor} fontWeight="bold" fontSize="sm">
                🏢 Apartament
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Text fontSize="sm">🚪</Text>
                </InputLeftElement>
                <Input
                  type="number"
                  value={addressData.apartmentNumber}
                  onChange={(e) => handleChange("apartmentNumber", e.target.value)}
                  placeholder="e.g., 15"
                  size="lg"
                  borderRadius="lg"
                  bg={inputBg}
                  border="2px solid"
                  borderColor={errors.apartmentNumber ? "red.300" : "gray.200"}
                  _focus={{
                    borderColor: errors.apartmentNumber ? "red.400" : "blue.400",
                    bg: "white",
                  }}
                  _hover={{ borderColor: errors.apartmentNumber ? "red.300" : "gray.300" }}
                />
              </InputGroup>
              <FormErrorMessage>{errors.apartmentNumber}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          {/* Full Address Preview */}
          {getFullAddress() && (
            <Box w="full" p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
              <VStack spacing={2}>
                <HStack>
                  <Text fontSize="sm" fontWeight="bold" color="blue.700">
                    📋 Adresa Completa:
                  </Text>
                </HStack>
                <Text fontSize="sm" color="blue.600" fontWeight="medium" textAlign="center">
                  {getFullAddress()}
                  {addressData.apartmentNumber && (
                    <Text as="span" ml={2} px={2} py={1} bg="blue.100" borderRadius="md" fontSize="xs">
                      Apt. {addressData.apartmentNumber}
                    </Text>
                  )}
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
