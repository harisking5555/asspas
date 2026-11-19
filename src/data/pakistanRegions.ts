import { CustomRegionCity } from '../types';

export interface CityInfo {
  name: string;
  province: string;
  lat: number;
  lng: number;
  popularAreas: string[];
  unionCouncils?: string[];
  shopCount: number;
}

export interface ProvinceInfo {
  name: string;
  code: string;
  cities: CityInfo[];
}

export const PAKISTAN_REGIONS: ProvinceInfo[] = [
  {
    name: 'Azad Jammu & Kashmir (AJK)',
    code: 'AJK',
    cities: [
      {
        name: 'Mirpur AJK',
        province: 'Azad Jammu & Kashmir (AJK)',
        lat: 33.1484,
        lng: 73.7519,
        popularAreas: ['Allama Iqbal Road', 'Chowk Shaheedan', 'New City Commercial', 'Sector F-1 Commercial'],
        unionCouncils: ['UC Chakswari', 'UC Dadyal', 'UC Islamgarh', 'UC Mirpur City', 'UC New City'],
        shopCount: 62,
      },
      {
        name: 'Muzaffarabad',
        province: 'Azad Jammu & Kashmir (AJK)',
        lat: 34.3700,
        lng: 73.4711,
        popularAreas: ['Madina Market', 'Main Bazar', 'Neelum Road Commercial', 'Upper Chatter'],
        unionCouncils: ['UC Bank Square', 'UC Chehla', 'UC Domel', 'UC Upper Chatter'],
        shopCount: 54,
      },
    ],
  },
  {
    name: 'Balochistan',
    code: 'BA',
    cities: [
      {
        name: 'Gwadar',
        province: 'Balochistan',
        lat: 25.1216,
        lng: 62.3254,
        popularAreas: ['Main Shahi Bazar', 'Marine Drive Commercial', 'Port Commercial Zone'],
        unionCouncils: ['UC Gwadar North', 'UC Gwadar South', 'UC Pishukan', 'UC Surbandar'],
        shopCount: 35,
      },
      {
        name: 'Quetta',
        province: 'Balochistan',
        lat: 30.1798,
        lng: 66.9750,
        popularAreas: ['Cantt Market', 'Chaman Phatak', 'Jinnah Road', 'Liaquat Bazar', 'Shahrah-e-Iqbal', 'Suraj Ganj Bazar'],
        unionCouncils: ['UC Brewery', 'UC Cantt', 'UC Gawalmandi', 'UC Killi Almas', 'UC Liaquat Bazar', 'UC Sariab'],
        shopCount: 88,
      },
      {
        name: 'Turbat',
        province: 'Balochistan',
        lat: 26.0081,
        lng: 63.0483,
        popularAreas: ['Airport Road', 'Kech River Commercial', 'Main Turbat Bazar'],
        unionCouncils: ['UC Absor', 'UC Kech Bazar', 'UC Turbat Central'],
        shopCount: 22,
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
        popularAreas: ['Airport Road', 'Jutial Market', 'NGB Commercial Area', 'Saddar Bazar Gilgit'],
        unionCouncils: ['UC Danyore', 'UC Jutial', 'UC Kashrote', 'UC Konodas', 'UC Nagaral'],
        shopCount: 46,
      },
      {
        name: 'Skardu',
        province: 'Gilgit-Baltistan (GB)',
        lat: 35.2971,
        lng: 75.6333,
        popularAreas: ['Airport Road', 'Haji Gam Commercial', 'Main Skardu Bazar', 'Yadgar Chowk'],
        unionCouncils: ['UC Gamba', 'UC Hussainabad', 'UC Sadpara', 'UC Skardu Central'],
        shopCount: 38,
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
        popularAreas: ['Bahria Enclave', 'Blue Area Jinnah Avenue', 'F-10 Markaz', 'F-11 Markaz', 'F-6 Markaz (Super Market)', 'F-7 Markaz (Jinnah Super)', 'G-9 Karachi Company', 'I-8 Markaz'],
        unionCouncils: ['UC Bara Kahu', 'UC Chak Shahzad', 'UC F-6 / F-7', 'UC F-10 / F-11', 'UC G-9 / G-10', 'UC I-8 / I-10', 'UC Tarlai'],
        shopCount: 310,
      },
    ],
  },
  {
    name: 'Khyber Pakhtunkhwa (KP)',
    code: 'KP',
    cities: [
      {
        name: 'Abbottabad',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.1688,
        lng: 73.2215,
        popularAreas: ['Cantt Bazar', 'Jadoon Plaza', 'Karakoram Highway Market', 'Mandian', 'Supply Road'],
        unionCouncils: ['UC Havelian', 'UC Kehal', 'UC Malikpura', 'UC Mandian', 'UC Mirpur', 'UC Nawanshehr', 'UC Supply'],
        shopCount: 92,
      },
      {
        name: 'Bannu',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 32.9889,
        lng: 70.6056,
        popularAreas: ['Bannu Cantt', 'Chai Bazar', 'Miranshah Road'],
        unionCouncils: ['UC Bannu City', 'UC Kakki', 'UC Mita Khel'],
        shopCount: 25,
      },
      {
        name: 'Charsadda',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.1482,
        lng: 71.7406,
        popularAreas: ['Main Charsadda Bazar', 'Shabqadar Road', 'Utmanzai Market'],
        unionCouncils: ['UC Charsadda Khas', 'UC Shabqadar', 'UC Tangi', 'UC Utmanzai'],
        shopCount: 36,
      },
      {
        name: 'Dera Ismail Khan',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 31.8314,
        lng: 70.9019,
        popularAreas: ['Cantt Market', 'Circular Road', 'Topanwala Gate', 'University Road'],
        unionCouncils: ['UC Cantt', 'UC Muryali', 'UC Paharpur', 'UC Topanwala'],
        shopCount: 48,
      },
      {
        name: 'Haripur',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 33.9946,
        lng: 72.9341,
        popularAreas: ['GT Road Bazar', 'Main Bazar Haripur', 'Sheranwala Gate', 'TIP Market'],
        unionCouncils: ['UC Haripur Central', 'UC Khalabat', 'UC Khanpur', 'UC Sarai Saleh'],
        shopCount: 44,
      },
      {
        name: 'Kohat',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 33.5869,
        lng: 71.4414,
        popularAreas: ['Cantt Commercial', 'Hangu Road', 'KDA Market', 'Main City Bazar'],
        unionCouncils: ['UC Cantt', 'UC Jarma', 'UC KDA', 'UC Kohat Urban'],
        shopCount: 42,
      },
      {
        name: 'Mansehra',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.3333,
        lng: 73.2000,
        popularAreas: ['Lari Adda Market', 'Main Bazar', 'Shinkiari Road'],
        unionCouncils: ['UC Balakot', 'UC Dhodial', 'UC Mansehra City', 'UC Shinkiari'],
        shopCount: 31,
      },
      {
        name: 'Mardan',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.1989,
        lng: 72.0404,
        popularAreas: ['Bank Road', 'Cantt Area', 'Gujar Garhi', 'Mall Road', 'Shamsi Road'],
        unionCouncils: ['UC Baghdada', 'UC Cantt', 'UC Gujar Garhi', 'UC Hoti', 'UC Mardan Khas', 'UC Takht Bhai'],
        shopCount: 78,
      },
      {
        name: 'Nowshera',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.0153,
        lng: 71.9747,
        popularAreas: ['Cantt Market', 'Main GT Road', 'Risalpur Road', 'Shobra Chowk'],
        unionCouncils: ['UC Akora Khattak', 'UC Nowshera Cantt', 'UC Nowshera Kalan', 'UC Pabbi', 'UC Risalpur'],
        shopCount: 39,
      },
      {
        name: 'Peshawar',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.0151,
        lng: 71.5249,
        popularAreas: ['Board Bazar', 'Gulbahar', 'Hayatabad', 'Qissa Khwani Bazar', 'Ring Road Commercial', 'Saddar Cantt', 'University Town'],
        unionCouncils: [
          'UC 1 Hashtnagri',
          'UC 5 Karim Pura',
          'UC 12 Qissa Khwani',
          'UC 20 Saddar Cantt',
          'UC 25 Shaheen Town',
          'UC 30 University Town',
          'UC 36 Hayatabad Phase 1-3',
          'UC 37 Hayatabad Phase 4-7',
          'UC 40 Tehkal Bala / Board Bazar',
          'UC 45 Gulbahar',
          'UC 52 Kohat Road',
          'UC 60 Warsak Road',
          'UC 68 Charsadda Road',
          'UC 75 Ring Road / Chamkani',
        ],
        shopCount: 284,
      },
      {
        name: 'Swabi',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.1202,
        lng: 72.4704,
        popularAreas: ['Jehangira Road', 'Swabi Main Chowk', 'Topi Market'],
        unionCouncils: ['UC Chota Lahore', 'UC Marghuz', 'UC Swabi Khas', 'UC Topi', 'UC Zaida'],
        shopCount: 29,
      },
      {
        name: 'Swat (Mingora)',
        province: 'Khyber Pakhtunkhwa (KP)',
        lat: 34.7717,
        lng: 72.3602,
        popularAreas: ['Kabal Road', 'Main Mingora Bazar', 'New Green Chowk', 'Saidu Sharif'],
        unionCouncils: ['UC Amankot', 'UC Banr', 'UC Gulkada', 'UC Kabal', 'UC Mingora', 'UC Saidu Sharif'],
        shopCount: 65,
      },
    ],
  },
  {
    name: 'Punjab',
    code: 'PB',
    cities: [
      {
        name: 'Bahawalpur',
        province: 'Punjab',
        lat: 29.3544,
        lng: 71.6911,
        popularAreas: ['Cantt Commercial', 'Circular Road', 'Farid Gate Bazar', 'Model Town A & B'],
        unionCouncils: ['UC Cantt', 'UC Farid Gate', 'UC Model Town', 'UC Shadab Colony'],
        shopCount: 64,
      },
      {
        name: 'Faisalabad',
        province: 'Punjab',
        lat: 31.4504,
        lng: 73.1350,
        popularAreas: ['Clock Tower Eight Bazars', 'D-Ground Peoples Colony', 'Jaranwala Road', 'Kohinoor City', 'Susan Road'],
        unionCouncils: ['UC Clock Tower', 'UC D-Ground', 'UC Ghulam Muhammadabad', 'UC Jaranwala Road', 'UC Peoples Colony'],
        shopCount: 165,
      },
      {
        name: 'Gujranwala',
        province: 'Punjab',
        lat: 32.1877,
        lng: 74.1945,
        popularAreas: ['GT Road Plaza', 'Model Town Market', 'Satellite Town', 'Wapda Town'],
        unionCouncils: ['UC Model Town', 'UC People Colony', 'UC Satellite Town', 'UC Wapda Town'],
        shopCount: 98,
      },
      {
        name: 'Gujrat',
        province: 'Punjab',
        lat: 32.5742,
        lng: 74.0754,
        popularAreas: ['Circular Road', 'Court Road', 'Rehman Shaheed Road'],
        unionCouncils: ['UC Fawara Chowk', 'UC Marghzar', 'UC Shadman Colony'],
        shopCount: 52,
      },
      {
        name: 'Lahore',
        province: 'Punjab',
        lat: 31.5204,
        lng: 74.3587,
        popularAreas: ['Anarkali', 'DHA Phase 5 & 6', 'Gulberg III', 'Johar Town', 'Mall Road', 'Model Town', 'Y-Block Commercial'],
        unionCouncils: ['UC Anarkali', 'UC DHA Lahore', 'UC Gulberg', 'UC Ichhra', 'UC Johar Town', 'UC Model Town', 'UC Walled City'],
        shopCount: 412,
      },
      {
        name: 'Multan',
        province: 'Punjab',
        lat: 30.1575,
        lng: 71.5249,
        popularAreas: ['Bosan Road', 'Cantt Mall Plaza', 'Gulgasht Colony', 'Hussain Agahi Bazar', 'Shah Rukn-e-Alam'],
        unionCouncils: ['UC Bosan Town', 'UC Cantt', 'UC Gulgasht', 'UC Mumtazabad', 'UC Shah Rukn-e-Alam'],
        shopCount: 130,
      },
      {
        name: 'Rawalpindi',
        province: 'Punjab',
        lat: 33.5651,
        lng: 73.0169,
        popularAreas: ['Bahria Town Rawalpindi', 'Commercial Market Satellite Town', 'Peshawar Road', 'Raja Bazar', 'Saddar Commercial'],
        unionCouncils: ['UC Bahria Town', 'UC Chaklala Scheme 3', 'UC Raja Bazar', 'UC Saddar Cantt', 'UC Satellite Town'],
        shopCount: 220,
      },
      {
        name: 'Sargodha',
        province: 'Punjab',
        lat: 32.0836,
        lng: 72.6711,
        popularAreas: ['Club Road', 'Katchery Bazar', 'Satellite Town', 'University Road'],
        unionCouncils: ['UC Civil Lines', 'UC Katchery', 'UC Satellite Town'],
        shopCount: 58,
      },
      {
        name: 'Sialkot',
        province: 'Punjab',
        lat: 32.4945,
        lng: 74.5229,
        popularAreas: ['Cantt Area', 'Kashmir Road', 'Paris Road', 'Shahabpura Sports Market'],
        unionCouncils: ['UC Cantt', 'UC Paris Road', 'UC Rangpura', 'UC Shahabpura'],
        shopCount: 110,
      },
    ],
  },
  {
    name: 'Sindh',
    code: 'SD',
    cities: [
      {
        name: 'Hyderabad',
        province: 'Sindh',
        lat: 25.3960,
        lng: 68.3578,
        popularAreas: ['Auto Bhan Road', 'Latifabad Unit 7', 'Qasimabad', 'Resham Gali Market', 'Saddar Cantt'],
        unionCouncils: ['UC City Hyderabad', 'UC Latifabad Unit 7', 'UC Qasimabad', 'UC Saddar'],
        shopCount: 140,
      },
      {
        name: 'Karachi',
        province: 'Sindh',
        lat: 24.8607,
        lng: 67.0011,
        popularAreas: ['Bahria Town Karachi', 'Clifton Block 2 & 5', 'DHA Phase 6 Bukhari & Ittehad', 'Gulshan-e-Iqbal', 'North Nazimabad', 'Saddar Electronics Market', 'Tariq Road PECHS'],
        unionCouncils: ['UC Clifton', 'UC Defence / DHA', 'UC Gulshan-e-Iqbal', 'UC Malir', 'UC North Nazimabad', 'UC PECHS', 'UC Saddar'],
        shopCount: 520,
      },
      {
        name: 'Larkana',
        province: 'Sindh',
        lat: 27.5598,
        lng: 68.2120,
        popularAreas: ['Bank Square', 'Shahi Bazar', 'Station Road', 'VIP Road'],
        unionCouncils: ['UC Dari', 'UC Empire', 'UC Lahori'],
        shopCount: 45,
      },
      {
        name: 'Mirpur Khas',
        province: 'Sindh',
        lat: 25.5269,
        lng: 69.0111,
        popularAreas: ['Satellite Town', 'Shahi Bazar', 'Station Road'],
        unionCouncils: ['UC Gharibabad', 'UC Satellite Town', 'UC Shahi Bazar'],
        shopCount: 32,
      },
      {
        name: 'Nawabshah',
        province: 'Sindh',
        lat: 26.2483,
        lng: 68.4096,
        popularAreas: ['Chakra Bazar', 'Masjid Road', 'Sakrand Road'],
        unionCouncils: ['UC Masjid Road', 'UC Sakrand Road'],
        shopCount: 38,
      },
      {
        name: 'Sukkur',
        province: 'Sindh',
        lat: 27.7052,
        lng: 68.8574,
        popularAreas: ['Gharibabad Bazar', 'Military Road', 'Minara Road', 'Station Road'],
        unionCouncils: ['UC Bunder Road', 'UC Military Road', 'UC Rohri', 'UC Sukkur Old'],
        shopCount: 68,
      },
    ],
  },
];

export const ALL_PAKISTAN_CITIES: CityInfo[] = PAKISTAN_REGIONS.flatMap((r) => r.cities).sort((a, b) =>
  a.name.localeCompare(b.name)
);

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
      popularAreas: ['Board Bazar', 'Gulbahar', 'Hayatabad', 'Qissa Khwani Bazar', 'Saddar Cantt', 'University Town'],
      unionCouncils: ['UC 20 Saddar Cantt', 'UC 30 University Town', 'UC 36 Hayatabad Phase 1-3'],
      shopCount: 284,
    }
  );
};

export const getRegionsWithCustom = (customRegions?: CustomRegionCity[]): ProvinceInfo[] => {
  const cloned: ProvinceInfo[] = PAKISTAN_REGIONS.map((p) => ({
    ...p,
    cities: p.cities.map((c) => ({
      ...c,
      popularAreas: [...c.popularAreas].sort((a, b) => a.localeCompare(b)),
      unionCouncils: [...(c.unionCouncils || [])].sort((a, b) => a.localeCompare(b)),
    })),
  }));

  if (customRegions && customRegions.length > 0) {
    for (const custom of customRegions) {
      let prov = cloned.find((p) => p.name.toLowerCase() === custom.province.toLowerCase());
      if (!prov) {
        prov = {
          name: custom.province,
          code: custom.province.slice(0, 3).toUpperCase(),
          cities: [],
        };
        cloned.push(prov);
      }
      const existingCity = prov.cities.find((c) => c.name.toLowerCase() === custom.city.toLowerCase());
      if (existingCity) {
        existingCity.popularAreas = Array.from(new Set([...existingCity.popularAreas, ...(custom.markets || [])])).sort();
        existingCity.unionCouncils = Array.from(
          new Set([...(existingCity.unionCouncils || []), ...(custom.unionCouncils || [])])
        ).sort();
      } else {
        prov.cities.push({
          name: custom.city,
          province: prov.name,
          lat: 33.6844,
          lng: 73.0479,
          popularAreas: (custom.markets || ['Main Bazar', 'City Center']).sort(),
          unionCouncils: (custom.unionCouncils || ['UC 1 Central']).sort(),
          shopCount: 0,
        });
      }
      prov.cities.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
  return cloned.sort((a, b) => a.name.localeCompare(b.name));
};
