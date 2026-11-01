export interface CityInfo {
  name: string;
  province: string;
  lat: number;
  lng: number;
  popularAreas: string[];
  shopCount: number;
}

export interface ProvinceInfo {
  name: string;
  code: string;
  cities: CityInfo[];
}

export const PAKISTAN_REGIONS: ProvinceInfo[] = [
  {
    name: 'Khyber Pakhtunkhwa (KP)',
    code: 'KP',
    cities: [
      {
        name: 'Peshawar',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.0151,
        lng: 71.5249,
        popularAreas: ['Saddar Cantt', 'Hayatabad', 'University Town', 'Qissa Khwani Bazar', 'Board Bazar', 'Gulbahar', 'Ring Road Commercial'],
        shopCount: 284,
      },
      {
        name: 'Mardan',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.1989,
        lng: 72.0404,
        popularAreas: ['Bank Road', 'Cantt Area', 'Shamsi Road', 'Mall Road', 'Gujar Garhi'],
        shopCount: 78,
      },
      {
        name: 'Abbottabad',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.1688,
        lng: 73.2215,
        popularAreas: ['Mandian', 'Supply Road', 'Jadoon Plaza', 'Karakoram Highway Market', 'Cantt Bazar'],
        shopCount: 92,
      },
      {
        name: 'Swat (Mingora)',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.7717,
        lng: 72.3602,
        popularAreas: ['Main Mingora Bazar', 'Saidu Sharif', 'New Green Chowk', 'Kabal Road'],
        shopCount: 65,
      },
      {
        name: 'Kohat',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 33.5869,
        lng: 71.4414,
        popularAreas: ['Main City Bazar', 'Cantt Commercial', 'KDA Market', 'Hangu Road'],
        shopCount: 42,
      },
      {
        name: 'Dera Ismail Khan',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 31.8314,
        lng: 70.9019,
        popularAreas: ['Circular Road', 'Topanwala Gate', 'Cantt Market', 'University Road'],
        shopCount: 48,
      },
      {
        name: 'Charsadda',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.1482,
        lng: 71.7406,
        popularAreas: ['Main Charsadda Bazar', 'Utmanzai Market', 'Shabqadar Road'],
        shopCount: 36,
      },
      {
        name: 'Nowshera',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.0153,
        lng: 71.9747,
        popularAreas: ['Cantt Market', 'Shobra Chowk', 'Risalpur Road', 'Main GT Road'],
        shopCount: 39,
      },
      {
        name: 'Swabi',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.1202,
        lng: 72.4704,
        popularAreas: ['Swabi Main Chowk', 'Jehangira Road', 'Topi Market'],
        shopCount: 29,
      },
      {
        name: 'Mansehra',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.3333,
        lng: 73.2000,
        popularAreas: ['Shinkiari Road', 'Main Bazar', 'Lari Adda Market'],
        shopCount: 31,
      },
      {
        name: 'Bannu',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 32.9889,
        lng: 70.6056,
        popularAreas: ['Chai Bazar', 'Bannu Cantt', 'Miranshah Road'],
        shopCount: 25,
      },
    ],
  },
  {
    name: 'Punjab',
    code: 'PB',
    cities: [
      {
        name: 'Lahore',
        province: 'Punjab',
        lat: 31.5204,
        lng: 74.3587,
        popularAreas: ['Gulberg III', 'DHA Phase 5 & 6', 'Mall Road', 'Johar Town', 'Model Town', 'Anarkali', 'Y-Block Commercial'],
        shopCount: 412,
      },
      {
        name: 'Rawalpindi',
        province: 'Punjab',
        lat: 33.5651,
        lng: 73.0169,
        popularAreas: ['Saddar Commercial', 'Bahria Town Rawalpindi', 'Commercial Market Satellite Town', 'Raja Bazar', 'Peshawar Road'],
        shopCount: 220,
      },
      {
        name: 'Faisalabad',
        province: 'Punjab',
        lat: 31.4504,
        lng: 73.1350,
        popularAreas: ['D-Ground Peoples Colony', 'Clock Tower Eight Bazars', 'Jaranwala Road', 'Kohinoor City', 'Susan Road'],
        shopCount: 165,
      },
      {
        name: 'Multan',
        province: 'Punjab',
        lat: 30.1575,
        lng: 71.5249,
        popularAreas: ['Gulgasht Colony', 'Cantt Mall Plaza', 'Bosan Road', 'Hussain Agahi Bazar', 'Shah Rukn-e-Alam'],
        shopCount: 130,
      },
      {
        name: 'Gujranwala',
        province: 'Punjab',
        lat: 32.1877,
        lng: 74.1945,
        popularAreas: ['Model Town Market', 'Satellite Town', 'GT Road Plaza', 'Wapda Town'],
        shopCount: 98,
      },
      {
        name: 'Sialkot',
        province: 'Punjab',
        lat: 32.4945,
        lng: 74.5229,
        popularAreas: ['Kashmir Road', 'Cantt Area', 'Paris Road', 'Shahabpura Sports Market'],
        shopCount: 110,
      },
      {
        name: 'Bahawalpur',
        province: 'Punjab',
        lat: 29.3544,
        lng: 71.6911,
        popularAreas: ['Circular Road', 'Model Town A & B', 'Farid Gate Bazar', 'Cantt Commercial'],
        shopCount: 64,
      },
      {
        name: 'Sargodha',
        province: 'Punjab',
        lat: 32.0836,
        lng: 72.6711,
        popularAreas: ['Satellite Town', 'Club Road', 'Katchery Bazar', 'University Road'],
        shopCount: 58,
      },
      {
        name: 'Gujrat',
        province: 'Punjab',
        lat: 32.5742,
        lng: 74.0754,
        popularAreas: ['Court Road', 'Circular Road', 'Rehman Shaheed Road'],
        shopCount: 52,
      },
    ],
  },
  {
    name: 'Sindh',
    code: 'SD',
    cities: [
      {
        name: 'Karachi',
        province: 'Sindh',
        lat: 24.8607,
        lng: 67.0011,
        popularAreas: ['Clifton Block 2 & 5', 'DHA Phase 6 Bukhari & Ittehad', 'Saddar Electronics Market', 'Tariq Road PECHS', 'Gulshan-e-Iqbal', 'Bahria Town Karachi', 'North Nazimabad'],
        shopCount: 520,
      },
      {
        name: 'Hyderabad',
        province: 'Sindh',
        lat: 25.3960,
        lng: 68.3578,
        popularAreas: ['Saddar Cantt', 'Auto Bhan Road', 'Latifabad Unit 7', 'Resham Gali Market', 'Qasimabad'],
        shopCount: 140,
      },
      {
        name: 'Sukkur',
        province: 'Sindh',
        lat: 27.7052,
        lng: 68.8574,
        popularAreas: ['Military Road', 'Minara Road', 'Gharibabad Bazar', 'Station Road'],
        shopCount: 68,
      },
      {
        name: 'Larkana',
        province: 'Sindh',
        lat: 27.5598,
        lng: 68.2120,
        popularAreas: ['VIP Road', 'Station Road', 'Shahi Bazar', 'Bank Square'],
        shopCount: 45,
      },
      {
        name: 'Nawabshah',
        province: 'Sindh',
        lat: 26.2483,
        lng: 68.4096,
        popularAreas: ['Masjid Road', 'Sakrand Road', 'Chakra Bazar'],
        shopCount: 38,
      },
      {
        name: 'Mirpur Khas',
        province: 'Sindh',
        lat: 25.5269,
        lng: 69.0111,
        popularAreas: ['Station Road', 'Shahi Bazar', 'Satellite Town'],
        shopCount: 32,
      },
    ],
  },
  {
    name: 'Islamabad Capital Territory (ICT)',
    code: 'ICT',
    cities: [
      {
        name: 'Islamabad',
        province: 'Islamabad Capital Territory (ICT)',
        lat: 33.6844,
        lng: 73.0479,
        popularAreas: ['Blue Area Jinnah Avenue', 'F-7 Markaz (Jinnah Super)', 'F-6 Markaz (Super Market)', 'F-10 Markaz', 'F-11 Markaz', 'I-8 Markaz', 'G-9 Karachi Company', 'Bahria Enclave'],
        shopCount: 310,
      },
    ],
  },
  {
    name: 'Balochistan',
    code: 'BA',
    cities: [
      {
        name: 'Quetta',
        province: 'Balochistan',
        lat: 30.1798,
        lng: 66.9750,
        popularAreas: ['Liaquat Bazar', 'Jinnah Road', 'Cantt Market', 'Suraj Ganj Bazar', 'Shahrah-e-Iqbal', 'Chaman Phatak'],
        shopCount: 88,
      },
      {
        name: 'Gwadar',
        province: 'Balochistan',
        lat: 25.1216,
        lng: 62.3254,
        popularAreas: ['Marine Drive Commercial', 'Port Commercial Zone', 'Main Shahi Bazar'],
        shopCount: 35,
      },
      {
        name: 'Turbat',
        province: 'Balochistan',
        lat: 26.0081,
        lng: 63.0483,
        popularAreas: ['Main Turbat Bazar', 'Airport Road', 'Kech River Commercial'],
        shopCount: 22,
      },
    ],
  },
  {
    name: 'Azad Jammu & Kashmir (AJK)',
    code: 'AJK',
    cities: [
      {
        name: 'Muzaffarabad',
        province: 'Azad Jammu & Kashmir (AJK)',
        lat: 34.3700,
        lng: 73.4711,
        popularAreas: ['Madina Market', 'Main Bazar', 'Upper Chatter', 'Neelum Road Commercial'],
        shopCount: 54,
      },
      {
        name: 'Mirpur AJK',
        province: 'Azad Jammu & Kashmir (AJK)',
        lat: 33.1484,
        lng: 73.7519,
        popularAreas: ['Sector F-1 Commercial', 'Chowk Shaheedan', 'Allama Iqbal Road', 'New City Commercial'],
        shopCount: 62,
      },
    ],
  },
  {
    name: 'Gilgit-Baltistan (GB)',
    code: 'GB',
    cities: [
      {
        name: 'Gilgit',
        province: 'Gilgit-Baltistan (GB)',
        lat: 35.9221,
        lng: 74.3087,
        popularAreas: ['NGB Commercial Area', 'Jutial Market', 'Saddar Bazar Gilgit', 'Airport Road'],
        shopCount: 46,
      },
      {
        name: 'Skardu',
        province: 'Gilgit-Baltistan (GB)',
        lat: 35.2971,
        lng: 75.6333,
        popularAreas: ['Yadgar Chowk', 'Main Skardu Bazar', 'Airport Road', 'Haji Gam Commercial'],
        shopCount: 38,
      },
    ],
  },
];

export const ALL_PAKISTAN_CITIES: CityInfo[] = PAKISTAN_REGIONS.flatMap((r) => r.cities);

export const getCityByName = (name: string): CityInfo => {
  const found = ALL_PAKISTAN_CITIES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  return (
    found || {
      name: 'Peshawar',
      province: 'Khyber Pakhtunkhwa (KP)',
      lat: 34.0151,
      lng: 71.5249,
      popularAreas: ['Saddar Cantt', 'Hayatabad', 'University Town', 'Qissa Khwani Bazar'],
      shopCount: 284,
    }
  );
};
