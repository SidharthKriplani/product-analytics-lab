export const estimationProblems = [
  {
    id: 'EST01',
    title: 'Uber Rides in NYC Right Now',
    subtitle: 'Market Sizing · Rideshare',
    difficulty: 'analyst',
    isFree: true,
    tags: ['rideshare', 'market-sizing', 'real-time', 'NYC'],
    category: 'market-sizing',
    approach: 'bottom-up',

    prompt: 'Estimate how many Uber rides are happening in New York City right now (assume a typical weekday morning around 9am).',

    frameworkSteps: [
      'Step 1 — Anchor with population: Start with NYC\'s population (~8.5M residents) and identify the addressable user base.',
      'Step 2 — Estimate daily rides: Determine what share of the population uses Uber and how often, to get a total daily ride count.',
      'Step 3 — Convert to hourly rate: Divide daily rides by 24 hours, then apply a peak-hour multiplier for 9am.',
      'Step 4 — Sanity check: Cross-check against Uber\'s reported global daily rides and NYC\'s estimated share of the global rideshare market.',
    ],

    hints: [
      'NYC\'s population is ~8.5M, but factor in tourists (~65M visits/year adds ~180k average visitors at any given time).',
      'Not everyone in NYC uses Uber — consider the subway\'s role. Roughly 25-30% of NYers are regular Uber users.',
      'Average Uber user in a city like NYC takes roughly 2 rides per week, or about 0.29 rides per day.',
      'Peak hours (7-9am, 12-1pm, 5-7pm) carry about 2-2.5x the hourly average ride volume.',
      'Global rideshare check: Uber reported ~18M daily global rides; NYC is roughly 5% of global rideshare demand.',
    ],

    modelAnswer: {
      walkthrough: 'Start with the NYC addressable population. NYC has ~8.5M residents plus an average of ~180k tourists at any given time (65M annual visits ÷ 365), giving ~8.68M people in the city.\n\nUber penetration: In NYC the subway is dominant, so not everyone Ubers. Estimate ~28% of the population as regular Uber users → 8.68M × 0.28 ≈ 2.43M Uber users.\n\nRides per user per day: A typical NYC Uber user might take 2 rides per week (airport, late nights, rain days, convenience trips). That\'s 2 ÷ 7 ≈ 0.29 rides/user/day. Total daily rides: 2.43M × 0.29 ≈ 704k rides/day.\n\nConvert to per-hour average: 704k ÷ 24h ≈ 29,300 rides/hour on average.\n\nApply peak multiplier: At 9am on a weekday, rideshare demand is ~2.2x the hourly average (morning commute surge). Rides in progress at any given moment of a 9am-hour window: ~29,300 × 2.2 ≈ 64,500 rides/hour.\n\nBut "right now" means simultaneous rides in progress, not rides started per hour. Average Uber trip in NYC is about 15 minutes (0.25 hours). Rides in flight at one instant = 64,500 × 0.25 ≈ 16,000 concurrent rides.\n\nRange: 10,000–25,000 concurrent rides, with a point estimate of ~16,000.\n\nSanity check via global data: Uber reported ~18M daily rides globally. NYC represents roughly 5% of global rideshare volume → 18M × 0.05 = 900k rides/day in NYC. This is slightly higher than our 704k bottom-up — suggesting our Uber penetration estimate is conservative. Adjusting to 900k/day: peak hour = 900k/24 × 2.2 = 82,500 rides/hour × 0.25h average trip = ~20,600 concurrent rides. Consistent with the 10k–25k range.',
      keyAssumptions: [
        '28% of NYC residents/visitors are regular Uber users — lower than other US cities due to NYC subway coverage',
        '2 rides/week per user — reflects occasional-to-moderate usage in a transit-heavy city',
        '2.2x peak multiplier at 9am — based on typical rideshare demand curves published in Uber driver forums',
        '15-minute average trip duration in NYC — consistent with published Uber data for dense urban markets',
        'NYC = ~5% of global Uber demand — based on NYC being the largest US rideshare market',
      ],
      finalEstimate: 'Range: 10,000–25,000 concurrent rides at 9am on a weekday',
      sanityChecks: [
        'Global check: 18M global daily rides × 5% NYC share = 900k/day → ~20k concurrent at peak. Consistent.',
        'Driver check: NYC has ~80k active Uber drivers. At peak utilization ~40% are on trips → 32k rides. Our estimate is within 2x, which is reasonable given different utilization assumptions.',
        'Revenue check: At avg $18/ride, 900k rides/day = $16M daily NYC gross booking. At 25% take rate = $4M revenue/day from NYC alone. Plausible for a top market.',
      ],
    },

    strongAnswerMarkers: [
      'Distinguishes between rides per hour and concurrent rides in flight (uses trip duration)',
      'Applies a peak multiplier rather than just using hourly average',
      'Cross-validates with a global top-down anchor (18M daily global rides)',
      'Explicitly states assumptions about Uber penetration given NYC\'s strong subway system',
      'Arrives at a range rather than a single point estimate',
    ],

    commonMistakes: [
      'Treating "rides per hour" as the same as "rides happening right now" — you need to multiply by trip duration (0.25h) to get concurrent count',
      'Ignoring the subway — NYC Uber penetration is much lower than in car-dependent cities like LA',
      'Using total population as the user base without applying a penetration rate',
      'Forgetting to apply a peak-hour multiplier for a 9am scenario',
      'Anchoring only on global data without building up from first principles — you should do both and reconcile',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates daily Uber rides in NYC, divides by 24 to get an hourly rate, and states that as the answer. They never apply the peak-hour multiplier for 9am, never convert rides-per-hour to concurrent rides using trip duration, and ignore the subway\'s effect on penetration by using a 50% adoption rate.',
      interviewerFollowUp: '"You said 65,000 rides per hour at 9am. But the question asks how many rides are happening right now — simultaneously in progress. If each ride takes 15 minutes, how does that change your answer, and what number do you actually get?"',
    },
  },

  {
    id: 'EST02',
    title: 'YouTube Storage Cost Per Year',
    subtitle: 'Cost Estimation · Cloud Infrastructure',
    difficulty: 'senior',
    isFree: true,
    tags: ['YouTube', 'storage', 'infrastructure', 'cost'],
    category: 'cost-estimation',
    approach: 'hybrid',

    prompt: 'Estimate the total storage cost YouTube incurs for video uploads in a single year (new uploads only, not the existing library).',

    frameworkSteps: [
      'Step 1 — Estimate upload volume: Quantify hours of video uploaded per year using the "minutes per minute uploaded" anchor.',
      'Step 2 — Convert to raw storage: Estimate average file size per hour of video across all quality levels.',
      'Step 3 — Account for transcoding: YouTube stores multiple resolutions (360p, 720p, 1080p, 4K). Apply a multiplier.',
      'Step 4 — Apply storage unit cost: Use public cloud pricing as a proxy for the cost per TB/month.',
      'Step 5 — Sanity check: Cross-check using public cloud cost benchmarks and YouTube\'s known infrastructure scale.',
    ],

    hints: [
      'YouTube has publicly stated ~500 hours of video are uploaded every minute.',
      'A 1-hour video at 1080p is roughly 2-4 GB; but many uploads are 480p or lower. Use ~1 GB/hour as a blended average raw size.',
      'YouTube transcodes each upload into ~5 quality tiers (240p, 360p, 480p, 720p, 1080p). The transcoded total is ~4x the original raw size.',
      'Public cloud storage (AWS S3, GCS) runs ~$20/TB/month for hot storage. Google\'s internal cost is likely 5-10x cheaper at their scale — use $3-5/TB/month as a reasonable hyperscaler estimate.',
      'Don\'t forget: storage cost is ongoing (you pay every month), not just on the day of upload.',
    ],

    modelAnswer: {
      walkthrough: 'Start with upload volume. YouTube has stated ~500 hours of video are uploaded per minute. Scale that up:\n500 hours/minute × 60 minutes/hour × 24 hours/day × 365 days/year = 500 × 525,600 = 262.8M hours uploaded per year.\n\nRaw storage per hour: A blended average across all quality levels of uploads (many are short, low-res user videos; some are professional 4K). Estimate ~1 GB per hour of raw video on average. Raw storage: 262.8M hours × 1 GB = 262.8M GB ≈ 263 petabytes (PB) of raw uploads/year.\n\nTranscoding multiplier: YouTube stores each video in approximately 5 quality tiers (240p, 360p, 480p, 720p, 1080p) plus original. The transcoded versions combined are roughly 4× the original size. Total stored per year: 263 PB × 4 = 1,052 PB ≈ 1 exabyte of new storage added per year.\n\nStorage cost: Google\'s internal storage at hyperscale is far cheaper than public cloud. Use ~$3/TB/month as an estimate for Google\'s internal cost (vs. $20-23/TB/month on AWS/GCS public pricing). 1,052 PB = 1,052,000 TB. Annual cost for just the first year\'s data (12 months average across the year, since uploads are spread over the year):\n- If all 1 exabyte were stored from Jan 1, cost = 1,052,000 TB × $3/TB/month × 12 months = $37.9B/year — that\'s way too high. The error: not all of this year\'s uploads arrived on Jan 1.\n- Correct annualization: Average TB-months for new 2024 uploads = 1,052,000 TB × 6.5 average months stored in first year ≈ 6.8M TB-months × $3 = ~$20.5M for the first year\'s storage of new uploads.\n- Ongoing: This ~1 exabyte of new uploads then costs $3M/month ($36M/year) every subsequent year.\n\nSummary: New uploads in year 1 cost ~$20M in storage for that year (partial-year basis). Ongoing annual storage cost for that cohort = ~$36M/year in perpetuity.\n\nFor a simpler framing the interviewer likely wants: Total cloud-equivalent cost for new uploads\' first year = ~$60-120M if using public cloud pricing ($20/TB/month): 1,052,000 TB × $20/TB/month × 6.5 months = ~$137M. Range: $20M-$140M depending on Google\'s internal pricing advantage.',
      keyAssumptions: [
        '500 hours uploaded per minute — widely published stat, though it has grown over time',
        '1 GB/hour blended average raw size — conservative estimate across all quality levels',
        '4x transcoding multiplier — YouTube stores ~5 quality tiers; 4x is a middle estimate',
        '$3/TB/month internal Google cost — public GCS is $20/TB/month; Google\'s scale gives ~5-7x cost advantage',
        'Only new uploads in one year counted — existing petabyte-scale library excluded per the question',
      ],
      finalEstimate: 'Range: $20M–$140M per year for new upload storage, depending on pricing model (Google internal vs. public cloud equivalent)',
      sanityChecks: [
        'Public cloud cross-check: 1,052 PB × $20/TB/month × 6.5 months ≈ $137M. Consistent with the upper bound.',
        'Revenue ratio: YouTube\'s estimated revenue is ~$30B/year. A $50-100M storage cost for new uploads is ~0.3% of revenue — plausible for a content platform.',
        'Netflix comparison: Netflix reportedly stores ~100 PB of content. YouTube adds 10x that per year, so storage costs 10x larger than Netflix\'s ~$20-30M/year estimate. Directionally consistent.',
      ],
    },

    strongAnswerMarkers: [
      'Correctly annualizes by recognizing that uploads throughout the year are stored for varying amounts of time (average ~6.5 months in year 1)',
      'Applies the transcoding multiplier (~4x) rather than just using raw upload size',
      'Distinguishes between public cloud pricing and hyperscaler internal costs',
      'Arrives at a range and explains what drives the range (internal vs. external pricing)',
      'Notes that "cost of new uploads" is separate from "total library storage cost"',
    ],

    commonMistakes: [
      'Treating 1 exabyte as fully stored from January 1 — leads to 10x overestimate; uploads are distributed across the year',
      'Forgetting the transcoding multiplier — raw upload size is only 1/4 of what\'s actually stored',
      'Using public cloud retail pricing ($20/TB/month) without noting Google\'s scale advantage',
      'Confusing "storage cost for new uploads" with "total YouTube storage cost including historical library"',
      'Getting the unit conversions wrong (PB → TB → GB) — work through units explicitly',
    ],
    failureMode: {
      weakAnswer: 'The candidate multiplies 500 hours/minute of uploads × 60 min × 24 hrs × 365 days × 2 GB/hour = some large number of GB, then multiplies by $0.023/GB/month × 12 to get annual cost. They forget the 4x transcoding multiplier, treat the full exabyte as stored from January 1, and use public cloud retail pricing — ending up with an estimate 20-40x too high.',
      interviewerFollowUp: '"Your estimate comes to $2 billion for YouTube\'s annual storage cost on new uploads alone. Google\'s entire capital expenditure for all data centers is roughly $12 billion. Does that ratio feel right — and what is the single adjustment to your calculation that would move it most toward reality?"',
    },
  },

  {
    id: 'EST03',
    title: 'WhatsApp Users in India',
    subtitle: 'Market Sizing · Messaging',
    difficulty: 'analyst',
    isFree: true,
    tags: ['WhatsApp', 'India', 'DAU/MAU', 'messaging'],
    category: 'market-sizing',
    approach: 'top-down',

    prompt: 'Estimate the number of daily active WhatsApp users in India.',

    frameworkSteps: [
      'Step 1 — Start with total population: India\'s ~1.4B people, then filter to the addressable base.',
      'Step 2 — Apply smartphone penetration: Only smartphone owners can use WhatsApp.',
      'Step 3 — Apply WhatsApp adoption rate: Among Indian smartphone users, WhatsApp penetration is unusually high.',
      'Step 4 — Apply DAU/MAU ratio: Convert from installs → monthly actives → daily actives.',
      'Step 5 — Sanity check: WhatsApp has disclosed India figures in press releases and legal filings.',
    ],

    hints: [
      'India\'s smartphone penetration is around 55% of the population as of 2024.',
      'WhatsApp is effectively the default messaging platform in India — penetration among smartphone users is extremely high (~85-90%).',
      'For a messaging app this embedded in daily life, DAU/MAU ratios are high — estimate 70-75% DAU/MAU.',
      'The published figure for India is ~500M monthly active users. Your estimate should land near that.',
    ],

    modelAnswer: {
      walkthrough: 'India population: ~1.4 billion people.\n\nSmartphone penetration: ~55% of the population owns a smartphone → 1.4B × 0.55 = 770M smartphone users.\n\nWhatsApp adoption rate in India: WhatsApp is the near-universal messaging app in India, effectively replacing SMS. Penetration among smartphone owners is ~85-90%. Use 88%: 770M × 0.88 = 678M WhatsApp installs/MAU-eligible users.\n\nMonthly Active Users: Not every install is active monthly. Some users have WhatsApp but rarely open it. Estimate ~90% of installs are monthly active (very high because WhatsApp groups for family, work, community are pervasive): 678M × 0.90 = 610M MAU.\n\nDaily Active Users: For a messaging app this integrated into daily communication, DAU/MAU is ~70-75%. Use 72%: 610M × 0.72 = 439M DAU.\n\nRange: 400M–470M DAU in India.\n\nSanity check: WhatsApp publicly stated ~500M users in India (this appears to be MAU). Our MAU estimate is 610M — about 20% higher. The slight overestimate likely comes from:\n1. Smartphone penetration may be closer to 50% (not 55%) in 2024, especially in rural areas.\n2. Some dual-SIM users may show as 2 accounts.\nAdjusting smartphone penetration to 50%: 1.4B × 0.50 = 700M × 0.88 = 616M installs × 0.90 MAU = 554M MAU × 0.72 = 399M DAU. Still in the right ballpark.',
      keyAssumptions: [
        '55% smartphone penetration in India — this is the midpoint; rural penetration is lower (~35%) while urban is 75%+',
        '88% WhatsApp penetration among smartphone users — conservative given some users are iOS on iMessage or corporate MDM',
        '90% MAU rate — high because WhatsApp groups (family, school, neighborhood) drive habitual daily checking',
        '72% DAU/MAU — benchmarked against other high-engagement messaging apps (WhatsApp\'s ratio is estimated around this level)',
      ],
      finalEstimate: 'Range: 380M–470M daily active users in India',
      sanityChecks: [
        'Published MAU figure: ~500M India MAU × 72% DAU/MAU = 360M DAU. Our estimate of 400-470M is slightly higher, suggesting slightly optimistic penetration assumptions.',
        'India vs. global: WhatsApp has ~2B global MAU. India at 500M = 25% of global MAU. India is ~17% of world population. The 25% share makes sense given WhatsApp\'s dominant position vs. competing apps like WeChat in China, iMessage in US/UK.',
        'Revenue context: At ~$0 direct revenue per user, India\'s ~500M MAU is strategic rather than monetized — aligns with Meta\'s stated approach of India as a growth market for future monetization.',
      ],
    },

    strongAnswerMarkers: [
      'Uses a funnel approach: population → smartphones → installs → MAU → DAU rather than jumping straight to DAU',
      'Applies a DAU/MAU ratio explicitly, rather than treating all users as daily active',
      'Notes regional variation (urban vs. rural smartphone penetration)',
      'Cross-validates against the known published figure and explains the gap',
      'Arrives at a range with the key drivers of uncertainty called out',
    ],

    commonMistakes: [
      'Applying WhatsApp penetration to total India population rather than just smartphone users',
      'Treating MAU = DAU — messaging apps have high but not 100% daily engagement',
      'Using global smartphone penetration (~57%) rather than India-specific (~50-55%)',
      'Confusing "users" (often means MAU) with "daily actives" — the question asks specifically for DAU',
      'Forgetting that dual-SIM phones are common in India and some users have 2 WhatsApp numbers',
    ],
    failureMode: {
      weakAnswer: 'The candidate applies 80% WhatsApp penetration to India\'s 1.4 billion total population and equates MAU with DAU, arriving at ~1.1 billion daily active users. They never adjust for smartphone penetration (~52% in India) or apply a DAU/MAU ratio, and treat every Indian adult as a daily WhatsApp user.',
      interviewerFollowUp: '"You got 1.1 billion daily WhatsApp users in India — that\'s more than the entire smartphone-owning population of India. What\'s the first assumption in your chain that breaks down, and what would a corrected number look like?"',
    },
  },

  {
    id: 'EST04',
    title: 'Restaurant Listings on Yelp',
    subtitle: 'Market Sizing · Consumer Platforms',
    difficulty: 'analyst',
    isFree: false,
    tags: ['Yelp', 'restaurants', 'bottom-up', 'US market'],
    category: 'market-sizing',
    approach: 'bottom-up',

    prompt: 'Estimate how many restaurant listings are on Yelp in the United States.',

    frameworkSteps: [
      'Step 1 — Estimate total US restaurants: Build up from household dining-out frequency and restaurant capacity.',
      'Step 2 — Estimate Yelp\'s coverage rate: Not all restaurants are on Yelp. Consider what share have been claimed or auto-listed.',
      'Step 3 — Account for non-restaurant food businesses: Yelp includes bars, cafes, food trucks, etc. Apply a multiplier if relevant.',
      'Step 4 — Sanity check: Cross-check against the National Restaurant Association total count and published Yelp business stats.',
    ],

    hints: [
      'The US has ~131M households. Average household eats out or orders in roughly 3-4 times per week.',
      'A typical restaurant serves about 150-250 covers per day.',
      'Not every restaurant in the US is on Yelp — particularly small, cash-only local spots. Estimate Yelp\'s coverage at ~50-60% of all US restaurants.',
      'The National Restaurant Association reports ~1M restaurant locations in the US.',
      'Yelp includes bars, cafes, bakeries, food trucks beyond just "restaurants." The "restaurant" category is roughly 50-60% of all food/drink Yelp listings.',
    ],

    modelAnswer: {
      walkthrough: 'Build from household dining behavior.\n\nUS population: 330M people, ~2.5 people per household → 132M households.\n\nDining-out frequency: Average US household eats out or orders from a restaurant about 3 times per week (mix of dine-in, takeout, delivery). Total restaurant visits per week: 132M × 3 = 396M visits/week.\n\nRestaurant capacity: A typical US restaurant serves about 200 diners per day (lunch + dinner + takeout), 7 days/week = 1,400 covers/week. Number of restaurants needed to serve demand: 396M ÷ 1,400 = ~283k restaurants.\n\nBut wait — 200 covers/day is for a mid-size sit-down restaurant. Many US restaurants are much smaller (food stalls, small diners at 50 covers/day) or much larger (chains at 500+/day). Using a blended average of 150 covers/day × 7 days = 1,050/week: 396M ÷ 1,050 = ~377k restaurants. Still feels low.\n\nThe issue: we\'re undercounting meal occasions. Many Americans eat fast food (McDonald\'s alone serves ~69M customers/day globally, ~40M in the US). Including QSR, fast casual, and delivery-only restaurants: total US foodservice units is about 1M per the NRA. Our demand-side estimate of 300-400k represents sit-down and independent restaurants; the other 600k are fast food chains and franchise units.\n\nRevised estimate for total US restaurants (all types): ~1M.\n\nYelp coverage: Yelp has been around since 2004 and has strong penetration in urban/suburban areas. Coverage for sit-down restaurants: ~75-80%. Coverage for fast food chains (McDonald\'s, Starbucks): ~90%+ (auto-listed). Coverage for very small, cash-only local spots: ~30-40%. Blended coverage: ~60%.\n\nYelp restaurant listings: 1M × 60% = 600k restaurant-category listings.\n\nBut Yelp also lists bars, cafes, food trucks. Total food/drink = ~600k / 0.55 = ~1.09M total food/drink listings (if restaurants are 55% of that category). The question asks specifically for restaurants: ~600k.',
      keyAssumptions: [
        '3 restaurant visits per household per week — slightly below the NRA\'s reported average of ~5.5 eating occasions outside home, but accounting for grocery delivery/meal kits',
        '150 average covers/day across all restaurant types — blended across fast food (high volume) and fine dining (low volume)',
        'NRA total of ~1M restaurant locations — used as the cross-check anchor',
        '60% Yelp coverage rate — higher in urban markets, lower in rural; Yelp auto-lists many businesses from public data',
      ],
      finalEstimate: 'Range: 500,000–700,000 restaurant listings on Yelp in the US',
      sanityChecks: [
        'NRA reports ~1M US restaurants × 60% Yelp coverage = 600k. Bottom-up demand approach gives ~380k sit-down + ~620k QSR ≈ 1M total → same answer.',
        'Yelp reported ~600k claimed business locations in 2023. Total listed (including unclaimed) is higher — ~3-5M total businesses across all categories. Food/drink is ~25-30% of listings → 750k-1.5M food listings. Restaurants specifically ~500-700k.',
        'Revenue check: If Yelp generates ~$1.3B annual revenue and has ~600k restaurant listings, average revenue per restaurant listing ≈ $2,167/year. At $300/month for a typical Yelp ad package and ~30% conversion to paid → ($300 × 12 × 0.30 × 600k = $648M from restaurants alone). Consistent with Yelp\'s actual advertising revenue profile.',
      ],
    },

    strongAnswerMarkers: [
      'Builds demand-side estimate (how many meals are served) and supply-side (how many restaurants does that require) separately then reconciles',
      'Distinguishes between sit-down restaurants (~300-400k) and QSR/fast food (~600k) to reach the NRA\'s 1M total',
      'Applies a Yelp-specific coverage rate rather than assuming 100% of restaurants are listed',
      'Explicitly notes that the question asks for restaurants vs. all food/drink businesses on Yelp',
    ],

    commonMistakes: [
      'Only estimating sit-down restaurants and ignoring QSR/fast food — undercounts by 2x',
      'Treating Yelp coverage as 100% — many small restaurants are not on Yelp',
      'Applying restaurant density per capita without accounting for different restaurant types and sizes',
      'Confusing total Yelp business listings (~5M) with restaurant-specific listings (~600k)',
      'Not doing a sanity check against the NRA\'s published ~1M restaurants figure',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates only sit-down restaurants using a "1 restaurant per 2,000 people" density rule, applies it to 330M Americans, and treats Yelp coverage as 100%. They get ~165,000 listings — off by nearly 4x — because they excluded QSR/fast food and never discounted for incomplete Yelp coverage of small independent restaurants.',
      interviewerFollowUp: '"You estimated 165,000 Yelp restaurant listings. The NRA reports roughly 1 million restaurants in the US total. If Yelp has 60% coverage of all restaurants, what does that imply your estimate missed — and which restaurant category is almost certainly the gap?"',
    },
  },

  {
    id: 'EST05',
    title: 'Songs Available on Spotify',
    subtitle: 'Product Metrics · Music Streaming',
    difficulty: 'analyst',
    isFree: false,
    tags: ['Spotify', 'catalog', 'music', 'product-metrics'],
    category: 'product-metrics',
    approach: 'hybrid',

    prompt: 'Estimate the total number of songs available on Spotify\'s platform today.',

    frameworkSteps: [
      'Step 1 — Estimate historical catalog: How many commercial songs were recorded annually across different decades?',
      'Step 2 — Estimate digital-era explosion: DIY distribution platforms (DistroKid, TuneCore) dramatically increased releases from ~2010 onwards.',
      'Step 3 — Triangulate with upload rate: Spotify reportedly receives ~100k new tracks per day in recent years.',
      'Step 4 — Apply availability rate: Not every recorded song has been cleared for Spotify — estimate what fraction of existing catalog is licensed.',
      'Step 5 — Sanity check: Spotify has disclosed approximate catalog sizes in earnings materials.',
    ],

    hints: [
      'Before digital distribution (~2010), new commercial music releases totaled ~500k-1M tracks per year globally.',
      'After 2015, DIY platforms enabled anyone to distribute music. By 2022-2023, ~100,000 tracks were uploaded to Spotify daily.',
      'Spotify has stated its catalog passed 100 million tracks in late 2023.',
      'The key insight: catalog growth is exponential, not linear — ~80% of all tracks on Spotify were uploaded after 2015.',
      'Even if you don\'t know the exact number, the method matters: triangulating upload rate × time is the cleanest approach.',
    ],

    modelAnswer: {
      walkthrough: 'Approach 1: Build from historical catalog + digital era growth.\n\nPre-digital era (1950-2010, 60 years): Estimate ~500k commercial tracks released per year globally (all genres, all countries). 60 years × 500k = 30M tracks in the historical catalog. Of these, ~60% have been digitized and licensed to streaming: 30M × 0.60 = 18M pre-2010 tracks on Spotify.\n\nEarly streaming era (2010-2015, 5 years): Music industry was adapting to streaming. Releases growing but not yet explosive. ~1M tracks/year → 5M tracks added. ~80% availability → 4M tracks.\n\nDIY explosion (2015-2020, 5 years): DistroKid, TuneCore, CD Baby made distribution nearly free. Releases growing from 5M/year to 30M/year. Average: ~15M/year × 5 = 75M tracks released. ~90% uploaded to Spotify → 67M tracks.\n\nRecent era (2020-2024, 4 years): ~40-50M tracks released per year (the ~100k/day figure = 36.5M/year). 4 years × 40M = 160M new releases, ~95% on Spotify → 152M.\n\nBut wait — this gives 18M + 4M + 67M + 152M = 241M, which seems too high. The issue: many "uploads" in the DIY era are AI-generated or duplicate tracks that Spotify has since removed.\n\nApproach 2: Upload rate triangulation (cleaner).\nSpotify receives ~100k new tracks/day = 36.5M/year currently. But the platform has been accepting uploads since 2008. Using a growth curve:\n- 2008-2012: ~5M tracks/year → 20M cumulative\n- 2013-2016: ~10M tracks/year → 40M cumulative\n- 2017-2019: ~20M tracks/year → 60M cumulative\n- 2020-2022: ~30M tracks/year → 90M cumulative\n- 2023-2024: ~36M tracks/year → 72M cumulative\nTotal cumulative: 20+40+60+90+72 = 282M. Minus removals (AI spam, duplicates, inactive labels): ~25% removed → ~212M.\n\nSpotify stated ~100M tracks in late 2023. Our estimate skews high, suggesting upload rate was lower than 100k/day historically (that\'s a very recent figure). A more conservative ramp gives ~80-120M.\n\nThe honest answer: without knowing Spotify\'s exact catalog, triangulation via the upload rate and a historical music release rate yields 80-120M tracks, converging on the ~100M disclosed figure.',
      keyAssumptions: [
        '500k global commercial tracks per year pre-2010 — covers all genres (pop, classical, world music) but excludes unreleased recordings',
        '60% licensing rate for pre-digital catalog — many tracks are out-of-print or have unresolved rights',
        '~100k tracks/day current upload rate — widely cited in music industry press as of 2022-2023',
        '25% removal rate for quality/spam reasons — Spotify has removed AI-generated spam tracks',
      ],
      finalEstimate: 'Range: 80M–120M songs, with ~100M as the central estimate',
      sanityChecks: [
        'Spotify disclosed "over 100 million tracks" in October 2023. Our range of 80-120M is consistent.',
        'Apple Music, Amazon Music report similar catalog sizes (~100M). Competitive parity check passes.',
        'Revenue per track: Spotify pays ~$0.003-0.005 per stream. At 100M tracks, even if each track is streamed once a month: 100M × $0.004 = $400k/month in royalties, far below Spotify\'s actual ~$1.3B/month royalty payments — consistent with a power law where a tiny fraction of tracks get the vast majority of streams.',
      ],
    },

    strongAnswerMarkers: [
      'Uses two independent methods (historical catalog build-up and daily upload rate triangulation) and reconciles them',
      'Recognizes the exponential growth in the digital/DIY era rather than applying a flat historical rate',
      'Accounts for removals (AI spam, duplicates) rather than treating all uploads as permanent',
      'Is honest about uncertainty and explains why the estimate might diverge from actuals',
      'Notes that without the published Spotify figure, arriving at "~100M" via triangulation is the correct approach',
    ],

    commonMistakes: [
      'Applying a flat historical release rate (e.g., 1M/year) across all decades — misses the exponential DIY explosion post-2015',
      'Treating all uploads as permanently available — Spotify actively removes duplicate and spam tracks',
      'Anchoring only on the "100k tracks/day" figure without noting that rate only applies recently',
      'Confusing "songs" with "albums" or "artists" — the question asks specifically for tracks',
      'Not triangulating with a second method — using only one approach without cross-validation leaves the estimate ungrounded',
    ],
    failureMode: {
      weakAnswer: 'The candidate assumes a flat 1 million tracks released per year across 70 years of recorded music history, multiplies 70M total tracks, and states that as the Spotify catalog. They miss the exponential upload explosion post-2015 (when DIY distribution platforms arrived) and don\'t triangulate with any second method.',
      interviewerFollowUp: '"You got 70 million tracks using a flat annual release rate. Spotify has publicly disclosed approximately 100 million tracks on the platform. What does the discrepancy tell you about where your flat-rate assumption breaks down most severely — and in which 5-year period would the actual release rate have grown most sharply?"',
    },
  },

  {
    id: 'EST06',
    title: 'Google Searches Per Second',
    subtitle: 'Product Metrics · Search',
    difficulty: 'analyst',
    isFree: false,
    tags: ['Google', 'search', 'scale', 'product-metrics'],
    category: 'product-metrics',
    approach: 'top-down',

    prompt: 'Estimate how many Google searches happen per second globally.',

    frameworkSteps: [
      'Step 1 — Estimate global Google users: Who has internet access and uses Google Search?',
      'Step 2 — Estimate searches per user per day: How often does an average Google user search?',
      'Step 3 — Convert to per-second: Divide by 86,400 seconds in a day, then adjust for time-zone smoothing.',
      'Step 4 — Sanity check: Google has disclosed approximate search volumes in various public statements.',
    ],

    hints: [
      'Global internet users: ~5.3 billion people as of 2024.',
      'Google\'s global search market share is ~91-92%, but not every internet user searches daily.',
      'Think about your own behavior: how many times do you Google something in a day? Consider the average across light and heavy users.',
      'There are 86,400 seconds in a day. The per-second number should be a 5-digit figure.',
      'Google has historically stated ~2 trillion searches per year, which was cited in 2016 filings. More recent estimates suggest 8-9 billion per day.',
    ],

    modelAnswer: {
      walkthrough: 'Start with the global user base.\n\nGlobal internet users: ~5.3 billion people.\nGoogle search market share: ~91% → 5.3B × 0.91 = ~4.8B Google users.\n\nBut not everyone searches every day. Distinguish by engagement level:\n- Heavy users (daily multiple searches, typically young adults/professionals): ~35% of users, ~8 searches/day\n- Regular users (search daily but fewer queries): ~40% of users, ~3 searches/day\n- Light/occasional users (weekly, older demographics, feature phones): ~25% of users, ~0.5 searches/day\n\nWeighted average searches per user per day:\n(0.35 × 8) + (0.40 × 3) + (0.25 × 0.5) = 2.8 + 1.2 + 0.125 = ~4.1 searches/user/day\n\nTotal daily searches: 4.8B users × 4.1 searches = 19.7B searches/day.\n\nPer second: 19.7B ÷ 86,400 = ~228,000 searches/second.\n\nSimpler check: 4.8B users × 3.5 searches/day ÷ 86,400 = ~194,000/second.\n\nGoogle\'s disclosed data: Google reported ~2 trillion searches per year as of 2016 = 5.5B/day = ~63,700/second. More recent industry estimates suggest 8-9 billion searches/day = ~100,000/second.\n\nOur estimate of ~200,000/second is likely high because:\n1. Many "users" in the 5.3B count are not daily Google searchers\n2. The 3.5 searches/user/day might be too high for global average including low-connectivity regions\n\nAdjusted: If 60% of Google users are active on any given day: 4.8B × 0.60 = 2.88B daily active searchers × 3.5 searches = 10.1B/day ÷ 86,400 = ~117,000/second.\n\nThe canonical answer the interviewer wants: approximately 100,000 searches per second.',
      keyAssumptions: [
        '91% Google search market share globally — consistent with StatCounter data',
        '60% daily active rate among Google users — many people go days without searching',
        '3.5 average searches per daily active user — a typical day involves searching for directions, facts, how-to, news, shopping',
        '86,400 seconds/day — uniform distribution (searches are roughly uniform globally due to timezone spread)',
      ],
      finalEstimate: 'Range: 80,000–130,000 searches per second; point estimate ~100,000/second',
      sanityChecks: [
        'Annual check: 100k/second × 86,400 seconds × 365 days = 3.15 trillion searches/year. Google\'s historical "2 trillion/year" was from 2016; growth to 3T by 2024 is plausible.',
        'Revenue per search: Google\'s 2023 search revenue ≈ $175B. At 3T searches/year: $175B ÷ 3T = $0.058 per search. Industry CPC on Google averages $2-3 but click-through rate on ads is ~2-5% → revenue per search ≈ $2.50 × 3% ≈ $0.075. Close to our implied $0.058. Consistent.',
        'Server load check: Google reportedly has ~1M servers. At 100k searches/second and ~10ms processing time per search: 100k × 0.01 seconds = 1,000 server-seconds needed per second → ~1,000 servers actively processing. With parallelism and the remaining 999k servers on standby/other services — plausible.',
      ],
    },

    strongAnswerMarkers: [
      'Segments users by engagement level (heavy/regular/light) rather than applying one flat rate',
      'Applies a daily active rate rather than treating all 4.8B Google users as daily searchers',
      'Converts correctly from daily total to per-second (divides by 86,400)',
      'Arrives at the ~100,000/second order of magnitude through structured reasoning',
      'Cross-validates via revenue per search as a sanity check',
    ],

    commonMistakes: [
      'Using the global internet user count as if all 5.3B search Google every day — overstates by 2-3x',
      'Dividing by hours in a day (24) to get per-hour and forgetting to divide by 3,600 to get per-second',
      'Using only 1 search/user/day — underestimates; power users dramatically pull up the average',
      'Not knowing that 86,400 = 24 × 60 × 60 seconds in a day — this is a fundamental constant you should know',
      'Anchoring on the "2 trillion/year" figure from 2016 without noting it was cited 8+ years ago and search volume has grown since',
    ],
    failureMode: {
      weakAnswer: 'The candidate takes 5 billion daily Google users × 3 searches/day = 15 billion searches/day, then divides by 24 to get ~625 million searches per hour and states that as the per-second answer. They divide by hours instead of seconds, landing at a number 3,600x too high — and never catch the error with a sanity check.',
      interviewerFollowUp: '"You got 625 million searches per second. That would mean Google processes more searches every second than there are people on Earth. What\'s the conversion you missed — and once you fix it, does your final per-second estimate feel reasonable?"',
    },
  },

  {
    id: 'EST07',
    title: 'Airbnb Cost to Acquire a New Host',
    subtitle: 'Cost Estimation · Marketplace Growth',
    difficulty: 'senior',
    isFree: false,
    tags: ['Airbnb', 'CAC', 'marketplace', 'supply-side', 'funnel'],
    category: 'cost-estimation',
    approach: 'bottom-up',

    prompt: 'Estimate Airbnb\'s cost to acquire one new active host in the United States.',

    frameworkSteps: [
      'Step 1 — Map the acquisition channels: Identify how new hosts find out about Airbnb (referral, paid, organic, outbound sales).',
      'Step 2 — Estimate cost per acquisition per channel: Each channel has a different unit economics profile.',
      'Step 3 — Weight by channel mix: Estimate what % of new hosts come from each channel.',
      'Step 4 — Adjust for activation rate: Not every new host signup becomes an active host (completes a listing and receives a booking).',
      'Step 5 — Sanity check: Compare to host LTV to assess whether the CAC makes strategic sense.',
    ],

    hints: [
      'Airbnb\'s strongest supply acquisition channel historically is host-to-host referral (someone who stayed as a guest becomes a host, or a host refers a friend). This channel has near-zero marginal cost.',
      'Paid digital ads for host acquisition (Facebook, Google "List your home on Airbnb") cost significantly more than guest acquisition because the supply funnel is smaller and higher-friction.',
      'Enterprise/direct sales teams are used for large property managers (multi-unit listings) — these deals are expensive to close but produce many listings each.',
      'An important adjustment: the ratio of host signups to active listings. Many hosts sign up but never complete onboarding or receive a booking.',
      'Host LTV context: An average US Airbnb host earns ~$14,000/year. Airbnb\'s take rate is ~14% → ~$1,960/year in revenue per active host.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Define acquisition channels and estimate mix (for US new host acquisition):\n\nChannel A — Referral / Word-of-mouth: A guest who loved their Airbnb experience and decides to list their own home. Also host referrals to friends. Cost: effectively $0 marginal CAC (brand/product cost amortized broadly). Estimated mix: ~40% of new host signups.\n\nChannel B — Paid digital: Facebook/Instagram and Google campaigns targeting homeowners ("Earn extra income"). Cost per lead (someone who starts an application): ~$30-50. Cost per signup (completes the basic host profile): ~$80-120. Estimated mix: ~35% of new host signups.\n\nChannel C — Organic / SEO / PR: Airbnb blog posts, press coverage, word-of-mouth discovery. Near-zero marginal cost. Estimated mix: ~15%.\n\nChannel D — Direct sales / partnerships: Airbnb\'s "Superhosts for Hire" type programs, property manager outreach, relocation company partnerships. Cost per acquisition very high (~$500-1,000+) but yields high-value multi-listing hosts. Estimated mix: ~10%.\n\nStep 2: Blended CAC at signup:\n(40% × $0) + (35% × $100) + (15% × $20) + (10% × $750)\n= $0 + $35 + $3 + $75 = $113 per host signup.\n\nStep 3: Adjust for activation rate.\nNot all signups become active. A host "signs up" = creates a profile. An active host = completes a verified listing AND receives at least one booking within 90 days. Estimated activation rate: ~50-60% (many people explore the idea but don\'t follow through with professional photos, listing copywriting, calendar management). Use 55%:\n\nTrue CAC per active host = $113 ÷ 0.55 = ~$205 per active host.\n\nRange: $150-$300 per active host.\n\nLTV check: Active US host earns ~$14k/year. Airbnb take rate: ~14% → $1,960/year revenue to Airbnb. Average host stays active ~3.5 years → LTV = $1,960 × 3.5 = $6,860. CAC/LTV ratio = $205 / $6,860 = ~3%. This is an excellent CAC:LTV ratio (conventional threshold is CAC < LTV/3, i.e., ratio < 33%). Airbnb\'s host supply economics are highly attractive — the product itself (earning $14k/year) is the best marketing.',
      keyAssumptions: [
        '40% referral/organic split — Airbnb is a strong network-effects platform; most supply growth in mature markets is organic',
        '$100 blended CPL for paid channels — competitive for a high-intent, low-frequency decision (listing your home)',
        '55% activation rate — many prospective hosts drop off during photo requirements, pricing setup, or calendar configuration',
        '$14k/year average US host earnings — derived from Airbnb\'s published "hosts earn an average of $14,000/year" claims',
        '14% Airbnb take rate — published service fee structure',
      ],
      finalEstimate: 'Range: $150–$300 per new active host; point estimate ~$200',
      sanityChecks: [
        'LTV/CAC check: Host LTV ≈ $6,860 over 3.5 years. CAC of $200 gives LTV/CAC = 34x. Extremely healthy — consistent with Airbnb prioritizing supply growth as a strategic investment.',
        'Compare to guest CAC: Airbnb\'s guest CAC is estimated at $15-30 (more competition, higher volume). Host CAC being 7-10x higher makes sense — it\'s a higher-friction, higher-commitment conversion.',
        'Airbnb S-1 check: Airbnb\'s sales & marketing spend was ~$1.5B in 2023 across both host and guest acquisition. They have ~4M active hosts globally. If 10% are new in a year (400k new hosts) and marketing is split 30/70 guest/host: $1.5B × 30% / 400k = $1,125/new host. This seems high — but includes brand spend, PR, and customer retention. Marginal paid acquisition per new host is much lower. The $200 estimate reflects marginal (not fully-loaded) CAC.',
      ],
    },

    strongAnswerMarkers: [
      'Breaks acquisition into 4 distinct channels with different cost structures rather than using one blended number',
      'Applies an activation rate adjustment — distinguishing "signup" from "active host"',
      'Benchmarks CAC against LTV to assess whether the economics make sense strategically',
      'Notes that referral/organic channels dominate in mature marketplace businesses — the product IS the acquisition',
      'Gives a range and explains the key drivers (channel mix and activation rate)',
    ],

    commonMistakes: [
      'Treating "host signup CAC" and "active host CAC" as the same number — activation rate is a crucial adjustment',
      'Using guest CAC as a proxy for host CAC — supply-side acquisition is fundamentally different and typically more expensive',
      'Ignoring the referral/organic channel — overestimates paid CAC by missing the free channels',
      'Not doing the LTV/CAC sanity check — without it, you can\'t tell whether your CAC estimate is strategically plausible',
      'Using total marketing spend ÷ new hosts — conflates host and guest acquisition spend, and includes retention/brand spend',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates Airbnb\'s total marketing spend (~$500M), assumes half goes to host acquisition, divides by new hosts added per year, and declares that the CAC. They never adjust for activation rate (many signed-up hosts never list), never segment by paid vs. organic channels, and skip the LTV/CAC sanity check entirely.',
      interviewerFollowUp: '"You got $250 CAC per new host signup. An Airbnb host who lists for 2 years at $10,000 annual gross bookings generates roughly $2,000–3,000 in Airbnb revenue. Does a $250 CAC pass a basic LTV/CAC test — and what does your number actually measure versus what the question is asking for?"',
    },
  },

  {
    id: 'EST08',
    title: 'Instagram Revenue Per US User Per Year',
    subtitle: 'Product Metrics · Social Media Monetization',
    difficulty: 'senior',
    isFree: false,
    tags: ['Instagram', 'ARPU', 'Meta', 'advertising', 'monetization'],
    category: 'product-metrics',
    approach: 'top-down',

    prompt: 'Estimate how much annual revenue Instagram generates per monthly active user in the United States.',

    frameworkSteps: [
      'Step 1 — Estimate Instagram US revenue: Use Meta\'s US advertising revenue and Instagram\'s estimated share of it.',
      'Step 2 — Estimate Instagram US MAU: How many monthly active users does Instagram have in the US?',
      'Step 3 — Divide to get ARPU: Revenue ÷ MAU = annual ARPU.',
      'Step 4 — Triangulate via CPM/engagement: Cross-check by estimating ad impressions × CPM.',
      'Step 5 — Benchmark: Compare to other platforms (YouTube, LinkedIn, TikTok) to sense-check the number.',
    ],

    hints: [
      'Meta\'s total US & Canada revenue was ~$56B in 2023, split between Facebook, Instagram, and WhatsApp (minimal).',
      'Instagram generates roughly 30-40% of Meta\'s total global revenue.',
      'Instagram US MAU is approximately 160-170 million users as of 2023.',
      'Meta publishes ARPU by geography in its quarterly earnings. US/Canada ARPU across all Meta products was ~$68/user/quarter (~$272/year) in 2024.',
      'If you know Meta\'s US/Canada revenue and Instagram\'s share of it, dividing by Instagram MAU gives you the Instagram-specific ARPU.',
    ],

    modelAnswer: {
      walkthrough: 'Approach 1: Top-down from Meta financials.\n\nMeta total revenue 2023: ~$135B globally. Meta US & Canada revenue: ~$63B (roughly 46% of global, consistent with Meta\'s earnings reports).\n\nInstagram\'s share of Meta revenue: Instagram accounts for approximately 35% of Meta\'s total revenue (it\'s the higher-CPM, younger-demographic platform; Facebook is larger by users but increasingly older and lower-CPM). Instagram global revenue: $135B × 35% = $47B. Instagram US revenue: proportional to the US share of Instagram\'s global user base — US is ~7.5% of Instagram\'s ~2B global MAU. But US commands a CPM premium of ~10x vs. emerging markets. Revenue-weighted US share: approximately $47B × 30% = $14B from the US (US is 7.5% of users but ~30% of revenue due to CPM premium).\n\nInstagram US MAU: ~170M.\n\nInstagram ARPU (US): $14B ÷ 170M = $82 per user per year.\n\nApproach 2: Bottom-up via ad impressions.\n\nAn average Instagram user in the US spends ~30 minutes/day on the app. In 30 minutes of scrolling, a user sees approximately 20-25 ad impressions (roughly 1 ad per ~8 posts in the feed/stories/Reels). Daily ad impressions per user: ~22. Annual impressions per user: 22 × 365 = ~8,030 impressions/user/year.\n\nInstagram US CPM (cost per thousand impressions): ~$7-$12. Use $9. Revenue per user per year: (8,030/1,000) × $9 = $72.27/user/year.\n\nBoth approaches converge around $75-$90/user/year.\n\nBenchmarking:\n- YouTube US ARPU: ~$30-40/user/year (lower because ads are skippable, CPMs lower)\n- LinkedIn US ARPU: ~$80-120/user/year (higher CPM B2B audience)\n- TikTok US ARPU: ~$20-30/user/year (newer, still scaling monetization)\n- Facebook US ARPU: ~$70-80/user/year (Instagram and Facebook are similar)\nInstagram at ~$80-90 looks reasonable — above YouTube (visual/intent-driven), similar to Facebook, below LinkedIn.\n\nFinal: ~$85/user/year.\n\nEngagement value check: At 30 min/day and $85/year ARPU, Instagram generates $85 / (30 min × 365 days / 60 min/hour) = $85 / 182.5 hours = $0.47 per hour of user attention. Compare: LinkedIn ~$2-3/hour, YouTube ~$0.10-0.15/hour. Instagram\'s $0.47/hour reflects its high-intent shopping audience vs. YouTube\'s scale but lower commercial intent.',
      keyAssumptions: [
        'Instagram = 35% of Meta global revenue — consistent with published analyst estimates (eMarketer, Bernstein)',
        'US = 30% of Instagram revenue despite 7.5% of users — reflects the 10x US/emerging market CPM differential',
        'Instagram US MAU = 170M — published by Meta indirectly; consistent with Pew and Statista surveys',
        '22 ad impressions/day per US user — based on 30-min session × 1 ad per 8-post scroll cadence',
        '$9 CPM for Instagram US — mid-range estimate; Instagram CPMs range $5-15 depending on format and targeting',
      ],
      finalEstimate: 'Range: $75–$100 per US monthly active user per year; point estimate ~$85',
      sanityChecks: [
        'Meta US/Canada ARPU published in Q4 2023 earnings: ~$68/quarter × 4 = $272/year per user across ALL Meta products (Facebook + Instagram + Messenger + WhatsApp). Instagram being ~35% of that for its own users: this approach suggests different user bases, not directly comparable. The $85 Instagram-specific ARPU is plausible if Instagram users in the US generate above-average Meta-wide revenue.',
        'Market share check: US digital ad market ~$250B in 2023. Instagram US revenue of $14B = 5.6% share. Given Instagram\'s dominant position in visual advertising, 5-6% of total digital ad spend is plausible (Google Search is ~28%, Facebook ~14%, YouTube ~5%).',
        'Advertiser check: Average small US advertiser spends ~$1,000-5,000/month on Instagram. If 500k advertisers spend avg $3,000/month: $3k × 12 × 500k = $18B. Consistent with $14B estimate (not all 500k advertise at that level year-round).',
      ],
    },

    strongAnswerMarkers: [
      'Uses two independent methods (top-down Meta financials and bottom-up CPM × impressions) and reconciles them',
      'Correctly applies the US revenue concentration premium — US generates far more than its population share',
      'Benchmarks Instagram ARPU against comparable platforms (YouTube, LinkedIn, TikTok)',
      'Calculates revenue per hour of attention and explains the economic intuition',
      'Notes the distinction between Meta-wide ARPU (published) and Instagram-specific ARPU (requires allocation)',
    ],

    commonMistakes: [
      'Using Meta\'s total ARPU ($272/year for US/Canada) as Instagram\'s ARPU — conflates all products',
      'Applying Instagram\'s global user share (7.5%) as the revenue share — ignores the massive US CPM premium',
      'Not knowing that Meta publishes US/Canada ARPU in quarterly earnings — you should know this metric',
      'Using global Instagram ARPU rather than US-specific — the US number is 8-12x the global average',
      'Forgetting to benchmark against comparable platforms — ARPU estimates without a benchmark have no reality check',
    ],
    failureMode: {
      weakAnswer: 'The candidate takes Meta\'s US total ARPU of ~$272/year, notes Instagram has ~2B global MAU out of Meta\'s ~3B, estimates Instagram\'s share as 67% of Meta\'s revenue, and applies that to US users — arriving at ~$182/year per US Instagram user. They confuse global user share with US revenue share and use Meta\'s aggregate ARPU rather than building up from ad impressions and CPMs.',
      interviewerFollowUp: '"You used Meta\'s total US ARPU as a proxy for Instagram specifically. But Facebook and Instagram have very different US user bases and advertiser demand dynamics. If US Instagram MAU is ~165M and Instagram\'s US revenue is roughly $30B, what does that imply per-user — and how far is that from your estimate?"',
    },
  },

  {
    id: 'EST09',
    title: 'How Many WhatsApp Messages Are Sent Per Day?',
    subtitle: 'Product Metrics · Messaging',
    difficulty: 'senior',
    isFree: false,
    tags: ['WhatsApp', 'messaging', 'Meta', 'global-scale', 'product-metrics'],
    category: 'product-metrics',
    approach: 'bottom-up',

    prompt: 'Estimate how many WhatsApp messages are sent globally per day.',

    frameworkSteps: [
      'Step 1 — Estimate WhatsApp MAU and DAU: How many people use WhatsApp, and how many of those are active on any given day?',
      'Step 2 — Estimate messages per DAU per day: What is the average number of messages a daily active WhatsApp user sends?',
      'Step 3 — Compute total: DAU × messages/user = total messages/day.',
      'Step 4 — Sanity check: Compare against WhatsApp\'s disclosed figures and comparable platforms.',
    ],

    hints: [
      'WhatsApp reported ~2 billion monthly active users in 2020 and has grown since. It is the dominant messaging app in most non-US markets.',
      'WhatsApp users are concentrated in high-engagement markets: India (~500M users), Brazil (~120M), Indonesia, Nigeria, and Europe.',
      'Daily active rate for a messaging app is higher than for social media — around 70-75% of MAU use it on a given day.',
      'WhatsApp includes group chats, which dramatically increase per-session message volume. A single group message counts once for sends but could reach 100+ recipients.',
      'WhatsApp has historically disclosed 100 billion messages per day (in 2020). By 2024, the figure is likely higher.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Estimate WhatsApp DAU.\n\nWhatsApp MAU: ~2.4 billion as of 2024.\nDaily active rate: ~72% (messaging apps have higher daily engagement than social media because they are utility-like communication tools, not entertainment feeds).\nDAU = 2.4B × 0.72 = ~1.73B daily active users.\n\nStep 2: Estimate messages sent per DAU per day.\n\nSegment WhatsApp users by messaging intensity:\n- Heavy users (primarily in South Asia, Brazil, Nigeria, teens and young adults): ~30% of DAU. Use WhatsApp as their primary communication channel. Estimate 40 messages/day (includes group chats, voice message transcription replies, business interactions).\n- Moderate users (Europe, Southeast Asia, everyday communication): ~45% of DAU. Estimate 15 messages/day.\n- Light users (business contacts only, occasional personal): ~25% of DAU. Estimate 4 messages/day.\n\nWeighted average messages/DAU: (0.30 × 40) + (0.45 × 15) + (0.25 × 4) = 12 + 6.75 + 1 = ~20 messages/user/day.\n\nStep 3: Total messages per day.\n1.73B DAU × 20 messages = ~34.6 billion messages/day.\n\nStep 4: Sanity check.\nWhatsApp disclosed 100 billion messages/day in 2020. Our 35B estimate is 3x lower. The discrepancy likely reflects two things: (1) WhatsApp may count received messages, not just sent — a group of 50 people counts each message as 50 received, 1 sent. If the ratio is sent:received = 1:3 on average, our 35B sent becomes ~105B total. (2) Message count may include read receipts, delivery notifications, and status updates.\n\nIf the question is "sent messages" (1 per user action), ~35B is the right range. If the question is "messages processed by servers" (including delivery to all recipients), 100B+ is consistent.\n\nFinal answer: ~35B messages sent per day, or ~100B messages delivered/processed per day. State both and explain the difference.',
      keyAssumptions: [
        '2.4B MAU — Meta has not disclosed a more recent figure but organic growth in emerging markets is steady',
        '72% daily active rate — messaging apps have near-utility engagement in high-volume markets',
        '20 messages/user/day — conservative; heavy group chat users exceed this but light users bring the average down',
        'Sent vs. delivered distinction — critical for matching against WhatsApp\'s disclosed 100B figure',
      ],
      finalEstimate: 'Range: 30B–40B messages sent per day; ~100B messages delivered (counting each recipient)',
      sanityChecks: [
        'WhatsApp disclosed 100B messages/day in 2020. Adjusting for sent vs. delivered, our estimate is consistent.',
        'SMS comparison: at peak, global SMS volume was ~23B messages/day (2012). WhatsApp overtook SMS by 2014 and has grown since — 35B+ sent is plausible.',
        'Telegram discloses ~700M MAU and is a distant second in engagement to WhatsApp in most markets. WhatsApp should be 3x higher in message volume given its user base advantage.',
      ],
    },

    strongAnswerMarkers: [
      'Distinguishes between messages sent (1 per user action) and messages delivered (1 per recipient) — explains why WhatsApp\'s disclosed 100B figure is not in conflict',
      'Segments users by intensity rather than applying a flat messages/day estimate',
      'Notes that group chats inflate message volume asymmetrically (1 sent → N delivered)',
      'Benchmarks against WhatsApp\'s disclosed figures and other messaging platforms',
    ],

    commonMistakes: [
      'Treating WhatsApp like a social media feed — messaging apps have much higher DAU rates and interaction frequency',
      'Not knowing WhatsApp\'s approximate user base (2B+) — a specific, disclosed number that an interviewer will expect you to know',
      'Confusing "sent" with "delivered" when citing the 100B figure — this causes apparent contradiction with a bottom-up estimate',
      'Ignoring group chats — they account for a large share of messages in high-engagement markets',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates WhatsApp has ~500M DAU (significantly underestimating the 2B+ user base), applies 5 messages per user per day, and gets 2.5 billion daily messages. They miss group chat multipliers, undercount the user base by 4x, and never triangulate against the publicly-known ~100 billion messages/day figure.',
      interviewerFollowUp: '"You got 2.5 billion messages per day. WhatsApp has publicly stated they deliver approximately 100 billion messages per day. Your estimate is 40x below that. What is the most important variable you underestimated — and by how much would adjusting just the user count move your answer?"',
    },
  },

  {
    id: 'EST10',
    title: 'How Much Storage Does Netflix Need for Its Entire Catalog?',
    subtitle: 'Infrastructure · System Scale',
    difficulty: 'senior',
    isFree: false,
    tags: ['Netflix', 'storage', 'infrastructure', 'system-design', 'video'],
    category: 'infrastructure',
    approach: 'bottom-up',

    prompt: 'Estimate how much total cloud storage Netflix requires to host its entire streaming video catalog.',

    frameworkSteps: [
      'Step 1 — Estimate Netflix\'s catalog size: How many hours of content does Netflix have?',
      'Step 2 — Estimate file size per hour of video: How large is one hour of Netflix video, accounting for encoding formats and quality levels?',
      'Step 3 — Multiply: Total storage = catalog hours × file size per hour.',
      'Step 4 — Apply redundancy/replication multiplier: Netflix replicates data across multiple regions for availability.',
      'Step 5 — Sanity check: Compare against Netflix\'s disclosed infrastructure usage.',
    ],

    hints: [
      'Netflix reported ~36,000 hours of content as of 2023 (TV episodes + movies + originals).',
      'Netflix encodes every piece of content in multiple formats: different resolutions (480p, 720p, 1080p, 4K), different codecs (H.264, H.265/HEVC, AV1), and different bitrates for adaptive streaming.',
      'A typical 1-hour episode at 4K HEVC might be 5–8 GB. At 1080p H.264, it might be 3–5 GB. Netflix maintains ~1,000 different encoding profiles per title.',
      'Netflix uses Amazon S3 as its primary storage layer and has disclosed heavy investment in AWS infrastructure.',
      'Netflix stores at least 3 copies of each file for redundancy (distributed across regions). Originals may be stored with higher redundancy.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Catalog size.\nNetflix reported ~36,000 hours of content in 2023 — this includes movies (~15,000 movies × ~1.8 hours average), TV series (~5,000 series × ~2 seasons × ~8 episodes × 0.7 hours), and documentaries/specials.\n\nStep 2: File size per hour per encoding profile.\nNetflix encodes content in roughly 4 quality tiers:\n- 4K HDR (HEVC/H.265): ~6 GB/hour\n- 1080p (H.265): ~3.5 GB/hour\n- 720p (H.264): ~1.5 GB/hour\n- 480p/360p mobile (H.264/AV1): ~0.5 GB/hour\n\nNetflix maintains ~1,000 encoding profiles per title when you include different device types, adaptive bitrate rungs, language versions, and accessibility tracks (audio descriptions, subtitles embedded in various formats). However, many of these are smaller variants — the primary storage is driven by the top 4-5 quality tiers.\n\nSimplified: 5 main quality tiers averaging ~2.5 GB/hour = 12.5 GB/hour per title across all tiers.\n\nStep 3: Raw catalog storage.\n36,000 hours × 12.5 GB/hour = 450,000 GB = ~450 TB of content before replication.\n\nStep 4: Replication multiplier.\nNetflix replicates data across at least 3 AWS regions for redundancy. Originals (~30% of catalog) may have additional backups. Use a 3.5× replication multiplier:\n450 TB × 3.5 = ~1,575 TB ≈ 1.6 petabytes.\n\nStep 5: Add operational data.\nNetflix also stores user data, analytics, thumbnail images (multiple sizes per title per user context), recommendation model artifacts, and encoding pipeline data. This likely adds another 20-30% on top of raw video. Total: ~2 petabytes.\n\nRange: 1.5–3 petabytes of total storage.\n\nSanity check: Netflix has disclosed using AWS S3 at massive scale. A 2015 Netflix blog post mentioned storing data at petabyte scale. Our 2 PB estimate for current catalog is consistent with publicly discussed infrastructure scale. Netflix\'s actual catalog is larger if you include raw footage, but for final-encoded streaming assets, 1.5–3 PB is the right order of magnitude.',
      keyAssumptions: [
        '36,000 hours of final encoded content — Netflix\'s publicly disclosed catalog size',
        '5 encoding profiles at 12.5 GB/hour average — simplified from ~1,000 profiles; captures dominant storage cost',
        '3.5× replication factor — standard for high-availability distributed storage at Netflix\'s SLA requirements',
        'Excludes raw production footage — the question is streaming-ready encoded catalog',
      ],
      finalEstimate: 'Range: 1.5–3 petabytes for streaming catalog; ~2 PB central estimate',
      sanityChecks: [
        '2 PB at $0.023/GB/month (S3 standard) = ~$46M/month storage cost. Netflix\'s total AWS bill is estimated at ~$1.7B/year. Storage at ~$550M/year is ~32% of that — high but plausible given video-heavy workload.',
        'Compare: YouTube hosts ~1 billion hours of video — orders of magnitude larger than Netflix. YouTube reportedly uses ~1 exabyte (1,000 PB). Netflix at 1-3 PB for 36,000 hours is proportionally consistent.',
        'Netflix\'s original content is much higher quality than user-generated video. Per-hour storage cost is higher.',
      ],
    },

    strongAnswerMarkers: [
      'Distinguishes encoding profiles (multiple per title) from raw catalog hours — explains why storage is much larger than catalog hours × one file size',
      'Applies a replication multiplier explicitly — storage estimates without redundancy understate real infrastructure cost',
      'Knows Netflix\'s approximate catalog size (~36,000 hours) — shows product knowledge',
      'Arrives at petabyte scale and sanity checks against storage cost relative to Netflix\'s known AWS spend',
    ],

    commonMistakes: [
      'Estimating one file per title — Netflix stores ~1,000 encoding variants per title for adaptive bitrate and multi-device support',
      'Forgetting replication — cloud storage for production systems is replicated 3+ times; single-copy estimates are wrong',
      'Estimating in GB instead of TB/PB — not recognizing that 36,000 hours of multi-profile video is petabyte scale',
      'Confusing catalog hours with total watchtime — catalog hours is what Netflix stores; watchtime per day is a different metric',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates Netflix has 36,000 hours of content, stores one file per hour at 4 GB/hour, and arrives at ~144 TB of total storage. They store one encoding variant per title, forget the 1,000-variant multiplier for adaptive bitrate streaming across all devices, and never apply the 3x replication factor — missing the actual answer by roughly 1,000x.',
      interviewerFollowUp: '"You got 144 TB. Netflix runs on AWS and has disclosed their infrastructure is at exabyte scale. If you store 1,000 encoding profiles per hour of content instead of one, and replicate 3x, what does your storage estimate become — and does that scale make more sense for a service with 260 million subscribers?"',
    },
  },

  {
    id: 'EST11',
    title: 'How Much Does It Cost Uber to Complete One Ride?',
    subtitle: 'Unit Economics · Marketplace',
    difficulty: 'senior',
    isFree: false,
    tags: ['Uber', 'unit-economics', 'cost-structure', 'marketplace', 'driver-pay'],
    category: 'unit-economics',
    approach: 'bottom-up',

    prompt: 'Estimate the fully loaded cost to Uber of completing one average ride in the United States.',

    frameworkSteps: [
      'Step 1 — Identify cost categories: What does Uber actually spend to fulfill a single ride?',
      'Step 2 — Estimate driver pay per ride: This is the largest variable cost component.',
      'Step 3 — Estimate platform overhead per ride: Payments processing, insurance, tech infrastructure, customer support.',
      'Step 4 — Allocate fixed costs per ride: S&M, R&D, G&A amortized over ride volume.',
      'Step 5 — Sanity check: Cross-check against Uber\'s disclosed financial metrics.',
    ],

    hints: [
      'The average Uber ride in the US is ~$20 gross booking value. Uber\'s take rate is roughly 25-30%.',
      'Driver pay is the largest variable cost — drivers receive approximately 70-75% of the fare (before Uber\'s service fee).',
      'Uber provides $1M liability coverage per ride. Insurance is a significant cost per trip.',
      'Payments processing fees run at approximately 2-3% of gross booking value.',
      'Uber\'s adjusted EBITDA margin in 2023 was ~4% of gross bookings. Their adjusted EBITDA margin per trip was roughly $0.80.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Establish the baseline.\nAverage US Uber ride: ~$20 gross booking value.\nUber net revenue (take rate): ~27% × $20 = $5.40 per ride.\nDriver pay: ~73% × $20 = $14.60 per ride (this is the direct cost paid out of gross bookings).\n\nNote: Uber\'s P&L shows "Cost of Revenue" as a % of net revenue (the $5.40), not gross bookings. I\'ll work from gross bookings for clarity.\n\nStep 2: Variable costs per ride.\n\nDriver pay: $14.60 (already established — this is the largest cost)\nInsurance (per-trip): Uber provides commercial auto insurance while the driver is in trip. Commercial rideshare insurance in the US is estimated at ~$0.35–0.50/ride on average. Use $0.45.\nPayment processing: ~2.5% of $20 = $0.50.\nDriver incentives/bonuses (surge, guarantees): ~3-4% of gross bookings annualized = ~$0.70.\nFraud and chargebacks: ~0.5% of net revenue = ~$0.03.\nEstimated variable cost: $14.60 + $0.45 + $0.50 + $0.70 + $0.03 = ~$16.28.\n\nStep 3: Allocate overhead per ride.\nUber had ~2.2B trips in 2023 in mobility. Total revenue (net) was ~$14.2B.\n\nCost of revenue (support, infrastructure): ~38% of net revenue = $5.40 × 0.38 = $2.05/ride.\nBut most of this is driver pay and insurance already counted. Incremental overhead (customer support, maps/routing tech, AWS): ~$0.35/ride.\n\nSales & marketing: ~16% of net revenue = $5.40 × 0.16 = $0.86/ride.\nR&D: ~15% of net revenue = $0.81/ride.\nG&A: ~9% of net revenue = $0.49/ride.\n\nTotal overhead per ride: $0.35 + $0.86 + $0.81 + $0.49 = $2.51.\n\nStep 4: Fully loaded cost per ride.\nVariable costs: $16.28\nOverhead allocation: $2.51\nTotal: $18.79 per ride.\n\nRevenue (net): $5.40 per ride.\nGross bookings: $20 per ride.\n\nThe math: Uber retains $5.40 from a $20 ride. Their adjusted EBITDA was ~$1.1B on ~$14.2B net revenue in 2023 = ~7.7% of net revenue = ~$0.42/ride in EBITDA. That means total costs from net revenue perspective are $5.40 − $0.42 = $4.98 per ride. Adding back driver pay ($14.60) gives fully loaded cost of ~$19.58 per ride.\n\nFinal estimate: ~$18–20 fully loaded cost per ride, leaving $0–$2 in net economics.',
      keyAssumptions: [
        '$20 average gross booking value — mid-range for US UberX; actual average is in the $18–22 range based on disclosed data',
        '27% take rate — Uber\'s disclosed "take rate" (net revenue / gross bookings)',
        '$0.45 insurance cost per ride — based on industry data for commercial rideshare auto insurance',
        'Overhead allocation via % of net revenue — derived from Uber\'s 2023 10-K cost structure',
      ],
      finalEstimate: 'Fully loaded cost: ~$18–20 per ride; Uber earns $0–$2 margin per ride at current economics',
      sanityChecks: [
        'Uber adjusted EBITDA per trip: ~$0.35–0.50/trip in 2023. Our $0–$2 range is consistent — Uber was marginally profitable on a per-trip basis.',
        'Driver economics check: A driver earning $14.60 per ride, with a 20-minute average trip, earns ~$43.80/hour gross before fuel, depreciation, and self-employment tax (~30%). Net driver earnings: ~$25–30/hour — consistent with published driver surveys.',
        'Compare to food delivery: DoorDash\'s contribution margin per order is similarly thin (~$1–2 per order). Platform businesses at scale tend to have 5-10% contribution margins before corporate overhead.',
      ],
    },

    strongAnswerMarkers: [
      'Starts from gross booking value (not net revenue) and correctly allocates driver pay as the dominant cost',
      'Distinguishes between gross booking value, net revenue (take rate), and unit economics at each layer',
      'Applies a per-ride overhead allocation using Uber\'s disclosed cost structure ratios',
      'Arrives at thin margins ($0–$2/ride) and sanity-checks against Uber\'s disclosed EBITDA',
    ],

    commonMistakes: [
      'Treating Uber\'s "revenue" as gross bookings rather than net revenue — conflates gross booking value with what Uber actually recognizes',
      'Forgetting driver pay is the dominant cost (73-75% of gross booking) — understates variable cost',
      'Not accounting for insurance per ride — a non-trivial fixed variable cost in rideshare',
      'Computing profit as "take rate minus overhead" without recognizing that Uber\'s "take rate" net revenue still has significant COGS against it',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates an average Uber ride costs $22, assumes Uber\'s take rate is 25%, and says Uber earns $5.50 per ride — concluding the cost per ride must be below that. They never account for driver pay as a cost to Uber, never add insurance, support, and platform overhead, and confuse gross booking revenue with Uber\'s net revenue.',
      interviewerFollowUp: '"You said Uber earns $5.50 per ride from a $22 fare. But driver pay comes out of the gross booking before Uber\'s take. If the driver receives 73% of the $22 fare — $16 — what does that leave for Uber\'s gross booking net revenue, and how does that change the economics you described?"',
    },
  },

  {
    id: 'EST12',
    title: 'How Many Software Engineers Work at Google?',
    subtitle: 'Workforce Estimation · Tech Company',
    difficulty: 'analyst',
    isFree: false,
    tags: ['Google', 'workforce', 'headcount', 'engineering', 'org-design'],
    category: 'workforce',
    approach: 'top-down',

    prompt: 'Estimate how many software engineers currently work at Google (Alphabet).',

    frameworkSteps: [
      'Step 1 — Estimate total Google/Alphabet headcount: What is Alphabet\'s total employee count?',
      'Step 2 — Estimate the engineering fraction: What share of a tech company\'s workforce is software engineers?',
      'Step 3 — Cross-check via product surface area: Can you estimate how many engineers different Google products require?',
      'Step 4 — Sanity check: Alphabet has disclosed headcount in filings.',
    ],

    hints: [
      'Alphabet (Google\'s parent) had ~182,000 full-time employees at the end of 2023. They conducted significant layoffs (~12,000) in early 2023.',
      'Large tech companies typically have 30–40% of their workforce in engineering and technical roles.',
      'But "software engineer" is narrower than "technical role" — it excludes SREs, data scientists, TPMs, hardware engineers, and IT staff.',
      'Google operates search, YouTube, Google Cloud, Android, Maps, Gmail, Ads, Workspace, DeepMind, Waymo, and many other products. Each requires substantial engineering.',
      'A useful proxy: LinkedIn data often shows ~25–30% of Google employees list "software engineer" or "software development" titles.',
    ],

    modelAnswer: {
      walkthrough: 'Approach 1: Top-down from total headcount.\n\nAlphabet total headcount: ~182,000 employees as of end-2023.\n\nTechnical workforce breakdown:\n- Software engineers (SWE, SWE II, Senior SWE, Staff, Principal, L3-L9): ~27% of headcount\n- Site reliability engineers (SRE): ~3%\n- Hardware/EE engineers: ~3%\n- Data scientists and ML engineers: ~4%\n- TPMs and PMs: ~6%\n- Sales, ops, legal, finance, HR: ~35%\n- Other technical staff (IT, security, support): ~7%\n- Nontechnical ops (facilities, admin): ~15%\n\nSoftware engineers specifically: 182,000 × 0.27 = ~49,000.\n\nApproach 2: Bottom-up via product teams.\n\nGoogle\'s major products and their approximate engineering headcount:\n- Search + Ads infrastructure: ~8,000 engineers (search ranking, ads serving, quality, relevance)\n- Google Cloud (GCP): ~10,000 (fastest-growing segment with significant hiring in 2021-2022)\n- YouTube: ~4,000 (video pipeline, recommendation, ads)\n- Android + Pixel hardware software: ~5,000\n- Google Maps + Geo products: ~2,500\n- Gmail/Workspace: ~2,000\n- Chrome + V8: ~1,000\n- DeepMind + Google Brain (now Google DeepMind): ~3,000 researchers and engineers\n- Waymo: ~1,500\n- Platforms/infra (Borg, Kubernetes, Spanner, Bigtable, TensorFlow teams): ~5,000\n- Other (Verily, X, Fiber, misc): ~2,000\n- Internal tools + G Suite developer experience: ~3,000\n\nSum: ~47,000 software engineers.\n\nBoth approaches converge on ~45,000–50,000 software engineers.\n\nFinal estimate: ~45,000–55,000 software engineers at Google/Alphabet, with a point estimate of ~50,000.',
      keyAssumptions: [
        '182,000 total Alphabet headcount — from 2023 annual report (post-12k layoffs)',
        '27% software engineering fraction — based on LinkedIn title distribution analysis and tech company benchmarks',
        'Product team sizes — estimated from public hiring patterns, org charts, and product complexity',
        'Excludes contractors and TVCs (temps, vendors, contractors) — Google\'s TVC population is estimated at ~100,000+, many of whom are technical',
      ],
      finalEstimate: 'Range: 45,000–55,000 full-time software engineers; ~50,000 central estimate',
      sanityChecks: [
        'Revenue per engineer: Alphabet 2023 revenue = ~$307B. At 50,000 engineers: $6.1M revenue/engineer. Typical range for scaled tech companies is $1M–10M. $6.1M is toward the high end, consistent with Google\'s asset-light software business model.',
        'LinkedIn proxy: LinkedIn typically shows ~13,000-17,000 people listing current employment as Google with "software engineer" in title — but this undercounts due to people not updating profiles and privacy settings. A 3x correction gives ~45,000-50,000.',
        'Meta comparison: Meta had ~87,000 employees in 2023, roughly 40% engineering. ~35,000 engineers. Google is ~2x Meta\'s headcount, so ~50,000-70,000 Google engineers is plausible. Our 50k estimate sits at the low end of that range.',
      ],
    },

    strongAnswerMarkers: [
      'Uses two independent approaches (top-down headcount fraction + bottom-up product teams) and reconciles them',
      'Knows Alphabet\'s approximate total headcount (~180k) — a foundational fact for any Google sizing question',
      'Distinguishes SWE from other technical roles (SRE, data scientists, hardware) to answer the specific question asked',
      'Notes TVC workforce as a caveat — shows awareness that disclosed headcount undercounts technical capacity',
    ],

    commonMistakes: [
      'Estimating total Alphabet headcount as much lower (e.g., 50,000) — Google is very large; ~180,000 is publicly disclosed',
      'Applying a generic 40% engineering fraction — this is for total technical staff, not specifically software engineers',
      'Not distinguishing SWEs from SREs, data scientists, and hardware engineers — the question asks specifically about software engineers',
      'Forgetting to note that TVCs (contractor population) likely doubles the effective technical workforce',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates Google has about 50,000 total employees, applies a 60% engineering fraction, and arrives at ~30,000 software engineers. They significantly underestimate Google\'s total headcount (~180,000 FTE, publicly disclosed), conflate all technical roles with software engineers, and miss that SWEs are roughly 25-30% of total headcount, not 60%.',
      interviewerFollowUp: '"You estimated 30,000 software engineers. Google disclosed ~180,000 total employees in their most recent annual report. If SWEs are approximately 25-30% of headcount at large tech companies, what range do you get — and why did anchoring on 50,000 total employees lead you so far off?"',
    },
  },

  {
    id: 'EST13',
    title: 'Annual US Revenue of Uber Eats',
    subtitle: 'Market Sizing · Food Delivery',
    difficulty: 'senior',
    isFree: false,
    tags: ['Uber Eats', 'food delivery', 'revenue', 'marketplace', 'US market'],
    category: 'revenue',
    approach: 'top-down',

    prompt: 'Estimate the annual US revenue of Uber Eats.',

    frameworkSteps: [
      'Step 1 — Size the US food delivery market: Start with total US restaurant spending, then carve out the delivery segment.',
      'Step 2 — Estimate Uber Eats market share: What fraction of online food delivery does Uber Eats command vs. DoorDash, Grubhub, and others?',
      'Step 3 — Convert gross order value to net revenue: Apply Uber Eats\' take rate (commission + delivery fee + service fee).',
      'Step 4 — Sanity check against Uber\'s disclosed Delivery segment financials.',
    ],

    hints: [
      'US consumers spend roughly $1 trillion/year at restaurants total; third-party delivery captures about 12-15% of that.',
      'DoorDash holds ~67% of the US food delivery market; Uber Eats is second at ~23%; Grubhub is a distant third.',
      'Uber Eats\' effective take rate (net revenue as a % of Gross Bookings) is roughly 12-14%, because gross bookings include the full order value but Uber recognizes only its commission and fees.',
      'Uber\'s Delivery segment includes both Uber Eats food and grocery/alcohol delivery. US is roughly 45-50% of global Delivery gross bookings.',
      'Uber disclosed global Delivery gross bookings of ~$68B in 2023. Net revenue (take rate ~13%) ≈ $8.8B globally.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Size the US food delivery TAM.\n\nUS restaurant industry total spending: ~$900B/year (NRA estimate). Third-party delivery (DoorDash, Uber Eats, Grubhub) captures ~13% of that: $900B × 0.13 = $117B in gross order value (GOV) through delivery platforms in the US.\n\nStep 2: Uber Eats US market share.\nDoorDash: ~67% share → $78B GOV.\nUber Eats: ~23% share → $117B × 0.23 = ~$26.9B in US Gross Bookings.\nGrubhub + others: ~10%.\n\nStep 3: Uber Eats take rate.\nUber Eats charges restaurants a commission (15-30%, average ~25%) and charges consumers a delivery fee ($2-5) plus a service fee (~15% of subtotal). However, Uber Eats reports "net revenue" as what it keeps after paying out delivery partners. The disclosed take rate is roughly 12-14% of gross bookings for the Delivery segment.\n\nUsing 13% take rate: $26.9B × 0.13 = ~$3.5B in US net revenue for Uber Eats.\n\nAdd: Uber One subscription attributable to Delivery, advertising revenue from restaurants (Uber Eats Ads), and Grocery/convenience delivery. These add roughly 15-20% incremental. Total US Delivery net revenue ≈ $3.5B × 1.175 = ~$4.1B.\n\nRange: $3.5B–$4.5B in US net revenue.\n\nStep 4: Cross-check via Uber financials.\nUber disclosed global Delivery net revenue of ~$8.9B in 2023. US is ~45-50% of that → $4.0B–4.5B. Our bottom-up estimate of $4.1B aligns well.\n\nNote: Some interviewers may want "gross bookings" not net revenue. Make sure to clarify — $26.9B (gross) vs. $3.5-4.5B (net) are both valid answers to different questions.',
      keyAssumptions: [
        '$900B US restaurant spending with 13% going through delivery apps — industry standard estimate; delivery share has grown from 6% in 2019 to ~13-15% post-pandemic',
        '23% US market share for Uber Eats — based on Bloomberg Second Measure and Bloomberg data as of 2023',
        '13% take rate on gross bookings — derived from Uber\'s disclosed Delivery segment financials',
        'US = ~47% of global Delivery gross bookings — consistent with disclosed geographic mix',
        'Restaurant advertising adds ~15-20% on top of commission-based revenue — Uber Eats Ads is a fast-growing segment',
      ],
      finalEstimate: 'US Uber Eats net revenue: ~$3.5B–$4.5B per year; gross order value (bookings): ~$26B–$28B',
      sanityChecks: [
        'Uber global Delivery net revenue 2023: ~$8.9B × 47% US = ~$4.2B. Matches the estimate.',
        'DoorDash comparison: DoorDash US net revenue was ~$7.7B in 2023 with ~67% market share. Uber Eats at ~23% share should have proportional revenue: $7.7B × (23/67) = ~$2.6B. The gap vs. our $4.1B estimate likely reflects Uber Eats\' slightly higher take rate and grocery/convenience mix. Reasonable.',
        'Per-order check: If average Uber Eats order is ~$35 and there are 750M US orders/year (at $26.9B GOV / $35): 750M orders × $4.50 net per order = $3.4B. Consistent with lower bound.',
      ],
    },

    strongAnswerMarkers: [
      'Distinguishes gross order value (bookings) from net revenue clearly — knowing the ~13% take rate is essential',
      'Uses market share data correctly to split the delivery TAM between platforms',
      'Cross-validates using Uber\'s disclosed global Delivery segment and applies a geographic allocation',
      'Notes that grocery/convenience delivery and advertising are increasingly material revenue lines',
      'Provides both gross bookings and net revenue as answer frames, since interviewers may mean either',
    ],

    commonMistakes: [
      'Treating Uber Eats "revenue" as gross order value — Uber\'s net revenue is ~13% of gross bookings, not the full order value',
      'Assuming Uber Eats is the US market leader — DoorDash leads at 67%; Uber Eats is second at ~23%',
      'Forgetting the US is only ~half of Uber\'s global Delivery segment — don\'t apply global figures directly',
      'Not accounting for restaurant advertising revenue — Uber Eats Ads is a meaningful and fast-growing incremental revenue line',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates Uber Eats processes $20 billion in US gross order value annually and states that as the revenue. They conflate gross bookings with Uber\'s net revenue (which is ~13% of gross order value), assume Uber Eats has 50% US market share rather than 23%, and arrive at an estimate roughly 7x too high.',
      interviewerFollowUp: '"You said Uber Eats US revenue is $20 billion. Uber\'s entire global Delivery segment net revenue is approximately $6 billion. If the US is half of global, and you\'re reporting gross order value instead of net revenue, what two adjustments does your number need — and what does the corrected figure look like?"',
    },
  },

  {
    id: 'EST14',
    title: 'Airbnb Listings in Paris Right Now',
    subtitle: 'Market Sizing · Accommodation',
    difficulty: 'analyst',
    isFree: false,
    tags: ['Airbnb', 'Paris', 'listings', 'accommodation', 'market-sizing'],
    category: 'market-sizing',
    approach: 'bottom-up',

    prompt: 'How many Airbnb listings are there in Paris right now?',

    frameworkSteps: [
      'Step 1 — Estimate Paris\'s housing stock: Total apartments and houses in the city of Paris.',
      'Step 2 — Estimate short-term rental penetration: What share of Parisian housing is listed on Airbnb at any given time?',
      'Step 3 — Account for regulation and seasonality: Paris has strict short-term rental rules that limit supply.',
      'Step 4 — Cross-check via demand: How many tourists visit Paris, and how many use Airbnb — what supply does that imply?',
    ],

    hints: [
      'Paris (city proper, not Île-de-France) has a population of ~2.1 million people with an average household size of ~1.8, implying ~1.17 million housing units.',
      'France limits primary-residence short-term rentals to 120 nights per year. Paris additionally requires hosts to register. This significantly constrains supply vs. less-regulated cities.',
      'InsideAirbnb (a public research project) has scraped Paris Airbnb data periodically — their figures typically show 50,000–80,000 listings in Paris.',
      'Paris receives ~30 million tourists per year. Hotel capacity is ~80,000 rooms. Short-term rentals serve a significant overflow — estimate 20-25% of visitors use Airbnb.',
      'Active listings (had at least one review in the past year) are roughly 60-70% of total listed inventory on any platform.',
    ],

    modelAnswer: {
      walkthrough: 'Approach 1: Supply-side (housing stock penetration).\n\nParis housing stock: Population ~2.1M ÷ 1.8 people/household = ~1.17M housing units.\n\nShort-term rental penetration: In cities with heavy Airbnb adoption but regulatory constraints (like Paris), approximately 5-7% of housing units may be listed at some point. Paris is an extreme case — very high tourist demand but increasingly strict enforcement. Use 5.5%: 1.17M × 0.055 = ~64,000 total listings.\n\nBut regulation adjustment: Paris\'s 120-day cap and registration requirements mean many potential hosts don\'t list. About 20% of would-be hosts are deterred. After regulation adjustment: 64,000 × 0.80 = ~51,000.\n\nApproach 2: Demand-side (tourist arrivals).\n\nParis receives ~30M international + domestic tourists/year. Average stay: ~3.5 nights. Total tourist nights/year: 30M × 3.5 = 105M tourist nights/year.\n\nHotel supply: ~80,000 hotel rooms × 365 nights × 70% average occupancy = ~20.4M hotel nights absorbed.\nShort-term rental share: Hotels serve ~75% of visitor nights, STRs (Airbnb + VRBO + etc.) serve ~15%, friends/family/other ~10%.\nAirbnb nights/year: 105M × 0.15 = 15.75M nights via Airbnb.\n\nAirbnb listing count: At an average of 3 nights booked per listing per week and 70% of year active: 1 listing × 52 weeks × 3 nights/week × 0.70 = ~109 nights/year per active listing. Total listings: 15.75M ÷ 109 = ~144,000. This seems too high.\n\nRecalibrate: Many Paris Airbnb listings are only occasionally rented (primary residence hosts renting during vacation). Average annual booked nights per listing is lower — perhaps 40-50 nights/year. 15.75M ÷ 45 = ~350,000. Still very high.\n\nThe issue: Airbnb is not 15% of Paris tourist nights — it\'s closer to 7-8%. Hotel capacity includes high-end hotels (unavailable to Airbnb) and Airbnb serves a different price point. Adjust:\nAirbnb nights: 105M × 0.07 = 7.35M nights. At 45 nights/year per listing: 7.35M ÷ 45 = ~163,000. Still high vs. supply-side estimate.\n\nBest estimate: supply-side is more reliable given concrete housing stock data. ~50,000–80,000 listings total, with ~35,000–55,000 active (reviewed in past year).\n\nPublished benchmark: InsideAirbnb reported ~65,000 total Paris listings with ~40,000 active as of 2023. Our supply-side estimate of ~51,000 is consistent.',
      keyAssumptions: [
        '1.17M Paris housing units — derived from population ÷ household size; roughly in line with INSEE data',
        '5.5% STR penetration rate — reflects high tourist demand but regulatory suppression vs. 10-15% in less-regulated tourist cities',
        '80% host compliance rate with registration rules — some hosts evade regulation but enforcement is increasing',
        '30M annual tourist visits to Paris — widely cited tourism authority figure (OTCP)',
        '7% of Paris tourist nights via Airbnb — less than global average due to Paris\'s large hotel capacity',
      ],
      finalEstimate: 'Range: 50,000–80,000 total listings; ~40,000–55,000 active listings',
      sanityChecks: [
        'InsideAirbnb data (2023): ~65,000 total listings in Paris, ~40,000 active. Supply-side estimate of ~51,000–64,000 is directionally consistent.',
        'Revenue check: At avg $120/night × 45 nights/year × 65,000 listings = $351M in host revenue per year in Paris. Airbnb take rate ~14% → ~$49M revenue to Airbnb from Paris alone. For a top-3 global market, $50M/year is plausible.',
        'Regulation benchmark: Barcelona and Amsterdam both had ~20,000 active listings before heavy regulation then dropped to ~5,000-10,000 after bans. Paris sits in the middle (regulation but not a ban) — 40,000 active is consistent with a partially restricted major tourist city.',
      ],
    },

    strongAnswerMarkers: [
      'Uses housing stock as the supply-side anchor rather than jumping directly to a demand-based estimate',
      'Explicitly accounts for Paris\'s regulatory constraints (120-day cap, registration requirement)',
      'Distinguishes between total listings and active listings (reviewed in past year)',
      'Attempts a demand-side cross-check from tourist arrivals and reconciles the discrepancy',
      'Names InsideAirbnb as a public benchmark source and validates against it',
    ],

    commonMistakes: [
      'Ignoring Paris\'s regulatory environment — Paris is one of the most-regulated Airbnb markets globally; raw penetration rates from unregulated cities will overstate supply',
      'Confusing "total listed" with "active listings" — 30-40% of Airbnb inventory in any city is stale/inactive',
      'Using Paris metro (12M people) rather than Paris city proper (2.1M) — results in a 5x overcount of the addressable housing stock',
      'Not cross-checking demand-side vs. supply-side estimates — one approach alone leaves the estimate ungrounded',
    ],
    failureMode: {
      weakAnswer: 'The candidate uses the Paris metro area population of 12 million, applies a 3% STR penetration rate, and arrives at ~360,000 Airbnb listings. They ignore the 120-day annual cap on whole-unit listings, use metropolitan area instead of city proper, and never apply an active-listing discount for stale inventory — overstating the answer by roughly 8-10x.',
      interviewerFollowUp: '"You estimated 360,000 Airbnb listings in Paris. Paris city proper has about 1.4 million housing units and one of the strictest STR regulatory environments in Europe, with a 120-day annual cap. Given those two corrections alone, what is the ceiling on your estimate — and does 360,000 survive either check?"',
    },
  },

  {
    id: 'EST15',
    title: 'Data Generated by WhatsApp Globally in One Day',
    subtitle: 'Infrastructure · Messaging',
    difficulty: 'senior',
    isFree: false,
    tags: ['WhatsApp', 'data', 'infrastructure', 'messaging', 'scale'],
    category: 'infrastructure',
    approach: 'bottom-up',

    prompt: 'How much data does WhatsApp generate globally in one day?',

    frameworkSteps: [
      'Step 1 — Enumerate data types: WhatsApp carries text messages, images, videos, voice notes, documents, voice/video calls, and status updates. Each has a different data footprint.',
      'Step 2 — Estimate volume per data type: Use DAU and per-user-per-day estimates for each category.',
      'Step 3 — Estimate size per item: Text messages are tiny (KB); videos can be large (MB-scale).',
      'Step 4 — Sum across all types and sanity check against known bandwidth benchmarks.',
    ],

    hints: [
      'WhatsApp has ~2B MAU and ~1.4-1.5B DAU. It processes ~100B messages per day (counting deliveries to all recipients).',
      'Text messages are tiny — a typical WhatsApp text is 100-500 bytes. Even 100B texts/day is only ~10-50 TB of text data.',
      'Images are the dominant data category by volume: a compressed WhatsApp image is ~100-500 KB. If 5% of messages are images, that alone dwarfs text.',
      'Video is even larger — WhatsApp compresses videos to ~5-15 MB before sending. Even a small share of video messages creates a massive data load.',
      'WhatsApp voice/video calls are not stored (real-time streaming), but they generate significant transit bandwidth — not typically included in "generated data" unless you\'re counting bandwidth rather than stored data.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Establish user base and message volume.\nWhatsApp DAU: ~1.5B.\nTotal messages delivered (including to all recipients in groups): ~100B/day.\nTotal messages sent by users (unique send actions): ~35B/day (see EST09 for derivation).\n\nStep 2: Break down by message type (% of sent messages).\nText messages: ~70% of sends = 24.5B texts/day\nImages (photos sent directly): ~15% = 5.25B images/day\nVideo clips: ~5% = 1.75B videos/day\nVoice notes (audio recordings): ~7% = 2.45B voice notes/day\nDocuments (PDFs, Office files): ~2% = 700M docs/day\nStickers/GIFs: ~1% = 350M/day\n\nStep 3: Data size per type.\nText message: ~200 bytes average (UTF-8 text + metadata) → 24.5B × 200B = 4.9 TB\nImage (WhatsApp-compressed JPEG): ~250 KB average → 5.25B × 250KB = 1,312 TB = ~1.3 PB\nVideo clip (WhatsApp-compressed, avg 30 sec): ~8 MB average → 1.75B × 8MB = 14,000 TB = ~14 PB\nVoice note (avg 20 seconds, Opus codec): ~40 KB → 2.45B × 40KB = 98 TB ≈ 0.1 PB\nDocuments: avg 500 KB → 700M × 500KB = 350 TB ≈ 0.35 PB\nStickers/GIFs: ~50 KB average → 350M × 50KB = 17.5 TB\n\nStep 4: Total data generated (sent by users, stored on WhatsApp servers at least transiently).\nText: ~5 TB\nImages: ~1,300 TB\nVoice notes: ~98 TB\nVideos: ~14,000 TB\nDocuments: ~350 TB\nStickers/GIFs: ~18 TB\nTotal: ~15,771 TB ≈ 15–16 petabytes per day\n\nImportantly: WhatsApp uses end-to-end encryption and stores messages transiently (delivers and discards for most messages). But the data still flows through their infrastructure daily.\n\nIf the question is about stored data (WhatsApp does temporarily store undelivered messages and media): subtract the ~85% that is delivered in real time. But as transmitted data volume: ~15–16 PB/day.\n\nRange: 12–20 petabytes of data transmitted through WhatsApp globally per day, dominated by video content.',
      keyAssumptions: [
        '35B messages sent/day — derived from 1.5B DAU × 20 messages/user/day on average (see EST09)',
        '5% of messages are video — this is the critical assumption; video dominates total data volume',
        '8 MB average WhatsApp video — WhatsApp auto-compresses; original videos may be 100MB+ but transmission is compressed',
        '250 KB average WhatsApp image — WhatsApp compresses photos before sending; a native iPhone photo is ~3-5 MB',
        'Real-time calls not included — VoIP call data is transit bandwidth, not stored data generation',
      ],
      finalEstimate: 'Range: 12–20 petabytes of data transmitted per day; ~15 PB central estimate',
      sanityChecks: [
        'Bandwidth check: 15 PB/day ÷ 86,400 seconds/day = ~174 GB/second average throughput. WhatsApp\'s infrastructure would need to sustain ~200+ GB/s at peak. For a Meta-scale platform, this is plausible — Meta\'s total network throughput is estimated at multiple TB/s.',
        'Internet traffic comparison: Global internet traffic is roughly 500 exabytes/month = ~17 PB/day. WhatsApp at 15 PB/day would represent nearly 90% of the entire internet — clearly too high. Re-check: 15 PB/day is the data WhatsApp transmits to/from users, but the internet benchmark includes all traffic. More likely WhatsApp is 1-3% of global internet traffic, suggesting ~5-15 PB/day is in the right order of magnitude range. The video assumption is the key lever.',
        'Video sensitivity: If only 2% of messages are video (not 5%), total drops to: (1.75B × 0.4) × 8MB = 5.6 PB for video, total ~8 PB/day. The range 8–20 PB captures this uncertainty.',
      ],
    },

    strongAnswerMarkers: [
      'Enumerates all message types (text, image, video, voice, document) rather than treating all messages as equal',
      'Correctly identifies video as the dominant data category by volume, not text',
      'Notes that WhatsApp compresses images and video before sending — raw file size ≠ transmitted size',
      'Distinguishes between transmitted data (in transit) and stored data (WhatsApp is not a long-term storage service)',
      'Does a bandwidth-per-second sanity check to validate plausibility of the total',
    ],

    commonMistakes: [
      'Treating all 100B messages as text and multiplying by a text message size — gives a wildly low answer (~50 TB) because video is 1,000x denser',
      'Using uncompressed file sizes — WhatsApp compresses images from ~3 MB to ~250 KB and videos proportionally; using native sizes overstates by 10-20x',
      'Forgetting voice notes — audio messages are significant in markets like Brazil and Nigeria (WhatsApp voice notes are the dominant communication medium)',
      'Not distinguishing transit data from stored data — WhatsApp mostly delivers-and-discards; the data is transmitted but not necessarily stored long-term',
    ],
    failureMode: {
      weakAnswer: 'The candidate treats all 100 billion daily WhatsApp messages as text at ~1 KB each, multiplies to get 100 TB/day, and states that as the answer. They ignore that roughly 10% of messages are images, videos, or voice notes — each thousands of times larger than a text — which makes the media volume orders of magnitude larger than the text volume.',
      interviewerFollowUp: '"You got 100 TB per day assuming all messages are text. If just 5% of messages are short video clips at an average of 5 MB compressed, how much data does that 5% add — and does that single correction change your total estimate by 2x, 10x, or 100x?"',
    },
  },

  {
    id: 'EST16',
    title: 'Simultaneous Netflix Viewers Worldwide Right Now',
    subtitle: 'Product Metrics · Streaming',
    difficulty: 'senior',
    isFree: false,
    tags: ['Netflix', 'concurrent viewers', 'streaming', 'real-time', 'DAU'],
    category: 'users',
    approach: 'hybrid',

    prompt: 'How many people are watching Netflix at this exact moment (worldwide)?',

    frameworkSteps: [
      'Step 1 — Estimate Netflix global paying subscribers and total viewers: Paid subscribers plus their household members.',
      'Step 2 — Estimate daily active viewers: What share of total Netflix-eligible viewers watch on any given day?',
      'Step 3 — Estimate viewing hours per viewer per day: This gives total watch-hours per day.',
      'Step 4 — Convert to concurrent viewers: Concurrent = (daily watch-hours × 1 hour) ÷ 24 hours, adjusted for peak-hour concentration.',
      'Step 5 — Apply a time-of-day adjustment: "This exact moment" needs a specific time-zone-weighted estimate.',
    ],

    hints: [
      'Netflix reported ~260 million paid subscribers at end-2023. With password sharing crackdown and "extra member" add-ons, average household size on Netflix is ~2.2 members.',
      'Netflix disclosed that subscribers watch ~2 hours per day on average in their earnings commentary.',
      'Not all subscribers watch every day — Netflix\'s daily active rate is estimated at 40-50% of subscriber households.',
      'Concurrent viewers = (total daily watch-hours) ÷ 24. This gives you the average concurrent number. At a peak (8-10pm local time), multiply by ~1.5-2x.',
      'Netflix\'s own public statements have cited ~100 million simultaneous streams as a rough internal capacity figure — your estimate should approach that order of magnitude at peak.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Total Netflix-eligible viewing population.\nPaid subscribers: ~260M households.\nAverage viewers per household: ~2.2 (Netflix allows up to 4 streams per account; average is 2.2 actual viewers using the account regularly).\nTotal eligible viewers: 260M × 2.2 = ~572M people.\n\nStep 2: Daily active viewers.\nNot every subscriber watches every day. Daily active rate (share of subscriber households watching at least once on a given day): ~45%. This accounts for weekday/weekend variation — use a midpoint.\nDaily active households: 260M × 0.45 = 117M active households per day.\nActive viewers per active household: ~1.6 (not all household members watch every day even in active households).\nDaily active viewers: 117M × 1.6 = ~187M individual viewers per day.\n\nStep 3: Watch time per daily active viewer.\nNetflix\'s disclosed average of ~2 hours/day is across all subscribers (including inactive days). For daily active viewers (who actually watched), average watch time is higher: ~2.5 hours per active viewing session.\nTotal daily watch-hours: 187M × 2.5 = ~467M watch-hours/day.\n\nStep 4: Convert to average concurrent viewers.\nAverage concurrent viewers = Total watch-hours per day ÷ 24 hours.\n467M ÷ 24 = ~19.5M concurrent viewers on average at any given moment.\n\nStep 5: Apply time-of-day and peak adjustments.\n"Right now" without a specified time requires a global average estimate. But:\n- Peak viewing globally (aggregating across time zones): evening hours in major markets (US 8pm EST, Europe 9pm CET, India 9pm IST) drive above-average concurrency.\n- At peak: ~1.8x the average → 19.5M × 1.8 = ~35M concurrent viewers at peak global moment.\n- At off-peak (e.g., 4am global average): ~0.4x → ~8M.\n- Average any given moment: ~19-20M.\n\nRange: 15M–40M depending on time of day; ~20M as a neutral estimate.\n\nCross-check: Netflix has ~260M subscribers streaming at avg 2 hrs/day. If Netflix processes ~20M streams at any time × 5 Mbps per stream = 100 Gbps = 100 petabits... actually 20M × 5 Mbps = 100,000 Gbps = 100 Tbps. That is Netflix\'s approximate CDN bandwidth requirement — consistent with industry reporting of Netflix driving ~15% of global internet downstream traffic.',
      keyAssumptions: [
        '260M paid subscriber households — disclosed Q4 2023 figure',
        '2.2 viewers per household — slightly above average household size because Netflix captures multi-person households disproportionately',
        '45% daily active rate of subscriber households — implies roughly 1 in 2 households watches on any given day',
        '2.5 hours watch time per active viewer per day — slightly above Netflix\'s stated ~2h average since active-day average is higher than all-day average',
        '1.8x peak multiplier for evening prime time aggregated across global time zones',
      ],
      finalEstimate: 'Range: 15M–40M concurrent viewers depending on time of day; ~20M average at any given moment',
      sanityChecks: [
        'Netflix CDN bandwidth: 20M concurrent streams × 5 Mbps/stream = 100 Tbps. Netflix drives ~15% of global internet downstream traffic (well-documented); global internet downstream is ~600 Tbps → Netflix share = ~90 Tbps. Our 100 Tbps is consistent.',
        'Netflix Q4 2023 earnings: CEO stated subscribers watch ~2 hours per day average. At 260M households × 2h = 520M household-watch-hours/day ÷ 24 = 21.7M concurrent households streaming. Consistent with our ~20M.',
        'Competitor comparison: Disney+ has ~150M subscribers with lower engagement. If Disney+ concurrent viewers are ~6-8M (roughly 30% of Netflix\'s), that seems reasonable given the subscriber ratio and lower engagement depth of Disney+ (more transactional than habitual viewing).',
      ],
    },

    strongAnswerMarkers: [
      'Uses the correct formula: concurrent viewers = daily watch-hours ÷ 24 hours',
      'Distinguishes paid households from total viewers using a household member multiplier',
      'Applies a daily active rate to avoid treating all 260M subscriber households as watching every day',
      'Notes the time-of-day dependency and provides a range with a peak estimate',
      'Cross-validates using Netflix CDN bandwidth requirements (100 Tbps is a documented benchmark)',
    ],

    commonMistakes: [
      'Treating all 260M subscribers as simultaneously watching — conflates total subscribers with concurrent viewers',
      'Using total daily watch-hours directly as the answer — "watch-hours per day" is very different from "concurrent viewers right now"',
      'Ignoring the household multiplier — Netflix has significantly more viewers than paid accounts',
      'Not accounting for the daily active rate — most subscriber households don\'t watch every single day',
    ],
    failureMode: {
      weakAnswer: 'The candidate states that Netflix has 260 million subscribers and assumes 20% are watching at any given moment, arriving at 52 million concurrent viewers. They never account for the fact that "right now" implies a specific time of day, never apply a daily active household rate (~40-50%), and don\'t discount for the fact that most subscribers are asleep for a large fraction of any 24-hour window.',
      interviewerFollowUp: '"You assumed 20% of 260M subscribers are always watching simultaneously. At 3am UTC, what fraction of households globally do you think are actively streaming? How does accounting for global time zone distribution change your concurrent viewer estimate?"',
    },
  },

  {
    id: 'EST17',
    title: 'Amazon Packages Delivered Per Day in the US',
    subtitle: 'Market Sizing · Logistics',
    difficulty: 'analyst',
    isFree: false,
    tags: ['Amazon', 'logistics', 'packages', 'delivery', 'e-commerce'],
    category: 'market-sizing',
    approach: 'bottom-up',

    prompt: 'How many packages does Amazon deliver in the US per day?',

    frameworkSteps: [
      'Step 1 — Estimate annual US Amazon orders: Work from the number of Prime members and non-Prime customers, and average orders per customer.',
      'Step 2 — Estimate packages per order: Many orders ship in multiple packages; some orders are consolidated.',
      'Step 3 — Account for third-party sellers: A significant share of Amazon orders are fulfilled by third-party sellers, not Amazon Logistics.',
      'Step 4 — Adjust for returns and reshipments: Some packages represent returns, replacements, or failed deliveries.',
      'Step 5 — Divide by 365 (or ~300 operating days) to get daily run-rate, noting Q4 spike.',
    ],

    hints: [
      'Amazon has ~168 million US Prime members (as of 2023). Prime members order significantly more than non-Prime customers.',
      'The average Prime member places roughly 25 orders per year; non-Prime customers average ~5 orders per year.',
      'Not all Amazon orders go through Amazon Logistics — USPS and UPS still handle a portion. Amazon\'s own delivery network (Amazon Logistics/AMZL) handles roughly 72% of its packages.',
      'Amazon disclosed it delivered over 5 billion packages in the US in 2023 through its own logistics network.',
      'Peak season (November-December) can be 2-3x the daily average.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Estimate annual Amazon orders in the US.\n\nUS Prime members: ~168M (Amazon disclosed 200M+ globally; US is ~84%).\nAverage orders per Prime member per year: ~25 (Prime members order frequently due to free shipping incentive; mix of daily essentials, gifts, electronics).\nPrime member orders: 168M × 25 = 4.2B orders/year.\n\nNon-Prime US shoppers: US population 330M − 168M Prime = ~162M potential non-Prime shoppers. Not all non-Prime users shop on Amazon at all. Estimate 80M non-Prime Amazon shoppers.\nAverage orders per non-Prime customer: ~5/year (they face shipping fees, so order less frequently).\nNon-Prime orders: 80M × 5 = 400M orders/year.\n\nTotal annual Amazon US orders: 4.2B + 0.4B = ~4.6B orders/year.\n\nStep 2: Orders per package.\nMost Amazon orders ship as 1 package per order. However, some multi-item orders split across 2+ packages (especially from different fulfillment centers or different sellers). Average: ~1.15 packages per order.\nTotal packages shipped: 4.6B × 1.15 = ~5.3B packages/year.\n\nStep 3: Amazon Logistics vs. 3rd party carriers.\nAmazon delivers ~72% of its packages via AMZL (Amazon Logistics); 28% goes to USPS, UPS, FedEx, etc. Amazon-delivered packages: 5.3B × 0.72 = ~3.8B through AMZL. Total (all carriers): ~5.3B/year.\n\nStep 4: Daily average.\nTotal annual packages: ~5.3B ÷ 365 = ~14.5M packages/day on average.\nAmazon-delivered specifically: ~3.8B ÷ 365 = ~10.4M packages/day via AMZL.\n\nRange: 14M–16M total packages/day; ~10M–12M delivered by Amazon\'s own network.\n\nStep 5: Q4 peak.\nPeak-season daily deliveries (Cyber Monday week): ~2.5x average = ~35-40M packages/day at peak.\n\nCross-check: Amazon disclosed delivering over 5 billion packages via its own logistics in the US in 2023 → 5B ÷ 365 = ~13.7M/day. Our AMZL estimate of 10.4M is slightly conservative; total including 3P carriers aligns well at 13-15M.',
      keyAssumptions: [
        '168M US Prime members — widely cited figure from Consumer Intelligence Research Partners (CIRP)',
        '25 orders/year per Prime member — based on CIRP survey data showing Prime members average ~25 annual orders',
        '5 orders/year per non-Prime shopper — conservative; shipping fees deter frequency',
        '1.15 packages per order — single-package majority with some multi-shipment orders blending the ratio',
        '72% Amazon Logistics (AMZL) share — Amazon\'s own logistics network handles a growing majority of its packages',
      ],
      finalEstimate: 'Range: 13M–17M total packages per day; ~10M–14M delivered by Amazon Logistics specifically',
      sanityChecks: [
        'Amazon disclosed 5B+ packages via its own network in 2023 → 13.7M/day. Consistent with our 10-14M range.',
        'USPS processes ~130M pieces of mail + packages per day in the US. Amazon alone generating ~14M/day would be ~10% of USPS\'s total volume. Amazon is USPS\'s largest single customer, so this proportion is plausible.',
        'Revenue check: Amazon\'s shipping cost was ~$86B in 2023 (across worldwide operations). If ~50% is US and ~$5.50 cost per package: $43B ÷ $5.50 = ~7.8B US packages/year → 21M/day. Slightly higher than our estimate — difference likely reflects inbound freight and returns, not just outbound deliveries.',
      ],
    },

    strongAnswerMarkers: [
      'Segments Prime vs. non-Prime customers with different order frequency assumptions — Prime members are the dominant demand driver',
      'Applies a packages-per-order multiplier rather than treating orders and packages as 1:1',
      'Distinguishes Amazon Logistics (AMZL) deliveries from total packages including 3P carriers',
      'Notes Q4 peak seasonality as a key context for any daily estimate',
      'Cross-validates using Amazon\'s disclosed "5 billion packages" figure',
    ],

    commonMistakes: [
      'Ignoring the Prime vs. non-Prime distinction — Prime members order 5x more frequently and represent the vast majority of Amazon\'s order volume',
      'Treating Amazon\'s total "shipping cost" as a per-package proxy without accounting for freight, returns, and worldwide operations',
      'Not knowing that Amazon runs its own last-mile delivery network (AMZL) and delivers ~70%+ of its own packages',
      'Using a flat US population and guessing "average orders per American" — misses the strong bifurcation between heavy Prime users and light shoppers',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates 330M Americans × 1.5 orders/month = ~500M monthly orders = ~16M/day. They apply a flat per-capita order rate across the entire US population without segmenting Prime vs. non-Prime members, completely missing that Prime members (~170M) generate over 80% of Amazon\'s order volume at ~5x the frequency of non-Prime shoppers.',
      interviewerFollowUp: '"You estimated 16 million Amazon packages per day in the US. Amazon disclosed delivering over 5 billion packages in the US in 2022 — about 14 million per day. Your bottom-up estimate is close, but for the wrong reason. You applied a flat 1.5 orders/month to everyone — what does the estimate look like if you segment Prime vs. non-Prime separately, and why does the flat rate accidentally get close to the right answer?"',
    },
  },

  {
    id: 'EST18',
    title: 'TikTok Monthly Active Users in the United States',
    subtitle: 'Product Metrics · Social Media',
    difficulty: 'analyst',
    isFree: false,
    tags: ['TikTok', 'MAU', 'social media', 'US market', 'short-video'],
    category: 'users',
    approach: 'top-down',

    prompt: 'How many monthly active users does TikTok have in the United States?',

    frameworkSteps: [
      'Step 1 — Start with US population and addressable demographic: Who is TikTok\'s core user base by age?',
      'Step 2 — Estimate smartphone penetration and app awareness: Not everyone with a smartphone knows or uses TikTok.',
      'Step 3 — Apply TikTok adoption rate by age cohort: TikTok penetration varies dramatically by generation.',
      'Step 4 — Convert installs to monthly active users: Not every install generates monthly activity.',
      'Step 5 — Sanity check against TikTok\'s disclosed US figures and ad platform audience data.',
    ],

    hints: [
      'The US population is ~335M. TikTok\'s core demographic is 13-34 year olds, though 35-54 has grown significantly.',
      'TikTok has publicly stated it has ~150 million US monthly active users (stated to Congress in 2023 hearings).',
      'TikTok penetration among 18-24 year olds in the US is exceptionally high — estimated 62-65% use TikTok monthly.',
      'Penetration falls off sharply with age: 35-44 is ~25%, 45-54 is ~13%, 55+ is ~6%.',
      'The MAU/install ratio for TikTok is high — TikTok\'s highly addictive algorithm creates strong habitual usage. Estimate ~80% of installs are monthly active.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: US population age breakdown.\nTotal US population: ~335M.\nApproximate age distribution:\n- 13-17 (teens): ~22M (6.5% of pop)\n- 18-24 (young adults): ~31M (9.2%)\n- 25-34: ~45M (13.4%)\n- 35-44: ~43M (12.8%)\n- 45-54: ~41M (12.2%)\n- 55-64: ~40M (11.9%)\n- 65+: ~56M (16.7%)\n- Under 13 (not eligible): ~57M\n\nTotal addressable (13+): ~278M.\n\nStep 2: Smartphone ownership by age group.\n13-17: ~93% have smartphones.\n18-34: ~97%.\n35-54: ~88%.\n55-64: ~73%.\n65+: ~50%.\n\nStep 3: TikTok monthly adoption rate by age cohort (among smartphone owners).\n13-17: ~67% (extremely high; TikTok is the primary entertainment platform for Gen Z teens)\n18-24: ~63%\n25-34: ~42%\n35-44: ~24%\n45-54: ~12%\n55-64: ~7%\n65+: ~3%\n\nStep 4: Calculate MAU by cohort.\n13-17: 22M × 0.93 × 0.67 = 13.7M\n18-24: 31M × 0.97 × 0.63 = 18.9M\n25-34: 45M × 0.97 × 0.42 = 18.3M\n35-44: 43M × 0.88 × 0.24 = 9.1M\n45-54: 41M × 0.88 × 0.12 = 4.3M\n55-64: 40M × 0.73 × 0.07 = 2.0M\n65+: 56M × 0.50 × 0.03 = 0.8M\n\nTotal US TikTok MAU: 13.7 + 18.9 + 18.3 + 9.1 + 4.3 + 2.0 + 0.8 = ~67M.\n\nHmm — this comes in at ~67M, short of TikTok\'s stated 150M. The discrepancy likely reflects under-estimated adoption rates, particularly among 18-34 year olds. TikTok penetration in 18-34 may be 65-75%, not 42-63%.\n\nRevised 25-34 at 60%: 45M × 0.97 × 0.60 = 26.2M. Revised 35-44 at 35%: 43M × 0.88 × 0.35 = 13.2M. Revised total: ~80-90M.\n\nTikTok stated ~150M US MAU to Congress in 2023. This suggests either:\n(a) Adoption rates are higher than Pew Research surveys suggest (perhaps self-report bias in surveys), or\n(b) TikTok counts any account that logged in during the month, including passive browsers.\n\nBest estimate anchoring on TikTok\'s own statement: ~150M US MAU. Bottom-up suggests 80-120M, with the gap explained by survey undercounting.\n\nFinal answer: 120M–150M US monthly active users, with ~150M as the company-disclosed figure.',
      keyAssumptions: [
        'TikTok adoption rates by age cohort — derived from Pew Research Center social media surveys (2022-2023)',
        '150M US MAU — stated by TikTok CEO Shou Zi Chew to US Congress in March 2023',
        'Smartphone penetration by age — Pew Research consistent estimates',
        'Bottom-up estimate arrives at 80-120M; gap to 150M explained by survey undercounting and loose MAU definition',
      ],
      finalEstimate: 'Range: 120M–160M US monthly active users; ~150M per TikTok\'s own disclosure',
      sanityChecks: [
        'TikTok Congressional testimony 2023: CEO stated "over 150 million Americans" use TikTok monthly. This is the primary anchor.',
        'Ad platform check: TikTok\'s self-serve ad platform shows available audience reach of ~130-140M in the US for 18+ users (ad buyers can see this in TikTok Ads Manager). Adding 13-17 teens brings it to ~145-150M. Consistent.',
        'Penetration rate: 150M ÷ 278M adults+teens in the US = 54% of the addressable population. Given Instagram\'s ~65% and Snapchat\'s ~35%, TikTok at 54% is plausible for a platform with 5+ years of US market history.',
      ],
    },

    strongAnswerMarkers: [
      'Segments by age cohort with different adoption rates rather than applying a flat national penetration rate',
      'Knows the TikTok US MAU disclosure (~150M from Congressional testimony) and uses it as the primary anchor',
      'Reconciles the bottom-up estimate (~80-120M) with the disclosed figure and explains the gap',
      'Uses TikTok Ads Manager audience data as a secondary cross-check',
      'Notes that MAU definition (any login vs. active engagement) affects the count',
    ],

    commonMistakes: [
      'Applying a single national adoption rate without age segmentation — TikTok\'s adoption curve is dramatically age-skewed',
      'Not knowing TikTok\'s US MAU disclosure (~150M) — this is a key publicly stated number an interviewer will likely know',
      'Treating TikTok\'s US user base as larger than Instagram\'s — Instagram (~165M US MAU) is still slightly larger; TikTok has closed the gap but hasn\'t overtaken it',
      'Forgetting the under-13 exclusion — TikTok does not allow users under 13, which removes a significant portion of the youngest cohort',
    ],
    failureMode: {
      weakAnswer: 'The candidate applies a flat 30% TikTok penetration to all 260M US adults and arrives at 78M MAU. They ignore the dramatic age-skew (80%+ of US 18-24 year olds use TikTok vs. under 10% of 55+ year olds), don\'t know TikTok\'s publicly disclosed US MAU of ~150M, and miss that the under-13 age group is excluded from the platform entirely.',
      interviewerFollowUp: '"You got 78M by applying a flat 30% to all US adults. TikTok has disclosed ~150M US MAU. If the 13-24 age cohort has roughly 80% penetration and accounts for most of TikTok\'s US base, and the 50+ cohort has under 10%, how does a segmented model get you closer to 150M than your flat-rate model?"',
    },
  },

  {
    id: 'EST19',
    title: 'Zoom Meetings Globally Per Day',
    subtitle: 'Product Metrics · SaaS',
    difficulty: 'senior',
    isFree: false,
    tags: ['Zoom', 'meetings', 'SaaS', 'enterprise', 'collaboration'],
    category: 'users',
    approach: 'bottom-up',

    prompt: 'Estimate the total number of Zoom meetings that happen globally per day.',

    frameworkSteps: [
      'Step 1 — Segment Zoom users: Enterprise paid accounts, SMB/team paid accounts, and free-tier users have very different meeting behavior.',
      'Step 2 — Estimate meetings per user per day: A power user in a large enterprise has far more Zoom meetings than a student on the free tier.',
      'Step 3 — Estimate total daily active meeting participants and convert to meeting count: Average meeting size matters.',
      'Step 4 — Account for time-zone concentration: Meetings are concentrated in business hours across time zones.',
      'Step 5 — Sanity check against Zoom\'s disclosed "300 million daily meeting participants" (April 2020 peak).',
    ],

    hints: [
      'Zoom reported ~300 million daily meeting participants at its April 2020 pandemic peak. Post-pandemic, the figure declined but stabilized at a high level.',
      'Zoom had ~220,000 enterprise customers and ~210 million free/lower-tier accounts as of 2023. Enterprise customers drive most meeting volume.',
      'The average Zoom meeting has ~5-7 participants. This is critical to converting "meeting participants" to "meetings".',
      'A typical enterprise knowledge worker with a full meeting calendar attends 3-5 Zoom meetings per day. Free-tier users average far fewer.',
      'Think about what fraction of Zoom\'s users are active on any given weekday vs. weekend — weekends have dramatically lower meeting volume.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Estimate Zoom\'s user base and segment it.\n\nZoom total registered users: ~300M+ (estimates; Zoom stopped disclosing full user count post-2020).\nZoom Monthly Active Users (paying/regularly using): ~200M.\nDaily active users on a typical weekday: ~50% of MAU = 100M daily participants (meetings are concentrated on business days).\n\nStep 2: Segment by user type.\n\nEnterprise/Paid heavy users (~15% of DAU = 15M participants):\n- Description: Knowledge workers in corporations, consulting firms, universities with enterprise licenses.\n- Meetings/day: ~4 meetings per day (calendar-heavy professionals).\n- Avg meeting size: 6 participants.\n- Meetings contributed per heavy-user participant: 4 meetings / 6 avg participants = 0.67 meetings per participant.\n- Total meetings from this segment: 15M × 0.67 = 10M meetings/day.\n\nSMB / Pro users (~25% of DAU = 25M participants):\n- Description: Small teams, startups, freelancers with paid Pro accounts.\n- Meetings/day: ~2 per participant.\n- Avg meeting size: 4 participants.\n- Meetings per participant: 2 / 4 = 0.50.\n- Total meetings: 25M × 0.50 = 12.5M meetings/day.\n\nFree-tier users (~60% of DAU = 60M participants):\n- Description: Students, family calls, occasional users. Free tier has 40-minute limit.\n- Meetings/day: ~0.5 per participant (use Zoom a few times per week).\n- Avg meeting size: 3 participants.\n- Meetings per participant: 0.5 / 3 = 0.17.\n- Total meetings: 60M × 0.17 = 10M meetings/day.\n\nStep 3: Total daily meetings.\n10M + 12.5M + 10M = ~32.5M meetings/day on a typical weekday.\n\nWeekend adjustment: If we\'re estimating a global average across all 7 days/week and meetings drop 70% on weekends:\nWeekday average: 32.5M.\nWeekend average: 32.5M × 0.30 = 9.75M.\nWeekly average: (5 × 32.5M + 2 × 9.75M) / 7 = (162.5M + 19.5M) / 7 = 26M/day.\n\nRange: 25M–35M meetings per day on a typical weekday; ~26M global average across all days.\n\nCross-check: Zoom disclosed ~300M daily meeting participants at peak (April 2020). At 300M participants ÷ 6 avg meeting size = 50M meetings/day at peak. Post-pandemic normalization: Zoom\'s paid revenue is now roughly stable at ~$4.5B/year, suggesting activity is ~50-60% of peak. 50M × 0.55 = ~27.5M meetings/day. Consistent with our bottom-up.',
      keyAssumptions: [
        '200M Zoom MAU (estimated) — Zoom stopped disclosing MAU post-2020; this is an industry analyst estimate based on revenue and seat-count data',
        '50% weekday daily active rate — ~100M daily participants on an average weekday',
        '6 average meeting participants overall — blended across 1:1 calls (2 people), team standups (5-8), large webinars (100+); median is ~4-6',
        '4 meetings/day for enterprise heavy users — consistent with published research on knowledge worker meeting load (Reclaim.ai, Microsoft Work Trend Index)',
        'Post-pandemic activity at ~55% of April 2020 peak — Zoom revenue has stabilized at ~55% of peak growth rate',
      ],
      finalEstimate: 'Range: 25M–35M Zoom meetings per weekday globally; ~26M average across all days of the week',
      sanityChecks: [
        'Zoom peak disclosure: 300M daily participants in April 2020 ÷ 6 avg meeting size = 50M meetings/day at peak. At ~55% post-pandemic normalization: ~27.5M. Consistent.',
        'Revenue check: Zoom 2023 revenue ~$4.5B/year. At ~26M meetings/day × 365 = 9.5B meetings/year. Revenue per meeting: $4.5B / 9.5B = $0.47/meeting. At $15/month per Pro user (30M users) × 12 months = $5.4B. Roughly consistent if Zoom averages $15-17/seat/month.',
        'Microsoft Teams comparison: Microsoft has stated Teams has ~300M monthly active users and "over 100 million" daily meeting participants. Teams is larger than Zoom by MAU; Zoom specializes in meetings while Teams includes chat. Zoom at ~100M meeting participants/day is in the right order relative to Teams.',
      ],
    },

    strongAnswerMarkers: [
      'Segments user base (enterprise, SMB, free-tier) with different meeting frequency assumptions — not all Zoom users are enterprise knowledge workers',
      'Converts daily participants to meetings by dividing by average meeting size — this is the key step most candidates miss',
      'Applies a weekend/weekday adjustment since meetings are business-day concentrated',
      'Knows Zoom\'s April 2020 peak disclosure (300M daily participants) and uses it as a sanity check anchor',
      'Notes that Zoom stopped disclosing MAU, and estimates from revenue-based proxies',
    ],

    commonMistakes: [
      'Treating daily meeting participants as equivalent to meetings — 100M participants ÷ 6 per meeting = ~17M meetings, not 100M',
      'Using Zoom\'s April 2020 pandemic peak figures directly without applying a post-pandemic normalization factor',
      'Ignoring the free-tier user base — free users are a majority of Zoom accounts and contribute significantly to total meeting volume',
      'Not accounting for weekday vs. weekend variation — using a flat 7-day average without a weekend discount overestimates weekday activity',
    ],
    failureMode: {
      weakAnswer: 'The candidate remembers that Zoom reported 300 million daily meeting participants at the April 2020 pandemic peak and uses that as the current answer. They don\'t apply any post-pandemic normalization, treat the participant count as a meeting count, and arrive at "300 million meetings per day" — conflating participants with meetings and using a 4-year-old peak figure.',
      interviewerFollowUp: '"You said 300 million meetings per day based on the 2020 peak participant figure. Two problems: that was participants, not meetings; and that was the pandemic peak, not today. If average meeting size is 6 participants and post-pandemic Zoom usage is roughly 50-60% of the 2020 peak, what range do you actually get?"',
    },
  },

  {
    id: 'EST20',
    title: 'Annual Revenue of Spotify\'s Podcast Advertising Business',
    subtitle: 'Revenue Estimation · Audio',
    difficulty: 'staff',
    isFree: false,
    tags: ['Spotify', 'podcasts', 'advertising', 'audio', 'revenue'],
    category: 'revenue',
    approach: 'top-down',

    prompt: 'Estimate the annual revenue of Spotify\'s podcast advertising business.',

    frameworkSteps: [
      'Step 1 — Size the global podcast advertising market: How large is the total pie?',
      'Step 2 — Estimate Spotify\'s share: Spotify competes with Apple Podcasts, iHeart, Amazon, and independent ad networks.',
      'Step 3 — Triangulate via Spotify\'s podcast listener base and CPM: How many podcast listeners on Spotify, how many hours, and what CPM?',
      'Step 4 — Account for Spotify\'s owned-and-operated vs. open ecosystem shows: Spotify owns some shows directly and sells ads on a broader network.',
      'Step 5 — Cross-check against Spotify\'s own disclosures about its ad-supported segment.',
    ],

    hints: [
      'The US podcast advertising market was ~$2B in 2023 (IAB/PwC Podcast Advertising Revenue Study). Global is roughly 2x US, so ~$4B globally.',
      'Spotify is the #1 podcast platform globally by listener count (~31% share of podcast listeners), but monetization share is not the same as listener share.',
      'Spotify has invested heavily in podcast content via acquisitions (Anchor/Spotify for Podcasters, Gimlet, Parcast, The Ringer, exclusive deals with Joe Rogan, Brené Brown, etc.) — these owned-and-operated shows are a key monetization vector.',
      'Podcast CPMs on Spotify\'s network: host-read ads command $25-50 CPM; programmatic ads are $10-20 CPM. Average blended CPM across all Spotify podcast inventory: ~$18.',
      'Spotify\'s total advertising revenue in 2023 was ~€1.68B (~$1.8B). Podcast ads are a subset — Spotify has indicated podcast monetization is a meaningful but still-maturing piece of its ad business.',
    ],

    modelAnswer: {
      walkthrough: 'Approach 1: Top-down from podcast ad market.\n\nTotal global podcast advertising market 2023: ~$4B (IAB/PwC: $2B US × 2 for global).\nSpotify\'s listener market share: ~31% of all podcast listening hours globally (Spotify has become the largest single platform).\nRevenue share ≠ listener share. Spotify monetizes a smaller share of inventory than its listener share because:\n(a) Most Spotify podcast listeners use the free tier where Spotify needs to monetize through ads — this is actually an advantage.\n(b) Many podcast creators use Spotify as a distribution channel but monetize through host-read ads outside Spotify\'s network (especially Apple Podcasts, independent).\n(c) Spotify\'s programmatic and first-party ad network for podcasts is still scaling.\n\nSpotify\'s monetizable podcast listen share: ~20% of global podcast ad market = $4B × 0.20 = ~$800M.\n\nApproach 2: Bottom-up from listeners and CPM.\n\nSpotify total MAU: ~602M as of Q4 2023.\nPodcast listeners on Spotify: ~25% of MAU listen to at least one podcast/month = ~150M podcast MAU.\nMonthly active podcast listeners who generate ad inventory (ad-supported, not Premium skip-enabled): ~60% of podcast listeners are on the free tier = 90M ad-eligible podcast listeners.\n\nPodcast listening hours per ad-eligible user per month: ~3.5 hours/month (roughly 30-45 minutes/week for a casual podcast listener).\nTotal monthly ad-eligible podcast listening hours: 90M × 3.5 = 315M hours/month.\nAnnual listening hours: 315M × 12 = 3.78B hours.\n\nAd load: ~3 ads per hour of podcast content (pre-roll + mid-roll × 2).\nAd impressions per year: 3.78B hours × 3 ads/hour = 11.34B impressions.\nBlended CPM: ~$18 (host-read premium: ~$35 for O&O shows; programmatic: ~$12 for distribution network).\nAnnual revenue: 11.34B impressions × ($18 / 1,000) = $204M.\n\nBut wait — this only covers the ad-supported free-tier listeners. Spotify also:\n(a) Sells ads on Premium users\' podcast feeds for some shows (Premium users see fewer ads but not zero).\n(b) Earns revenue from its Spotify Audience Network (SANeT), which monetizes podcasts hosted on Anchor across ANY platform, not just Spotify\'s app. SANeT impressions could be 3-5x Spotify-app-only.\n\nApplying a 3x SANeT multiplier (podcasts distributed via Anchor that Spotify monetizes elsewhere): $204M × 3 = ~$612M.\n\nRange from both approaches: $600M–$900M.\n\nSpotify\'s own commentary: On earnings calls through 2022-2023, Spotify has indicated podcast monetization is "hundreds of millions of dollars and growing," with an aspiration to build it into a multi-billion dollar segment. "Hundreds of millions" = likely $400M–$800M range in 2023. Consistent.',
      keyAssumptions: [
        '$4B global podcast ad market — IAB/PwC 2023 report; growing ~5-10% per year',
        '20% Spotify podcast ad revenue share vs. 31% listener share — monetization share lags due to creator independence and platform immaturity',
        '25% of Spotify MAU are monthly podcast listeners — Spotify has disclosed 31% of users engage with podcasts; using 25% as conservative',
        '$18 blended CPM across O&O host-read and SANeT programmatic inventory',
        '3x SANeT multiplier for Anchor-hosted podcasts distributed beyond Spotify — Spotify monetizes off-platform inventory through its ad network',
      ],
      finalEstimate: 'Range: $500M–$900M annually; ~$700M central estimate for Spotify\'s global podcast advertising revenue',
      sanityChecks: [
        'Spotify total ad revenue 2023: ~$1.8B. If podcast ads are ~40% of total ad revenue: ~$720M. Consistent with our estimate. (The other ~60% is music/other content ads and display.)',
        'Market share check: $700M / $4B global podcast ad market = 17.5% share. For the #1 podcast platform globally with 31% listener share, 17-18% ad revenue share reflects the lag in monetization maturity. Apple has ~20% listener share but near-zero podcast ad revenue (no ad network). So Spotify disproportionately monetizes relative to its raw listener share among platforms with ad infrastructure.',
        'Joe Rogan deal check: Spotify paid ~$200M for the Joe Rogan Experience exclusive deal. At ~$30 CPM × 200M downloads/year × 3 mid-rolls = 200M × 3 × $0.030 = $18M in ad revenue per year from the JRE alone. With 100+ similarly large shows in its O&O portfolio, $100-200M from top shows is plausible — a meaningful slice of the total.',
      ],
    },

    strongAnswerMarkers: [
      'Distinguishes Spotify listener share (~31%) from podcast ad revenue share (~17-20%) and explains the gap',
      'Accounts for Spotify Audience Network (SANeT) / Anchor — Spotify monetizes podcasts it doesn\'t just host in its app',
      'Uses both a top-down market share approach and a bottom-up CPM × impressions approach and reconciles them',
      'Notes Spotify\'s "hundreds of millions and growing" commentary from earnings calls as a qualitative anchor',
      'Breaks down O&O (owned-and-operated) shows vs. distributed network inventory with different CPM rates',
    ],

    commonMistakes: [
      'Treating Spotify\'s 31% podcast listener share as its ad revenue share directly — platforms with ad infrastructure monetize above their listener share; platforms without (Apple) monetize zero',
      'Only counting ads on the Spotify app and ignoring Spotify Audience Network (SANeT) / Anchor-distributed inventory — this understates revenue by 2-3x',
      'Using music streaming CPMs as a proxy for podcast CPMs — podcast ads command 3-5x the CPM of music/display ads due to their engaged listener base',
      'Not knowing the global podcast ad market size (~$4B in 2023, IAB) — without this anchor, top-down estimates are ungrounded',
      'Forgetting that Premium subscribers still hear ads on some podcast content — not all podcast ad revenue is "free tier only"',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates Spotify has 100M podcast listeners, assumes 2 ads per hour at a $5 CPM, listens for 1 hour/week, and arrives at ~$50M annual podcast ad revenue. They use a music streaming CPM ($5) instead of a podcast-specific CPM ($18-25), ignore the Spotify Audience Network\'s off-app inventory, and don\'t triangulate against the known $4B global podcast ad market.',
      interviewerFollowUp: '"You got $50M using a $5 CPM. Podcast ads typically command $18-25 CPM because listeners are highly engaged and ads are host-read. If you use $20 CPM instead of $5, and Spotify captures 30% of the global $4B podcast ad market, what range do you get — and does your bottom-up estimate reconcile with the top-down?"',
    },
  },

  {
    id: 'EST21',
    title: 'Uber Eats Orders on New Year\'s Eve in the US',
    subtitle: 'Demand Estimation · Food Delivery',
    difficulty: 'senior',
    isFree: false,
    tags: ['Uber Eats', 'food delivery', 'demand', 'seasonality'],
    category: 'volume',
    approach: 'bottom-up',

    prompt: 'Estimate the number of Uber Eats orders placed in the US on New Year\'s Eve.',

    frameworkSteps: [
      'Step 1 — Estimate the US Uber Eats user base: Start from US internet users, apply food-delivery app penetration, then Uber Eats\' market share.',
      'Step 2 — Estimate baseline daily orders: On a typical day, what fraction of monthly active users places an order?',
      'Step 3 — Apply a New Year\'s Eve multiplier: NYE is one of the highest-demand nights for food delivery — quantify the lift.',
      'Step 4 — Cross-check with Uber\'s disclosed order volume and seasonal data.',
    ],

    hints: [
      'Uber Eats has ~80M+ monthly active users in the US as of 2023. DoorDash leads with ~37% share; Uber Eats has ~29%.',
      'On a typical day, roughly 10-15% of food-delivery MAU places an order. Order frequency for active users is roughly 3-4 times per month.',
      'New Year\'s Eve food delivery demand is typically 2.5-3x a typical Tuesday/Wednesday due to parties, gatherings, and celebrations.',
      'Uber\'s global gross bookings for delivery were ~$12B/quarter in 2023. Average US order value is ~$35-40.',
      'Seasonality: The top 5 food-delivery days in the US are typically Super Bowl Sunday, NYE, New Year\'s Day, July 4th, and the night before Thanksgiving.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: US Uber Eats user base.\nUS internet users: ~285M. Food delivery app penetration: ~35% use any food delivery app at least monthly → 100M food delivery MAU across all platforms.\nUber Eats US market share: ~29% of food delivery orders → 29M Uber Eats MAU in the US.\n\nStep 2: Baseline daily orders.\nOrder frequency for active users: ~3.5 orders/month = 3.5/30 ≈ 0.117 orders/day.\nDaily orders on a typical day: 29M × 0.117 = ~3.4M orders/day.\n\nStep 3: NYE multiplier.\nNew Year\'s Eve is a major gathering event. Drivers of increased demand:\n(a) Parties and group meals replacing restaurant dining ($150 group order vs. 2 individual orders)\n(b) Office closed, more people at home\n(c) "Don\'t want to cook" + special occasion uplift\nEstimated NYE multiplier: 2.8x typical day.\n\nNYE orders: 3.4M × 2.8 = ~9.5M Uber Eats orders on New Year\'s Eve.\n\nBut this counts order events. Some group orders may be single orders for 6-8 people, so the "number of orders" could be slightly lower if ordering behavior consolidates. Adjusting down ~10% for consolidation: ~8.5M.\n\nRange: 7M–11M Uber Eats orders on New Year\'s Eve in the US.\n\nCross-check via revenue:\nUber delivery gross bookings ~$12B/quarter globally = $4B/month globally. US is ~55% of Uber delivery bookings → ~$2.2B/month US = $73M/typical day.\nAt $37 average order value: 73M/37 = ~2M orders/day typical, weighted to include quieter days.\nNYE at 2.8x: ~5.5M. (This is slightly lower than our bottom-up because Uber\'s disclosed bookings include some very low-volume days. Using a weekday baseline brings the range to 5M–10M. Consistent with our 7-11M range.)',
      keyAssumptions: [
        '29M Uber Eats US MAU — consistent with DoorDash\'s ~67M MAU and Uber Eats\' ~29% market share',
        '3.5 orders/month per active user — based on industry surveys; active users place orders about once per week on average',
        '2.8x NYE multiplier — NYE is historically the highest single night for food delivery; 2.5-3x is a reasonable range',
        '$37 average order value in the US — consistent with published Uber Eats data (order values have risen post-pandemic)',
      ],
      finalEstimate: 'Range: 7M–11M Uber Eats orders on New Year\'s Eve in the US; ~9M central estimate',
      sanityChecks: [
        'Revenue check: 9M orders × $37 avg order = $333M GMV on NYE. Uber takes ~15-18% cut = $50-60M revenue on a single night. At ~10x annualized, that\'s one of the top 5 revenue days of the year — consistent with NYE being a landmark event.',
        'Driver supply check: Uber has ~600k Uber Eats couriers active in the US. At peak NYE, if 50% are active and each completes 3 deliveries in 2 hours of peak demand: 300k × 3 = 900k deliveries in the 2-hour window. Over the full evening (6pm-1am = 7 hours), total capacity ≈ 3.15M delivery slots at peak staffing. With surge pricing drawing in more drivers, 9M orders across the full 24-hour day is feasible.',
        'Market share check: DoorDash has ~37% share vs. Uber Eats\' ~29%. If Uber Eats has 9M orders, DoorDash would have ~11.5M and Grubhub ~4M → total US food delivery on NYE ~25M orders. US has 130M households, so 1-in-5 households ordering food delivery on NYE is plausible given it\'s a celebration night.',
      ],
    },

    strongAnswerMarkers: [
      'Builds from MAU and order frequency rather than just applying a national penetration rate',
      'Explicitly quantifies the NYE seasonality multiplier and provides behavioral rationale for it',
      'Cross-checks via Uber\'s disclosed delivery gross bookings converted to order count',
      'Notes the consolidation effect — NYE group orders may mean fewer but larger individual orders',
      'Accounts for Uber Eats\' market share within the food delivery category',
    ],

    commonMistakes: [
      'Treating all 285M US internet users as potential Uber Eats orderers on NYE — food delivery penetration is ~35%, not 100%',
      'Using a flat daily order rate without applying a NYE multiplier — ignoring seasonality leads to a 3x underestimate',
      'Confusing Uber\'s global delivery bookings with US-only bookings — US is ~55% of Uber\'s delivery business',
      'Not considering the group-order consolidation effect — a party of 10 may place one $200 Uber Eats order, not 10 individual orders',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates a typical Uber Eats daily order volume in the US (~4M orders/day) and uses that directly for New Year\'s Eve without applying any seasonality multiplier. They treat NYE as a normal day, miss the 2-3x demand spike from parties and gatherings, and don\'t distinguish Uber Eats\' US share from its global delivery business.',
      interviewerFollowUp: '"You assumed New Year\'s Eve has the same order volume as a typical Tuesday. Which other high-demand delivery events do you know of — Super Bowl, Valentine\'s Day, Mother\'s Day — and what does their typical demand multiplier suggest NYE\'s should be? How does applying a 2.5x multiplier change your estimate?"',
    },
  },

  {
    id: 'EST22',
    title: 'YouTube Storage Cost for One Day of Uploads',
    subtitle: 'Cost Estimation · Cloud Infrastructure',
    difficulty: 'staff',
    isFree: false,
    tags: ['YouTube', 'storage', 'infrastructure', 'cloud cost', 'transcoding'],
    category: 'cost-estimation',
    approach: 'bottom-up',

    prompt: 'Estimate the storage cost YouTube incurs for all videos uploaded in a single day (new uploads only).',

    frameworkSteps: [
      'Step 1 — Estimate upload volume: How many hours of video are uploaded in 24 hours?',
      'Step 2 — Convert to raw bytes: What is the average file size per hour of uploaded video?',
      'Step 3 — Account for transcoding overhead: YouTube stores multiple quality tiers and formats.',
      'Step 4 — Apply storage cost per TB: Use public cloud pricing as a proxy for Google\'s internal cost.',
      'Step 5 — Sanity check: Cross-reference with Google infrastructure cost benchmarks.',
    ],

    hints: [
      'YouTube\'s publicly stated stat: ~500 hours of video are uploaded every minute. Over 24 hours: 500 × 60 × 24 = 720,000 hours/day.',
      'Raw file sizes: 1080p video runs ~2-4 GB/hour; 720p ~1-2 GB/hour; 480p and below ~0.3-0.5 GB/hour. Most uploaded videos are not 4K. A blended average across all uploads is roughly 1.5-2 GB/hour raw.',
      'YouTube transcodes each upload into multiple quality tiers: 144p, 240p, 360p, 480p, 720p, 1080p — sometimes 1440p and 4K. The transcoded storage footprint is ~3-5x the raw upload size. Use 4x as a blended multiplier.',
      'Cloud storage costs: AWS S3 standard is ~$0.023/GB/month. Google Cloud Storage is similar. Google has some infrastructure cost advantage but not dramatically different at a per-GB level.',
      'Remember: this is the monthly recurring storage cost for one day\'s uploads (you pay to store them every month going forward, not just once).',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Daily upload volume.\n500 hours uploaded/minute × 60 min × 24 hours = 720,000 hours of video uploaded per day.\n\nStep 2: Raw file size estimate.\nBlended average across all uploads: a mix of phone-shot 1080p (2 GB/hr), YouTube Creator 4K (8 GB/hr), old standard-def content (0.5 GB/hr). Weighted blended: ~1.8 GB/hour raw.\nTotal raw data uploaded in 1 day: 720,000 hours × 1.8 GB/hour = 1,296,000 GB = ~1.3 PB of raw upload data per day.\n\nStep 3: Transcoding multiplier.\nYouTube stores: original + 144p + 240p + 360p + 480p + 720p + 1080p. Each quality tier is smaller but the set accumulates. Typical multiplier: ~4x the original (the lower-quality versions are much smaller; 144p is ~0.05 GB/hr, but there are 6+ versions).\nTotal stored data per day of uploads: 1.3 PB × 4 = 5.2 PB stored per day\'s batch.\n\nStep 4: Storage cost.\nGoogle\'s internal storage cost is estimated at ~$0.012-0.016/GB/month (below public cloud due to Google\'s infrastructure scale and custom hardware). Use $0.013/GB/month.\nMonthly cost to store one day\'s uploads: 5.2 PB × 1,024 × 1,024 GB/PB × ... wait, let\'s convert cleanly.\n5.2 PB = 5,200 TB = 5,200,000 GB.\nMonthly cost: 5,200,000 GB × $0.013/GB/month = $67,600/month to store one day\'s uploads.\nAnnual cost: $67,600 × 12 = ~$811,000/year.\n\nBut this is just for one day\'s worth of uploads, stored for a year. Over a full year, YouTube accumulates 365 days of uploads, each requiring perpetual storage.\nYear 1 cumulative annual storage cost for all uploads in Year 1: approximately $811k × (1 + 2/3) adjustment for the average cohort being uploaded mid-year = ~$400k average monthly × 12 = ~$5M/year for one year\'s worth of new uploads (ongoing monthly cost building up to $67,600 × 365 = $24.7M/month by year-end).\n\nSingle-day upload cost framing (what does one day cost, stored for one month):\n5.2 PB × $0.013/GB = ~$68k for one month\'s storage of one day\'s content.\n\nRange: $60,000–$80,000 per month in storage costs for one day\'s YouTube uploads.',
      keyAssumptions: [
        '500 hours/minute upload rate — stated by YouTube at Google I/O; this figure has been stable since 2022',
        '1.8 GB/hour blended raw upload size — weighted average across 4K creator content (heavy) and mobile/legacy uploads (light)',
        '4x transcoding multiplier — YouTube stores 6+ quality tiers; lower-quality copies are small but the total set is roughly 4x the raw upload',
        '$0.013/GB/month Google internal storage cost — estimated at 40-50% below public cloud list price due to Google\'s custom Colossus/GCS infrastructure',
      ],
      finalEstimate: '~$60,000–$80,000 per month to store one day\'s worth of new YouTube uploads; ~$68k/month central estimate',
      sanityChecks: [
        'Scale check: At $68k/month per day of uploads, 365 days × $68k = $24.8M/month by end of Year 1 for that year\'s total new-upload storage cost. YouTube\'s parent Alphabet spends ~$12-15B/year on capex (data centers, servers). Storage is a fraction of that — $300M/year on YouTube storage alone is plausible (~2% of capex).',
        'GB price sanity: 5.2 PB per day × $0.013/GB/month = $67.6k/month. AWS S3 pricing for 5.2 PB = $0.023/GB × 5,200,000 GB = $119.6k/month. Google\'s internal cost is plausibly 40-50% below this. Consistent.',
        'Total YouTube library check: YouTube reportedly stores ~1 billion hours of video total. At 1.8 GB/hr × 4x transcoding = 7.2 GB/hr average stored: 1B × 7.2 = 7.2 billion GB = 7,200 PB = ~7 Exabytes. At $0.013/GB: ~$94M/month total storage for the entire library. That\'s ~$1.1B/year — a large but not implausible fraction of Google\'s storage infrastructure spend.',
      ],
    },

    strongAnswerMarkers: [
      'Uses the 500 hours/minute anchor (publicly stated) as the starting point',
      'Applies a transcoding multiplier and explains the quality-tier logic (not just raw upload size)',
      'Estimates Google\'s internal storage cost below public cloud list price with a rationale',
      'Clearly distinguishes between "one month\'s storage of one day\'s uploads" vs. "annual accumulation of all uploads" — and specifies which framing they\'re answering',
      'Cross-checks against Google\'s total capex and the implied YouTube library size',
    ],

    commonMistakes: [
      'Forgetting the transcoding multiplier — using only the raw upload size understates actual storage by 4x',
      'Using public cloud list price ($0.023/GB) without discounting for Google\'s infrastructure advantage',
      'Confusing one-time storage cost with monthly recurring cost — storage is a perpetual monthly expense',
      'Not converting units correctly — PB to TB to GB arithmetic errors are common under pressure',
      'Ignoring the distinction between "one day\'s uploads" and "all of YouTube\'s library" — the question asks specifically about new uploads in one day',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates 500 hours/minute × 60 minutes = 30,000 hours of daily uploads, converts at 2 GB/hour to 60,000 GB = ~60 TB, applies public cloud pricing of $0.023/GB/month × 12 months = $16,560/day in annual storage cost. They forget the 4x transcoding multiplier and use list price instead of Google\'s internal infrastructure cost, understating both storage volume and cost.',
      interviewerFollowUp: '"You calculated $16,560 per day for YouTube\'s annual storage cost from one day\'s uploads. But you stored only the raw upload file. YouTube encodes every video into ~1,000 format/quality/bitrate variants for adaptive streaming. If storage volume increases 4x from transcoding and annual cost is monthly cost × 12, what is the corrected annual cost — and what does it imply about YouTube\'s total infrastructure bill?"',
    },
  },

  {
    id: 'EST23',
    title: 'Active WhatsApp Groups Globally',
    subtitle: 'User Behavior · Messaging',
    difficulty: 'analyst',
    isFree: false,
    tags: ['WhatsApp', 'messaging', 'groups', 'social', 'global'],
    category: 'users',
    approach: 'bottom-up',

    prompt: 'Estimate the number of active WhatsApp groups globally.',

    frameworkSteps: [
      'Step 1 — Anchor with WhatsApp\'s total user base: How many people use WhatsApp monthly?',
      'Step 2 — Estimate group participation rate: What fraction of WhatsApp users are in at least one active group?',
      'Step 3 — Estimate groups per active group user: On average, how many groups is a typical user in?',
      'Step 4 — Estimate average group size: How many members per group on average?',
      'Step 5 — Calculate total groups, then apply an activity filter.',
    ],

    hints: [
      'WhatsApp has ~2.78 billion monthly active users globally (Meta 2023 disclosure).',
      'WhatsApp groups are widely used across the world for family, work, school, neighborhood, and social coordination — especially in emerging markets. Penetration in group usage is very high.',
      'A typical WhatsApp user might be in 5-10 groups of varying activity levels.',
      'WhatsApp allows up to 1,024 members per group (raised from 512 in 2022), but the vast majority of groups are small: family groups (5-15 people), friend groups (5-20), work groups (10-50).',
      'Define "active" as a group that had at least one message in the past 30 days.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: WhatsApp MAU.\nWhatsApp MAU: ~2.78B (Meta disclosed 2B+ as of early 2024; industry estimates are 2.7-2.9B).\n\nStep 2: Group participation rate.\nWhatsApp groups are ubiquitous. Usage patterns:\n- In India (largest market, ~500M users): almost every user is in multiple family and neighborhood groups.\n- In Brazil, Mexico, Indonesia: similar high-group-usage patterns.\n- In the US/EU: lower group usage; people use iMessage or SMS groups.\nEstimate: ~75% of MAU are in at least one active group = 2.78B × 0.75 = ~2.1B group-participating users.\n\nStep 3: Groups per user.\nTypical active group user:\n- 1-2 family groups (immediate family, extended family)\n- 1-2 friend circles\n- 1-2 work/professional groups\n- 1 school/class group (especially in EM markets)\nAverage: ~6 groups per user, but many are low-activity.\n\nTotal group memberships: 2.1B users × 6 groups = 12.6B group memberships.\n\nStep 4: Average group size.\nMost groups are small: the median WhatsApp group probably has 10-15 members. Large groups (100+) are rare and skew the average up. Blended average: ~20 members per group.\n\nTotal unique groups: 12.6B memberships / 20 members per group = 630M total groups.\n\nStep 5: Apply activity filter.\nNot all groups are active. Many groups are created and go quiet. Define active = ≥1 message in past 30 days.\nEstimate: ~60% of all groups are active in any given month → 630M × 0.60 = ~378M active groups.\n\nRange: 300M–450M active WhatsApp groups globally.',
      keyAssumptions: [
        '2.78B WhatsApp MAU — Meta\'s disclosed figure; consistent with public reports',
        '75% of users are in at least one active group — based on WhatsApp\'s group-centric usage in India, Brazil, Indonesia (the 3 largest markets)',
        '6 groups per active group user — median user is in family, friends, work, and neighborhood groups; power users in 15-20',
        '20 members per group average — median group is a small family/friend circle; larger groups skew the average up from ~10',
        '60% activity rate — large fraction of groups fade after initial creation; many seasonal or event-based groups go dormant',
      ],
      finalEstimate: 'Range: 300M–450M active WhatsApp groups globally; ~375M central estimate',
      sanityChecks: [
        '100M groups per billion users: At 375M groups / 2.78B users = ~1 active group per 7.4 users. That feels low — suggests roughly 1 active group per extended family unit, which is consistent with WhatsApp\'s role as a family communication tool.',
        'Messages per group check: WhatsApp reportedly delivers ~100B messages per day. If 375M active groups each send ~150-200 messages/day on average (some very active, many quiet): 375M × 175 = ~66B messages from groups. Plus individual DMs accounting for the remainder. Plausible.',
        'Comparison: Telegram has ~900M users and reports ~700M monthly users; Telegram\'s group/channel structure is heavier. WhatsApp\'s more personal nature suggests fewer but more intimate groups per user. Our estimate is consistent with this positioning.',
      ],
    },

    strongAnswerMarkers: [
      'Distinguishes group participation rate from the total user base (not all 2.78B users are in active groups)',
      'Notes the geographic skew — WhatsApp group usage in India, Brazil, Indonesia is fundamentally higher than in US/EU',
      'Converts group memberships to unique groups by dividing by average group size — a critical step',
      'Applies a dormancy/activity filter rather than treating all groups as active',
      'Arrives at a range with a reasoned central estimate',
    ],

    commonMistakes: [
      'Using the total WhatsApp user count as the number of groups — confusing users with groups',
      'Forgetting to divide by average group size when converting memberships to unique groups (gets 12.6B instead of 375M)',
      'Assuming all created groups are active — many WhatsApp groups are created for events and then go dormant',
      'Not accounting for geographic variation — applying US/EU group behavior to the global user base significantly underestimates group usage in India and Latin America',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates 2 billion WhatsApp users, assumes each user is in 3 groups, and states 6 billion active WhatsApp groups. They forget to divide by the average group size to convert group memberships into unique groups — a fundamental double-counting error that inflates the answer by roughly 15-20x.',
      interviewerFollowUp: '"You said 6 billion WhatsApp groups by multiplying 2B users × 3 groups each. But each of those 3 groups also counts all the other members — so you\'re counting the same group once per member. If the average group has 15 members, what is the unique group count — and how does that change your answer?"',
    },
  },

  {
    id: 'EST24',
    title: 'Google Maps\' Server Infrastructure Cost Per User Per Year',
    subtitle: 'Cost Estimation · Infrastructure · Maps',
    difficulty: 'staff',
    isFree: false,
    tags: ['Google Maps', 'infrastructure', 'cost-per-user', 'APIs', 'cloud'],
    category: 'cost-estimation',
    approach: 'bottom-up',

    prompt: 'Estimate Google Maps\' server infrastructure cost per user per year.',

    frameworkSteps: [
      'Step 1 — Identify cost components: Maps involves tile serving, geocoding, routing, real-time traffic, Places API, and Street View.',
      'Step 2 — Estimate usage per user per year: Sessions per day, queries per session, data transferred per query.',
      'Step 3 — Estimate compute and storage cost per unit of usage.',
      'Step 4 — Sum up the cost per user and cross-check against Google Maps Platform API pricing as a proxy.',
    ],

    hints: [
      'Google Maps has ~1 billion monthly active users. For this problem, focus on the consumer app (not the API/developer business).',
      'Cost components: (1) Map tile serving — serving raster/vector tiles to render the map, (2) Routing/directions — compute-intensive graph search, (3) Search/Places — geocoding and POI lookup, (4) Real-time traffic — sensor data processing, (5) Street View — high-bandwidth image serving.',
      'Google Maps Platform API pricing (public): Static Maps = $2/1,000 requests; Directions API = $5/1,000; Places API = $17/1,000. These are revenue-priced at ~3-5x Google\'s internal cost. Use this to back into cost.',
      'A typical Maps user: opens the app ~3x/week, averages 4 tile loads per session, 1 route per session. A heavy user opens it 2x/day.',
      'Google\'s internal compute costs are dramatically lower than cloud list price — similar to the storage discount (40-60% below public cloud rates).',
    ],

    modelAnswer: {
      walkthrough: 'Approach: Break down cost by usage component.\n\nUser profile — average consumer Maps user:\nSessions per week: ~4 sessions (commute + weekend errands + occasional trips).\nSessions per year: 4 × 52 = ~208 sessions/year.\nPer session:\n- ~10-15 map tile loads (panning, zooming)\n- ~0.5 route requests (not every session uses navigation)\n- ~0.5 place searches (restaurant lookups, etc.)\n\nComponent 1: Map tile serving.\n208 sessions × 12 tiles/session = 2,496 tile requests/year.\nEach tile is a small data packet (~20-50 KB for vector tiles). Data transfer: 2,496 × 35 KB = ~87 MB/year.\nCloud data egress: ~$0.05-0.08/GB. Google\'s internal cost: ~$0.03/GB.\nTile serving data cost: 0.087 GB × $0.03 = ~$0.003/year.\nTile serving compute (rendering, CDN): estimate ~$0.50/1,000 tiles → 2,496/1,000 × $0.50 = $1.25. But at Google scale with massive CDN caching, effective cost is 10-20x lower: ~$0.10/user/year for tiles.\n\nComponent 2: Routing (Directions).\n208 sessions × 0.5 routes = 104 route requests/year.\nGoogle Maps Platform Directions API: $5/1,000 requests (retail). Internal cost at 20% of retail: $0.001/request.\nRouting cost per user: 104 × $0.001 = $0.10/year.\n\nComponent 3: Places/Search.\n208 × 0.5 = 104 place searches/year.\nPlaces API retail: ~$17/1,000 = $0.017/request. Internal cost at 20%: ~$0.0034/request.\nPlaces cost: 104 × $0.0034 = ~$0.35/year.\n\nComponent 4: Real-time traffic data processing.\nMaps continuously processes GPS signals, road sensor data, and incident reports. This is a fixed infrastructure cost spread across 1B users.\nGoogle\'s annual traffic data infrastructure (estimated): $300-500M/year globally.\nPer user: $400M / 1B users = $0.40/user/year.\n\nComponent 5: Street View image serving.\nMost users occasionally view Street View (maybe 10 sessions/year at 30-second views).\nEach Street View load: ~2-5 MB of panoramic images. 10 sessions × 3 MB = 30 MB/year.\nStorage + egress: ~$0.005/user/year.\n\nTotal cost per user per year: $0.10 + $0.10 + $0.35 + $0.40 + $0.005 = ~$0.96/user/year.\n\nRange: $0.50–$1.50/user/year for Google Maps infrastructure cost.',
      keyAssumptions: [
        'Google Maps 1B MAU consumer app — this is the user base for infrastructure amortization',
        'Internal cost is ~20% of Google Maps Platform API retail price — Google\'s internal cost advantage and the API price includes significant margin',
        '4 sessions/week average — blended across heavy navigators (daily) and casual users (occasional)',
        '$400M/year traffic data infrastructure — rough estimate based on Google\'s disclosed capex and Maps\' share of infrastructure',
      ],
      finalEstimate: 'Range: $0.50–$1.50 per user per year; ~$1.00 central estimate',
      sanityChecks: [
        'Google Maps Platform revenue: Google earns ~$2-3B/year from Maps API/Platform (developer revenue). At $1/user/year internal cost × 1B users = $1B total infrastructure cost. Gross margin on Platform would be ~50-66%. Plausible for a developer API business.',
        'Comparison to YouTube: YouTube costs Google ~$3-4/user/year in infrastructure (video is vastly more bandwidth-intensive). Maps at ~$1/user is in the right order of magnitude for a mostly text-and-tile product.',
        'Per-request check: ~400 total API-equivalent requests/user/year × $0.0025 blended internal cost/request = $1.00/user/year. Consistent.',
      ],
    },

    strongAnswerMarkers: [
      'Decomposes the problem into distinct cost components (tiles, routing, places, traffic, Street View) rather than treating Maps as a monolith',
      'Uses Google Maps Platform API pricing as a public proxy, then discounts it to estimate internal cost',
      'Quantifies data transfer separately from compute cost',
      'Amortizes fixed infrastructure (real-time traffic processing) across the user base',
      'Cross-checks against Google Maps Platform revenue and YouTube cost benchmarks',
    ],

    commonMistakes: [
      'Using public cloud API pricing directly as Google\'s internal cost — Google\'s internal cost is 10-20% of retail API prices',
      'Ignoring the fixed infrastructure cost of real-time traffic data processing — this is a significant and often-overlooked component',
      'Treating all 1B users as heavy navigators — the vast majority of casual users generate far less tile/routing traffic',
      'Forgetting to separate data transfer costs from compute costs — both are real and additive',
    ],
    failureMode: {
      weakAnswer: 'The candidate takes Google Maps\' public API pricing ($2 per 1,000 map tile loads), estimates 1 billion users × 10 tile loads/session × 1 session/day = 10 billion tile loads/day × $0.002 = $20M/day = $7B/year in infrastructure cost. They use Google\'s own retail API pricing (which is revenue, not internal cost) and get a number that implies Google loses money on Maps before any other expenses.',
      interviewerFollowUp: '"You used Google\'s public Maps API price as a proxy for their internal infrastructure cost. That API price is what Google charges external developers — it includes margin. Google\'s actual internal infrastructure cost is estimated at 5-15% of that price. How does adjusting to 10% of your per-tile cost change your annual estimate?"',
    },
  },

  {
    id: 'EST25',
    title: 'Airbnb Listings in New York City',
    subtitle: 'Market Sizing · Accommodation',
    difficulty: 'analyst',
    isFree: false,
    tags: ['Airbnb', 'listings', 'NYC', 'market-sizing', 'accommodation'],
    category: 'market-sizing',
    approach: 'bottom-up',

    prompt: 'Estimate the number of Airbnb listings in New York City.',

    frameworkSteps: [
      'Step 1 — Estimate NYC\'s total housing stock: How many residential units exist in NYC?',
      'Step 2 — Estimate the share of units listed on Airbnb: What fraction of homeowners and renters put their home on Airbnb?',
      'Step 3 — Account for NYC\'s short-term rental regulations: Local Law 18 (2023) significantly restricts legal STRs.',
      'Step 4 — Cross-check with public data: Inside Airbnb and NYC Open Data publish listing counts.',
    ],

    hints: [
      'NYC has approximately 3.5 million housing units total (apartments, condos, co-ops, townhouses).',
      'NYC enacted Local Law 18 in September 2023, requiring hosts to be present during guest stays and limiting listings to 2 guests at a time — this dramatically reduced legal listings from ~40,000 to ~4,000-6,000 active legal listings.',
      'Pre-regulation (pre-2023): Airbnb had ~40,000-50,000 listings in NYC. Post-regulation: listings dropped ~90% in the legal category.',
      'The question asks for listings "in New York City" — consider whether to estimate current legal listings or total including non-compliant ones.',
      'Inside Airbnb (a public dataset) tracked NYC listings: ~22,000 as of mid-2023 before LL18 enforcement, dropping to ~3,700 by early 2024.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: NYC housing stock.\nNYC has ~3.5M residential units. Ownership breakdown:\n- ~30% owner-occupied (condos, co-ops, townhouses): ~1.05M units\n- ~70% renter-occupied: ~2.45M units\n\nStep 2: Pre-regulation estimate (to understand baseline).\nAirbnb hosting requires willingness to host strangers, regulatory compliance, and a unit type suitable for guests.\nPre-LL18 (before Sept 2023) estimate:\nAmong owner-occupied units, ~3% might list on Airbnb = 1.05M × 0.03 = 31,500 listings.\nAmong rental units, tenants subletting illegally or legally: ~0.5% = 2.45M × 0.005 = 12,250 listings.\nTotal pre-regulation: ~43,750 listings. Consistent with the ~40,000-50,000 reported before 2023.\n\nStep 3: Post-regulation (current, post-Sept 2023).\nNYC Local Law 18 requires:\n(a) Host must be present during guest stays (no "whole unit" rentals)\n(b) Max 2 guests\n(c) Registration with NYC government\n\nThis eliminated most whole-unit vacation rentals. The practical effect:\n- Owner-occupied hosts who can remain present while renting a spare room: ~0.3% of owner units = 1.05M × 0.003 = 3,150\n- Renters with a spare room and lease allowing subletting: very rare, ~0.1% = 2.45M × 0.001 = 2,450\nTotal compliant listings post-LL18: ~5,600.\n\nSome non-compliant listings still exist (enforcement is imperfect). Add ~30% non-compliant: 5,600 × 1.30 = ~7,300 total active listings (including those operating illegally).\n\nRange: 4,000–8,000 active Airbnb listings in NYC today.\nPre-regulation range: 35,000–50,000 (for historical context).',
      keyAssumptions: [
        'NYC has 3.5M housing units — NYC Housing and Vacancy Survey data; this is a well-documented figure',
        '30% owner-occupied vs. 70% renter — NYC is one of the highest renter-proportion cities in the US',
        'Local Law 18 (Sept 2023) reduced compliant listings by ~90% — this is confirmed by Inside Airbnb data and news reporting',
        '~30% of current listings are non-compliant but still active — enforcement lags registration requirements',
      ],
      finalEstimate: 'Post-LL18: 4,000–8,000 active listings; ~6,000 central estimate. Pre-LL18 historical: ~40,000–50,000.',
      sanityChecks: [
        'Inside Airbnb public data: NYC had ~22,000 listings in mid-2023 before LL18 enforcement, dropping to ~3,700-4,000 by Jan 2024. Our estimate of 4,000-8,000 (including some non-compliant) is consistent.',
        'Revenue check: At ~6,000 listings × 50% occupancy × 365 nights × $200/night × 15% service fee: 6,000 × 182.5 × $200 × 0.15 = ~$32.8M annual revenue for Airbnb from NYC. Pre-LL18: 40,000 × 45% × 365 × $180 × 0.15 = ~$177M. The LL18 impact is significant — NYC went from being Airbnb\'s largest US market to a sharply reduced one.',
        'Hotel room count check: NYC has ~120,000 hotel rooms. At 6,000 Airbnb listings, Airbnb represents about 5% of the short-term accommodation inventory — far below the ~30% share it had pre-regulation. Consistent with the regulatory reset.',
      ],
    },

    strongAnswerMarkers: [
      'Knows about NYC\'s Local Law 18 (2023) and quantifies its dramatic impact on listing count',
      'Builds from housing stock using owner-occupied vs. renter breakdown',
      'Provides both historical (pre-regulation) and current (post-regulation) estimates',
      'Cross-checks against Inside Airbnb public data',
      'Notes that non-compliant listings still exist (enforcement is imperfect)',
    ],

    commonMistakes: [
      'Not knowing about Local Law 18 and giving a ~40,000 estimate as if regulations don\'t exist — this is the most important contextual fact for this question',
      'Starting with US Airbnb total listings (~7M) and estimating NYC\'s share without bottom-up housing stock analysis',
      'Forgetting that most NYC residents are renters, not owners — NYC\'s 70% renter rate is far above the US average',
      'Ignoring that whole-unit vacation rentals are now essentially banned in NYC (host must be present)',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates NYC housing stock at 3.5 million units, applies a 1% STR penetration rate, and arrives at 35,000 Airbnb listings — a reasonable pre-2023 estimate. They are unaware that NYC\'s Local Law 18 took effect in September 2023, which requires hosts to register and be present during stays, effectively eliminating whole-unit short-term rentals and cutting active listings from ~40,000 to under 5,000.',
      interviewerFollowUp: '"You got 35,000 listings based on a 1% penetration rate. In September 2023 New York City enacted Local Law 18 requiring host presence and registration. What does that regulation specifically prohibit — and how would awareness of that law change both your estimate and the structure of your answer?"',
    },
  },

  {
    id: 'EST26',
    title: 'Daily Instagram Stories Users Globally',
    subtitle: 'Product Metrics · Social Media',
    difficulty: 'analyst',
    isFree: false,
    tags: ['Instagram', 'Stories', 'DAU', 'social media', 'Meta'],
    category: 'users',
    approach: 'bottom-up',

    prompt: 'Estimate how many people use Instagram Stories daily.',

    frameworkSteps: [
      'Step 1 — Anchor with Instagram\'s total user base: Monthly and daily active users.',
      'Step 2 — Define "use Instagram Stories": This means viewing or posting a Story, not just opening the app.',
      'Step 3 — Estimate the Stories engagement rate among daily active users.',
      'Step 4 — Cross-check against Meta\'s disclosed Stories metrics.',
    ],

    hints: [
      'Instagram has ~2B MAU and ~500M DAU globally (Meta 2023 disclosures).',
      'Meta has disclosed in past earnings calls and blog posts that Stories is used by 500 million accounts daily across Facebook and Instagram. Instagram-specific figure: ~400M+ accounts view or post Stories daily.',
      'Stories is the primary consumption format on Instagram — the horizontal scrolling grid is secondary for younger users.',
      'Distinguish between "viewing" a Story (much higher frequency) and "posting" a Story (maybe 5-10% of DAU post daily; nearly all DAU view).',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Instagram user base.\nInstagram MAU: ~2 billion (Meta reported in 2023).\nInstagram DAU: roughly 500M, assuming a 25% DAU/MAU ratio (Instagram is a daily-use app for many but not all MAU check in daily; 25% is a reasonable blended rate for a social media platform with high frequency but also passive/monthly users).\n\nStep 2: Stories engagement among DAU.\nStories is the default entry point on Instagram — when you open the app, Stories appear at the top of the feed. Nearly every DAU is exposed to Stories.\n\nStories viewers: ~90% of DAU view at least one Story per day = 500M × 0.90 = 450M viewers/day.\n\nStories posters: Typically 5-10% of DAU post a Story daily. 500M × 0.075 = ~37.5M posters/day.\n\n"Using" Stories (viewers + posters; most overlap, so this is basically the viewer count since all posters are also viewers): ~450M daily Stories users.\n\nStep 3: Cross-check.\nMeta disclosed in 2018 that "500 million accounts use Stories on Instagram every day." This was the figure at a point when Instagram MAU was ~1B. With MAU now at 2B, extrapolating: 500M × (2B/1B) × modest decay for saturation ≈ 600-700M? But Stories engagement rates may have declined as Reels became dominant.\n\nConservative estimate anchored on more recent signals: ~400M–500M daily Stories users.\n\nRange: 350M–500M people use Instagram Stories daily.',
      keyAssumptions: [
        'Instagram MAU: 2B (Meta 2023)',
        'Instagram DAU/MAU ratio: 25% → ~500M DAU',
        '90% of DAU view at least one Story daily — Stories is the topmost UI element and nearly unavoidable',
        'Meta\'s 2018 disclosure of 500M daily Stories users on Instagram as an anchor, adjusted for MAU growth and Reels competition',
      ],
      finalEstimate: 'Range: 350M–500M people use Instagram Stories daily; ~400M–450M central estimate',
      sanityChecks: [
        'Meta\'s stated figure: Meta disclosed 500M daily Instagram Stories users in 2018 when Instagram had ~1B MAU. With MAU doubled to 2B but Reels now dominant, ~400M-500M today is directionally consistent.',
        'Penetration check: 400M Stories users / 2B MAU = 20% of all Instagram accounts interact with Stories daily. This is a high but plausible engagement rate for the app\'s primary consumption feature.',
        'Creator check: If 5-10% of 500M DAU post Stories daily: 25M-50M posts/day. With each Story post containing 1-3 frames on average: 50-150M Story frames uploaded per day. At ~200KB per frame: 10-30 TB of Stories content uploaded per day — consistent with Instagram\'s infrastructure scale.',
      ],
    },

    strongAnswerMarkers: [
      'Distinguishes between MAU (2B) and DAU (500M) and applies the DAU/MAU ratio correctly',
      'Separates Story viewers from Story posters — a much larger fraction of DAU views than posts',
      'Recalls Meta\'s own disclosed figure (~500M daily Stories users) as a primary anchor',
      'Notes the competitive tension with Reels, which may have reduced Stories engagement',
      'Provides a range rather than a single number',
    ],

    commonMistakes: [
      'Using MAU (2B) as the base for daily Stories users — confusing monthly and daily engagement',
      'Assuming only "posters" use Stories — the vast majority of Stories usage is passive viewing',
      'Not knowing Meta\'s 500M daily Stories users disclosure — this is a widely-cited publicly available figure',
      'Ignoring the Reels factor — Reels has taken significant share of session time from Stories since 2020',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates that Instagram has 2 billion MAU, assumes 20% of users post a Story each day, and arrives at 400M daily Stories users. They frame the answer around posters only — missing that the vast majority of daily Stories users are viewers, not posters — and use a posting rate that conflates creators with consumers.',
      interviewerFollowUp: '"You estimated 400M daily Stories users based on 20% of MAU posting daily. Meta has disclosed 500M daily Stories users across their apps. The gap is small, but your logic is wrong: you\'re counting posters, not all users who interact with Stories. If only 5% of DAU post but 40% view, which number does the question ask for — and why does the distinction matter for product decisions about the Stories feature?"',
    },
  },

  {
    id: 'EST27',
    title: 'Netflix Bandwidth During US Peak Hours',
    subtitle: 'Infrastructure · Streaming · Bandwidth',
    difficulty: 'senior',
    isFree: false,
    tags: ['Netflix', 'bandwidth', 'streaming', 'infrastructure', 'peak traffic'],
    category: 'infrastructure',
    approach: 'bottom-up',

    prompt: 'Estimate the bandwidth Netflix uses during peak hours in the US.',

    frameworkSteps: [
      'Step 1 — Estimate concurrent US Netflix viewers during peak hours: When does peak occur and how many streams are active?',
      'Step 2 — Estimate average bitrate per stream: Quality varies by device and plan.',
      'Step 3 — Calculate total bandwidth as concurrent streams × average bitrate.',
      'Step 4 — Cross-check against public data (Sandvine Internet Phenomena Report, Netflix Open Connect disclosures).',
    ],

    hints: [
      'Netflix has ~80M US subscribers. Peak viewing is 8-11pm Eastern on weekdays and weekends.',
      'Netflix\'s average bitrate varies: SD = ~3 Mbps, HD = ~5 Mbps, 4K = ~15-25 Mbps. Most US viewers watch in HD. Blended average: ~7-8 Mbps.',
      'Sandvine\'s 2023 Internet Phenomena Report: Netflix accounts for ~15% of all internet downstream traffic globally. In North America, Netflix has historically been ~35-37% of peak downstream traffic.',
      'US broadband peak traffic: ~40-50 Tbps of total downstream during peak hours (estimated from ISP capacity data).',
      'Concurrent stream count: At peak, roughly 20-25% of US subscribers are watching simultaneously.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Concurrent US Netflix streams at peak.\nNetflix US subscribers: ~80M.\nPeak concurrent viewer rate: 20-25% of subscribers. This accounts for:\n- Not all subscribers are in the US timezone simultaneously at peak (8-11pm ET)\n- Households share a subscription (avg ~2.3 people per household, but the concurrent stream count is per household, not per person)\n- Not everyone watches every night\n\nUS concurrent streams at peak: 80M × 0.22 = ~17.6M concurrent streams.\n\nNote: Netflix allows 2-4 simultaneous streams per account depending on plan. Many households have multiple concurrent streams. Adjusting: 80M accounts × 25% active accounts × 1.3 average streams per active account = 26M concurrent streams.\n\nUse 20M concurrent streams as a midpoint estimate.\n\nStep 2: Average bitrate per stream.\nNetflix plan distribution (US, 2024):\n- Standard with ads: ~25% → mostly HD (1080p) = 5 Mbps\n- Standard: ~30% → HD = 5 Mbps\n- Premium: ~35% → 4K UHD = 15 Mbps average (not all 4K-capable TVs or content)\n- Basic/legacy: ~10% → SD = 3 Mbps\n\nBlended average bitrate: (25%×5) + (30%×5) + (35%×12) + (10%×3) = 1.25 + 1.50 + 4.20 + 0.30 = 7.25 Mbps per stream.\n\nAlso: Netflix uses adaptive bitrate (ABR) — quality adjusts to network conditions. During peak when networks are congested, actual delivered bitrate may drop to 4-5 Mbps. Use 6 Mbps as a congestion-adjusted blended average.\n\nStep 3: Total peak bandwidth.\n20M concurrent streams × 6 Mbps = 120 million Mbps = 120,000 Gbps = 120 Tbps.\n\nRange: 80–150 Tbps.',
      keyAssumptions: [
        'Netflix US subscribers: 80M (Netflix Q4 2023 earnings; Netflix reported ~260M global; US is ~31%)',
        '25% peak concurrent rate — industry benchmark; Netflix\'s Open Connect CDN documentation references similar figures',
        '1.3 streams per active account at peak — multi-room viewing is common in households with Premium plans',
        '6 Mbps blended effective bitrate — lower than theoretical max due to ABR throttling during congestion',
      ],
      finalEstimate: 'Range: 80–150 Tbps of bandwidth during US peak hours; ~120 Tbps central estimate',
      sanityChecks: [
        'Sandvine check: Sandvine 2023 reports Netflix as ~15% of global downstream traffic. Global internet traffic ~1,000 Tbps. Netflix global = ~150 Tbps. US peak is a subset of global peak. North America is ~40% of global internet traffic → ~400 Tbps North American total → Netflix at 35% of peak = ~140 Tbps. Consistent with our 120 Tbps estimate.',
        'Netflix Open Connect: Netflix has publicly disclosed that its Open Connect CDN (which delivers Netflix content directly from ISP networks) handles "petabytes per day" of traffic. 1 PB/day = 8 × 10^15 bits / 86,400 seconds = ~92 Tbps average; peaks higher. Consistent.',
        'Per-user check: 120 Tbps / 20M concurrent streams = 6,000 kbps = 6 Mbps per stream. This matches our assumed average bitrate — internally consistent.',
      ],
    },

    strongAnswerMarkers: [
      'Estimates concurrent streams (not subscribers) as the key driver — recognizing that peak concurrent << total subscribers',
      'Accounts for multi-stream households (1.3 streams per active account)',
      'Uses plan distribution and quality tier to compute a weighted average bitrate',
      'Adjusts for ABR throttling during congestion — the delivered bitrate is lower than the nominal maximum',
      'Cross-checks using Sandvine Internet Phenomena Report data and Netflix Open Connect disclosures',
    ],

    commonMistakes: [
      'Using total subscribers (80M) instead of peak concurrent streams (~20M) — this overstates bandwidth by 4x',
      'Using the peak 4K bitrate (25 Mbps) for all streams — the blended average is far lower (6-8 Mbps)',
      'Ignoring ABR — Netflix adaptively reduces quality when networks are congested; theoretical max bitrate ≠ actual delivered',
      'Confusing global Netflix bandwidth with US peak bandwidth',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates 80M US subscribers × 4K streaming bitrate of 25 Mbps = 2,000 Tbps (2 Pbps) of Netflix US peak bandwidth. They use total subscribers instead of peak concurrent streams (~20M), and apply the maximum 4K bitrate rather than the blended average (most streams are HD at 5-8 Mbps, not 4K at 25 Mbps).',
      interviewerFollowUp: '"You said 2 Pbps of peak bandwidth. Sandvine reports Netflix accounts for roughly 15% of global internet traffic. The entire US internet backbone handles about 600 Tbps at peak. Your estimate of 2,000 Tbps is 3x the entire US internet capacity. What are the two overestimates in your calculation — and what does the corrected answer look like?"',
    },
  },

  {
    id: 'EST28',
    title: 'Stripe\'s Daily Customer Support Tickets',
    subtitle: 'Operations · FinTech · Support Volume',
    difficulty: 'senior',
    isFree: false,
    tags: ['Stripe', 'customer support', 'fintech', 'tickets', 'operations'],
    category: 'volume',
    approach: 'bottom-up',

    prompt: 'Estimate the number of customer support tickets Stripe handles per day.',

    frameworkSteps: [
      'Step 1 — Estimate Stripe\'s active merchant base: How many businesses use Stripe?',
      'Step 2 — Estimate ticket rate per merchant: What fraction of active merchants submit a support ticket on a given day?',
      'Step 3 — Estimate the developer/API consumer segment: Stripe has a large developer user base that generates technical support tickets.',
      'Step 4 — Account for volume spikes: Ticket volume correlates with payment failures, fraud events, and platform incidents.',
    ],

    hints: [
      'Stripe processes payments for millions of businesses. Stripe has stated it works with "millions of businesses" globally; estimates put active users at 4-5M businesses.',
      'Support ticket rates for payment processors are typically low per-merchant per-day — most merchants don\'t contact support daily. A typical SaaS product sees ~0.5-2% of users submit a ticket per month.',
      'Stripe\'s user base is heavily developer-skewed. Documentation questions, API integration issues, and sandbox testing problems generate technical tickets.',
      'Stripe also handles issuer/acquirer disputes, fraud alerts, and compliance queries — these are often higher-severity and more time-consuming than basic onboarding tickets.',
      'Compare with a known benchmark: Zendesk reports B2B SaaS companies typically handle 100-500 support tickets per 1,000 monthly active users per month.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Stripe\'s active merchant base.\nStripe has disclosed "millions of companies" use Stripe. Industry estimates: ~4-5M active businesses.\nSegment breakdown:\n- Startups and developers (integrating/testing): ~2M accounts (many low-volume, often technical support)\n- SMBs and mid-market (regular payment processing): ~1.5M businesses\n- Enterprise/large companies: ~50,000 (Stripe\'s "Stripe Corporate" segment)\n\nStep 2: Daily ticket rate by segment.\n\nStartups/developers:\nThese users hit integration issues, API errors, sandbox questions. Monthly ticket rate: ~2% of this segment submits a ticket per month.\nDaily tickets: 2M × 0.02 / 30 = ~1,333 tickets/day.\n\nSMBs/mid-market:\nIssues: payment disputes, fraud, failed transactions, payout questions. Monthly ticket rate: ~1% per month.\nDaily tickets: 1.5M × 0.01 / 30 = 500 tickets/day.\n\nEnterprise:\nDedicated support channels, often via Slack/email with designated account managers. Monthly ticket rate: ~5% of enterprise accounts have a touch per month (many through non-ticket channels).\nDaily tickets through formal ticketing: 50,000 × 0.05 / 30 = ~83 tickets/day.\n\nStep 3: Cardholder/payment-end tickets.\nStripe also handles inquiries from consumers who see "Stripe" on their bank statement. These are typically redirected to the merchant, but some arrive at Stripe.\nEstimate: ~200 such tickets/day (Stripe tries to minimize this channel).\n\nStep 4: Total.\nTotal daily tickets: 1,333 + 500 + 83 + 200 = ~2,116 tickets/day.\n\nAdd a spike/incident multiplier: On normal days, this is the baseline. On days with payment network outages or fraud spikes, volume may 2-3x. Average daily including incident days: ~2,500 tickets/day.\n\nRange: 1,500–4,000 tickets/day.',
      keyAssumptions: [
        'Stripe has 4-5M active businesses — based on Stripe\'s disclosed "millions of companies" and analyst estimates',
        'Developer/startup segment (2M accounts) has a higher ticket rate (2%/month) due to integration complexity',
        'SMB segment (1.5M businesses) generates ~1%/month ticket rate — lower per-account but large in number',
        'Enterprise segment uses dedicated success managers for most issues, reducing formal ticket volume',
      ],
      finalEstimate: 'Range: 1,500–4,000 tickets/day; ~2,500 central estimate',
      sanityChecks: [
        'Support team size check: Stripe employs ~8,000 people (per their own hiring disclosures). If 15% are in support/operations: ~1,200 support staff. At 10 tickets/agent/day: 12,000 tickets/day capacity. Our 2,500 estimate implies ~25% support staff utilization — plausible if many support staff handle complex/long-form issues rather than high-volume simple tickets.',
        'Comparison with similar companies: Twilio (API/developer-focused like Stripe) serves ~300k active accounts and reportedly handles ~5,000-10,000 tickets/month = ~170-330/day. Stripe at 10-15x the merchant scale: 1,700-5,000/day. Consistent.',
        'Transaction volume check: Stripe processed ~$817B in payment volume in 2023. If 0.01% of transactions generate a support touch: $817B / $50 avg transaction = ~16.3B transactions. 0.01% × 16.3B / 365 = 4,466 per day. Our estimate is in the right order of magnitude.',
      ],
    },

    strongAnswerMarkers: [
      'Segments Stripe\'s user base (developers, SMBs, enterprise) with differentiated ticket rates',
      'Accounts for the developer/API segment which generates technical support disproportionately',
      'Notes that enterprise customers often use dedicated account management rather than ticketing systems',
      'Provides a baseline and accounts for incident-driven spikes',
      'Cross-checks against Stripe\'s headcount and transaction volume proxies',
    ],

    commonMistakes: [
      'Using the total number of Stripe API calls (millions per day) as a proxy for tickets — the vast majority of API calls generate no support contact',
      'Applying a consumer-app ticket rate to a developer-focused B2B product — Stripe\'s support needs are different from a consumer app',
      'Forgetting the spike factor — payment processor support volumes are highly correlated with outages and fraud events',
      'Not segmenting by merchant type — a 10-person startup and a Fortune 500 company have very different support interaction patterns',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates Stripe processes 500M transactions/day, applies a 1% ticket rate (one ticket per 100 transactions), and arrives at 5M daily support tickets. They treat every failed transaction as a support contact, apply a consumer-app contact rate to a B2B developer platform, and never distinguish between automated error responses and actual human support tickets.',
      interviewerFollowUp: '"You applied a 1% ticket-per-transaction rate. Most Stripe errors are handled programmatically by developer code — they never result in a human support ticket. What is the difference between a Stripe API error (handled in code) and a support ticket (a human contacts Stripe), and how does that distinction collapse your estimate by 2-3 orders of magnitude?"',
    },
  },

  {
    id: 'EST29',
    title: 'Amazon Fulfillment Floor Space for Prime Day',
    subtitle: 'Operations · E-Commerce · Logistics',
    difficulty: 'staff',
    isFree: false,
    tags: ['Amazon', 'Prime Day', 'fulfillment', 'logistics', 'warehousing'],
    category: 'operations',
    approach: 'bottom-up',

    prompt: 'Estimate the additional Amazon fulfillment center floor space needed to support Prime Day inventory surge.',

    frameworkSteps: [
      'Step 1 — Estimate Prime Day order volume uplift: How many more orders does Amazon fulfill on Prime Day vs. a typical day?',
      'Step 2 — Estimate inventory pre-staging: Prime Day inventory is built up days/weeks before the event.',
      'Step 3 — Calculate the incremental physical space requirement: How much floor space does each incremental unit of inventory require?',
      'Step 4 — Cross-check against Amazon\'s known fulfillment network capacity.',
    ],

    hints: [
      'Amazon reported ~$12.9B in Prime Day 2023 sales over 2 days (~$6.45B/day). A typical non-Prime-Day day for Amazon in 2023 averaged ~$1.2B/day in product sales.',
      'Prime Day peak order rate is ~5-6x a typical day. Fulfillment centers pre-stage inventory 2-4 weeks in advance.',
      'Amazon has ~400+ fulfillment centers in the US totaling ~400M sq ft. An average fulfillment center is ~1M sq ft.',
      'Inventory density in Amazon fulfillment centers: ~350-400 units per square foot of storage (using vertical racking and robotic systems). Each unit averages ~0.5 lb and fits in a tote or bin.',
      'Think about SKU variety: Prime Day deals span millions of SKUs. Each SKU requires dedicated storage slots regardless of volume.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Prime Day order volume vs. typical day.\nPrime Day 2023: ~$12.9B over 2 days = ~$6.45B/day.\nTypical Amazon day: ~$1.2B in third-party + first-party product sales.\nUplift ratio: 6.45 / 1.2 = ~5.4x typical day volume.\n\nDaily order count baseline: At ~$40 average order value, 1.2B/40 = 30M orders/day typical.\nPrime Day daily orders: 30M × 5.4 = ~162M orders on each Prime Day.\n\nStep 2: Inventory pre-staging.\nTo fulfill Prime Day orders without stockouts, Amazon pre-positions inventory 3-4 weeks ahead.\nPre-staged inventory = anticipated Prime Day demand × safety stock factor.\n\nIncremental inventory to support Prime Day (above normal inventory levels):\nNormal daily throughput: 30M units.\nNormal inventory on hand: ~2-3 weeks of normal demand = 30M × 18 days = 540M units in transit/storage.\nPrime Day pre-stage: Need to support 162M/day for 2 days = 324M units, plus safety stock = ~500M extra units.\nNet incremental inventory: 500M - 540M normal = actually, inventory is being built up gradually, so total FCs need to hold ~(normal + 500M incremental) during the pre-stage period.\n\nFocus on incremental physical space for the 500M additional units:\n500M units × average unit size. Amazon average item: a book, small electronics item, apparel piece — roughly 0.5 lb, dimensions ~6×4×3 inches = 72 cubic inches.\n\nStorage density in Amazon RobotStow/Kiva FCs: ~8-12 units per cubic foot of storage (shelves + aisles + robots).\nAt 10 units/cubic foot: 500M / 10 = 50M cubic feet of storage volume needed.\nConverting to floor space (storage height ~20 feet usable): 50M / 20 = 2.5M square feet of floor space.\n\nStep 3: Translate to fulfillment centers.\nA typical Amazon FC is ~1M sq ft floor space, with ~40% used for storage = 400,000 sq ft of active storage.\nIncremental floor space needed: 2.5M sq ft → approximately 6 additional standard fulfillment centers\' worth of storage.\n\nIn practice, Amazon handles this through:\n(a) Clearing existing FCs by shipping out slow-moving inventory beforehand\n(b) Using overflow storage in partner 3PL warehouses\n(c) Distributing across 400+ US FCs (each absorbing ~12,500 sq ft / 400 = ~6,250 additional sq ft per FC)\n\nRange: 2M–4M sq ft of additional storage space activated for Prime Day pre-staging.',
      keyAssumptions: [
        'Prime Day daily order volume: ~5.4x typical day, based on $12.9B/2 days vs. $1.2B/day typical',
        '$40 average Amazon order value — consistent with published estimates; lower than pure electronics, higher than pure daily deals',
        '10 units/cubic foot storage density — assumes Amazon\'s robotic fulfillment with 20-foot rack heights',
        '500M incremental units in pre-stage — rough estimate based on 2-day event × 5x daily unit volume above normal',
      ],
      finalEstimate: '~2.5M sq ft of incremental storage floor space needed (equivalent to ~6 standard fulfillment centers)',
      sanityChecks: [
        'Capacity check: Amazon\'s US network of 400+ FCs covers ~400M sq ft total. The incremental 2.5M sq ft represents ~0.6% of total network capacity — a very small increment. Amazon handles this by optimizing across its existing network, which is built to absorb exactly this kind of surge.',
        'Revenue per sq ft check: $12.9B Prime Day revenue / 2.5M incremental sq ft = $5,160 revenue per sq ft of incremental storage. At Amazon\'s ~5% operating margin on product sales: $258 operating profit per incremental sq ft. At ~$15/sq ft/month for warehouse space, the 1-month staging period costs ~$15 per sq ft. Return = 17x. This high ROI explains why Amazon aggressively pre-stages inventory.',
        'Amazon Prime Day headcount check: Amazon hires ~100,000 temporary workers for Prime Day. At ~1 worker per 500 sq ft of active pick-and-pack area: implies 50M sq ft active. Amazon\'s total US FC footprint of 400M sq ft supports this scale.',
      ],
    },

    strongAnswerMarkers: [
      'Uses Prime Day disclosed revenue ($12.9B) to calculate the order volume uplift ratio vs. a typical day',
      'Identifies the pre-staging window (3-4 weeks) as the key driver of incremental space, not just the event itself',
      'Converts units to volumetric storage space using realistic storage density (units/cubic foot)',
      'Translates floor space to number of equivalent fulfillment centers for intuitive framing',
      'Notes that Amazon absorbs the surge across its existing 400+ FC network rather than building new ones',
    ],

    commonMistakes: [
      'Estimating "total Amazon warehouse space" instead of "incremental space for Prime Day" — the question is about the delta',
      'Ignoring the pre-staging dynamic — Prime Day inventory is built up weeks before, requiring extended incremental space',
      'Using floor area directly without accounting for vertical storage (20-foot racking doubles usable storage per floor area)',
      'Not knowing Amazon\'s Prime Day disclosed revenue — this is the essential anchor for the order volume calculation',
    ],
    failureMode: {
      weakAnswer: 'The candidate estimates Amazon\'s total US fulfillment center floor space at ~300M square feet and says "Amazon needs X% more for Prime Day" — applying a flat percentage uplift to total warehouse capacity without anchoring on actual Prime Day order volume uplift or the per-unit space requirement for incremental SKUs.',
      interviewerFollowUp: '"You applied a 20% floor space uplift to Amazon\'s total warehouse capacity. But the question is about incremental space for the Prime Day inventory surge, not a percentage of existing capacity. If Prime Day generates ~300M incremental orders above normal volume, and each order requires roughly 1 cubic foot of pre-staged picking space, what does the incremental space requirement actually look like from the bottom up?"',
    },
  },

  {
    id: 'EST30',
    title: 'Active Chrome Browser Tabs Open Globally Right Now',
    subtitle: 'Fun / Challenging · Infrastructure Thinking',
    difficulty: 'staff',
    isFree: false,
    tags: ['Chrome', 'browsers', 'tabs', 'estimation', 'global', 'fun'],
    category: 'market-sizing',
    approach: 'bottom-up',

    prompt: 'Estimate the number of active Chrome browser tabs open globally right now.',

    frameworkSteps: [
      'Step 1 — Estimate the number of active Chrome users globally at any given moment.',
      'Step 2 — Estimate the average number of tabs a Chrome user has open at one time.',
      'Step 3 — Account for different user segments (casual vs. power users) and time zones.',
      'Step 4 — Cross-check against Chrome\'s memory footprint and total PC memory estimates.',
    ],

    hints: [
      'Chrome has ~3.3B active users globally and ~65% global desktop browser market share.',
      'The global internet user base is ~5.4B; around 60% use Chrome on some device (desktop, Android, iOS).',
      'Mobile Chrome behavior: mobile users typically have 1-3 tabs open at a time (many use tab groups or have auto-close). Desktop Chrome users are notorious for leaving many tabs open.',
      'A 2019 Mozilla study found the median number of open tabs per Firefox session was ~5. Chrome users are commonly reported to have 10-30+ tabs, especially developers and researchers.',
      '"Active right now" — assume a typical mid-day moment on a weekday. Not all Chrome users are using their computer simultaneously.',
    ],

    modelAnswer: {
      walkthrough: 'Step 1: Chrome users active right now.\nChrome total global users: ~3.3B accounts/installs.\nActive at any moment: Not everyone is using Chrome right now.\nDesktop Chrome users: ~1.5B. At a typical mid-day moment on a weekday, ~25% of desktop users have Chrome open: 1.5B × 0.25 = 375M desktop Chrome sessions active.\nMobile Chrome users: ~1.8B. At any moment ~20% are actively browsing: 1.8B × 0.20 = 360M mobile Chrome sessions active.\n\nStep 2: Tabs per session.\n\nDesktop users:\nLight users (students, casual browsing): ~5 tabs → 30% of desktop sessions\nMedium users (office workers, news readers): ~12 tabs → 40% of desktop sessions\nHeavy/power users (developers, researchers): ~35 tabs → 30% of desktop sessions\nWeighted average desktop tabs: (0.30×5) + (0.40×12) + (0.30×35) = 1.5 + 4.8 + 10.5 = 16.8 tabs/session.\n\nMobile users:\nMobile browsers have fewer tabs; Android Chrome often encourages tab closure.\nLight: ~2 tabs (60% of mobile sessions)\nMedium: ~5 tabs (30%)\nHeavy: ~15 tabs (10%)\nWeighted average mobile tabs: (0.60×2) + (0.30×5) + (0.10×15) = 1.2 + 1.5 + 1.5 = 4.2 tabs/session.\n\nStep 3: Total tabs.\nDesktop: 375M sessions × 16.8 tabs = 6.3B tabs.\nMobile: 360M sessions × 4.2 tabs = 1.51B tabs.\nTotal: 6.3B + 1.51B = ~7.8B active Chrome tabs globally.\n\nRound to nearest order of magnitude: approximately 5–10 billion active Chrome tabs.\n\nThe "right now" qualifier means this is for a mid-day weekday moment when internet usage is near but not at its global peak (which would be higher due to overlapping time zones in the afternoon).',
      keyAssumptions: [
        'Chrome has ~3.3B active users globally — consistent with StatCounter data (~65% of ~5.2B internet-using devices)',
        '25% of desktop Chrome users have Chrome open at any given weekday mid-day moment — desktop activity rates are lower than mobile (mobile is always-on)',
        '20% of mobile Chrome users are actively browsing — most smartphone users aren\'t in a browser at any given second',
        '16.8 average desktop tabs — driven by the heavy-user tail (developers, researchers with 20-50+ tabs) pulling the average well above the median',
      ],
      finalEstimate: 'Range: 5B–10B active Chrome tabs globally at a typical mid-day moment; ~8B central estimate',
      sanityChecks: [
        'Memory check: Each Chrome tab uses ~50-100 MB of RAM on average. 8B tabs × 75 MB = 600 petabytes of RAM — clearly impossible. This is the key sanity check failure: 8B concurrent open tabs would require RAM that doesn\'t exist. Resolution: most "open" tabs are inactive/suspended. Chrome\'s tab discarding feature suspends background tabs. The number of OPEN tabs (including suspended) could be 8B; the number requiring active RAM at any instant is ~10-100x smaller.',
        'Revised framing: If ~1% of all open tabs are "actively loaded in RAM" at any moment: 8B × 0.01 = 80M actively loaded tab-equivalents globally. At 75 MB each: 6 TB of total RAM in use for Chrome — plausible (there are ~2B PCs in the world; average 4 GB RAM; even if 0.1% goes to one Chrome tab = 800M GB × 0.001 = 800 TB, which is in range).',
        'Chrome team data: Google internally tracks tab usage. A 2020 Chromium blog post noted "most users have fewer than 10 tabs open"; however, users who have many tabs open have a disproportionate number. This confirms our heavy-user segment is key.',
      ],
    },

    strongAnswerMarkers: [
      'Builds from active sessions at a moment in time (not total user installs) — recognizing that not all 3.3B users are online simultaneously',
      'Segments desktop vs. mobile users because tab behavior is fundamentally different on each platform',
      'Uses a distribution approach (light/medium/heavy) for tabs per session rather than a single average — the heavy-user tail matters',
      'Runs the memory sanity check and identifies that "open tabs" includes suspended tabs, which resolves the apparent impossibility',
      'Arrives at a range (5B-10B) and acknowledges the inherent uncertainty in estimating user-device state',
    ],

    commonMistakes: [
      'Using total Chrome installs (3.3B) as the number of currently-active sessions — billions of users are asleep, offline, or using other apps',
      'Applying the same tab count to mobile and desktop users — mobile Chrome users have dramatically fewer tabs than desktop power users',
      'Not running a memory sanity check — the result of billions of open tabs should be tested against how much RAM actually exists on the world\'s computers',
      'Treating "open tab" and "actively loaded tab" as synonymous — Chrome aggressively suspends background tabs to reduce RAM usage',
      'Anchoring too conservatively on the median (5 tabs) without accounting for the heavy-user tail that pulls the average up',
    ],
    failureMode: {
      weakAnswer: 'The candidate states "Chrome has 3.3 billion installs, and the average user has 5 tabs open, so there are 16.5 billion open tabs globally." They apply the install count as if all 3.3B Chrome users are simultaneously browsing, apply a uniform 5-tab count to both mobile and desktop users, and never run a RAM sanity check on whether the world\'s hardware could support that many loaded tabs.',
      interviewerFollowUp: '"You said 16.5 billion open tabs at 100 MB RAM per tab = 1.65 exabytes of RAM needed. The entire world\'s installed PC RAM is estimated at about 50 petabytes. Your estimate needs 33x more RAM than exists. What are the two assumptions that most inflate your number — and how does correcting for active-session rate and mobile vs. desktop tab counts bring it into a plausible range?"',
    },
  },
];
