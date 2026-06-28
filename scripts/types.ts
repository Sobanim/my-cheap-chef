// Main response interface
export interface LidlSearchResponse {
    type: string;
    version: string;
    engine: string;
    variant: Variant;
    xPayload: XPid;
    id: string;
    locale: string;
    assortment: string;
    resultType: string;
    rendering: Rendering;
    numFound: number;
    offset: number;
    fetchsize: number;
    maxfetchsize: number;
    sort: Sort;
    selections: Selections;
    sorts: SortOption[];
    facets: Facet[];
    items: ProductItem[];
    breadcrumbs: Breadcrumb[];
    details: Details;
    teasers: Teasers;
    advisors: Advisor[];
}

// Variant
export interface Variant {
    id: string;
    testName: string;
    trackingSolution: string;
    active: boolean;
    xPayload: VariantXPid;
}

export interface VariantXPid {
    groupVariantsAsFlatArticles: boolean;
    engine: string;
}

// xPayload
export interface XPid {
    keywordResults: KeywordResults;
}

export interface KeywordResults {
    num_items_found: number;
}

// Rendering
export interface Rendering {
    breadcrumb: boolean;
}

// Sort
export interface Sort {
    code: string;
    label: string;
    url: string;
    link: Link;
}

export interface Link {
    type: string;
    filter: Filter;
    sort?: string;
}

export interface Filter {
    [key: string]: string[];
}

// Selections
export interface Selections {
    values: SelectionValue[];
    resetAll: string;
    resetLink: Link;
}

export interface SelectionValue {
    code: string;
    value: string;
    label: string;
    url: string;
    link: Link;
    rendering: SelectionRendering;
    children?: SelectionValue[];
}

export interface SelectionRendering {
    style: string;
    searchable: boolean;
    selectedPosition: string;
    renderLabel: boolean;
    collapsible: boolean;
}

// SortOption
export interface SortOption {
    code: string;
    label: string;
    url: string;
    link: Link;
}

// Facet
export interface Facet {
    type: string; // e.g., "TEXT" or "RANGE"
    code: string;
    label: string;
    selector: string;
    rendering: FacetRendering;
    topvalues?: FacetValue[];
    values?: FacetValue[];
    unit?: string;
    baseURL?: string;
    baseLink?: Link;
    globalMin?: NumericValue;
    globalMax?: NumericValue;
    min?: NumericValue;
    max?: NumericValue;
    selectedMin?: SelectedNumericValue;
    selectedMax?: SelectedNumericValue;
}

export interface FacetRendering {
    style: string;
    searchable: boolean;
    selectedPosition: string;
    renderLabel: boolean;
    collapsible: boolean;
}

export interface FacetValue {
    type: string;
    label: string;
    selected: boolean;
    count: number;
    url: string;
    link: Link;
    value: string;
    children?: FacetValue[];
}

export interface NumericValue {
    type: string;
    unit: string;
    value: number;
}

export interface SelectedNumericValue {
    value: number;
}

// ProductItem
export interface ProductItem {
    resultClass: string;
    type: string;
    code: string;
    label: string;
    url: string;
    xPayload: ProductXPid;
    gridbox: Gridbox;
    tracking: Tracking;
}

export interface ProductXPid {
    metaData: MetaData;
}

export interface MetaData {
    relevancyScore: number;
    sort_values: any[];
    keywordScore: number;
    semanticScore: number;
    ratingScore: number;
    freshnessScore: number;
    searchHubImpressions: number;
    searchHubClicks: number;
    searchHubCarts: number;
    businessRuleFactor: number;
    version: number;
}

// Gridbox - this is complex, simplified
export interface Gridbox {
    country: string;
    sequence: number;
    data: GridboxData;
    productId: number;
    meta: GridboxMeta;
    action: string;
    language: string;
    eventType: string;
    id: string;
}

// Simplified GridboxData
export interface GridboxData {
    ageRestriction: boolean;
    awards: any[];
    brand: Brand;
    canonicalPath: string;
    canonicalUrl: string;
    category: string;
    cutoutimage: any;
    dealOfDay: DealOfDay;
    designTheme: string;
    disclaimers: Disclaimer[];
    displayFreeDelivery: boolean;
    energyLabels: any[];
    erpNumber: string;
    flashSales: boolean;
    fullTitle: string;
    gs1Attributes: any[];
    havingPrice: boolean;
    havingThreesixty: boolean;
    havingVideos: boolean;
    highlightedSeals: number;
    ians: string[];
    image: string;
    image_V1: ImageV1;
    isUsedProduct: boolean;
    itemId: number;
    imageList: string[];
    imageList_V1: ImageV1[];
    keyfacts: Keyfacts;
    lidlPlus: LidlPlus[];
    multipack: boolean;
    online: boolean;
    preventSelling: boolean;
    price: Price;
    productId: number;
    productType: string;
    productOrigin: string;
    quickAddToCart: boolean;
    ratings?: Ratings;
    regions: any[];
    ribbons: Ribbon[];
    renderedTs: number;
    seals: Seal[];
    stockAvailability: StockAvailability;
    store: boolean;
    storeStartDate: number;
    title: string;
    zones: any;
}

export interface Brand {
    showBrand: boolean;
    logo?: string;
    name?: string;
    url?: string;
    id?: string;
}

export interface DealOfDay {
    active: boolean;
}

export interface Disclaimer {
    id: string;
    type: string;
    value: string;
}

export interface ImageV1 {
    image: string;
    accessibility: string;
}

export interface Keyfacts {
    analyticsCategory: string;
    description?: string;
    fullTitle: string;
    moreDetails: string;
    supplementalDescription: string;
    title: string;
    wonCategoryPrimary: string;
    wonCategoryPrimaryPath: string;
}

export interface LidlPlus {
    price: LidlPlusPrice;
    lidlPlusText: string;
    highlightText: string;
}

export interface LidlPlusPrice {
    discount: Discount;
    hasStar: boolean;
    hasVat: boolean;
    oldPrice?: number;
    price: number;
    priceTheme: string;
    specialTaxes: any[];
    packaging?: Packaging;
}

export interface Discount {
    discountHasStar: boolean;
    discountText: string;
    fromRecommendedPrice: boolean;
    showDiscount: boolean;
    showFrom: boolean;
    showPercentage: boolean;
    showUpTo: boolean;
    deletedPrice?: number;
    percentageDiscount?: number;
}

export interface Packaging {
    text: string;
}

export interface Price {
    currencyCode: string;
    currencyCodeSecond: string;
    currencySymbol: string;
    currencySymbolSecond: string;
    discount?: Discount;
    hasStar: boolean;
    hasVat: boolean;
    oldPrice?: number;
    price?: number;
    priceTheme: string;
    specialTaxes: any[];
    variantsHaveDifferentPrices: boolean;
    basePrice?: BasePrice;
    packaging?: Packaging;
}

export interface BasePrice {
    prefix: boolean;
    text: string;
}

export interface Ratings {
    average: number;
    count: number;
    recommendedNo: number;
    recommendedYes: number;
    sizePercentage: number;
    topRated: boolean;
}

export interface Ribbon {
    type: string;
    text: string;
    theme: string;
}

export interface Seal {
    altText: string;
    image: string;
}

export interface StockAvailability {
    availabilityIndicator: number;
    badgeInfo: BadgeInfo;
    badgeInfoV2?: BadgeInfoV2[];
    onlineAvailable: boolean;
    orderableQuantities: OrderableQuantity[];
    minOrderableQuantity: number;
}

export interface BadgeInfoV2 {
    badges: Badge[];
    validFrom?: number;
    validUntil?: number;
}


export interface BadgeInfo {
    badges: Badge[];
}

export interface Badge {
    text: string;
    type: string;
}

export interface OrderableQuantity {
    unit: string;
    value: number;
}

// GridboxMeta
export interface GridboxMeta {
    sapProductCategory?: SapProductCategory;
    categoryPaths: CategoryPath[];
    campaignPaths: CampaignPath[];
    fullTitle: string;
    ean?: string;
    gs1?: Gs1;
    shopCategories?: ShopCategories;
    wonCategoryBreadcrumbs: WonCategoryBreadcrumb[];
    worldOfNeeds: WorldOfNeed[];
    retailLists?: RetailList[];
    lists: number[];
    preview: boolean;
}

export interface SapProductCategory {
    code: string;
    name: string;
    pathCode: string;
    pathName: string;
}

export interface CategoryPath {
    id: string;
    name: string;
    url: string;
    hiddenCategory: boolean;
}

export interface CampaignPath {
    id: string;
    name: string;
    url: string;
    hiddenCategory: boolean;
}

export interface Gs1 {
    segment: Gs1Segment;
}

export interface Gs1Segment {
    code: string;
    label: string;
    family: Gs1Family;
}

export interface Gs1Family {
    code: string;
    label: string;
    clazz: Gs1Class;
}

export interface Gs1Class {
    code: string;
    label: string;
    brick: Gs1Brick;
}

export interface Gs1Brick {
    code: string;
    label: string;
    attributeGS1: any[];
}

export interface ShopCategories {
    shopCategory: ShopCategory[];
}

export interface ShopCategory {
    code: string;
    name: string;
    parent: string;
    superCategories: SuperCategory[];
}

export interface SuperCategory {
    category: SubCategory[];
}

export interface SubCategory {
    code: string;
    name: string;
    parent: string;
}

export interface WonCategoryBreadcrumb {
    id: string;
    name: string;
    url: string;
    hiddenCategory: boolean;
}

export interface WorldOfNeed {
    code: string;
    isMain: boolean;
    name: string;
    parent: string;
    superCategories: SuperCategory[];
}

export interface RetailList {
    id: number;
    productSortIndex: number;
}

// Tracking
export interface Tracking {
    position: number;
    xPayload: TrackingXPid;
}

export interface TrackingXPid {
    searchTrackingMasterId: string;
    searchTrackingTitle: string;
    searchTrackingPageSize: number;
    searchTrackingPage: number;
    searchTrackingEvent: string;
    list: string;
    searchTrackingId: string;
    searchTrackingOrigPos: number;
    searchTrackingPos: number;
    searchTrackingOrigPageSize: number;
    searchTrackingChannel: string;
    category: string;
}

// Breadcrumb
export interface Breadcrumb {
    code: string;
    url: string;
    link: Link;
    label?: string;
}

// Details
export interface Details {
    [key: string]: any;
}

// Teasers
export interface Teasers {
    "above search result": Teaser[];
}

export interface Teaser {
    id: string;
    name: string;
    link: string;
    image: string;
    mobile_image: string;
    alt_image: string;
    open_in_a_new_tab: boolean;
}

// Advisor
export interface Advisor {
    // Assuming empty array, so any or specific
    [key: string]: any;
}