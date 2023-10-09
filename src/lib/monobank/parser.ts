const FoodPattern = new RegExp(
	/Ашан|/.source +
	/Rossmann|Carrefour|/.source +
	/Biedronka|ZABKA|/.source +
	/CUKIERNIA KROPKA|Inmedio/.source
);
const RidesPattern = new RegExp(
  	/Bolt|Uber|/.source + 
	/Jakdojade|BILETOMAT|/.source + 
	/TAXI|Taxi/.source
);
const MonobankPattern = new RegExp(
  	/Поповнення «|/.source + 
	/З гривневого рахунку ФОП|/.source + 
	/Від: /.source
);
const MediaPattern = new RegExp(
  	/YouTube|GitHub|Steam|Spotify|/.source + 
	/UPC|doladowania.play/.source
);
const SportPattern = new RegExp(/ZDROFIT/.source);
const DeliveryPattern = new RegExp(/pyszne/.source);
const InernetShopsPattern = /Allegro|AliExpress|Amazon/;
const TreatmentPattern = /Аптека|APTEKA|Apteka|LUX MED|compensa.pl/;
const RestaurantPattern = new RegExp(
    /Restauracja|RESTAURACJA|RESTAURNT|ITALIA|Kuchnia|Bar|BAR|PIZZA|/.source +
    /KEBAB|BURGER|/.source +
    /McDonald’s/.source
);
const PolandRestaurantPattern = new RegExp(
    /Zapiecek|ANATOLIA|U SIOSTR|FOOD HALL|OGRODY WISLA|Goraco Polecam|Philly's Finest|/.source +
    /PWIP|DOMEK KATA|SEAFARMERS YERSEKE|SPOKE I SLEDZIE|PI-TEL GABRIELA PALCZA/.source
);
const CaffePattern = /KAWIARNIA|Coffee|COFFEE|CAFFE|Cafe/;
const ClothesShopsPattern = /Pull and Bear|Zara|CROPP|HM|CCC|Інтерспорт|Carry/;
const ShopsPattern = /Leroy Merlin|IKEA|EURO-NET|ARKADIA|ISPOT/;
const LimePattern = /LIM\*/;
const InmedioPattern = /Inmedio/;
const EuroSparPattern = /SUPERMARKET PIOTR I PA/;

const groups = {
  food: [FoodPattern, EuroSparPattern, InmedioPattern],
  rides: [RidesPattern, LimePattern],
  restaurant: [
    RestaurantPattern,
    PolandRestaurantPattern,
    CaffePattern,
  ],
  media: [MediaPattern],
  shopping: [InernetShopsPattern, ClothesShopsPattern, ShopsPattern],
  delivery: [DeliveryPattern],
  bank: [MonobankPattern],
  sport: [SportPattern],
  health: [TreatmentPattern],
} as const;

type Tag = keyof typeof groups | "other";

export const parseDesctiptionIntoTags = (description: string): Tag => {
  for (const [name, patterns] of Object.entries(groups)) {
    if (patterns.some((pattern) => pattern.test(description))) {
      return name as keyof typeof groups;
    }
  }
  return "other";
};