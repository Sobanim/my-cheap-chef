// Main response type
export type LidlSearchResponse = {
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
};

// Variant
export type Variant = {
    id: string;
    testName: string;
    trackingSolution: string;
    active: boolean;
    xPayload: VariantXPid;
};

export type VariantXPid = {
    groupVariantsAsFlatArticles: boolean;
    engine: string;
};

// xPayload
export type XPid = {
    keywordResults: KeywordResults;
};

export type KeywordResults = {
    num_items_found: number;
};

// Rendering
export type Rendering = {
    breadcrumb: boolean;
};

// Sort
export type Sort = {
    code: string;
    label: string;
    url: string;
    link: Link;
};

export type Link = {
    type: string;
    filter: Filter;
    sort?: string;
};

export type Filter = {
    [key: string]: string[];
};

// Selections
export type Selections = {
    values: SelectionValue[];
    resetAll: string;
    resetLink: Link;
};

export type SelectionValue = {
    code: string;
    value: string;
    label: string;
    url: string;
    link: Link;
    rendering: SelectionRendering;
    children?: SelectionValue[];
};

export type SelectionRendering = {
    style: string;
    searchable: boolean;
    selectedPosition: string;
    renderLabel: boolean;
    collapsible: boolean;
};

// SortOption
export type SortOption = {
    code: string;
    label: string;
    url: string;
    link: Link;
};

// Facet
export type Facet = {
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
};

export type FacetRendering = {
    style: string;
    searchable: boolean;
    selectedPosition: string;
    renderLabel: boolean;
    collapsible: boolean;
};

export type FacetValue = {
    type: string;
    label: string;
    selected: boolean;
    count: number;
    url: string;
    link: Link;
    value: string;
    children?: FacetValue[];
};

export type NumericValue = {
    type: string;
    unit: string;
    value: number;
};

export type SelectedNumericValue = {
    value: number;
};

// ProductItem
export type ProductItem = {
    resultClass: string;
    type: string;
    code: string;
    label: string;
    url: string;
    xPayload: ProductXPid;
    gridbox: Gridbox;
    tracking: Tracking;
};

export type ProductXPid = {
    metaData: MetaData;
};

export type MetaData = {
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
};

// Gridbox - this is complex, simplified
export type Gridbox = {
    country: string;
    sequence: number;
    data: GridboxData;
    productId: number;
    meta: GridboxMeta;
    action: string;
    language: string;
    eventType: string;
    id: string;
};

// Simplified GridboxData
export type GridboxData = {
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
};

export type Brand = {
    showBrand: boolean;
    logo?: string;
    name?: string;
    url?: string;
    id?: string;
};

export type DealOfDay = {
    active: boolean;
};

export type Disclaimer = {
    id: string;
    type: string;
    value: string;
};

export type ImageV1 = {
    image: string;
    accessibility: string;
};

export type Keyfacts = {
    analyticsCategory: string;
    description?: string;
    fullTitle: string;
    moreDetails: string;
    supplementalDescription: string;
    title: string;
    wonCategoryPrimary: string;
    wonCategoryPrimaryPath: string;
};

export type LidlPlus = {
    price: LidlPlusPrice;
    lidlPlusText: string;
    highlightText: string;
};

export type LidlPlusPrice = {
    discount: Discount;
    hasStar: boolean;
    hasVat: boolean;
    oldPrice?: number;
    price: number;
    priceTheme: string;
    specialTaxes: any[];
    packaging?: Packaging;
};

export type Discount = {
    discountHasStar: boolean;
    discountText: string;
    fromRecommendedPrice: boolean;
    showDiscount: boolean;
    showFrom: boolean;
    showPercentage: boolean;
    showUpTo: boolean;
    deletedPrice?: number;
    percentageDiscount?: number;
};

export type Packaging = {
    text: string;
};

export type Price = {
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
};

export type BasePrice = {
    prefix: boolean;
    text: string;
};

export type Ratings = {
    average: number;
    count: number;
    recommendedNo: number;
    recommendedYes: number;
    sizePercentage: number;
    topRated: boolean;
};

export type Ribbon = {
    type: string;
    text: string;
    theme: string;
};

export type Seal = {
    altText: string;
    image: string;
};

export type StockAvailability = {
    availabilityIndicator: number;
    badgeInfo: BadgeInfo;
    badgeInfoV2?: BadgeInfoV2[];
    onlineAvailable: boolean;
    orderableQuantities: OrderableQuantity[];
    minOrderableQuantity: number;
};

export type BadgeInfoV2 = {
    badges: Badge[];
    validFrom?: number;
    validUntil?: number;
};

export type BadgeInfo = {
    badges: Badge[];
};

export type Badge = {
    text: string;
    type: string;
};

export type OrderableQuantity = {
    unit: string;
    value: number;
};

// GridboxMeta
export type GridboxMeta = {
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
};

export type SapProductCategory = {
    code: string;
    name: string;
    pathCode: string;
    pathName: string;
};

export type CategoryPath = {
    id: string;
    name: string;
    url: string;
    hiddenCategory: boolean;
};

export type CampaignPath = {
    id: string;
    name: string;
    url: string;
    hiddenCategory: boolean;
};

export type Gs1 = {
    segment: Gs1Segment;
};

export type Gs1Segment = {
    code: string;
    label: string;
    family: Gs1Family;
};

export type Gs1Family = {
    code: string;
    label: string;
    clazz: Gs1Class;
};

export type Gs1Class = {
    code: string;
    label: string;
    brick: Gs1Brick;
};

export type Gs1Brick = {
    code: string;
    label: string;
    attributeGS1: any[];
};

export type ShopCategories = {
    shopCategory: ShopCategory[];
};

export type ShopCategory = {
    code: string;
    name: string;
    parent: string;
    superCategories: SuperCategory[];
};

export type SuperCategory = {
    category: SubCategory[];
};

export type SubCategory = {
    code: string;
    name: string;
    parent: string;
};

export type WonCategoryBreadcrumb = {
    id: string;
    name: string;
    url: string;
    hiddenCategory: boolean;
};

export type WorldOfNeed = {
    code: string;
    isMain: boolean;
    name: string;
    parent: string;
    superCategories: SuperCategory[];
};

export type RetailList = {
    id: number;
    productSortIndex: number;
};

// Tracking
export type Tracking = {
    position: number;
    xPayload: TrackingXPid;
};

export type TrackingXPid = {
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
};

// Breadcrumb
export type Breadcrumb = {
    code: string;
    url: string;
    link: Link;
    label?: string;
};

// Details
export type Details = {
    [key: string]: any;
};

// Teasers
export type Teasers = {
    "above search result": Teaser[];
};

export type Teaser = {
    id: string;
    name: string;
    link: string;
    image: string;
    mobile_image: string;
    alt_image: string;
    open_in_a_new_tab: boolean;
};

// Advisor
export type Advisor = {
    [key: string]: any;
};
