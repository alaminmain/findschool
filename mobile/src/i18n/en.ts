// English (en) — source of truth. Keep keys flat and stable.
// Use {placeholders} for substitution; keep them in the same shape across locales.

export const en = {
  // App / nav
  appTitle: "Find School BD",
  schoolDetailsTitle: "School details",
  filtersTitle: "Filters",
  libraryTitle: "My library",
  settingsTitle: "Settings",

  // Search screen
  searchPlaceholder: "Search by name, EIIN, upazila…",
  a11ySearch: "Search schools",
  a11ySearchHint: "Search by school name, EIIN, or upazila",
  a11yClearSearch: "Clear search",
  a11yOpenFilters: "Open filters",
  a11yFiltersActive: "Filters, {n} active",
  a11yLibrary: "My library",
  a11yLibraryWithFavs: "My library, {n} favorites",
  loadingSchools: "Loading schools…",
  endOfResults: "End of results",
  noMatchesTitle: "No matches",
  noMatchesQuery: "Nothing found for \"{q}\". Try a different name, EIIN, or upazila.",
  noSchoolsAvailable: "No schools available.",
  errorTitle: "Something went wrong",
  errorFallback: "Couldn't load schools. Please try again.",
  retry: "Retry",
  a11yRetry: "Retry loading schools",
  resultsForQuery: "{n}{plus} {label} for \"{q}\"",
  resultLabelOne: "result",
  resultLabelMany: "results",
  matchingSchools: "{n}{plus} matching {label}",
  schoolLabelOne: "school",
  schoolLabelMany: "schools",
  browseAlpha: "Browse {n}{plus} schools — A to Z",
  a11yRemoveFilter: "Remove filter {label}",

  // Filters screen
  sortBy: "Sort by",
  sortName: "Name (A–Z)",
  sortDistrict: "District",
  sortLevel: "Level",
  filterDivision: "Division",
  filterDistrict: "District",
  filterUpazila: "Upazila",
  filterLevel: "Level",
  all: "All",
  allOf: "All {label}s",
  withinX: "Within {x}",
  hintDivisionFirst: "Choose a division to narrow the list",
  hintDistrictFirst: "Choose a district to narrow the list",
  searchInList: "Search {label}…",
  noOptions: "No options available",
  noListMatches: "No matches",
  clearAll: "Clear all",
  done: "Done",
  a11yClearAllFilters: "Clear all filters",
  a11yApplyFilters: "Apply filters and close",
  a11ySectionState: "{title}, currently {value}",
  a11ySearchInList: "Search {label}",
  a11ySortBy: "Sort by {label}",

  // School detail
  cardLocation: "Location",
  rowAddress: "Address",
  rowUpazila: "Upazila",
  rowDistrict: "District",
  rowDivision: "Division",
  cardOnTheMap: "On the map",
  getDirections: "Get Directions",
  a11yGetDirections: "Get directions to this school",
  noCoordsBlurb:
    "No GPS coordinates on file for this school. You can still open the address in Maps to navigate.",
  openAddressInMaps: "Open address in Maps",
  a11yOpenAddress: "Open address in Maps",
  shareSchool: "Share school details",
  a11yShareSchool: "Share school details",
  reportIncorrect: "Report incorrect info",
  a11yReportIncorrect: "Report incorrect information",
  a11yEiinCopy: "EIIN {eiin}, tap to copy",
  a11yRowCopy: "{label} {value}, tap to copy",
  tapToCopy: "tap to copy",
  copied: "{label} copied",
  copyFailed: "Couldn't copy",
  noMailApp: "No mail app installed",
  a11yAddFavorite: "Add to favorites",
  a11yRemoveFavorite: "Remove from favorites",

  // Report email body
  reportSubject: "Incorrect info: {name} (EIIN {eiin})",
  reportBody:
    "Hi Find School BD team,\n\nI'd like to report incorrect information for:\n  Name: {name}\n  EIIN: {eiin}\n  Address: {address}\n\nWhat's wrong / suggested correction:\n",

  // Library
  tabFavorites: "Favorites",
  tabRecents: "Recently viewed",
  noFavoritesTitle: "No favorites yet",
  noFavoritesText:
    "Tap the ★ on any school's detail page to save it for later.",
  noRecentsTitle: "Nothing here yet",
  noRecentsText: "Schools you open will show up here.",
  clearRecents: "Clear recently viewed",
  removeAllFavorites: "Remove all favorites",
  a11yTab: "{label}, {n} {schools}",

  // Settings
  language: "Language",
  langSystemDefault: "System default",
  langEnglish: "English",
  langBangla: "বাংলা",

  // School detail — extended (Phase G)
  cardContact: "Contact",
  cardStats: "At a glance",
  callSchool: "Call",
  emailSchool: "Email",
  visitWebsite: "Website",
  a11yCallSchool: "Call this school",
  a11yEmailSchool: "Email this school",
  a11yVisitWebsite: "Visit school website",
  totalTeachers: "Teachers",
  totalStudents: "Students",
  callFailed: "No phone app found",

  // About / data freshness
  aboutTitle: "About",
  a11yOpenAbout: "About this app",
  dataAsOf: "Data as of {date}",
  dataAsOfUnknown: "Data version unknown",
  aboutBlurb:
    "Find School BD is an offline-first directory of schools across Bangladesh. The app ships with the data file embedded — no account, no tracking, no network calls for searches.",
  aboutSourcesTitle: "Data sources",
  aboutSources:
    "Primary source: IPEMIS (Department of Primary Education, Bangladesh). Coordinates where available are courtesy of OpenStreetMap contributors via the Nominatim service.",
  aboutFreshnessTitle: "Keeping data fresh",
  aboutFreshness:
    "There is no server. Updated data ships with each app update. If you spot incorrect info, tap \"Report incorrect info\" on any school's detail page.",
  aboutContact: "Contact",
  aboutContactEmail: "hello@findschool.app",
  aboutRowCount: "{n} schools in this build",
  aboutGeocoded: "{n} have GPS coordinates",
  appVersion: "App version {v}",

  // Map
  mapTitle: "Map",
  a11yOpenMap: "Open map",
  nearMe: "Near me",
  a11yNearMe: "Center map on your location",
  locationDeniedTitle: "Location permission needed",
  locationDeniedText:
    "Allow location access in Settings to use \"Near me\".",
  locationFailed: "Couldn't get your location",
  noMappableSchools:
    "No schools in this area have GPS coordinates yet. Pan to a different region or remove some filters.",
  mapMarkersShown: "{n} schools on the map",
};

export type StringKey = keyof typeof en;
