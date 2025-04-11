/**
 * This file contains utility functions for generating property-related suggestions
 * for the property listing form components.
 */

// Country options for the dropdown
export const countries = [
  { value: "us", label: "United States" },
  { value: "mx", label: "Mexico" },
  { value: "ca", label: "Canada" },
  { value: "es", label: "Spain" },
  { value: "gb", label: "United Kingdom" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "it", label: "Italy" },
  { value: "br", label: "Brazil" },
  { value: "ar", label: "Argentina" },
  { value: "co", label: "Colombia" },
  { value: "cl", label: "Chile" },
  { value: "pe", label: "Peru" },
  { value: "au", label: "Australia" },
  { value: "nz", label: "New Zealand" },
  { value: "jp", label: "Japan" },
  { value: "cn", label: "China" },
  { value: "sg", label: "Singapore" },
  { value: "ae", label: "United Arab Emirates" },
];

/**
 * Generates title suggestions based on property type
 */
export function getTitleSuggestions(propertyType: string): string[] {
  const baseSuggestions = [
    "Beautiful Property with Amazing Views",
    "Newly Renovated Property for Sale",
    "Perfect Location for Your Next Home",
    "Modern Property in Desirable Neighborhood",
    "Spacious Property with Great Amenities"
  ];

  const typeSpecificSuggestions: Record<string, string[]> = {
    house: [
      "Elegant Family Home with Private Garden",
      "Modern Single-Family House in Safe Neighborhood",
      "Charming Ranch-Style Home with Spacious Yard",
      "Stunning Colonial House with Classic Details",
      "Contemporary Home with Open Concept Living",
      "Spacious Two-Story Home Perfect for Families",
      "Cozy Craftsman Home in Established Neighborhood"
    ],
    apartment: [
      "Bright & Spacious Urban Apartment",
      "Modern Apartment with City Views",
      "Renovated Apartment in Historic Building",
      "Luxury High-Rise Apartment with Amenities",
      "Cozy Studio Apartment in Central Location",
      "Stylish Loft Apartment with High Ceilings",
      "Sunny Corner Apartment with Balcony"
    ],
    condo: [
      "Modern Condo with Resort-Style Amenities",
      "Luxury Waterfront Condo with Amazing Views",
      "Exclusive Penthouse Condo with Private Terrace",
      "Contemporary Condo in Secure Building",
      "Spacious Corner Condo with Updated Features",
      "Urban Condo Steps from Shopping & Dining",
      "Newly Built Condo with Designer Finishes"
    ],
    townhouse: [
      "Elegant Townhouse with Private Courtyard",
      "Modern Townhome in Gated Community",
      "Multi-Level Townhouse with Rooftop Deck",
      "End-Unit Townhouse with Abundant Natural Light",
      "Urban Townhouse with Private Garage",
      "Contemporary Townhome with Open Floor Plan",
      "Spacious Townhouse in Established Community"
    ],
    land: [
      "Prime Residential Building Lot",
      "Agricultural Land with Development Potential",
      "Commercial Lot in High-Traffic Area",
      "Scenic Undeveloped Land with Mountain Views",
      "Waterfront Property Ready for Development",
      "Large Parcel with Investment Potential",
      "Buildable Lot in Desirable Area"
    ],
    commercial: [
      "Prime Commercial Space in Business District",
      "Well-Located Retail Property for Sale",
      "Commercial Building with Multiple Units",
      "Investment Office Property with Tenants",
      "High-Visibility Commercial Corner Lot",
      "Mixed-Use Commercial Building with Potential",
      "Modern Commercial Space with Parking"
    ],
    industrial: [
      "Functional Industrial Warehouse for Sale",
      "Modern Industrial Facility with Office Space",
      "Versatile Industrial Property with Loading Docks",
      "Industrial Building in Strategic Location",
      "Multi-Bay Industrial Complex with Yard",
      "Industrial Property with Highway Access",
      "Turnkey Manufacturing Facility"
    ]
  };

  // Get the specific suggestions for the property type, or use defaults
  const specificSuggestions = typeSpecificSuggestions[propertyType] || baseSuggestions;
  
  // Combine and return suggestions
  return [...specificSuggestions, ...baseSuggestions];
}

/**
 * Generates description suggestions based on property type
 */
export function getDescriptionSuggestions(propertyType: string): string[] {
  const baseSuggestions = [
    "This property features modern design elements and quality finishes throughout. Conveniently located near shopping, dining, and public transportation. Don't miss this opportunity!",
    "Beautifully maintained property in a desirable location. Offering the perfect blend of comfort and style, this property won't last long on the market.",
    "Fantastic opportunity to own in a highly sought-after area. This property offers excellent value with its convenient location and attractive features.",
    "This property boasts an ideal location with easy access to major highways, schools, and local amenities. Perfect for those seeking convenience without sacrificing comfort.",
    "Spacious and well-designed property with plenty of natural light throughout. The layout offers versatility and comfort for various lifestyle needs."
  ];

  const typeSpecificSuggestions: Record<string, string[]> = {
    house: [
      "Welcome to this charming family home featuring spacious rooms and a functional layout. The property includes a welcoming front yard and private backyard, perfect for outdoor entertaining and relaxation. Located in a family-friendly neighborhood with easy access to schools, parks, and shopping centers.",
      "This beautiful house offers the perfect blend of comfort and style. Featuring an open floor plan, updated kitchen with modern appliances, and a primary suite with ensuite bathroom. The backyard includes a covered patio area ideal for outdoor dining and entertaining. Located in a quiet neighborhood with excellent schools nearby.",
      "Stunning single-family home with exceptional curb appeal and thoughtful design. The interior features high ceilings, abundant natural light, and quality finishes throughout. The kitchen includes stainless steel appliances and plenty of counter space. Outside, you'll find a professionally landscaped yard with irrigation system. This home is perfectly situated near parks, schools, and shopping."
    ],
    apartment: [
      "Bright and spacious apartment offering modern urban living at its finest. This unit features an open concept layout, updated kitchen with quality appliances, and large windows providing abundant natural light. Building amenities include secure entry, fitness center, and rooftop terrace. Ideally located near public transportation, restaurants, and entertainment venues.",
      "Stylish apartment in a well-maintained building located in the heart of the city. This unit offers a functional layout with a modern kitchen, in-unit laundry, and a private balcony with city views. Enjoy the convenience of nearby cafes, shops, and public transportation just steps from your door.",
      "Contemporary apartment featuring an intelligent layout that maximizes space and functionality. The unit includes updated fixtures, ample storage, and energy-efficient appliances. Building amenities include 24-hour security, resident lounge, and on-site management. Centrally located with easy access to major employers, dining, and entertainment options."
    ],
    condo: [
      "Luxurious condominium offering resort-style living in a prime location. This unit features high-end finishes, gourmet kitchen with stone countertops, and a spacious primary suite. Community amenities include swimming pool, fitness center, and clubhouse. Located near upscale shopping, fine dining, and entertainment options.",
      "Modern condo in a secure building with exceptional amenities. This unit offers an open floor plan, upgraded kitchen with premium appliances, and a private balcony with captivating views. Residents enjoy access to a swimming pool, fitness center, and concierge services. Perfectly situated near parks, dining options, and convenient transportation links.",
      "Elegant condominium featuring a desirable open concept design and premium finishes throughout. The gourmet kitchen includes stone countertops and stainless steel appliances. Enjoy building amenities such as a rooftop deck, fitness facility, and secured parking. Located in a vibrant area with walkable access to restaurants, shops, and entertainment."
    ],
    townhouse: [
      "Stylish townhouse offering multi-level living in a convenient location. This property features a functional layout with separate living and sleeping areas, modern kitchen with breakfast bar, and attached garage. The community offers well-maintained common areas and a central location near shopping, dining, and major transportation routes.",
      "Contemporary townhome providing the perfect blend of privacy and community living. This residence includes an open main level, spacious bedrooms, and a private outdoor area. The community features include landscaped grounds and visitor parking. Located in a desirable area near schools, parks, and shopping centers.",
      "Well-designed townhouse in a sought-after community offering low-maintenance living without sacrificing space or privacy. The property features multiple levels with versatile living spaces, updated kitchen, and a private patio perfect for outdoor enjoyment. Conveniently located near major employers, shopping centers, and recreational facilities."
    ],
    land: [
      "Prime undeveloped land offering exceptional opportunity in a growing area. This parcel features [topography details] with [view features if applicable]. Utilities are [available/nearby]. Zoned for [residential/commercial/mixed-use] development with potential for [specific uses]. Located in an area experiencing significant growth with strong demand for new development.",
      "Valuable land parcel ideally situated for future development. This property offers [size] acres with [road frontage details] and [natural features]. The location provides excellent visibility and accessibility, making it suitable for various development options. Area amenities include [nearby features] with strong demographic indicators supporting future growth.",
      "Exceptional land opportunity in a strategic location. This property features desirable [flat/rolling/varied] topography with [vegetation/water features if applicable]. Currently zoned for [current zoning] with potential for [possible rezoning if applicable]. The surrounding area includes [nearby developments/amenities] with strong economic indicators."
    ],
    commercial: [
      "Prime commercial property in a high-visibility location with excellent traffic counts. This property features [size] square feet of versatile space suitable for various business uses. The building includes [features like parking, loading areas, office space]. Located in a thriving commercial district with complementary businesses nearby and strong demographic indicators.",
      "Well-maintained commercial building offering excellent investment potential. The property includes [size] square feet with [configuration details] and ample on-site parking. Currently [vacant/leased] with [lease details if applicable]. Located in a business-friendly area with strong economic indicators and development initiatives.",
      "Strategic commercial property ideally positioned in a growing business district. This [size] square foot building features [layout details] with modern systems and infrastructure. The property offers excellent visibility, easy access, and ample parking. Surrounding businesses include [nearby businesses] creating a synergistic commercial environment."
    ],
    industrial: [
      "Functional industrial property offering versatile space for manufacturing, warehousing, or distribution operations. This facility features [size] square feet with [clear height] ceilings, [loading dock details], and [power/utility details]. The property includes [office space details] and [yard/parking details]. Strategically located near major transportation routes with easy access to [highways/ports/rail].",
      "Modern industrial building designed for operational efficiency and flexibility. This property offers [size] square feet of high-quality industrial space with [features like ESFR sprinklers, loading capabilities, power specifications]. The layout includes [configuration details] with [office percentage]. Located in an established industrial park with excellent logistics advantages.",
      "Well-maintained industrial facility ready for immediate occupancy. This property features [size] square feet with [layout details] including [loading capabilities], [power specifications], and [ceiling heights]. The site includes [parking/yard details] with secure perimeter. Ideally located in a business-friendly area with convenient access to major transportation networks."
    ]
  };

  // Get the specific suggestions for the property type, or use defaults
  const specificSuggestions = typeSpecificSuggestions[propertyType] || baseSuggestions;
  
  // Combine and return suggestions
  return [...specificSuggestions, ...baseSuggestions];
}

/**
 * Generates address suggestions based on country
 */
export function getAddressSuggestions(country: string): string[] {
  const baseSuggestions = [
    "123 Main Street",
    "456 Oak Avenue",
    "789 Maple Boulevard",
    "101 Pine Road",
    "202 Cedar Lane"
  ];

  const countrySpecificSuggestions: Record<string, string[]> = {
    us: [
      "123 Main Street, Suite 4B",
      "456 Oak Avenue, Apt 7C",
      "789 Maple Boulevard",
      "101 Pine Road",
      "202 Cedar Lane",
      "303 Washington Avenue",
      "404 Jefferson Street"
    ],
    mx: [
      "Calle Reforma 123, Interior 4",
      "Avenida Insurgentes 456",
      "Boulevard Miguel Alemán 789",
      "Calle Juárez 101",
      "Avenida Chapultepec 202",
      "Paseo de la Reforma 303",
      "Calle Madero 404"
    ],
    ca: [
      "123 Maple Street, Unit 4",
      "456 Queen Street West",
      "789 King Street East",
      "101 Yonge Street, Suite 200",
      "202 Bloor Street West",
      "303 Dundas Street",
      "404 Bay Street"
    ],
    es: [
      "Calle Gran Vía 123, 4º B",
      "Avenida Diagonal 456, 2º 3ª",
      "Paseo de la Castellana 789",
      "Calle Alcalá 101",
      "Rambla Catalunya 202",
      "Calle Serrano 303",
      "Avenida del Paralelo 404"
    ],
    gb: [
      "123 High Street, Flat 4B",
      "456 Oxford Street",
      "789 Baker Street, Apartment 7",
      "101 Regent Street",
      "202 Piccadilly",
      "303 Bond Street",
      "404 Kings Road"
    ]
  };
  
  // Get country-specific suggestions or use base suggestions
  const specificSuggestions = countrySpecificSuggestions[country] || baseSuggestions;
  
  // Combine and return suggestions
  return [...specificSuggestions, ...baseSuggestions];
}