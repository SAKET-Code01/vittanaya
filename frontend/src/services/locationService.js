import { apiClient } from './apiClient';

/**
 * Location Service (Indian Administrative Hierarchy)
 * 
 * Provides hierarchical cascading location lookups:
 * 1. State
 * 2. District
 * 3. City / Town
 * 4. Block / Tehsil
 * 5. Village / Street / Locality
 * 
 * Structured with stable { id, name } tuples, asynchronous Promise interfaces,
 * and backend-ready adapter points for future REST/GraphQL endpoints.
 */

// Comprehensive sample dataset covering major Indian states, districts, cities, blocks, and localities
const INDIAN_LOCATION_DATA = {
  states: [
    { id: 'OD', name: 'Odisha', code: '21' },
    { id: 'MH', name: 'Maharashtra', code: '27' },
    { id: 'KA', name: 'Karnataka', code: '29' },
    { id: 'GJ', name: 'Gujarat', code: '24' },
    { id: 'TN', name: 'Tamil Nadu', code: '33' },
    { id: 'UP', name: 'Uttar Pradesh', code: '09' },
    { id: 'MP', name: 'Madhya Pradesh', code: '23' },
    { id: 'RJ', name: 'Rajasthan', code: '08' },
    { id: 'WB', name: 'West Bengal', code: '19' },
    { id: 'TS', name: 'Telangana', code: '36' },
    { id: 'AP', name: 'Andhra Pradesh', code: '28' },
    { id: 'KL', name: 'Kerala', code: '32' },
    { id: 'PB', name: 'Punjab', code: '03' },
    { id: 'BR', name: 'Bihar', code: '10' },
    { id: 'AS', name: 'Assam', code: '18' },
    { id: 'HR', name: 'Haryana', code: '06' },
    { id: 'JH', name: 'Jharkhand', code: '20' },
    { id: 'CH', name: 'Chhattisgarh', code: '22' },
    { id: 'UK', name: 'Uttarakhand', code: '05' },
    { id: 'HP', name: 'Himachal Pradesh', code: '02' },
  ],

  districts: {
    OD: [
      { id: 'OD_KH', stateId: 'OD', name: 'Khordha' },
      { id: 'OD_CU', stateId: 'OD', name: 'Cuttack' },
      { id: 'OD_SU', stateId: 'OD', name: 'Sundargarh' },
      { id: 'OD_PU', stateId: 'OD', name: 'Puri' },
      { id: 'OD_GA', stateId: 'OD', name: 'Ganjam' },
      { id: 'OD_BA', stateId: 'OD', name: 'Balasore' },
      { id: 'OD_SA', stateId: 'OD', name: 'Sambalpur' },
      { id: 'OD_AN', stateId: 'OD', name: 'Angul' },
      { id: 'OD_MY', stateId: 'OD', name: 'Mayurbhanj' },
      { id: 'OD_JA', stateId: 'OD', name: 'Jajpur' },
    ],
    MH: [
      { id: 'MH_PU', stateId: 'MH', name: 'Pune' },
      { id: 'MH_MU', stateId: 'MH', name: 'Mumbai Suburban' },
      { id: 'MH_TH', stateId: 'MH', name: 'Thane' },
      { id: 'MH_NA', stateId: 'MH', name: 'Nagpur' },
      { id: 'MH_NS', stateId: 'MH', name: 'Nashik' },
      { id: 'MH_AU', stateId: 'MH', name: 'Chhatrapati Sambhajinagar' },
      { id: 'MH_KO', stateId: 'MH', name: 'Kolhapur' },
      { id: 'MH_SO', stateId: 'MH', name: 'Solapur' },
    ],
    KA: [
      { id: 'KA_BU', stateId: 'KA', name: 'Bengaluru Urban' },
      { id: 'KA_MY', stateId: 'KA', name: 'Mysuru' },
      { id: 'KA_DK', stateId: 'KA', name: 'Dakshina Kannada' },
      { id: 'KA_DH', stateId: 'KA', name: 'Dharwad' },
      { id: 'KA_BE', stateId: 'KA', name: 'Belagavi' },
      { id: 'KA_TU', stateId: 'KA', name: 'Tumakuru' },
    ],
    GJ: [
      { id: 'GJ_AH', stateId: 'GJ', name: 'Ahmedabad' },
      { id: 'GJ_SU', stateId: 'GJ', name: 'Surat' },
      { id: 'GJ_VA', stateId: 'GJ', name: 'Vadodara' },
      { id: 'GJ_RA', stateId: 'GJ', name: 'Rajkot' },
      { id: 'GJ_GA', stateId: 'GJ', name: 'Gandhinagar' },
    ],
    TN: [
      { id: 'TN_CH', stateId: 'TN', name: 'Chennai' },
      { id: 'TN_CO', stateId: 'TN', name: 'Coimbatore' },
      { id: 'TN_MA', stateId: 'TN', name: 'Madurai' },
      { id: 'TN_TR', stateId: 'TN', name: 'Tiruchirappalli' },
      { id: 'TN_SA', stateId: 'TN', name: 'Salem' },
    ],
    UP: [
      { id: 'UP_LU', stateId: 'UP', name: 'Lucknow' },
      { id: 'UP_KA', stateId: 'UP', name: 'Kanpur Nagar' },
      { id: 'UP_GB', stateId: 'UP', name: 'Gautam Buddha Nagar' },
      { id: 'UP_VA', stateId: 'UP', name: 'Varanasi' },
      { id: 'UP_AG', stateId: 'UP', name: 'Agra' },
      { id: 'UP_PR', stateId: 'UP', name: 'Prayagraj' },
    ],
    MP: [
      { id: 'MP_IN', stateId: 'MP', name: 'Indore' },
      { id: 'MP_BH', stateId: 'MP', name: 'Bhopal' },
      { id: 'MP_JA', stateId: 'MP', name: 'Jabalpur' },
      { id: 'MP_GW', stateId: 'MP', name: 'Gwalior' },
      { id: 'MP_UJ', stateId: 'MP', name: 'Ujjain' },
    ],
    RJ: [
      { id: 'RJ_JA', stateId: 'RJ', name: 'Jaipur' },
      { id: 'RJ_JO', stateId: 'RJ', name: 'Jodhpur' },
      { id: 'RJ_UD', stateId: 'RJ', name: 'Udaipur' },
      { id: 'RJ_KO', stateId: 'RJ', name: 'Kota' },
      { id: 'RJ_AJ', stateId: 'RJ', name: 'Ajmer' },
    ],
    WB: [
      { id: 'WB_KO', stateId: 'WB', name: 'Kolkata' },
      { id: 'WB_HO', stateId: 'WB', name: 'Howrah' },
      { id: 'WB_24N', stateId: 'WB', name: 'North 24 Parganas' },
      { id: 'WB_DAR', stateId: 'WB', name: 'Darjeeling' },
    ],
    TS: [
      { id: 'TS_HY', stateId: 'TS', name: 'Hyderabad' },
      { id: 'TS_RR', stateId: 'TS', name: 'Ranga Reddy' },
      { id: 'TS_ME', stateId: 'TS', name: 'Medchal-Malkajgiri' },
      { id: 'TS_WA', stateId: 'TS', name: 'Warangal' },
    ],
    AP: [
      { id: 'AP_VI', stateId: 'AP', name: 'Visakhapatnam' },
      { id: 'AP_NT', stateId: 'AP', name: 'NTR (Vijayawada)' },
      { id: 'AP_GU', stateId: 'AP', name: 'Guntur' },
      { id: 'AP_TP', stateId: 'AP', name: 'Tirupati' },
    ],
    KL: [
      { id: 'KL_EK', stateId: 'KL', name: 'Ernakulam' },
      { id: 'KL_TV', stateId: 'KL', name: 'Thiruvananthapuram' },
      { id: 'KL_KO', stateId: 'KL', name: 'Kozhikode' },
      { id: 'KL_TS', stateId: 'KL', name: 'Thrissur' },
    ],
    PB: [
      { id: 'PB_LU', stateId: 'PB', name: 'Ludhiana' },
      { id: 'PB_AS', stateId: 'PB', name: 'Amritsar' },
      { id: 'PB_JA', stateId: 'PB', name: 'Jalandhar' },
      { id: 'PB_SA', stateId: 'PB', name: 'SAS Nagar (Mohali)' },
    ],
    BR: [
      { id: 'BR_PA', stateId: 'BR', name: 'Patna' },
      { id: 'BR_GA', stateId: 'BR', name: 'Gaya' },
      { id: 'BR_MU', stateId: 'BR', name: 'Muzaffarpur' },
      { id: 'BR_BH', stateId: 'BR', name: 'Bhagalpur' },
    ],
    AS: [
      { id: 'AS_KA', stateId: 'AS', name: 'Kamrup Metropolitan' },
      { id: 'AS_DI', stateId: 'AS', name: 'Dibrugarh' },
      { id: 'AS_CA', stateId: 'AS', name: 'Cachar' },
    ],
  },

  cities: {
    OD_KH: [
      { id: 'OD_KH_BBSR', districtId: 'OD_KH', name: 'Bhubaneswar' },
      { id: 'OD_KH_JAT', districtId: 'OD_KH', name: 'Jatni' },
      { id: 'OD_KH_KHO', districtId: 'OD_KH', name: 'Khordha Town' },
      { id: 'OD_KH_BAN', districtId: 'OD_KH', name: 'Banapur' },
      { id: 'OD_KH_BAL', districtId: 'OD_KH', name: 'Balipatna' },
    ],
    OD_CU: [
      { id: 'OD_CU_CUT', districtId: 'OD_CU', name: 'Cuttack City' },
      { id: 'OD_CU_CHO', districtId: 'OD_CU', name: 'Choudwar' },
      { id: 'OD_CU_ATH', districtId: 'OD_CU', name: 'Athagarh' },
      { id: 'OD_CU_BAN', districtId: 'OD_CU', name: 'Banki' },
    ],
    OD_SU: [
      { id: 'OD_SU_ROU', districtId: 'OD_SU', name: 'Rourkela' },
      { id: 'OD_SU_SUN', districtId: 'OD_SU', name: 'Sundargarh Town' },
      { id: 'OD_SU_RAJ', districtId: 'OD_SU', name: 'Rajgangpur' },
      { id: 'OD_SU_BIR', districtId: 'OD_SU', name: 'Biramitrapur' },
    ],
    OD_PU: [
      { id: 'OD_PU_PUR', districtId: 'OD_PU', name: 'Puri Town' },
      { id: 'OD_PU_KON', districtId: 'OD_PU', name: 'Konark' },
      { id: 'OD_PU_PIP', districtId: 'OD_PU', name: 'Pipili' },
      { id: 'OD_PU_NIM', districtId: 'OD_PU', name: 'Nimapada' },
    ],
    MH_PU: [
      { id: 'MH_PU_PUN', districtId: 'MH_PU', name: 'Pune City' },
      { id: 'MH_PU_PCMC', districtId: 'MH_PU', name: 'Pimpri-Chinchwad' },
      { id: 'MH_PU_HAV', districtId: 'MH_PU', name: 'Haveli' },
      { id: 'MH_PU_BAR', districtId: 'MH_PU', name: 'Baramati' },
      { id: 'MH_PU_LON', districtId: 'MH_PU', name: 'Lonavala' },
    ],
    MH_TH: [
      { id: 'MH_TH_THA', districtId: 'MH_TH', name: 'Thane City' },
      { id: 'MH_TH_KAL', districtId: 'MH_TH', name: 'Kalyan-Dombivli' },
      { id: 'MH_TH_BHI', districtId: 'MH_TH', name: 'Bhiwandi' },
      { id: 'MH_TH_MBI', districtId: 'MH_TH', name: 'Navi Mumbai' },
    ],
    KA_BU: [
      { id: 'KA_BU_BLR', districtId: 'KA_BU', name: 'Bengaluru City' },
      { id: 'KA_BU_YEL', districtId: 'KA_BU', name: 'Yelahanka' },
      { id: 'KA_BU_KRI', districtId: 'KA_BU', name: 'K.R. Puram' },
      { id: 'KA_BU_ANE', districtId: 'KA_BU', name: 'Anekal' },
      { id: 'KA_BU_ELE', districtId: 'KA_BU', name: 'Electronic City' },
    ],
    GJ_AH: [
      { id: 'GJ_AH_AHM', districtId: 'GJ_AH', name: 'Ahmedabad City' },
      { id: 'GJ_AH_SAN', districtId: 'GJ_AH', name: 'Sanand' },
      { id: 'GJ_AH_DHO', districtId: 'GJ_AH', name: 'Dholka' },
      { id: 'GJ_AH_VIR', districtId: 'GJ_AH', name: 'Viramgam' },
    ],
    MP_IN: [
      { id: 'MP_IN_IND', districtId: 'MP_IN', name: 'Indore City' },
      { id: 'MP_IN_MHO', districtId: 'MP_IN', name: 'Dr. Ambedkar Nagar (Mhow)' },
      { id: 'MP_IN_SAN', districtId: 'MP_IN', name: 'Sanwer' },
      { id: 'MP_IN_DEP', districtId: 'MP_IN', name: 'Depalpur' },
    ],
    UP_LU: [
      { id: 'UP_LU_LUC', districtId: 'UP_LU', name: 'Lucknow City' },
      { id: 'UP_LU_MAL', districtId: 'UP_LU', name: 'Malihabad' },
      { id: 'UP_LU_BAK', districtId: 'UP_LU', name: 'Bakshi Ka Talab' },
      { id: 'UP_LU_MOH', districtId: 'UP_LU', name: 'Mohanlalganj' },
    ],
  },

  blocks: {
    OD_KH_BBSR: [
      { id: 'OD_KH_B_BBS', cityId: 'OD_KH_BBSR', name: 'Bhubaneswar Block' },
      { id: 'OD_KH_B_BAL', cityId: 'OD_KH_BBSR', name: 'Balianta Tehsil' },
      { id: 'OD_KH_B_PAT', cityId: 'OD_KH_BBSR', name: 'Balipatna Tehsil' },
    ],
    OD_KH_JAT: [
      { id: 'OD_KH_B_JAT', cityId: 'OD_KH_JAT', name: 'Jatni Tehsil' },
      { id: 'OD_KH_B_KHO', cityId: 'OD_KH_JAT', name: 'Khordha Block' },
    ],
    OD_SU_ROU: [
      { id: 'OD_SU_B_LAT', cityId: 'OD_SU_ROU', name: 'Lathikata Block' },
      { id: 'OD_SU_B_PAN', cityId: 'OD_SU_ROU', name: 'Panposh Tehsil' },
      { id: 'OD_SU_B_BIS', cityId: 'OD_SU_ROU', name: 'Bisra Block' },
    ],
    MH_PU_PUN: [
      { id: 'MH_PU_B_HAV', cityId: 'MH_PU_PUN', name: 'Haveli Tehsil' },
      { id: 'MH_PU_B_PUN', cityId: 'MH_PU_PUN', name: 'Pune City Tehsil' },
      { id: 'MH_PU_B_MUL', cityId: 'MH_PU_PUN', name: 'Mulshi Tehsil' },
    ],
    MH_PU_PCMC: [
      { id: 'MH_PU_B_PCMC', cityId: 'MH_PU_PCMC', name: 'Pimpri-Chinchwad Ward' },
      { id: 'MH_PU_B_BHO', cityId: 'MH_PU_PCMC', name: 'Bhosari MIDC Zone' },
      { id: 'MH_PU_B_CHA', cityId: 'MH_PU_PCMC', name: 'Chakan Industrial Block' },
    ],
    KA_BU_BLR: [
      { id: 'KA_BU_B_BLRN', cityId: 'KA_BU_BLR', name: 'Bangalore North' },
      { id: 'KA_BU_B_BLRS', cityId: 'KA_BU_BLR', name: 'Bangalore South' },
      { id: 'KA_BU_B_BLRE', cityId: 'KA_BU_BLR', name: 'Bangalore East' },
    ],
    MP_IN_IND: [
      { id: 'MP_IN_B_IND', cityId: 'MP_IN_IND', name: 'Indore Tehsil' },
      { id: 'MP_IN_B_SAN', cityId: 'MP_IN_IND', name: 'Sanwer Block' },
      { id: 'MP_IN_B_MHO', cityId: 'MP_IN_IND', name: 'Mhow Tehsil' },
    ],
  },

  localities: {
    OD_KH_B_BBS: [
      { id: 'OD_KH_L_PAT', blockId: 'OD_KH_B_BBS', name: 'Patia / Infocity' },
      { id: 'OD_KH_L_SAH', blockId: 'OD_KH_B_BBS', name: 'Saheed Nagar' },
      { id: 'OD_KH_L_CSP', blockId: 'OD_KH_B_BBS', name: 'Chandrasekharpur' },
      { id: 'OD_KH_L_NAY', blockId: 'OD_KH_B_BBS', name: 'Nayapalli' },
      { id: 'OD_KH_L_JAN', blockId: 'OD_KH_B_BBS', name: 'Janla Village' },
    ],
    OD_SU_B_LAT: [
      { id: 'OD_SU_L_LAT', blockId: 'OD_SU_B_LAT', name: 'Lathikata Central Village' },
      { id: 'OD_SU_L_KAL', blockId: 'OD_SU_B_LAT', name: 'Kaloor Gram Panchayat' },
      { id: 'OD_SU_L_GAR', blockId: 'OD_SU_B_LAT', name: 'Garjan Village' },
    ],
    MH_PU_B_HAV: [
      { id: 'MH_PU_L_HAD', blockId: 'MH_PU_B_HAV', name: 'Hadapsar Industrial Estate' },
      { id: 'MH_PU_L_KHA', blockId: 'MH_PU_B_HAV', name: 'Kharadi IT Park Area' },
      { id: 'MH_PU_L_WAG', blockId: 'MH_PU_B_HAV', name: 'Wagholi Rural Locality' },
    ],
    MH_PU_B_CHA: [
      { id: 'MH_PU_L_MID', blockId: 'MH_PU_B_CHA', name: 'Chakan Phase II Industrial Area' },
      { id: 'MH_PU_L_KHA', blockId: 'MH_PU_B_CHA', name: 'Khalumbre Village' },
      { id: 'MH_PU_L_KUR', blockId: 'MH_PU_B_CHA', name: 'Kuruli Gram Panchayat' },
    ],
    KA_BU_B_BLRS: [
      { id: 'KA_BU_L_KOR', blockId: 'KA_BU_B_BLRS', name: 'Koramangala Commercial Hub' },
      { id: 'KA_BU_L_HSR', blockId: 'KA_BU_B_BLRS', name: 'HSR Layout Sector 1-7' },
      { id: 'KA_BU_L_ELE', blockId: 'KA_BU_B_BLRS', name: 'Electronic City Phase 1' },
      { id: 'KA_BU_L_BEG', blockId: 'KA_BU_B_BLRS', name: 'Begur Rural Fringe' },
    ],
    MP_IN_B_IND: [
      { id: 'MP_IN_L_VIJ', blockId: 'MP_IN_B_IND', name: 'Vijay Nagar Commercial Square' },
      { id: 'MP_IN_L_PAL', blockId: 'MP_IN_B_IND', name: 'Palasia Market' },
      { id: 'MP_IN_L_SAN', blockId: 'MP_IN_B_IND', name: 'Sanwer Road Industrial Area' },
      { id: 'MP_IN_L_RAU', blockId: 'MP_IN_B_IND', name: 'Rau Rural Growth Centre' },
    ],
  },
};

/**
 * Helper to simulate backend latency and provide fallback for unlisted districts/cities
 */
const delay = (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

export const locationService = {
  /**
   * Fetch all supported Indian States
   * @returns {Promise<Array<{id: string, name: string, code?: string}>>}
   */
  async getStates() {
    await delay(10);
    return [...INDIAN_LOCATION_DATA.states];
  },

  /**
   * Fetch Districts under a specific State
   * @param {string} stateId - State ID (e.g. 'OD', 'MH')
   * @returns {Promise<Array<{id: string, stateId: string, name: string}>>}
   */
  async getDistricts(stateId) {
    await delay(10);
    if (!stateId) return [];
    const list = INDIAN_LOCATION_DATA.districts[stateId];
    if (list && list.length > 0) return [...list];

    // Fallback: If state has no hardcoded sample districts, generate representative districts
    return [
      { id: `${stateId}_HQ`, stateId, name: `${stateId} Central District` },
      { id: `${stateId}_NORTH`, stateId, name: `${stateId} North District` },
      { id: `${stateId}_SOUTH`, stateId, name: `${stateId} South District` },
    ];
  },

  /**
   * Fetch Cities / Towns under a specific District
   * @param {string} districtId - District ID (e.g. 'OD_KH', 'MH_PU')
   * @returns {Promise<Array<{id: string, districtId: string, name: string}>>}
   */
  async getCities(districtId) {
    await delay(10);
    if (!districtId) return [];
    const list = INDIAN_LOCATION_DATA.cities[districtId];
    if (list && list.length > 0) return [...list];

    // Default fallback based on district name
    const districtParts = districtId.split('_');
    const prefix = districtParts[1] || districtId;
    return [
      { id: `${districtId}_MAIN`, districtId, name: `${prefix} Main City` },
      { id: `${districtId}_TOWN1`, districtId, name: `${prefix} West Town` },
      { id: `${districtId}_TOWN2`, districtId, name: `${prefix} East Town` },
    ];
  },

  /**
   * Fetch Blocks / Tehsils under a specific City or District
   * @param {string} cityId - City ID (e.g. 'OD_KH_BBSR')
   * @returns {Promise<Array<{id: string, cityId: string, name: string}>>}
   */
  async getBlocks(cityId) {
    await delay(10);
    if (!cityId) return [];
    const list = INDIAN_LOCATION_DATA.blocks[cityId];
    if (list && list.length > 0) return [...list];

    return [
      { id: `${cityId}_BLK1`, cityId, name: 'Central Block' },
      { id: `${cityId}_BLK2`, cityId, name: 'Rural Tehsil 1' },
      { id: `${cityId}_BLK3`, cityId, name: 'Industrial Sub-Division' },
    ];
  },

  /**
   * Fetch Villages / Streets / Localities under a specific Block
   * @param {string} blockId - Block ID (e.g. 'OD_KH_B_BBS')
   * @returns {Promise<Array<{id: string, blockId: string, name: string}>>}
   */
  async getLocalities(blockId) {
    await delay(10);
    if (!blockId) return [];
    const list = INDIAN_LOCATION_DATA.localities[blockId];
    if (list && list.length > 0) return [...list];

    return [
      { id: `${blockId}_LOC1`, blockId, name: 'Main Village Settlement' },
      { id: `${blockId}_LOC2`, blockId, name: 'Market Road / Ward 1' },
      { id: `${blockId}_LOC3`, blockId, name: 'Highway Bypass Junction' },
    ];
  },

  /**
   * Fetch live 2D/3D Market Map spatial POIs & intelligence from backend API
   */
  async getMarketMapData({ location, district, category, radius_km = 15, business_id = null } = {}) {
    try {
      const response = await apiClient.get('/locations/market-map', {
        location,
        district,
        category,
        radius_km,
        business_id,
      });
      return response;
    } catch (error) {
      console.warn('Market map backend fetch fallback:', error);
      return null;
    }
  },
};

export default locationService;
