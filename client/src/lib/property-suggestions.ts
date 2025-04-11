// Property suggestion data for form fields

// Title suggestions based on property type
export const getTitleSuggestions = (propertyType: string): string[] => {
  const baseMap: Record<string, string[]> = {
    house: [
      'Charming Family Home in',
      'Spacious House with Beautiful Garden in',
      'Modern House with Great Views in',
      'Elegant Family Residence in',
      'Luxurious Villa in Exclusive',
      'Cozy Single-Family Home in',
      'Stunning Detached House in',
    ],
    condo: [
      'Modern Urban Condo in',
      'Luxury Condominium with City Views in',
      'Stylish Condo in the Heart of',
      'Elegant Condominium in Prime Location in',
      'Contemporary Condo with Amenities in',
      'Exclusive Penthouse Condo in',
    ],
    apartment: [
      'Bright City Apartment in',
      'Stylish Urban Apartment in',
      'Renovated Apartment with Balcony in',
      'Cozy Studio Apartment in Central',
      'Modern Apartment with Great Location in',
      'Premium Apartment with Panoramic Views in',
    ],
    townhouse: [
      'Beautiful Townhouse in Residential',
      'Modern Townhome with Terrace in',
      'Spacious Townhouse with Garden in',
      'Elegant Row House in Historic',
      'Contemporary Townhouse with Garage in',
    ],
    land: [
      'Prime Building Lot in Developing',
      'Scenic Land Parcel in',
      'Development Opportunity in Growing',
      'Investment Land with Great Potential in',
      'Commercial Land Plot in',
    ],
  };
  
  return baseMap[propertyType] || baseMap.house;
};

// Description suggestions based on property type
export const getDescriptionSuggestions = (propertyType: string): string[] => {
  const baseMap: Record<string, string[]> = {
    house: [
      'This beautiful house offers a perfect blend of comfort and style. Featuring spacious rooms, modern amenities, and a well-maintained garden, it\'s ideal for families looking for a peaceful neighborhood with convenient access to local services.',
      'Welcome to this charming family home nestled in a quiet neighborhood. The property boasts open living areas, a fully equipped kitchen, and comfortable bedrooms. The backyard is perfect for entertaining and outdoor activities.',
      'Discover this impeccably maintained home with quality finishes throughout. The thoughtful layout provides a comfortable living space with abundant natural light. Located in a friendly community with excellent schools nearby.',
      'This elegant residence combines modern design with practical living spaces. The home features high ceilings, large windows, and premium fixtures. The landscaped garden offers privacy and tranquility in a desirable location.',
    ],
    condo: [
      'Modern condominium in a premium building with excellent amenities including a fitness center, swimming pool, and 24-hour security. This stylish unit features contemporary finishes, an open floor plan, and stunning views.',
      'Luxury condo in a sought-after location offering the perfect urban lifestyle. The unit includes high-end appliances, designer fixtures, and a private balcony. Building amenities include concierge service and a rooftop terrace.',
      'This sleek condo combines comfort with convenience in a central location. The open-concept layout maximizes space and light, while building amenities provide additional luxury. Perfect for professionals or investors.',
      'Elegant condominium in a secure building with resort-style amenities. The thoughtfully designed interior offers premium finishes and smart home features. Enjoy city living with all conveniences at your doorstep.',
    ],
    apartment: [
      'Bright and airy apartment in a well-maintained building. The functional layout makes the most of the space, with modern fixtures and neutral decor throughout. Conveniently located near public transportation and local amenities.',
      'This stylish apartment offers contemporary living in a vibrant neighborhood. Features include updated kitchen and bathroom, ample storage space, and energy-efficient appliances. Perfect for urban dwellers who value both comfort and location.',
      'Beautifully renovated apartment with a practical floor plan and quality finishes. The property benefits from abundant natural light and views over the surrounding area. Located in a secure building with good amenities.',
      'Cozy yet spacious apartment providing comfortable city living. Recent updates include modern kitchen fixtures and bathroom renovations. The central location offers easy access to restaurants, shops, and entertainment options.',
    ],
    townhouse: [
      'Elegant townhouse offering the perfect balance between house and apartment living. The multi-level layout provides excellent separation of living areas, while the location offers a sense of community and security.',
      'Modern townhome with a practical floor plan and private outdoor space. The interior features contemporary design elements and quality finishes. Enjoy low-maintenance living in a desirable residential area.',
      'Charming townhouse with character and modern updates. The property includes multiple bedrooms, updated bathrooms, and a functional kitchen. The private yard offers outdoor enjoyment in a convenient location.',
      'This stylish townhouse combines sophisticated design with practical living spaces. The open-concept main level flows into a private outdoor area, while upper levels provide comfortable sleeping quarters and additional living space.',
    ],
    land: [
      'Prime development opportunity in a growing area with strong appreciation potential. This vacant land is ready for your custom project, with utilities nearby and good access roads already in place.',
      'Exceptional land parcel in a desirable location, ideal for custom home construction or development. The property features natural beauty with mature trees and slight elevation changes creating character.',
      'Versatile land offering multiple possibilities for development or private estate. The location provides a balance of privacy and convenience, with peaceful surroundings yet proximity to amenities.',
      'Rare find - buildable lot in an established neighborhood. This parcel offers the opportunity to design and build to your specifications in an area with existing infrastructure and services.',
    ],
  };
  
  return baseMap[propertyType] || baseMap.house;
};

// Country options for dropdown
export const countries = [
  { value: 'Mexico', label: 'Mexico' },
  { value: 'Spain', label: 'Spain' },
  { value: 'USA', label: 'United States' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Austria', label: 'Austria' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'France', label: 'France' },
  { value: 'Italy', label: 'Italy' },
];

// Address suggestions by country
export const getAddressSuggestions = (countryValue: string): string[] => {
  const suggestionsMap: Record<string, string[]> = {
    Mexico: [
      'Calle Reforma 123, Condesa, Ciudad de México',
      'Avenida Insurgentes 456, Polanco, Ciudad de México',
      'Calle 10 Norte 789, Centro, Playa del Carmen, Quintana Roo',
      'Blvd. Kukulcán Km 12.5, Zona Hotelera, Cancún',
      'Avenida Chapultepec 278, Roma Norte, Ciudad de México',
    ],
    Spain: [
      'Calle Gran Vía 32, 28013 Madrid',
      'Passeig de Gràcia 43, 08007 Barcelona',
      'Calle Sierpes 78, 41004 Sevilla',
      'Plaza Mayor 15, 37008 Salamanca',
      'Avenida de la Constitución 17, 18001 Granada',
    ],
    USA: [
      '123 Main Street, Seattle, WA 98101',
      '456 Park Avenue, New York, NY 10022',
      '789 Ocean Drive, Miami Beach, FL 33139',
      '555 Market Street, San Francisco, CA 94105',
      '321 Highland Avenue, Los Angeles, CA 90036',
    ],
    Germany: [
      'Friedrichstraße 43, 10117 Berlin',
      'Maximilianstraße 17, 80539 München',
      'Königsallee 30, 40212 Düsseldorf',
      'Mönckebergstraße 15, 20095 Hamburg',
      'Zeil 106, 60313 Frankfurt am Main',
    ],
    Austria: [
      'Kärntner Straße 28, 1010 Wien',
      'Getreidegasse 9, 5020 Salzburg',
      'Herrengasse 14, 8010 Graz',
      'Maria-Theresien-Straße 18, 6020 Innsbruck',
      'Landstraße 17, 4020 Linz',
    ],
    Portugal: [
      'Avenida da Liberdade 110, 1250-146 Lisboa',
      'Rua de Santa Catarina 375, 4000-451 Porto',
      'Rua Serpa Pinto 15, the 8200-471 Albufeira',
      'Rua do Comércio 32, 1100-150 Lisboa',
      'Avenida dos Aliados 104, 4000-065 Porto',
    ],
    France: [
      'Avenue des Champs-Élysées 75, 75008 Paris',
      'Rue de la République 42, 69002 Lyon',
      'Promenade des Anglais 27, 06000 Nice',
      'Rue du Faubourg Saint-Honoré 101, 75008 Paris',
      'Quai des Belges 33, 13001 Marseille',
    ],
    Italy: [
      'Via Condotti 12, 00187 Roma',
      'Via Montenapoleone 8, 20121 Milano',
      'Via Toledo 256, 80132 Napoli',
      'Ponte di Rialto, 30125 Venezia',
      'Via Tornabuoni 16, 50123 Firenze',
    ],
  };
  
  return suggestionsMap[countryValue] || [];
};

// Property type human-readable labels
export const propertyTypeLabels: Record<string, string> = {
  house: 'House',
  condo: 'Condominium',
  apartment: 'Apartment',
  townhouse: 'Townhouse',
  land: 'Land',
};