/**
 * seed.js — Populate the database with the 10 world-famous museums and their
 *           20 iconic artifacts sourced from the Museums-artifacts-seed.md file.
 *
 * Usage:
 *   node src/scripts/seed.js          (insert only if DB is empty)
 *   node src/scripts/seed.js --force  (drop existing data and re-seed)
 */
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const Museum   = require('../modules/museums/museum.model');
const Artifact = require('../modules/artifacts/artifact.model');
const User     = require('../modules/users/user.model');
const logger   = require('../middleware/logger');

const FORCE = process.argv.includes('--force');

// ── Museums ──────────────────────────────────────────────────────────────────

const MUSEUMS = [
  // 1 ── The British Museum
  {
    name: 'The British Museum',
    location: {
      address: 'Great Russell St',
      city: 'London',
      state: 'England',
      country: 'United Kingdom',
      zipCode: 'WC1B 3DG',
    },
    description: 'A public institution dedicated to human history, art, and culture. Its permanent collection of some eight million works is among the largest and most comprehensive in existence, having been widely sourced during the era of the British Empire, and documenting the story of human culture from its beginnings to the present.',
    establishedYear: 1753,
    founder: 'Sir Hans Sloane',
    originalPurpose: 'Cabinet of curiosities and national library',
    architecturalStyle: 'Greek Revival / Neoclassical',
    architect: 'Sir Robert Smirke',
    historicalDesignations: ['Grade I Listed Building'],
    museumType: 'History',
    erasCovered: ['Prehistoric', 'Ancient Near East', 'Ancient Egypt', 'Greco-Roman', 'Medieval', 'Renaissance', 'Modern'],
    collectionSize: 8000000,
    tags: ['history', 'art', 'culture', 'british', 'london'],
    images: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/British_Museum_from_northeast_2.JPG/1200px-British_Museum_from_northeast_2.JPG', caption: 'British Museum from Northeast' }],
  },

  // 2 ── Musée du Louvre
  {
    name: 'Musée du Louvre',
    location: {
      address: 'Rue de Rivoli',
      city: 'Paris',
      state: 'Île-de-France',
      country: 'France',
      zipCode: '75001',
    },
    description: 'The Louvre is the world\'s most-visited museum and a historic monument in Paris. It is home to some of the best-known works of art, including the Mona Lisa and the Venus de Milo. The museum is housed in the Louvre Palace, originally built as the Louvre castle in the late 12th century under Philip II.',
    establishedYear: 1793,
    founder: 'French National Assembly',
    originalPurpose: 'Royal fortress and palace',
    architecturalStyle: 'French Renaissance, Baroque, Modern (Pyramid)',
    architect: 'Pierre Lescot, Louis Le Vau, I.M. Pei',
    historicalDesignations: ['Monument Historique', 'UNESCO World Heritage Site'],
    museumType: 'Art',
    erasCovered: ['Antiquity', 'Middle Ages', 'Renaissance', '18th Century', '19th Century'],
    collectionSize: 380000,
    tags: ['art', 'paris', 'france', 'louvre', 'world-famous'],
    images: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/1200px-Louvre_Museum_Wikimedia_Commons.jpg', caption: 'Musée du Louvre' }],
  },

  // 3 ── The Metropolitan Museum of Art
  {
    name: 'The Metropolitan Museum of Art',
    location: {
      address: '1000 5th Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10028',
    },
    description: 'The Met presents over 5,000 years of art from around the world for everyone to experience and enjoy. It is the largest art museum in the Americas, with collections spanning classical antiquity, ancient Egypt, European masters, and an extensive collection of American and modern art.',
    establishedYear: 1870,
    founder: 'Group of American citizens, financiers, and artists',
    originalPurpose: 'Public art and education gallery',
    architecturalStyle: 'Beaux-Arts',
    architect: 'Richard Morris Hunt, Calvert Vaux',
    historicalDesignations: ['National Register of Historic Places', 'National Historic Landmark'],
    museumType: 'Art',
    erasCovered: ['Ancient Egypt', 'Classical Antiquity', 'Islamic Golden Age', 'Renaissance', 'Modern'],
    collectionSize: 2000000,
    tags: ['art', 'new-york', 'metropolitan', 'beaux-arts', 'americas'],
    images: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Metropolitan_Museum_of_Art_%28The_Met%29_-_Central_Park%2C_NYC.jpg/1200px-Metropolitan_Museum_of_Art_%28The_Met%29_-_Central_Park%2C_NYC.jpg', caption: 'The Metropolitan Museum of Art' }],
  },

  // 4 ── National Museum of Natural History (Smithsonian)
  {
    name: 'National Museum of Natural History',
    location: {
      address: '10th St. & Constitution Ave. NW',
      city: 'Washington',
      state: 'D.C.',
      country: 'USA',
      zipCode: '20560',
    },
    description: 'Administered by the Smithsonian Institution, it is the most visited natural history museum in the world. Its collections tell the history of the planet and are a record of human interaction with the environment and one another, holding everything from dinosaur skeletons to the Hope Diamond.',
    establishedYear: 1910,
    founder: 'United States Government',
    originalPurpose: 'Purpose-built natural history museum',
    architecturalStyle: 'Neoclassical / Beaux-Arts',
    architect: 'Hornblower & Marshall',
    historicalDesignations: ['National Register of Historic Places'],
    museumType: 'Natural History',
    erasCovered: ['Prehistoric', 'Mesozoic Era', 'Cenozoic Era', 'Early Human History'],
    collectionSize: 146000000,
    tags: ['natural-history', 'smithsonian', 'science', 'washington', 'dinosaurs'],
    images: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Smithsonian_National_Museum_of_Natural_History_-_2012.jpg/1200px-Smithsonian_National_Museum_of_Natural_History_-_2012.jpg', caption: 'National Museum of Natural History' }],
  },

  // 5 ── State Hermitage Museum
  {
    name: 'State Hermitage Museum',
    location: {
      address: 'Palace Square, 2',
      city: 'St. Petersburg',
      state: 'Northwestern Federal District',
      country: 'Russia',
      zipCode: '190000',
    },
    description: 'The largest art museum in the world by gallery space, founded when Empress Catherine the Great acquired an impressive collection of paintings. The museum complex consists of six historic buildings along the Palace Embankment, including the Winter Palace, a former residence of Russian emperors.',
    establishedYear: 1764,
    founder: 'Empress Catherine the Great',
    originalPurpose: 'Imperial winter residence',
    architecturalStyle: 'Elizabethan Baroque',
    architect: 'Francesco Bartolomeo Rastrelli',
    historicalDesignations: ['UNESCO World Heritage Site'],
    museumType: 'Art',
    erasCovered: ['Antiquity', 'Renaissance', 'Dutch Golden Age', '19th Century', 'Modern'],
    collectionSize: 3000000,
    tags: ['art', 'russia', 'hermitage', 'imperial', 'st-petersburg'],
    images: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Winter_Palace_Panorama.jpg/1200px-Winter_Palace_Panorama.jpg', caption: 'Winter Palace — State Hermitage Museum' }],
  },

  // 6 ── Vatican Museums
  {
    name: 'Vatican Museums',
    location: {
      address: 'Viale Vaticano',
      city: 'Vatican City',
      state: 'Vatican City',
      country: 'Vatican City',
      zipCode: '00120',
    },
    description: 'The public art and sculpture museums in the Vatican City. They display works from the immense collection amassed by the Catholic Church and the papacy throughout the centuries, including several of the most renowned Roman sculptures and most important masterpieces of Renaissance art in the world.',
    establishedYear: 1506,
    founder: 'Pope Julius II',
    originalPurpose: 'Papal palaces and private collection',
    architecturalStyle: 'Renaissance',
    architect: 'Donato Bramante, Michelangelo',
    historicalDesignations: ['UNESCO World Heritage Site'],
    museumType: 'Art',
    erasCovered: ['Ancient Rome', 'Medieval', 'Renaissance', 'Baroque'],
    collectionSize: 70000,
    tags: ['art', 'vatican', 'renaissance', 'papal', 'rome'],
    images: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cortile_della_Pigna.jpg/1200px-Cortile_della_Pigna.jpg', caption: 'Vatican Museums — Cortile della Pigna' }],
  },

  // 7 ── Rijksmuseum
  {
    name: 'Rijksmuseum',
    location: {
      address: 'Museumstraat 1',
      city: 'Amsterdam',
      state: 'North Holland',
      country: 'Netherlands',
      zipCode: '1071 XX',
    },
    description: 'The national museum of the Netherlands dedicated to Dutch arts and history. The museum has on display 8,000 objects of art and history, from their total collection of 1 million objects, featuring masterpieces by Rembrandt, Frans Hals, and Johannes Vermeer.',
    establishedYear: 1800,
    founder: 'Alexander Gogel',
    originalPurpose: 'National gallery for Dutch heritage',
    architecturalStyle: 'Gothic Revival / Dutch Renaissance',
    architect: 'Pierre Cuypers',
    historicalDesignations: ['Rijksmonument'],
    museumType: 'History',
    erasCovered: ['Middle Ages', 'Dutch Golden Age', '18th Century', '19th Century'],
    collectionSize: 1000000,
    tags: ['art', 'netherlands', 'dutch', 'amsterdam', 'rembrandt'],
    images: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Rijksmuseum_Amsterdam_park_zijde.jpg/1200px-Rijksmuseum_Amsterdam_park_zijde.jpg', caption: 'Rijksmuseum Amsterdam' }],
  },

  // 8 ── Acropolis Museum
  {
    name: 'Acropolis Museum',
    location: {
      address: 'Dionysiou Areopagitou 15',
      city: 'Athens',
      state: 'Attica',
      country: 'Greece',
      zipCode: '117 42',
    },
    description: 'An archaeological museum focused on the findings of the archaeological site of the Acropolis of Athens. The museum was built to house every artifact found on the rock and on the surrounding slopes, from the Greek Bronze Age to Roman and Byzantine Greece.',
    establishedYear: 2009,
    founder: 'Greek Ministry of Culture',
    originalPurpose: 'Purpose-built archaeological museum',
    architecturalStyle: 'Contemporary / Modernist',
    architect: 'Bernard Tschumi',
    historicalDesignations: ['Built over ancient Athenian ruins'],
    museumType: 'History',
    erasCovered: ['Mycenaean', 'Archaic', 'Classical Greece', 'Hellenistic', 'Roman'],
    collectionSize: 4250,
    tags: ['archaeology', 'greece', 'ancient', 'acropolis', 'athens'],
    images: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Acropolis_Museum_Athens.jpg/1200px-Acropolis_Museum_Athens.jpg', caption: 'Acropolis Museum Athens' }],
  },

  // 9 ── Museo Nacional del Prado
  {
    name: 'Museo Nacional del Prado',
    location: {
      address: 'Calle de Ruiz de Alarcón, 23',
      city: 'Madrid',
      state: 'Community of Madrid',
      country: 'Spain',
      zipCode: '28014',
    },
    description: 'The main Spanish national art museum. It is widely considered to house one of the world\'s finest collections of European art, dating from the 12th century to the early 20th century, based on the former Spanish Royal Collection, and the single best collection of Spanish art.',
    establishedYear: 1819,
    founder: 'King Ferdinand VII',
    originalPurpose: 'Cabinet of Natural History',
    architecturalStyle: 'Neoclassical',
    architect: 'Juan de Villanueva',
    historicalDesignations: ['Bien de Interés Cultural', 'UNESCO World Heritage (Paseo del Prado)'],
    museumType: 'Art',
    erasCovered: ['Middle Ages', 'Renaissance', 'Baroque', 'Romanticism'],
    collectionSize: 35000,
    tags: ['art', 'spain', 'madrid', 'prado', 'velazquez'],
    images: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Museo_del_Prado_2016_%2825185969599%29.jpg/1200px-Museo_del_Prado_2016_%2825185969599%29.jpg', caption: 'Museo Nacional del Prado' }],
  },

  // 10 ── Tokyo National Museum
  {
    name: 'Tokyo National Museum',
    location: {
      address: '13-9 Uenokoen, Taito City',
      city: 'Tokyo',
      state: 'Tokyo Metropolis',
      country: 'Japan',
      zipCode: '110-8712',
    },
    description: 'The oldest national museum in Japan, the largest art museum in Japan, and one of the largest art museums in the world. It collects, houses, and preserves a comprehensive collection of artwork and archaeological objects of Asia, focusing on Japan.',
    establishedYear: 1872,
    founder: 'Ministry of Education, Japan',
    originalPurpose: 'First public exhibition of Japanese antiquities',
    architecturalStyle: 'Imperial Crown Style (Honkan building)',
    architect: 'Watanabe Jin',
    historicalDesignations: ['Important Cultural Property of Japan'],
    museumType: 'History',
    erasCovered: ['Jomon Period', 'Yayoi Period', 'Edo Period', 'Meiji Era'],
    collectionSize: 120000,
    tags: ['history', 'japan', 'tokyo', 'japanese-art', 'antiquities'],
    images: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Tokyo_National_Museum_Honkan.jpg/1200px-Tokyo_National_Museum_Honkan.jpg', caption: 'Tokyo National Museum — Honkan' }],
  },
];

// ── Artifacts (2 per museum) ─────────────────────────────────────────────────

function buildArtifacts(museumMap) {
  return [
    // ══ The British Museum ════════════════════════════════════════════════════

    {
      museumId: museumMap['The British Museum'],
      name: 'Rosetta Stone Fragment',
      historicalPeriod: 'Ptolemaic Period (196 BCE)',
      origin: 'Memphis, Egypt',
      description: 'A granodiorite stele inscribed with three versions of a decree issued in Memphis, Egypt in 196 BCE. It became the key to deciphering Ancient Egyptian hieroglyphs and unlocking millennia of recorded history.',
      creationDate: '196 BCE',
      periodOrEra: 'Ptolemaic Period',
      cultureOrCivilization: 'Ancient Egyptian',
      originLocation: 'Memphis, Egypt',
      discoveryYear: 1799,
      discoveredBy: 'Pierre-François Bouchard',
      discoveryLocation: 'Rashid (Rosetta), Egypt',
      materials: ['Granodiorite'],
      dimensions: { height: '112.3', width: '75.7', depth: '28.4', unit: 'cm' },
      historicalSignificance: 'It provided the modern world with the first opportunity to translate Egyptian hieroglyphs.',
      funFacts: [
        'It was originally a slab of a larger monument.',
        'The inscriptions represent three different scripts: Hieroglyphic, Demotic, and Ancient Greek.',
      ],
      tags: ['stone', 'hieroglyphs', 'ptolemaic', 'egyptian', 'decode'],
    },

    {
      museumId: museumMap['The British Museum'],
      name: 'Parthenon Pediment Sculptures',
      historicalPeriod: 'Classical Period (447–432 BCE)',
      origin: 'Athens, Greece',
      description: 'A collection of Classical Greek marble sculptures that originally decorated the Parthenon on the Acropolis of Athens. Also known as the Elgin Marbles, they depict scenes from Athenian mythology and civic life.',
      creationDate: '447–432 BCE',
      periodOrEra: 'Classical Period',
      cultureOrCivilization: 'Ancient Greek',
      originLocation: 'Athens, Greece',
      materials: ['Pentelic Marble'],
      historicalSignificance: 'These represent the pinnacle of High Classical Greek art and naturalistic carving.',
      tags: ['marble', 'greek', 'sculpture', 'classical', 'parthenon'],
    },

    // ══ Musée du Louvre ═══════════════════════════════════════════════════════

    {
      museumId: museumMap['Musée du Louvre'],
      name: 'Portrait of Lisa Gherardini',
      historicalPeriod: 'High Renaissance (c. 1503–1506)',
      origin: 'Florence, Italy',
      description: 'A half-length portrait painting by Italian artist Leonardo da Vinci. Considered an archetypal masterpiece of the Italian Renaissance, it is the world\'s most recognised painting.',
      creationDate: 'c. 1503–1506',
      periodOrEra: 'High Renaissance',
      cultureOrCivilization: 'Italian',
      originLocation: 'Florence, Italy',
      materials: ['Oil on poplar wood panel'],
      dimensions: { height: '77', width: '53', unit: 'cm' },
      historicalSignificance: 'Known for the subject\'s elusive expression and the artist\'s masterful use of sfumato (smoke-like blurring).',
      tags: ['painting', 'renaissance', 'da-vinci', 'italian', 'portrait'],
    },

    {
      museumId: museumMap['Musée du Louvre'],
      name: 'Aphrodite of Milos',
      historicalPeriod: 'Hellenistic Period (c. 150–125 BCE)',
      origin: 'Island of Milos, Greece',
      description: 'An ancient Greek sculpture from the Hellenistic period, depicting a goddess, most likely Aphrodite, the goddess of love and beauty. It is celebrated for its graceful proportions and enigmatic armless form.',
      creationDate: 'c. 150–125 BCE',
      periodOrEra: 'Hellenistic Period',
      cultureOrCivilization: 'Ancient Greek',
      discoveryYear: 1820,
      discoveryLocation: 'Island of Milos, Greece',
      materials: ['Parian Marble'],
      dimensions: { height: '204', unit: 'cm' },
      historicalSignificance: 'One of the most famous examples of ancient Greek sculpture, showcasing the transition from Classical to Hellenistic styles.',
      tags: ['sculpture', 'greek', 'marble', 'hellenistic', 'goddess'],
    },

    // ══ The Metropolitan Museum of Art ════════════════════════════════════════

    {
      museumId: museumMap['The Metropolitan Museum of Art'],
      name: 'Roman-Period Egyptian Temple',
      historicalPeriod: 'Roman Period, Egypt (c. 15 BCE)',
      origin: 'Dendur, Nubia',
      description: 'An ancient Egyptian temple that was dismantled and gifted to the United States to save it from flooding by the Aswan High Dam. Now reassembled in the Sackler Wing of the Met.',
      creationDate: 'c. 15 BCE',
      periodOrEra: 'Roman Period (Egypt)',
      cultureOrCivilization: 'Ancient Egyptian',
      originLocation: 'Dendur, Nubia',
      materials: ['Aeolian Sandstone'],
      dimensions: { depth: '25', unit: 'm' },
      historicalSignificance: 'It depicts the Roman Emperor Augustus as a Pharaoh, showcasing the intersection of Roman and Egyptian political and religious power.',
      tags: ['temple', 'egyptian', 'roman', 'nubia', 'sandstone'],
    },

    {
      museumId: museumMap['The Metropolitan Museum of Art'],
      name: 'Petite danseuse de quatorze ans',
      historicalPeriod: 'Impressionism (1878–1881)',
      origin: 'Paris, France',
      description: 'A celebrated bronze sculpture by Edgar Degas, originally modeled in wax and featuring a real cotton tutu and satin hair ribbon. It was controversial when first exhibited for its unflinching realism.',
      creationDate: '1878–1881',
      periodOrEra: 'Impressionism',
      cultureOrCivilization: 'French',
      materials: ['Bronze', 'Silk', 'Cotton'],
      dimensions: { height: '99.1', unit: 'cm' },
      historicalSignificance: 'Challenged traditional sculpture by using mixed media and realistic, non-idealized features.',
      tags: ['sculpture', 'bronze', 'degas', 'impressionism', 'ballet'],
    },

    // ══ National Museum of Natural History ═══════════════════════════════════

    {
      museumId: museumMap['National Museum of Natural History'],
      name: 'Tavernier Blue Diamond',
      historicalPeriod: 'Mughal Era to Modern (17th century–present)',
      origin: 'Golconda, India',
      description: 'One of the world\'s most famous jewels, this deep-blue diamond is legendary for its extraordinary size, vivid color, and rumored curse. It passed through royal hands across three continents before reaching the Smithsonian.',
      creationDate: 'Formed c. 1 billion years ago',
      periodOrEra: 'Mughal Era to Modern',
      cultureOrCivilization: 'Indian / French / American',
      originLocation: 'Golconda, India',
      discoveryYear: 1666,
      materials: ['Diamond (Natural Carbon)'],
      dimensions: { weight: '45.52 carats', unit: 'carats' },
      historicalSignificance: 'It passed through the hands of Louis XIV and Marie Antoinette before reaching the Smithsonian.',
      funFacts: [
        'It is believed to glow red under ultraviolet light.',
        'It was donated to the Smithsonian via registered mail in 1958.',
      ],
      tags: ['diamond', 'gemstone', 'golconda', 'blue', 'hope'],
    },

    {
      museumId: museumMap['National Museum of Natural History'],
      name: 'Loxodonta africana specimen',
      historicalPeriod: 'Contemporary (1955–present)',
      origin: 'Angola',
      description: 'The iconic taxidermy mount of an African bush elephant that has greeted visitors in the museum\'s rotunda since 1959. At the time of its death it was one of the largest known African elephants ever recorded.',
      periodOrEra: 'Contemporary',
      cultureOrCivilization: 'African',
      originLocation: 'Angola',
      discoveryYear: 1955,
      materials: ['Biological specimen (Taxidermy)'],
      dimensions: { height: '4', unit: 'm' },
      historicalSignificance: 'Serves as a global symbol for wildlife conservation and the awe-inspiring scale of the natural world.',
      tags: ['elephant', 'taxidermy', 'africa', 'wildlife', 'conservation'],
    },

    // ══ State Hermitage Museum ════════════════════════════════════════════════

    {
      museumId: museumMap['State Hermitage Museum'],
      name: 'Automated Peacock Clock',
      historicalPeriod: 'Enlightenment Era (c. 1770s)',
      origin: 'London, England',
      description: 'A large 18th-century automaton featuring three life-sized mechanical birds: a peacock, a rooster, and an owl in an oak tree. Each bird performs when the clock mechanism is activated.',
      creationDate: 'c. 1770s',
      periodOrEra: 'Enlightenment Era',
      cultureOrCivilization: 'British / Russian Imperial',
      materials: ['Gilded bronze', 'Silver', 'Crystals'],
      historicalSignificance: 'One of the few 18th-century large-scale automatons still in fully functioning condition.',
      funFacts: [
        'The peacock spreads its feathers and bows when the mechanism activates.',
        'It was purchased by Prince Grigory Potemkin as a gift for Catherine the Great.',
      ],
      tags: ['automaton', 'clock', 'bronze', 'gilded', 'mechanical'],
    },

    {
      museumId: museumMap['State Hermitage Museum'],
      name: 'Solokha Comb',
      historicalPeriod: 'Iron Age (c. 400 BCE)',
      origin: 'Solokha Kurgan, Ukraine',
      description: 'An exquisitely detailed golden comb depicting a battle scene between mounted and foot soldiers. Found in a Scythian royal burial mound, it represents the pinnacle of Scythian goldsmithing.',
      creationDate: 'c. 400 BCE',
      periodOrEra: 'Iron Age',
      cultureOrCivilization: 'Scythian',
      discoveryYear: 1913,
      discoveryLocation: 'Solokha Kurgan, Ukraine',
      materials: ['24k Gold'],
      historicalSignificance: 'Showcases the incredible metalworking skills of the nomadic Scythian warriors.',
      tags: ['gold', 'scythian', 'comb', 'iron-age', 'nomadic'],
    },

    // ══ Vatican Museums ═══════════════════════════════════════════════════════

    {
      museumId: museumMap['Vatican Museums'],
      name: 'The Laocoön Group',
      historicalPeriod: 'Hellenistic / Early Roman (c. 40–30 BCE)',
      origin: 'Rome, Italy',
      description: 'A marble sculpture showing the Trojan priest Laocoön and his two sons being attacked by giant sea serpents. Regarded since its rediscovery as one of the greatest works of antiquity.',
      creationDate: 'c. 40–30 BCE',
      periodOrEra: 'Hellenistic / Early Roman',
      cultureOrCivilization: 'Roman / Hellenistic',
      discoveryYear: 1506,
      discoveryLocation: 'Esquiline Hill, Rome',
      materials: ['Marble'],
      historicalSignificance: 'Its discovery in 1506 was the primary catalyst for the founding of the Vatican Museums.',
      tags: ['marble', 'sculpture', 'roman', 'hellenistic', 'trojan'],
    },

    {
      museumId: museumMap['Vatican Museums'],
      name: 'Statue of Emperor Augustus',
      historicalPeriod: 'Augustan Era (c. 20 BCE)',
      origin: 'Prima Porta, Rome, Italy',
      description: 'A full-length portrait statue of Augustus Caesar, the first emperor of the Roman Empire. The breastplate is decorated with complex reliefs symbolizing cosmic order under Roman rule.',
      creationDate: 'c. 20 BCE',
      periodOrEra: 'Augustan Era',
      cultureOrCivilization: 'Roman',
      discoveryYear: 1863,
      materials: ['White Marble'],
      dimensions: { height: '2.03', unit: 'm' },
      historicalSignificance: 'The definitive propaganda piece of Ancient Rome, symbolizing the Pax Romana (Roman Peace).',
      tags: ['sculpture', 'roman', 'marble', 'augustus', 'imperial'],
    },

    // ══ Rijksmuseum ═══════════════════════════════════════════════════════════

    {
      museumId: museumMap['Rijksmuseum'],
      name: 'Militia Company of District II under the Command of Captain Frans Banninck Cocq',
      historicalPeriod: 'Dutch Golden Age (1642)',
      origin: 'Amsterdam, Netherlands',
      description: 'Rembrandt\'s most famous painting, universally known as The Night Watch. Renowned for its colossal size, dramatic use of light and shadow (chiaroscuro), and sense of motion.',
      creationDate: '1642',
      periodOrEra: 'Dutch Golden Age',
      cultureOrCivilization: 'Dutch',
      materials: ['Oil on canvas'],
      dimensions: { height: '363', width: '437', unit: 'cm' },
      historicalSignificance: 'Revolutionized group portraiture by depicting the subjects in active motion rather than a static formal line-up.',
      tags: ['painting', 'rembrandt', 'dutch', 'golden-age', 'militia'],
    },

    {
      museumId: museumMap['Rijksmuseum'],
      name: 'De Melkmeid',
      historicalPeriod: 'Dutch Golden Age (c. 1658)',
      origin: 'Amsterdam, Netherlands',
      description: 'A quiet, luminous domestic scene by Johannes Vermeer, celebrated for its strikingly realistic textures and masterful use of natural light. Also known as The Milkmaid.',
      creationDate: 'c. 1658',
      periodOrEra: 'Dutch Golden Age',
      cultureOrCivilization: 'Dutch',
      materials: ['Oil on canvas'],
      dimensions: { height: '45.5', width: '40.6', unit: 'cm' },
      historicalSignificance: 'A masterclass in 17th-century realism and the play of natural light in interior spaces.',
      tags: ['painting', 'vermeer', 'dutch', 'golden-age', 'domestic'],
    },

    // ══ Acropolis Museum ══════════════════════════════════════════════════════

    {
      museumId: museumMap['Acropolis Museum'],
      name: 'Erechtheion Maidens',
      historicalPeriod: 'Classical Period (421–406 BCE)',
      origin: 'Acropolis of Athens, Greece',
      description: 'Five of the original six female figures that served as the architectural columns (Caryatids) supporting the porch of the Erechtheion temple on the Acropolis.',
      creationDate: '421–406 BCE',
      periodOrEra: 'Classical Period',
      cultureOrCivilization: 'Athenian Greek',
      materials: ['Pentelic Marble'],
      historicalSignificance: 'Represents the perfect union between sculpture and structural architecture in the ancient world.',
      tags: ['sculpture', 'marble', 'greek', 'classical', 'architecture'],
    },

    {
      museumId: museumMap['Acropolis Museum'],
      name: 'Archaic Statue of a Man',
      historicalPeriod: 'Archaic Period (c. 560 BCE)',
      origin: 'Acropolis of Athens, Greece',
      description: 'An early Archaic Greek statue known as the Moschophoros (Calf-Bearer), depicting a bearded man carrying a sacrificial calf across his shoulders, with both sharing a characteristic "Archaic smile".',
      creationDate: 'c. 560 BCE',
      periodOrEra: 'Archaic Period',
      cultureOrCivilization: 'Ancient Greek',
      discoveryYear: 1866,
      materials: ['Hymettian Marble'],
      historicalSignificance: 'Famous for the Archaic smile and being one of the earliest examples of human–animal interaction rendered in stone.',
      tags: ['sculpture', 'marble', 'greek', 'archaic', 'calf-bearer'],
    },

    // ══ Museo Nacional del Prado ══════════════════════════════════════════════

    {
      museumId: museumMap['Museo Nacional del Prado'],
      name: 'The Ladies-in-Waiting',
      historicalPeriod: 'Spanish Baroque (1656)',
      origin: 'Madrid, Spain',
      description: 'Diego Velázquez\'s complex masterpiece depicting the Infanta Margaret Theresa surrounded by her entourage, with the artist himself visible at his canvas and the king and queen reflected in a mirror.',
      creationDate: '1656',
      periodOrEra: 'Spanish Baroque',
      cultureOrCivilization: 'Spanish',
      materials: ['Oil on canvas'],
      dimensions: { height: '318', width: '276', unit: 'cm' },
      historicalSignificance: 'Noted for its philosophical questions about the relationship between the viewer, the artist, and the subject.',
      tags: ['painting', 'baroque', 'velazquez', 'spanish', 'royal'],
    },

    {
      museumId: museumMap['Museo Nacional del Prado'],
      name: 'Bosch Triptych',
      historicalPeriod: 'Early Netherlandish (1490–1510)',
      origin: 'Netherlands',
      description: 'A bizarre and densely detailed triptych painting by Hieronymus Bosch, depicting the history of the world from the Garden of Eden through earthly pleasures to Hell. Also known as The Garden of Earthly Delights.',
      creationDate: '1490–1510',
      periodOrEra: 'Early Netherlandish',
      cultureOrCivilization: 'Netherlandish',
      materials: ['Oil on oak panels'],
      historicalSignificance: 'One of the most enigmatic works in art history, pre-dating Surrealism by more than 400 years.',
      tags: ['painting', 'bosch', 'netherlandish', 'triptych', 'surreal'],
    },

    // ══ Tokyo National Museum ═════════════════════════════════════════════════

    {
      museumId: museumMap['Tokyo National Museum'],
      name: 'Clay Burial Figure',
      historicalPeriod: 'Kofun Period (6th Century CE)',
      origin: 'Japan',
      description: 'A terracotta funerary object (Haniwa) from the Kofun period, showing a fully armed warrior in detailed keiko armor. Placed around burial mounds, Haniwa are key records of early Japanese society.',
      creationDate: '6th Century CE',
      periodOrEra: 'Kofun Period',
      cultureOrCivilization: 'Japanese',
      materials: ['Earthenware (Terracotta)'],
      historicalSignificance: 'A National Treasure of Japan providing vital evidence for early Japanese military equipment and burial customs.',
      tags: ['terracotta', 'japanese', 'kofun', 'burial', 'warrior'],
    },

    {
      museumId: museumMap['Tokyo National Museum'],
      name: 'Osafune Kanemitsu Blade',
      historicalPeriod: 'Nanboku-cho Period (14th Century CE)',
      origin: 'Osafune, Japan',
      description: 'A masterfully forged Japanese sword (Katana) signed by the swordsmith Kanemitsu of Osafune. It reflects the pinnacle of samurai blade-making from the turbulent Nanboku-cho period.',
      creationDate: '14th Century CE',
      periodOrEra: 'Nanboku-cho Period',
      cultureOrCivilization: 'Samurai (Japanese)',
      materials: ['Tamahagane (Steel)'],
      historicalSignificance: 'Represents the spiritual and technological height of the Japanese swordsmithing tradition.',
      tags: ['sword', 'katana', 'japanese', 'samurai', 'steel'],
    },
  ];
}

const USERS = [
  {
    name: 'Test User',
    email: 'user@museumtour.com',
    password: 'User@1234',
    role: 'user',
    bio: 'A museum enthusiast exploring artifacts from around the world.',
    location: 'Mumbai, India',
  },
  {
    name: 'Museum Moderator',
    email: 'moderator@museumtour.com',
    password: 'Mod@1234',
    role: 'moderator',
    bio: 'Content moderator keeping the community safe.',
    location: 'London, UK',
  },
];

// ── Seed Logic ──────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Seed: connected to MongoDB');

    const [museumCount, artifactCount, userCount] = await Promise.all([
      Museum.countDocuments(),
      Artifact.countDocuments(),
      User.countDocuments(),
    ]);

    if (!FORCE && (museumCount > 0 || artifactCount > 0)) {
      logger.info(`Seed: DB already has data (museums: ${museumCount}, artifacts: ${artifactCount}, users: ${userCount}). Use --force to re-seed.`);
      process.exit(0);
    }

    if (FORCE) {
      logger.info('Seed: --force detected — clearing existing data');
      await Promise.all([
        Museum.deleteMany({}),
        Artifact.deleteMany({}),
      ]);
    }

    // Insert museums
    const createdMuseums = await Museum.insertMany(MUSEUMS);
    logger.info(`Seed: inserted ${createdMuseums.length} museums`);

    // Build name → _id map
    const museumMap = {};
    createdMuseums.forEach((m) => { museumMap[m.name] = m._id; });

    // Insert artifacts
    const artifacts = buildArtifacts(museumMap);
    const createdArtifacts = await Artifact.insertMany(artifacts);
    logger.info(`Seed: inserted ${createdArtifacts.length} artifacts`);

    // Insert users (only if they don't already exist)
    let usersInserted = 0;
    for (const u of USERS) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const hashed = await bcrypt.hash(u.password, 12);
        await User.create({ ...u, password: hashed });
        usersInserted++;
      }
    }
    logger.info(`Seed: inserted ${usersInserted} users (${USERS.length - usersInserted} already existed)`);

    logger.info('Seed: complete ✓');
    process.exit(0);
  } catch (err) {
    logger.error(`Seed failed: ${err.message}`);
    process.exit(1);
  }
}

seed();
