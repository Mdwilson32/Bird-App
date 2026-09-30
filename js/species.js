// Game birds that can be legally hunted in California.
// Sources: CDFW upland game bird and waterfowl regulations (2025–26), USFWS Pacific Flyway frameworks.
// Seasons, zones and limits change every year — always check current CDFW regulations.

export const CATEGORIES = [
  { id: 'dabbling', name: 'Dabbling Ducks', color: '#3f7f5a' },
  { id: 'diving', name: 'Diving Ducks', color: '#2f6690' },
  { id: 'sea', name: 'Sea Ducks', color: '#3a5a78' },
  { id: 'geese', name: 'Geese', color: '#6b5b3e' },
  { id: 'upland', name: 'Upland Birds', color: '#a0522d' },
  { id: 'turkey', name: 'Wild Turkey', color: '#8b3a3a' },
  { id: 'doves', name: 'Doves & Pigeons', color: '#7a6a8a' },
  { id: 'webless', name: 'Coots, Moorhens & Snipe', color: '#5f7d3a' },
  { id: 'other', name: 'Other', color: '#555555' },
];

const s = (id, name, sci, category, extra = {}) => ({ id, name, sci, category, ...extra });

export const SPECIES = [
  // Dabbling ducks
  s('mallard', 'Mallard', 'Anas platyrhynchos', 'dabbling', { note: 'Daily limit includes no more than 2 hens.' }),
  s('gadwall', 'Gadwall', 'Mareca strepera', 'dabbling'),
  s('american-wigeon', 'American Wigeon', 'Mareca americana', 'dabbling'),
  s('eurasian-wigeon', 'Eurasian Wigeon', 'Mareca penelope', 'dabbling', { note: 'Uncommon winter visitor, usually found with American wigeon.' }),
  s('northern-pintail', 'Northern Pintail', 'Anas acuta', 'dabbling', { note: 'Has its own species limit within the duck bag.' }),
  s('northern-shoveler', 'Northern Shoveler', 'Spatula clypeata', 'dabbling'),
  s('blue-winged-teal', 'Blue-winged Teal', 'Spatula discors', 'dabbling'),
  s('cinnamon-teal', 'Cinnamon Teal', 'Spatula cyanoptera', 'dabbling'),
  s('green-winged-teal', 'Green-winged Teal', 'Anas crecca', 'dabbling'),
  s('wood-duck', 'Wood Duck', 'Aix sponsa', 'dabbling'),

  // Diving ducks
  s('canvasback', 'Canvasback', 'Aythya valisineria', 'diving', { note: 'Has its own species limit within the duck bag.' }),
  s('redhead', 'Redhead', 'Aythya americana', 'diving', { note: 'Has its own species limit within the duck bag.' }),
  s('ring-necked-duck', 'Ring-necked Duck', 'Aythya collaris', 'diving'),
  s('greater-scaup', 'Greater Scaup', 'Aythya marila', 'diving', { note: 'Scaup have their own limit within the duck bag.' }),
  s('lesser-scaup', 'Lesser Scaup', 'Aythya affinis', 'diving', { note: 'Scaup have their own limit within the duck bag.' }),
  s('ruddy-duck', 'Ruddy Duck', 'Oxyura jamaicensis', 'diving'),
  s('bufflehead', 'Bufflehead', 'Bucephala albeola', 'diving'),
  s('common-goldeneye', 'Common Goldeneye', 'Bucephala clangula', 'diving'),
  s('barrows-goldeneye', "Barrow's Goldeneye", 'Bucephala islandica', 'diving'),
  s('hooded-merganser', 'Hooded Merganser', 'Lophodytes cucullatus', 'diving'),
  s('common-merganser', 'Common Merganser', 'Mergus merganser', 'diving'),
  s('red-breasted-merganser', 'Red-breasted Merganser', 'Mergus serrator', 'diving'),

  // Sea ducks (coastal bays and estuaries)
  s('surf-scoter', 'Surf Scoter', 'Melanitta perspicillata', 'sea'),
  s('white-winged-scoter', 'White-winged Scoter', 'Melanitta deglandi', 'sea'),
  s('black-scoter', 'Black Scoter', 'Melanitta americana', 'sea', { note: 'Uncommon along the California coast.' }),
  s('long-tailed-duck', 'Long-tailed Duck', 'Clangula hyemalis', 'sea', { note: 'Rare winter visitor along the coast.' }),

  // Geese
  s('canada-goose', 'Canada Goose', 'Branta canadensis', 'geese'),
  s('cackling-goose', 'Cackling Goose', 'Branta hutchinsii', 'geese', { note: "Includes the Aleutian cackling goose, which has zone-specific limits in some areas." }),
  s('brant', 'Brant', 'Branta bernicla', 'geese', { note: 'Short season in the Northern Brant and Balance of State zones; length set each year from the fall survey.' }),
  s('greater-white-fronted-goose', 'Greater White-fronted Goose', 'Anser albifrons', 'geese'),
  s('snow-goose', 'Snow Goose', 'Anser caerulescens', 'geese'),
  s('rosss-goose', "Ross's Goose", 'Anser rossii', 'geese'),

  // Upland birds
  s('ring-necked-pheasant', 'Ring-necked Pheasant', 'Phasianus colchicus', 'upland', { note: 'Roosters only.' }),
  s('chukar', 'Chukar', 'Alectoris chukar', 'upland'),
  s('california-quail', 'California Quail', 'Callipepla californica', 'upland'),
  s('gambels-quail', "Gambel's Quail", 'Callipepla gambelii', 'upland'),
  s('mountain-quail', 'Mountain Quail', 'Oreortyx pictus', 'upland', { note: 'Early mountain-quail-only season in Zone Q1.' }),
  s('sooty-grouse', 'Sooty Grouse', 'Dendragapus fuliginosus', 'upland', { note: "California's \"blue grouse\". Open only in certain counties." }),
  s('ruffed-grouse', 'Ruffed Grouse', 'Bonasa umbellus', 'upland', { note: 'Far northwestern California only; shares the sooty grouse season and limit.' }),
  s('white-tailed-ptarmigan', 'White-tailed Ptarmigan', 'Lagopus leucura', 'upland', { note: 'Short September season in the high Sierra; limit applies per season.' }),
  s('greater-sage-grouse', 'Greater Sage-Grouse', 'Centrocercus urophasianus', 'upland', { note: 'Permit-only drawing in four zones. Some years no permits are issued (none were for 2025).' }),

  // Wild turkey
  s('rio-grande-turkey', 'Rio Grande Wild Turkey', 'Meleagris gallopavo intermedia', 'turkey', { guide: 'Wild_Turkey', note: "California's most widespread turkey: foothills and oak woodlands, mostly below 3,000 ft." }),
  s('merriams-turkey', "Merriam's Wild Turkey", 'Meleagris gallopavo merriami', 'turkey', { guide: 'Wild_Turkey', note: 'Pine forests above 3,000 ft, mainly in northeastern California.' }),
  s('eastern-turkey', 'Eastern Wild Turkey', 'Meleagris gallopavo silvestris', 'turkey', { guide: 'Wild_Turkey', note: 'Released along the north coast.' }),
  s('hybrid-turkey', 'Wild Turkey (hybrid / unsure)', 'Meleagris gallopavo', 'turkey', { guide: 'Wild_Turkey', note: 'Many California birds are subspecies crosses. Use this when you can’t tell.' }),

  // Doves & pigeons
  s('mourning-dove', 'Mourning Dove', 'Zenaida macroura', 'doves'),
  s('white-winged-dove', 'White-winged Dove', 'Zenaida asiatica', 'doves', { note: 'Mostly in the low deserts; shares a combined limit with mourning dove.' }),
  s('eurasian-collared-dove', 'Eurasian Collared-Dove', 'Streptopelia decaocto', 'doves', { note: 'Invasive: open year-round with no limit.' }),
  s('spotted-dove', 'Spotted Dove', 'Spilopelia chinensis', 'doves', { note: 'Non-native: no limit.' }),
  s('ringed-turtle-dove', 'Ringed Turtle-Dove', 'Streptopelia risoria', 'doves', { guide: false, note: 'Non-native (domestic dove gone wild): no limit.' }),
  s('band-tailed-pigeon', 'Band-tailed Pigeon', 'Patagioenas fasciata', 'doves', { note: 'Two short seasons: September in the north, December in the south.' }),

  // Coots, moorhens & snipe
  s('american-coot', 'American Coot', 'Fulica americana', 'webless', { note: 'Season runs with duck season; separate limit.' }),
  s('common-gallinule', 'Common Gallinule (Moorhen)', 'Gallinula galeata', 'webless', { note: 'Shares a limit with coots.' }),
  s('wilsons-snipe', "Wilson's Snipe", 'Gallinago delicata', 'webless'),

  // Other
  s('american-crow', 'American Crow', 'Corvus brachyrhynchos', 'other', { note: 'Winter-to-spring season; some mapped areas are closed.' }),
];

// Species from the original North America-wide list that have no California season.
// Kept only so that entries logged before the list was trimmed still display correctly.
const RETIRED = [
  s('american-black-duck', 'American Black Duck', 'Anas rubripes', 'dabbling'),
  s('mottled-duck', 'Mottled Duck', 'Anas fulvigula', 'dabbling'),
  s('black-bellied-whistling-duck', 'Black-bellied Whistling-Duck', 'Dendrocygna autumnalis', 'dabbling'),
  s('fulvous-whistling-duck', 'Fulvous Whistling-Duck', 'Dendrocygna bicolor', 'dabbling'),
  s('common-eider', 'Common Eider', 'Somateria mollissima', 'sea'),
  s('king-eider', 'King Eider', 'Somateria spectabilis', 'sea'),
  s('emperor-goose', 'Emperor Goose', 'Anser canagicus', 'geese'),
  s('tundra-swan', 'Tundra Swan', 'Cygnus columbianus', 'geese'),
  s('gray-partridge', 'Gray Partridge', 'Perdix perdix', 'upland'),
  s('northern-bobwhite', 'Northern Bobwhite', 'Colinus virginianus', 'upland'),
  s('scaled-quail', 'Scaled Quail', 'Callipepla squamata', 'upland'),
  s('montezuma-quail', 'Montezuma Quail', 'Cyrtonyx montezumae', 'upland'),
  s('dusky-grouse', 'Dusky Grouse', 'Dendragapus obscurus', 'upland'),
  s('spruce-grouse', 'Spruce Grouse', 'Canachites canadensis', 'upland'),
  s('sharp-tailed-grouse', 'Sharp-tailed Grouse', 'Tympanuchus phasianellus', 'upland'),
  s('greater-prairie-chicken', 'Greater Prairie-Chicken', 'Tympanuchus cupido', 'upland'),
  s('willow-ptarmigan', 'Willow Ptarmigan', 'Lagopus lagopus', 'upland'),
  s('rock-ptarmigan', 'Rock Ptarmigan', 'Lagopus muta', 'upland'),
  s('osceola-turkey', 'Osceola Wild Turkey', 'Meleagris gallopavo osceola', 'turkey', { guide: 'Wild_Turkey' }),
  s('goulds-turkey', "Gould's Wild Turkey", 'Meleagris gallopavo mexicana', 'turkey', { guide: 'Wild_Turkey' }),
  s('rock-pigeon', 'Rock Pigeon', 'Columba livia', 'doves'),
  s('sandhill-crane', 'Sandhill Crane', 'Antigone canadensis', 'webless'),
  s('american-woodcock', 'American Woodcock', 'Scolopax minor', 'webless'),
  s('purple-gallinule', 'Purple Gallinule', 'Porphyrio martinica', 'webless'),
  s('virginia-rail', 'Virginia Rail', 'Rallus limicola', 'webless'),
  s('sora', 'Sora', 'Porzana carolina', 'webless'),
  s('king-rail', 'King Rail', 'Rallus elegans', 'webless'),
  s('clapper-rail', 'Clapper Rail', 'Rallus crepitans', 'webless'),
].map((sp) => ({ ...sp, retired: true, note: 'Not a California game bird. Shown here because you have entries for it.' }));

export const speciesById = new Map([...SPECIES, ...RETIRED].map((sp) => [sp.id, sp]));
export const categoryById = new Map(CATEGORIES.map((c) => [c.id, c]));

// Cornell Lab "All About Birds" species page.
export function guideUrl(sp) {
  if (sp.guide === false) return null;
  const slug = sp.guide || sp.name.replace(/ \(.*\)$/, '').replace(/'/g, '').replace(/ /g, '_');
  return `https://www.allaboutbirds.org/guide/${encodeURIComponent(slug)}`;
}
