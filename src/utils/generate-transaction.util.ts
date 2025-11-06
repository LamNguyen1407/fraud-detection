import { randomUUID } from "crypto";

const sampleAmount = () => {
    // simple distribution: many small tx, few large
    const r = Math.random();
    if (r < 0.7) return Number((Math.random() * 50).toFixed(2)); // <50
    if (r < 0.95) return Number((50 + Math.random() * 450).toFixed(2)); // 50-500
    return Number((500 + Math.random() * 4500).toFixed(2)); // >500
  }

const sampleCategory = () => {
    const cats = ['electronics','food','travel','fashion','grocery','services'];
    return cats[Math.floor(Math.random() * cats.length)];
  }

export const genTransaction = () => {
    const transId = randomUUID();
    const now = Date.now();
    const amt = sampleAmount();
    const userId = `cc_${100000 + Math.floor(Math.random() * 900000)}`;
    const cityList = [
      { city: 'HCM', lat: 10.7769, long: 106.7009, pop: 9000000 },
      { city: 'Hanoi', lat: 21.0278, long: 105.8342, pop: 8000000 },
      { city: 'Da Nang', lat: 16.0544, long: 108.2022, pop: 1200000 },
    ];
    const city = cityList[Math.floor(Math.random() * cityList.length)];
    const merchantLat = city.lat + (Math.random() - 0.5) * 0.02;
    const merchantLong = city.long + (Math.random() - 0.5) * 0.02;
    const fraud = Math.random() < 0.005 ? 1 : 0; // configurable fraud rate

    return {
      trans_id: transId,
      unix_time: Math.floor(now / 1000),
      trans_date_trans_time: new Date(now).toISOString(),
      cc_num: userId,
      first: 'Nguyen',
      last: 'Van A',
      gender: Math.random() < 0.5 ? 'M' : 'F',
      dob: '1990-01-01',
      job: 'engineer',
      street: 'Some street',
      city: city.city,
      state: 'VN',
      zip: '70000',
      lat: city.lat,
      long: city.long,
      city_pop: city.pop,
      trans_num: `TRX-${Math.floor(Math.random() * 1e8)}`,
      merchant: `Merchant-${Math.floor(Math.random() * 1000)}`,
      category: sampleCategory(),
      amt: amt,
      merch_lat: merchantLat,
      merch_long: merchantLong,
      is_fraud: fraud
    };
}