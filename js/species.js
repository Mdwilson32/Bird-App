// Curated list of North American game birds.
// Legal status varies by state/province and season — always check current regulations.

export const CATEGORIES = [
  { id: 'dabbling', name: 'Dabbling Ducks', color: '#3f7f5a' },
  { id: 'diving', name: 'Diving Ducks', color: '#2f6690' },
  { id: 'sea', name: 'Sea Ducks', color: '#3a5a78' },
  { id: 'geese', name: 'Geese & Swans', color: '#6b5b3e' },
  { id: 'upland', name: 'Upland Birds', color: '#a0522d' },
  { id: 'turkey', name: 'Wild Turkey', color: '#8b3a3a' },
  { id: 'doves', name: 'Doves & Pigeons', color: '#7a6a8a' },
  { id: 'webless', name: 'Cranes, Rails & Shorebirds', color: '#5f7d3a' },
  { id: 'other', name: 'Other', color: '#555555' },
];

const s = (id, name, sci, category, extra = {}) => ({ id, name, sci, category, ...extra });

export const SPECIES = [
  // Dabbling ducks
  s('mallard', 'Mallard', 'Anas platyrhynchos', 'dabbling'),
  s('american-black-duck', 'American Black Duck', 'Anas rubripes', 'dabbling'),
  s('mottled-duck', 'Mottled Duck', 'Anas fulvigula', 'dabbling'),
  s('gadwall', 'Gadwall', 'Mareca strepera', 'dabbling'),
  s('american-wigeon', 'American Wigeon', 'Mareca americana', 'dabbling'),
  s('northern-pintail', 'Northern Pintail', 'Anas acuta', 'dabbling'),
  s('northern-shoveler', 'Northern Shoveler', 'Spatula clypeata', 'dabbling'),
  s('blue-winged-teal', 'Blue-winged Teal', 'Spatula discors', 'dabbling'),
  s('cinnamon-teal', 'Cinnamon Teal', 'Spatula cyanoptera', 'dabbling'),
  s('green-winged-teal', 'Green-winged Teal', 'Anas crecca', 'dabbling'),
  s('wood-duck', 'Wood Duck', 'Aix sponsa', 'dabbling'),
  s('black-bellied-whistling-duck', 'Black-bellied Whistling-Duck', 'Dendrocygna autumnalis', 'dabbling'),
  s('fulvous-whistling-duck', 'Fulvous Whistling-Duck', 'Dendrocygna bicolor', 'dabbling'),

  // Diving ducks
  s('canvasback', 'Canvasback', 'Aythya valisineria', 'diving'),
  s('redhead', 'Redhead', 'Aythya americana', 'diving'),
  s('ring-necked-duck', 'Ring-necked Duck', 'Aythya collaris', 'diving'),
  s('greater-scaup', 'Greater Scaup', 'Aythya marila', 'diving'),
  s('lesser-scaup', 'Lesser Scaup', 'Aythya affinis', 'diving'),
  s('ruddy-duck', 'Ruddy Duck', 'Oxyura jamaicensis', 'diving'),
  s('bufflehead', 'Bufflehead', 'Bucephala albeola', 'diving'),
  s('common-goldeneye', 'Common Goldeneye', 'Bucephala clangula', 'diving'),
  s('barrows-goldeneye', "Barrow's Goldeneye", 'Bucephala islandica', 'diving'),
  s('hooded-merganser', 'Hooded Merganser', 'Lophodytes cucullatus', 'diving'),
  s('common-merganser', 'Common Merganser', 'Mergus merganser', 'diving'),
  s('red-breasted-merganser', 'Red-breasted Merganser', 'Mergus serrator', 'diving'),

  // Sea ducks
  s('long-tailed-duck', 'Long-tailed Duck', 'Clangula hyemalis', 'sea'),
  s('surf-scoter', 'Surf Scoter', 'Melanitta perspicillata', 'sea'),
  s('white-winged-scoter', 'White-winged Scoter', 'Melanitta deglandi', 'sea'),
  s('black-scoter', 'Black Scoter', 'Melanitta americana', 'sea'),
  s('common-eider', 'Common Eider', 'Somateria mollissima', 'sea'),
  s('king-eider', 'King Eider', 'Somateria spectabilis', 'sea'),

  // Geese & swans
  s('canada-goose', 'Canada Goose', 'Branta canadensis', 'geese'),
  s('cackling-goose', 'Cackling Goose', 'Branta hutchinsii', 'geese'),
  s('brant', 'Brant', 'Branta bernicla', 'geese'),
  s('greater-white-fronted-goose', 'Greater White-fronted Goose', 'Anser albifrons', 'geese'),
  s('snow-goose', 'Snow Goose', 'Anser caerulescens', 'geese'),
  s('rosss-goose', "Ross's Goose", 'Anser rossii', 'geese'),
  s('emperor-goose', 'Emperor Goose', 'Anser canagicus', 'geese'),
  s('tundra-swan', 'Tundra Swan', 'Cygnus columbianus', 'geese'),

  // Upland birds
  s('ring-necked-pheasant', 'Ring-necked Pheasant', 'Phasianus colchicus', 'upland'),
  s('chukar', 'Chukar', 'Alectoris chukar', 'upland'),
  s('gray-partridge', 'Gray Partridge', 'Perdix perdix', 'upland'),
  s('northern-bobwhite', 'Northern Bobwhite', 'Colinus virginianus', 'upland'),
  s('california-quail', 'California Quail', 'Callipepla californica', 'upland'),
  s('gambels-quail', "Gambel's Quail", 'Callipepla gambelii', 'upland'),
  s('scaled-quail', 'Scaled Quail', 'Callipepla squamata', 'upland'),
  s('mountain-quail', 'Mountain Quail', 'Oreortyx pictus', 'upland'),
  s('montezuma-quail', 'Montezuma Quail', 'Cyrtonyx montezumae', 'upland'),
  s('ruffed-grouse', 'Ruffed Grouse', 'Bonasa umbellus', 'upland'),
  s('dusky-grouse', 'Dusky Grouse', 'Dendragapus obscurus', 'upland'),
  s('sooty-grouse', 'Sooty Grouse', 'Dendragapus fuliginosus', 'upland'),
  s('spruce-grouse', 'Spruce Grouse', 'Canachites canadensis', 'upland'),
  s('sharp-tailed-grouse', 'Sharp-tailed Grouse', 'Tympanuchus phasianellus', 'upland'),
  s('greater-prairie-chicken', 'Greater Prairie-Chicken', 'Tympanuchus cupido', 'upland'),
  s('greater-sage-grouse', 'Greater Sage-Grouse', 'Centrocercus urophasianus', 'upland'),
  s('willow-ptarmigan', 'Willow Ptarmigan', 'Lagopus lagopus', 'upland'),
  s('rock-ptarmigan', 'Rock Ptarmigan', 'Lagopus muta', 'upland'),
  s('white-tailed-ptarmigan', 'White-tailed Ptarmigan', 'Lagopus leucura', 'upland'),

  // Wild turkey subspecies (the "Grand Slam" / "Royal Slam")
  s('eastern-turkey', 'Eastern Wild Turkey', 'Meleagris gallopavo silvestris', 'turkey', { guide: 'Wild_Turkey' }),
  s('rio-grande-turkey', 'Rio Grande Wild Turkey', 'Meleagris gallopavo intermedia', 'turkey', { guide: 'Wild_Turkey' }),
  s('merriams-turkey', "Merriam's Wild Turkey", 'Meleagris gallopavo merriami', 'turkey', { guide: 'Wild_Turkey' }),
  s('osceola-turkey', 'Osceola Wild Turkey', 'Meleagris gallopavo osceola', 'turkey', { guide: 'Wild_Turkey' }),
  s('goulds-turkey', "Gould's Wild Turkey", 'Meleagris gallopavo mexicana', 'turkey', { guide: 'Wild_Turkey' }),

  // Doves & pigeons
  s('mourning-dove', 'Mourning Dove', 'Zenaida macroura', 'doves'),
  s('white-winged-dove', 'White-winged Dove', 'Zenaida asiatica', 'doves'),
  s('eurasian-collared-dove', 'Eurasian Collared-Dove', 'Streptopelia decaocto', 'doves'),
  s('band-tailed-pigeon', 'Band-tailed Pigeon', 'Patagioenas fasciata', 'doves'),
  s('rock-pigeon', 'Rock Pigeon', 'Columba livia', 'doves'),

  // Cranes, rails & shorebirds (webless migratory game birds)
  s('sandhill-crane', 'Sandhill Crane', 'Antigone canadensis', 'webless'),
  s('american-woodcock', 'American Woodcock', 'Scolopax minor', 'webless'),
  s('wilsons-snipe', "Wilson's Snipe", 'Gallinago delicata', 'webless'),
  s('american-coot', 'American Coot', 'Fulica americana', 'webless'),
  s('common-gallinule', 'Common Gallinule', 'Gallinula galeata', 'webless'),
  s('purple-gallinule', 'Purple Gallinule', 'Porphyrio martinica', 'webless'),
  s('virginia-rail', 'Virginia Rail', 'Rallus limicola', 'webless'),
  s('sora', 'Sora', 'Porzana carolina', 'webless'),
  s('king-rail', 'King Rail', 'Rallus elegans', 'webless'),
  s('clapper-rail', 'Clapper Rail', 'Rallus crepitans', 'webless'),

  // Other
  s('american-crow', 'American Crow', 'Corvus brachyrhynchos', 'other'),
];

export const speciesById = new Map(SPECIES.map((sp) => [sp.id, sp]));
export const categoryById = new Map(CATEGORIES.map((c) => [c.id, c]));

// Cornell Lab "All About Birds" species page.
export function guideUrl(sp) {
  const slug = sp.guide || sp.name.replace(/'/g, '').replace(/ /g, '_');
  return `https://www.allaboutbirds.org/guide/${encodeURIComponent(slug)}`;
}
