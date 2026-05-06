// Bangla (bn). Translation drafted by Claude — should be reviewed by a native
// speaker before any 1.x release that ships bn as a default. EIIN/numerals
// stay Latin (Western numerals) until a separate Bangla-numerals option lands.

import type { en } from "./en";

export const bn: typeof en = {
  // App / nav
  appTitle: "ফাইন্ড স্কুল বিডি",
  schoolDetailsTitle: "স্কুলের বিবরণ",
  filtersTitle: "ফিল্টার",
  libraryTitle: "আমার তালিকা",
  settingsTitle: "সেটিংস",

  // Search screen
  searchPlaceholder: "নাম, EIIN বা উপজেলা দিয়ে খুঁজুন…",
  a11ySearch: "স্কুল খুঁজুন",
  a11ySearchHint: "নাম, EIIN বা উপজেলা দিয়ে খুঁজুন",
  a11yClearSearch: "অনুসন্ধান মুছুন",
  a11yOpenFilters: "ফিল্টার খুলুন",
  a11yFiltersActive: "{n}টি ফিল্টার সক্রিয়",
  a11yLibrary: "আমার তালিকা",
  a11yLibraryWithFavs: "আমার তালিকা, {n}টি প্রিয়",
  loadingSchools: "স্কুল লোড হচ্ছে…",
  endOfResults: "তালিকা শেষ",
  noMatchesTitle: "কোনো ফলাফল পাওয়া যায়নি",
  noMatchesQuery:
    "\"{q}\" এর জন্য কিছু পাওয়া যায়নি। অন্য নাম, EIIN বা উপজেলা দিয়ে চেষ্টা করুন।",
  noSchoolsAvailable: "কোনো স্কুল পাওয়া যায়নি।",
  errorTitle: "সমস্যা হয়েছে",
  errorFallback: "স্কুল লোড করা যায়নি। আবার চেষ্টা করুন।",
  retry: "আবার চেষ্টা করুন",
  a11yRetry: "স্কুল লোড করার পুনঃচেষ্টা",
  resultsForQuery: "\"{q}\" এর জন্য {n}{plus} {label}",
  resultLabelOne: "ফলাফল",
  resultLabelMany: "ফলাফল",
  matchingSchools: "{n}{plus} মিলে যাওয়া {label}",
  schoolLabelOne: "স্কুল",
  schoolLabelMany: "স্কুল",
  browseAlpha: "{n}{plus} স্কুল ব্রাউজ করুন — অ থেকে হ",
  a11yRemoveFilter: "{label} ফিল্টার সরান",

  // Filters screen
  sortBy: "সাজান",
  sortName: "নাম (অ–হ)",
  sortDistrict: "জেলা",
  sortLevel: "স্তর",
  filterDivision: "বিভাগ",
  filterDistrict: "জেলা",
  filterUpazila: "উপজেলা",
  filterLevel: "স্তর",
  all: "সব",
  allOf: "সব {label}",
  withinX: "{x} এর মধ্যে",
  hintDivisionFirst: "তালিকা ছোট করতে একটি বিভাগ বেছে নিন",
  hintDistrictFirst: "তালিকা ছোট করতে একটি জেলা বেছে নিন",
  searchInList: "{label} খুঁজুন…",
  noOptions: "কোনো অপশন নেই",
  noListMatches: "কিছু পাওয়া যায়নি",
  clearAll: "সব সাফ করুন",
  done: "সম্পন্ন",
  a11yClearAllFilters: "সব ফিল্টার সাফ করুন",
  a11yApplyFilters: "ফিল্টার প্রয়োগ করে বন্ধ করুন",
  a11ySectionState: "{title}, বর্তমানে {value}",
  a11ySearchInList: "{label} খুঁজুন",
  a11ySortBy: "{label} অনুসারে সাজান",

  // School detail
  cardLocation: "অবস্থান",
  rowAddress: "ঠিকানা",
  rowUpazila: "উপজেলা",
  rowDistrict: "জেলা",
  rowDivision: "বিভাগ",
  cardOnTheMap: "মানচিত্রে",
  getDirections: "দিকনির্দেশ পান",
  a11yGetDirections: "এই স্কুলের দিকনির্দেশ পান",
  noCoordsBlurb:
    "এই স্কুলের জিপিএস স্থানাঙ্ক নেই। তবুও আপনি ম্যাপে ঠিকানা খুলে যেতে পারেন।",
  openAddressInMaps: "ম্যাপে ঠিকানা খুলুন",
  a11yOpenAddress: "ম্যাপে ঠিকানা খুলুন",
  shareSchool: "স্কুলের বিবরণ শেয়ার করুন",
  a11yShareSchool: "স্কুলের বিবরণ শেয়ার করুন",
  reportIncorrect: "ভুল তথ্য রিপোর্ট করুন",
  a11yReportIncorrect: "ভুল তথ্য রিপোর্ট করুন",
  a11yEiinCopy: "EIIN {eiin}, কপি করতে ট্যাপ করুন",
  a11yRowCopy: "{label} {value}, কপি করতে ট্যাপ করুন",
  tapToCopy: "কপি করতে ট্যাপ করুন",
  copied: "{label} কপি হয়েছে",
  copyFailed: "কপি করা যায়নি",
  noMailApp: "কোনো মেইল অ্যাপ ইনস্টল নেই",
  a11yAddFavorite: "প্রিয়তে যোগ করুন",
  a11yRemoveFavorite: "প্রিয় থেকে সরান",

  // Report email body
  reportSubject: "ভুল তথ্য: {name} (EIIN {eiin})",
  reportBody:
    "প্রিয় Find School BD টিম,\n\nনিম্নলিখিত স্কুলের ভুল তথ্য রিপোর্ট করতে চাই:\n  নাম: {name}\n  EIIN: {eiin}\n  ঠিকানা: {address}\n\nকী ভুল আছে / পরামর্শ:\n",

  // Library
  tabFavorites: "প্রিয়",
  tabRecents: "সম্প্রতি দেখা",
  noFavoritesTitle: "এখনো কোনো প্রিয় নেই",
  noFavoritesText:
    "যেকোনো স্কুলের বিবরণ পাতায় ★ ট্যাপ করে পরে দেখার জন্য সংরক্ষণ করুন।",
  noRecentsTitle: "এখনো কিছু নেই",
  noRecentsText: "আপনি যেসব স্কুল খুলবেন সেগুলো এখানে দেখাবে।",
  clearRecents: "সম্প্রতি দেখা মুছুন",
  removeAllFavorites: "সব প্রিয় সরান",
  a11yTab: "{label}, {n} {schools}",

  // Settings
  language: "ভাষা",
  langSystemDefault: "ডিভাইসের ভাষা",
  langEnglish: "English",
  langBangla: "বাংলা",

  // School detail — extended (Phase G)
  cardContact: "যোগাযোগ",
  cardStats: "এক নজরে",
  callSchool: "কল",
  emailSchool: "ইমেইল",
  visitWebsite: "ওয়েবসাইট",
  a11yCallSchool: "এই স্কুলে কল করুন",
  a11yEmailSchool: "এই স্কুলে ইমেইল করুন",
  a11yVisitWebsite: "স্কুলের ওয়েবসাইট দেখুন",
  totalTeachers: "শিক্ষক",
  totalStudents: "শিক্ষার্থী",
  callFailed: "কোনো ফোন অ্যাপ পাওয়া যায়নি",

  // About / data freshness
  aboutTitle: "অ্যাপ সম্পর্কে",
  a11yOpenAbout: "অ্যাপ সম্পর্কে",
  dataAsOf: "তথ্য হালনাগাদ: {date}",
  dataAsOfUnknown: "তথ্যের সংস্করণ অজানা",
  aboutBlurb:
    "ফাইন্ড স্কুল বিডি বাংলাদেশের স্কুলের একটি অফলাইন ডিরেক্টরি। তথ্য ফাইল অ্যাপের সাথেই থাকে — কোনো অ্যাকাউন্ট, ট্র্যাকিং বা সার্চের জন্য নেটওয়ার্ক প্রয়োজন নেই।",
  aboutSourcesTitle: "তথ্যের উৎস",
  aboutSources:
    "প্রাথমিক উৎস: IPEMIS (প্রাথমিক শিক্ষা অধিদপ্তর, বাংলাদেশ)। যেখানে উপলব্ধ, GPS স্থানাঙ্ক OpenStreetMap কন্ট্রিবিউটরদের Nominatim পরিষেবা থেকে নেওয়া।",
  aboutFreshnessTitle: "তথ্য হালনাগাদ",
  aboutFreshness:
    "কোনো সার্ভার নেই। প্রতিটি অ্যাপ আপডেটের সাথে নতুন তথ্য আসে। ভুল তথ্য দেখলে স্কুলের বিবরণ পাতায় \"ভুল তথ্য রিপোর্ট করুন\" ট্যাপ করুন।",
  aboutContact: "যোগাযোগ",
  aboutContactEmail: "hello@findschool.app",
  aboutRowCount: "এই বিল্ডে {n}টি স্কুল",
  aboutGeocoded: "{n}টির GPS স্থানাঙ্ক আছে",
  appVersion: "অ্যাপ সংস্করণ {v}",

  // Map
  mapTitle: "মানচিত্র",
  a11yOpenMap: "মানচিত্র খুলুন",
  nearMe: "আমার কাছে",
  a11yNearMe: "মানচিত্রকে আপনার অবস্থানে কেন্দ্রীভূত করুন",
  locationDeniedTitle: "লোকেশন অনুমতি প্রয়োজন",
  locationDeniedText:
    "\"আমার কাছে\" ব্যবহার করতে সেটিংসে লোকেশন অনুমতি দিন।",
  locationFailed: "আপনার অবস্থান পাওয়া যায়নি",
  noMappableSchools:
    "এই এলাকার কোনো স্কুলের জিপিএস স্থানাঙ্ক নেই। অন্য এলাকায় যান বা কিছু ফিল্টার সরান।",
  mapMarkersShown: "মানচিত্রে {n}টি স্কুল",
};
