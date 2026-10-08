export type Language = "en" | "fr";

export interface TranslationKeys {
  nav: {
    home: string;
    about: string;
    divisions: string;
    journey: string;
    blog: string;
    joinUs: string;
    contact: string;
    partnerWithUs: string;
    ourDivisions: string;
    language: string;
    switchLanguage: string;
  };
  footer: {
    tagline: string;
    contactTitle: string;
    contactPhoneLabel: string;
    contactEmailLabel: string;
    contactWhatsappLabel: string;
    site: string;
    resources: string;
    legal: string;
    privacyPolicy: string;
    termsOfUse: string;
    contactUs: string;
    faq: string;
    verifyRegistration: string;
    locationTitle: string;
    locationText: string;
    governanceNote: string;
    copyright: string;
    builtWith: string;
  };
  splash: {
    madeInCameroon: string;
    builtForTheWorld: string;
    poweredByNexus: string;
    initializing: string;
  };
  divisions: {
    academy: { name: string; tagline: string; desc: string };
    techHub: { name: string; tagline: string; desc: string };
    foundation: { name: string; tagline: string; desc: string };
    mentorship: { name: string; tagline: string; desc: string };
  };
  home: {
    badge: string;
    heroTitle: string;
    heroCountry: string;
    heroSubtitle: string;
    partnerBtn: string;
    joinBtn: string;
    explorePrograms: string;
    gapEyebrow: string;
    gapTitle: string;
    gapDesc: string;
    gapPoint1Title: string;
    gapPoint1Text: string;
    gapPoint2Title: string;
    gapPoint2Text: string;
    gapPoint3Title: string;
    gapPoint3Text: string;
    gapClosing: string;
    ecosystemEyebrow: string;
    ecosystemTitle: string;
    ecosystemDesc: string;
    learnMore: string;
    whyEyebrow: string;
    whyTitle: string;
    whyDesc: string;
    whyPoint1Title: string;
    whyPoint1Text: string;
    whyPoint2Title: string;
    whyPoint2Text: string;
    whyPoint3Title: string;
    whyPoint3Text: string;
    whyPoint4Title: string;
    whyPoint4Text: string;
    whyPoint5Title: string;
    whyPoint5Text: string;
    peopleEyebrow: string;
    peopleTitle: string;
    peopleDesc: string;
    meetFounders: string;
    seeJourney: string;
    liveEyebrow: string;
    liveTitle: string;
    liveDesc: string;
    journeyUpdate: string;
    openTimeline: string;
    fromBlog: string;
    readPost: string;
    ctaTitle: string;
    ctaDesc: string;
  };
  about: {
    eyebrow: string;
    title: string;
    subtitle: string;
    description: string;
    storyEyebrow: string;
    storyTitle: string;
    storyP1: string;
    storyP2: string;
    storyP3: string;
    storyP4: string;
    purposeEyebrow: string;
    purposeTitle: string;
    missionTitle: string;
    missionText: string;
    visionTitle: string;
    visionText: string;
    directionTitle: string;
    directionText: string;
    identityEyebrow: string;
    identityTitle: string;
    identityDesc: string;
    fact1Label: string;
    fact1Value: string;
    fact2Label: string;
    fact2Value: string;
    fact3Label: string;
    fact3Value: string;
    fact4Label: string;
    fact4Value: string;
    fact5Label: string;
    fact5Value: string;
    whatWeDoEyebrow: string;
    whatWeDoTitle: string;
    whatWeDoDesc: string;
    wd1Title: string;
    wd1Text: string;
    wd2Title: string;
    wd2Text: string;
    wd3Title: string;
    wd3Text: string;
    wd4Title: string;
    wd4Text: string;
    wd5Title: string;
    wd5Text: string;
    wd6Title: string;
    wd6Text: string;
    valuesEyebrow: string;
    valuesTitle: string;
    valuesDesc: string;
    val1Name: string;
    val1Text: string;
    val2Name: string;
    val2Text: string;
    val3Name: string;
    val3Text: string;
    val4Name: string;
    val4Text: string;
    val5Name: string;
    val5Text: string;
    govTitle: string;
    govText: string;
    teamEyebrow: string;
    teamTitle: string;
    teamDesc: string;
    role1Title: string;
    role1Text: string;
    role2Title: string;
    role2Text: string;
    role3Title: string;
    role3Text: string;
    role4Title: string;
    role4Text: string;
    role5Title: string;
    role5Text: string;
    ctaTitle: string;
    ctaDesc: string;
  };
  divisionsPage: {
    eyebrow: string;
    title: string;
    description: string;
    overviewEyebrow: string;
    overviewTitle: string;
    overviewDesc: string;
    academyTagline: string;
    academyDesc: string;
    techHubTagline: string;
    techHubDesc: string;
    foundationTagline: string;
    foundationDesc: string;
    mentorshipTagline: string;
    mentorshipDesc: string;
    exploreBtn: string;
    heroScroll: string;
    academyH1: string;
    academyH2: string;
    academyH3: string;
    techHubH1: string;
    techHubH2: string;
    techHubH3: string;
    foundationH1: string;
    foundationH2: string;
    foundationH3: string;
    mentorshipH1: string;
    mentorshipH2: string;
    mentorshipH3: string;
    ecoEyebrow: string;
    ecoTitle: string;
    ecoDesc: string;
    ecoHubLabel: string;
    ecoAcademyFlow: string;
    ecoTechHubFlow: string;
    ecoFoundationFlow: string;
    ecoMentorshipFlow: string;
    finderEyebrow: string;
    finderTitle: string;
    finderDesc: string;
    finderPickHint: string;
    personaStudent: string;
    personaBusiness: string;
    personaCommunity: string;
    personaProfessional: string;
    finderRecStudent: string;
    finderRecBusiness: string;
    finderRecCommunity: string;
    finderRecProfessional: string;
    statsEyebrow: string;
    statsTitle: string;
    statDivisionsLabel: string;
    statProgramsLabel: string;
    statTrainedLabel: string;
    statCommunitiesLabel: string;
    journeyEyebrow: string;
    journeyTitle: string;
    journeyDesc: string;
    jStep1Title: string;
    jStep1Text: string;
    jStep2Title: string;
    jStep2Text: string;
    jStep3Title: string;
    jStep3Text: string;
    jStep4Title: string;
    jStep4Text: string;
    systemEyebrow: string;
    systemTitle: string;
    systemDesc: string;
    s1Title: string;
    s1Text: string;
    s2Title: string;
    s2Text: string;
    s3Title: string;
    s3Text: string;
    ctaTitle: string;
    ctaDesc: string;
  };
  academyPage: {
    eyebrow: string;
    title: string;
    description: string;
    whatEyebrow: string;
    whatTitle: string;
    whatDesc: string;
    f1Title: string;
    f1Text: string;
    f2Title: string;
    f2Text: string;
    f3Title: string;
    f3Text: string;
    cohortEyebrow: string;
    cohortTitle: string;
    cohortDesc: string;
    tableProgram: string;
    tableCohort: string;
    tableStatus: string;
    cohort1Name: string;
    cohort1Label: string;
    cohort1Status: string;
    cohortNote: string;
    programGraphicDesign: string;
    programUiUxDesign: string;
    programSoftwareDevelopment: string;
    programAiAutomation: string;
    verifyBadge: string;
    verifyTitle: string;
    verifyText: string;
    verifyBtn: string;
    ctaTitle: string;
    ctaDesc: string;
  };
  techHubPage: {
    eyebrow: string;
    title: string;
    hugeEyebrow: string;
    hugeWord1: string;
    hugeWord2: string;
    hugeWord3: string;
    marqueeEyebrow: string;
    description: string;
    servicesEyebrow: string;
    servicesTitle: string;
    servicesDesc: string;
    s1Title: string;
    s1Text: string;
    s2Title: string;
    s2Text: string;
    s3Title: string;
    s3Text: string;
    s4Title: string;
    s4Text: string;
    approachEyebrow: string;
    approachTitle: string;
    approachDesc: string;
    a1Title: string;
    a1Text: string;
    a2Title: string;
    a2Text: string;
    a3Title: string;
    a3Text: string;
    targetSmes: string;
    targetNgos: string;
    targetFintechs: string;
    targetEnterprise: string;
    targetMomoOperators?: string;
    heroTag: string;
    scrollCue: string;
    statsEyebrow: string;
    stat1Label: string;
    stat1Text: string;
    stat2Label: string;
    stat2Text: string;
    stat3Label: string;
    stat3Text: string;
    orderCta: string;
    clientsEyebrow: string;
    clientsTitle: string;
    clientsDesc: string;
    clientSmesSub: string;
    clientSmesDesc: string;
    clientSmesBackTitle: string;
    clientSmesBack: string;
    clientNgosSub: string;
    clientNgosDesc: string;
    clientNgosBackTitle: string;
    clientNgosBack: string;
    clientFintechsSub: string;
    clientFintechsDesc: string;
    clientFintechsBackTitle: string;
    clientFintechsBack: string;
    clientEnterpriseSub: string;
    clientEnterpriseDesc: string;
    clientEnterpriseBackTitle: string;
    clientEnterpriseBack: string;
    clientMomoSub?: string;
    clientMomoDesc?: string;
    clientsCta: string;
    terminalOut1: string;
    terminalOut2: string;
    terminalOut3: string;
    terminalFootnote: string;
    ctaPrimaryBtn: string;
    ctaTitle: string;
    ctaDesc: string;
    introEyebrow: string;
    introTitle: string;
    introDesc: string;
    introPoint1Title: string;
    introPoint1Text: string;
    introPoint2Title: string;
    introPoint2Text: string;
    introPoint3Title: string;
    introPoint3Text: string;
    introHoursTitle: string;
    introHoursText: string;
    introHoursTime: string;
    introResponseTitle: string;
    introResponseText: string;
    introResponseTime: string;
    introRemoteTitle: string;
    introRemoteText: string;
    processEyebrow: string;
    processTitle: string;
    processDesc: string;
    process1Title: string;
    process1Desc: string;
    process1Del1: string;
    process1Del2: string;
    process1Del3: string;
    process2Title: string;
    process2Desc: string;
    process2Del1: string;
    process2Del2: string;
    process2Del3: string;
    process3Title: string;
    process3Desc: string;
    process3Del1: string;
    process3Del2: string;
    process3Del3: string;
    process4Title: string;
    process4Desc: string;
    process4Del1: string;
    process4Del2: string;
    process4Del3: string;
    process5Title: string;
    process5Desc: string;
    process5Del1: string;
    process5Del2: string;
    process5Del3: string;
    process6Title: string;
    process6Desc: string;
    process6Del1: string;
    process6Del2: string;
    process6Del3: string;
    whyEyebrow: string;
    whyTitle: string;
    whyDesc: string;
    why1Title: string;
    why1Desc: string;
    why2Title: string;
    why2Desc: string;
    why3Title: string;
    why3Desc: string;
    why4Title: string;
    why4Desc: string;
    why5Title: string;
    why5Desc: string;
    why6Title: string;
    why6Desc: string;
    whyCta: string;
    why1Alt: string;
    why2Alt: string;
    why3Alt: string;
    why4Alt: string;
    why5Alt: string;
    why6Alt: string;
    projectsEyebrow: string;
    projectsTitle: string;
    projectsDesc: string;
    projectsAutoPlay: string;
    projectTrendoraCategory: string;
    projectTrendoraTitle: string;
    projectTrendoraDesc: string;
    projectTrendoraFeature1: string;
    projectTrendoraFeature2: string;
    projectTrendoraFeature3: string;
    projectTrendoraFeature4: string;
    projectVIPCategory: string;
    projectVIPTitle: string;
    projectVIPDesc: string;
    projectVIPFeature1: string;
    projectVIPFeature2: string;
    projectVIPFeature3: string;
    projectVIPFeature4: string;
    projectAcademyCategory: string;
    projectAcademyTitle: string;
    projectAcademyDesc: string;
    projectAcademyFeature1: string;
    projectAcademyFeature2: string;
    projectAcademyFeature3: string;
    projectAcademyFeature4: string;
    projectFoundationCategory: string;
    projectFoundationTitle: string;
    projectFoundationDesc: string;
    projectFoundationFeature1: string;
    projectFoundationFeature2: string;
    projectFoundationFeature3: string;
    projectFoundationFeature4: string;
    projectMentorshipCategory: string;
    projectMentorshipTitle: string;
    projectMentorshipDesc: string;
    projectMentorshipFeature1: string;
    projectMentorshipFeature2: string;
    projectMentorshipFeature3: string;
    projectMentorshipFeature4: string;
    engagementEyebrow: string;
    engagementTitle: string;
    engagementDesc: string;
    engagementCta: string;
    engagementFooterBold: string;
    engagementFooterText: string;
    engagement1Title: string;
    engagement1Desc: string;
    engagement1Best1: string;
    engagement1Best2: string;
    engagement1Best3: string;
    engagement1Pricing: string;
    engagement2Title: string;
    engagement2Desc: string;
    engagement2Best1: string;
    engagement2Best2: string;
    engagement2Best3: string;
    engagement2Pricing: string;
    engagement3Title: string;
    engagement3Desc: string;
    engagement3Best1: string;
    engagement3Best2: string;
    engagement3Best3: string;
    engagement3Pricing: string;
    faqEyebrow: string;
    faqTitle: string;
    faqFooter: string;
    faqFooterLink: string;
    faq1Q: string;
    faq1A: string;
    faq2Q: string;
    faq2A: string;
    faq3Q: string;
    faq3A: string;
    faq4Q: string;
    faq4A: string;
    faq5Q: string;
    faq5A: string;
    faq6Q: string;
    faq6A: string;
    faq7Q: string;
    faq7A: string;
    faq8Q: string;
    faq8A: string;
  };
  foundationPage: {
    description: string;
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCtaPrimary: string;
    heroCtaSecondary: string;
    learnLabel: string;
    buildLabel: string;
    impactLabel: string;
    whoEyebrow: string;
    whoTitle: string;
    whoText1: string;
    whoText2: string;
    learnText: string;
    buildText: string;
    impactText: string;
    drivesEyebrow: string;
    drivesTitle: string;
    drivesDesc: string;
    d1Num: string;
    d1Title: string;
    d1Text: string;
    d2Num: string;
    d2Title: string;
    d2Text: string;
    d3Num: string;
    d3Title: string;
    d3Text: string;
    ambitionsEyebrow: string;
    ambitionsTitle: string;
    ambitionsDesc: string;
    horizonNear: string;
    horizonMid: string;
    horizonLong: string;
    a1Title: string;
    a1Text: string;
    a2Title: string;
    a2Text: string;
    a3Title: string;
    a3Text: string;
    a4Title: string;
    a4Text: string;
    a5Title: string;
    a5Text: string;
    valueBandText: string;
    supportEyebrow: string;
    supportTitle: string;
    supportDesc: string;
    supportTrustNote: string;
    supportVolunteerTitle: string;
    supportVolunteerText: string;
    supportVolunteerCta: string;
    supportSkillsTitle: string;
    supportSkillsText: string;
    supportSkillsCta: string;
    supportUpdatesTitle: string;
    supportUpdatesText: string;
    supportUpdatesCta: string;
    supportPartnerTitle: string;
    supportPartnerText: string;
    supportPartnerCta: string;
    newsEyebrow: string;
    newsTitle: string;
    newsDesc: string;
    newsPlaceholder: string;
    newsButton: string;
    newsSuccess: string;
    newsErrorInvalid: string;
    ctaTitle: string;
    ctaDesc: string;
  };
  mentorshipPage: {
    eyebrow: string;
    title: string;
    description: string;
    // Introduction
    introEyebrow: string;
    introTitle: string;
    introText: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    // Programmes & Services
    programmesEyebrow: string;
    programmesTitle: string;
    programmesDesc: string;
    prog1Title: string;
    prog1Text: string;
    prog2Title: string;
    prog2Text: string;
    prog3Title: string;
    prog3Text: string;
    prog4Title: string;
    prog4Text: string;
    // How it works
    howEyebrow: string;
    howTitle: string;
    howDesc: string;
    h1Title: string;
    h1Text: string;
    h2Title: string;
    h2Text: string;
    h3Title: string;
    h3Text: string;
    // Who we serve
    whoServeEyebrow: string;
    whoServeTitle: string;
    whoServeDesc: string;
    whoServe1Title: string;
    whoServe1Text: string;
    whoServe2Title: string;
    whoServe2Text: string;
    whoServe3Title: string;
    whoServe3Text: string;
    whoServe4Title: string;
    whoServe4Text: string;
    // Benefits / Outcomes
    benefitsEyebrow: string;
    benefitsTitle: string;
    benefit1Title: string;
    benefit1Text: string;
    benefit2Title: string;
    benefit2Text: string;
    benefit3Title: string;
    benefit3Text: string;
    // For Mentees / For Mentors
    whoEyebrow: string;
    whoTitle: string;
    whoDesc: string;
    w1Title: string;
    w1Text: string;
    w2Title: string;
    w2Text: string;
    // CTA
    ctaEyebrow: string;
    ctaTitle: string;
    ctaDesc: string;
    // Cycle Timeline
    cycleEyebrow: string;
    cycleTitle: string;
    cycleDesc: string;
    cycle1Title: string;
    cycle1Text: string;
    cycle2Title: string;
    cycle2Text: string;
    cycle3Title: string;
    cycle3Text: string;
    cycle4Title: string;
    cycle4Text: string;
    cycle5Title: string;
    cycle5Text: string;
    cycle6Title: string;
    cycle6Text: string;
    // Explore NEXUS
    exploreNexusEyebrow: string;
    exploreNexusTitle: string;
    exploreNexusDesc: string;
  };
  contactPage: {
    eyebrow: string;
    title: string;
    description: string;
    getInTouchEyebrow: string;
    getInTouchTitle: string;
    getInTouchDesc: string;
    directTitle: string;
    formTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    divisionLabel: string;
    selectDivision: string;
    generalInquiry: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendBtn: string;
    sentSuccess: string;
    whatsapp: string;
    email: string;
    phone: string;
    chatOnWhatsApp: string;
  };
  journeyPage: {
    eyebrow: string;
    title: string;
    description: string;
    heroCtaPrimary: string;
    heroCtaSecondary: string;
    stat1Label: string;
    stat2Label: string;
    stat3Label: string;
    stat4Label: string;
    filterAll: string;
    filterCompany: string;
    filterAcademy: string;
    filterTechHub: string;
    filterFoundation: string;
    galleryTitle: string;
    galleryDesc: string;
    newsletterEyebrow: string;
    newsletterTitle: string;
    newsletterDesc: string;
    newsletterPlaceholder: string;
    newsletterBtn: string;
    newsletterSuccess: string;
    newsletterInvalid: string;
    socialEyebrow: string;
    socialTitle: string;
    socialDesc: string;
    socialFollow: string;
    ctaEyebrow: string;
    ctaTitle: string;
    ctaDesc: string;
    ctaPrograms: string;
    ctaPartner: string;
    ctaBlog: string;
    readMore: string;
    readLess: string;
    imageCount: string;
    videoCount: string;
    noMedia: string;
    sharedTo: string;
  };
  blogPage: {
    eyebrow: string;
    title: string;
    description: string;
    readTime: string;
    readMore: string;
    backToBlog: string;
    searchPlaceholder: string;
    noPosts: string;
    relatedPosts: string;
    loadMore: string;
    share: string;
    minRead: string;
    author: string;
    tags: string;
  };
  faqPage: {
    eyebrow: string;
    title: string;
    description: string;
    catAll: string;
    catGeneral: string;
    catAcademy: string;
    catTechHub: string;
    catFoundation: string;
    catMentorship: string;
    q1Question: string;
    q2Question: string;
    q3Question: string;
    q4Question: string;
    q5Question: string;
    q6Question: string;
    q7Question: string;
    stillQuestions: string;
    contactSupport: string;
  };
  joinUsPage: {
    eyebrow: string;
    title: string;
    description: string;
    pathwayTitle: string;
    pathwaySubtitle: string;
    opportunitiesTitle: string;
    opportunitiesSubtitle: string;
    applyNote: string;
    submitBtn: string;
    successTitle: string;
    successDesc: string;
    pathwayPrompt: string;
    closeForm: string;
    sideTitle: string;
    sideText: string;
    whatsappAlt: string;
    emailAlt: string;
  };
  partnerPage: {
    eyebrow: string;
    title: string;
    description: string;
    waysEyebrow: string;
    waysTitle: string;
    waysDesc: string;
    w1Title: string;
    w1Text: string;
    w2Title: string;
    w2Text: string;
    w3Title: string;
    w3Text: string;
    formTitle: string;
    orgNameLabel: string;
    orgPlaceholder: string;
    contactNameLabel: string;
    contactPlaceholder: string;
    emailLabel: string;
    typeLabel: string;
    typeSelect: string;
    tCorporate: string;
    tEducational: string;
    tGovernment: string;
    tNgo: string;
    tIndividual: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitBtn: string;
    sentSuccess: string;
    // Redesign additions
    statsEyebrow: string;
    statsTitle: string;
    statsDesc: string;
    statDivisionsLabel: string;
    statProgramsLabel: string;
    statTrainedLabel: string;
    statCommunitiesLabel: string;
    benefitEyebrow: string;
    benefitTitle: string;
    benefitDesc: string;
    benefit1Title: string;
    benefit1Text: string;
    benefit2Title: string;
    benefit2Text: string;
    benefit3Title: string;
    benefit3Text: string;
    benefit4Title: string;
    benefit4Text: string;
    typesEyebrow: string;
    typesTitle: string;
    typesDesc: string;
    typeCorporateTitle: string;
    typeCorporateText: string;
    typeNgoTitle: string;
    typeNgoText: string;
    typeGovernmentTitle: string;
    typeGovernmentText: string;
    typeEducationTitle: string;
    typeEducationText: string;
    typeIndividualTitle: string;
    typeIndividualText: string;
    modelEyebrow: string;
    modelTitle: string;
    modelDesc: string;
    model4Title: string;
    model4Text: string;
    model5Title: string;
    model5Text: string;
    processEyebrow: string;
    processTitle: string;
    processDesc: string;
    processCtaLabel: string;
    step1Title: string;
    step1Text: string;
    step2Title: string;
    step2Text: string;
    step3Title: string;
    step3Text: string;
    step4Title: string;
    step4Text: string;
    formWebsiteLabel: string;
    formInterestLabel: string;
    interestSelect: string;
    interestSponsorship: string;
    interestTech: string;
    interestTalent: string;
    interestCommunity: string;
    interestResearch: string;
    formSideTitle: string;
    formSideText: string;
    whatsappAlt: string;
    emailAlt: string;
    formError: string;
  };
  verifyPage: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    verifyBtn: string;
    howTitle: string;
    howText: string;
    sampleCode: string;
    noResult: string;
    validResult: string;
    registrationId: string;
  };
  legalPage: {
    termsTitle: string;
    termsSubtitle: string;
    privacyTitle: string;
    privacySubtitle: string;
    lastUpdated: string;
    termsIntro: string;
    termsScopeTitle: string;
    termsScopeText: string;
    termsAcceptanceTitle: string;
    termsAcceptanceText: string;
    termsUseTitle: string;
    termsUseText: string;
    termsIpTitle: string;
    termsIpText: string;
    termsAccuracyTitle: string;
    termsAccuracyText: string;
    termsLinksTitle: string;
    termsLinksText: string;
    termsLiabilityTitle: string;
    termsLiabilityText: string;
    termsWarrantyTitle: string;
    termsWarrantyText: string;
    termsPrivacyTitle: string;
    termsPrivacyText: string;
    termsGoverningTitle: string;
    termsGoverningText: string;
    termsEnrollmentTitle: string;
    termsEnrollmentText: string;
    termsResponsibilityTitle: string;
    termsResponsibilityText: string;
    termsChangesTitle: string;
    termsChangesText: string;
    termsContactTitle: string;
    termsContactText: string;
    privacyIntro: string;
    pCollectTitle: string;
    pCollectText: string;
    pAutoTitle: string;
    pAutoText: string;
    pUseTitle: string;
    pUseText: string;
    pLegalTitle: string;
    pLegalText: string;
    pEnrollTitle: string;
    pEnrollText: string;
    pSecurityTitle: string;
    pSecurityText: string;
    pRetentionTitle: string;
    pRetentionText: string;
    pSharingTitle: string;
    pSharingText: string;
    pRightsTitle: string;
    pRightsText: string;
    pThirdTitle: string;
    pThirdText: string;
    pChildrenTitle: string;
    pChildrenText: string;
    pChangesTitle: string;
    pChangesText: string;
    pContactTitle: string;
    pContactText: string;
  };
  notFoundPage: {
    title: string;
    subtitle: string;
    backBtn: string;
  };
  common: {
    backToHome: string;
    submit: string;
    loading: string;
    success: string;
    error: string;
  };
}

export const translations: Record<Language, TranslationKeys> = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      divisions: "Divisions",
      journey: "Journey",
      blog: "Blog",
      joinUs: "Join Us",
      contact: "Contact",
      partnerWithUs: "Partner With Us",
      ourDivisions: "Our Divisions",
      language: "EN",
      switchLanguage: "FR",
    },
    footer: {
      tagline: "NEXUS is Cameroon's emerging technology company. Four divisions, one mission. Built in 2026. Learn. Build. Impact.",
      contactTitle: "Contact Us",
      contactPhoneLabel: "Direct Call",
      contactEmailLabel: "Email",
      contactWhatsappLabel: "WhatsApp",
      site: "Site",
      resources: "Resources",
      legal: "Legal",
      privacyPolicy: "Privacy Policy",
      termsOfUse: "Terms of Use",
      contactUs: "Contact Us",
      faq: "Frequently Asked Questions (FAQ)",
      verifyRegistration: "Verify Registration",
      locationTitle: "Location",
      locationText: "Remote-first, spanning Buea to Bamenda. Our team works across Cameroon's tech corridors.",
      governanceNote: "Remote-first · Cameroon. Governed by our Constitution & Code of Conduct.",
      copyright: "All rights reserved.",
      builtWith: "Built with integrity in Cameroon.",
    },
    splash: {
      madeInCameroon: "Made in Cameroon",
      builtForTheWorld: "Built for the World",
      poweredByNexus: "Powered by NEXUS",
      initializing: "Initialising secure environment…",
    },
    divisions: {
      academy: {
        name: "NEXUS Academy",
        tagline: "Practical tech training, cohort-based.",
        desc: "Equipping young Cameroonians with industry-relevant digital skills through intensive, hands-on cohorts.",
      },
      techHub: {
        name: "NEXUS Tech Hub",
        tagline: "Services, products & client work.",
        desc: "Delivering world-class software development, cloud infrastructure, and technical consulting for global and local clients.",
      },
      foundation: {
        name: "NEXUS Foundation",
        tagline: "Community impact & digital literacy.",
        desc: "Fostering digital trust, combating online fraud, and bridging the tech literacy gap across Cameroonian communities.",
      },
      mentorship: {
        name: "NEXUS Mentorship",
        tagline: "Structured people development.",
        desc: "Connecting rising tech talent with experienced industry leaders for career guidance, leadership, and professional growth.",
      },
    },
    home: {
      badge: "Remote-first · Cameroon",
      heroTitle: "Building digital trust for",
      heroCountry: "Cameroon",
      heroSubtitle: "NEXUS is empowering the next generation of Cameroonian technologists to learn hands-on, build meaningful projects, and solve the problems that matter most.",
      partnerBtn: "Partner With Us",
      joinBtn: "Join the Team",
      explorePrograms: "Explore Our Programs",
      gapEyebrow: "The gap",
      gapTitle: "The gap between education and real impact",
      gapDesc: "Young Cameroonians are talented and ambitious, but the bridge between what they learn in school and what the real world demands barely exists.",
      gapPoint1Title: "Theory without practice",
      gapPoint1Text: "Students graduate with degrees but lack the hands-on skills employers and communities need. Practical training changes that.",
      gapPoint2Title: "Untapped potential",
      gapPoint2Text: "Cameroon has a young, connected, ambitious population, but too few structured pathways to turn talent into real-world impact.",
      gapPoint3Title: "Problems waiting for solutions",
      gapPoint3Text: "From local businesses to public services, real problems persist because the people who could solve them haven't been given the tools.",
      gapClosing: "NEXUS exists to close this gap by learning practical skills, building real solutions, and creating lasting impact in our communities.",
      ecosystemEyebrow: "One ecosystem",
      ecosystemTitle: "Four divisions, one mission",
      ecosystemDesc: "Each division of NEXUS solves a different piece of the same problem.",
      learnMore: "Learn more",
      whyEyebrow: "Why NEXUS",
      whyTitle: "Why NEXUS",
      whyDesc: "We built NEXUS to be as serious as it is ambitious.",
      whyPoint1Title: "Remote-first by design",
      whyPoint1Text: "Built to work from anywhere in Cameroon, and beyond, so the best talent and the biggest impact aren't limited by geography.",
      whyPoint2Title: "Community-driven",
      whyPoint2Text: "We believe technology should serve the people who need it most. NEXUS channels engineering talent toward solving everyday challenges: protecting communities online, creating opportunities, and building tools that matter.",
      whyPoint3Title: "Learning through doing",
      whyPoint3Text: "Growth at NEXUS isn't theoretical. Every cohort, every project, every community initiative is hands-on, built to teach, challenge, and develop real skills that last.",
      whyPoint4Title: "Innovation at the core",
      whyPoint4Text: "NEXUS encourages its members to think beyond employment. We build products, explore new ideas, and foster an entrepreneurial spirit that turns local problems into tech-driven solutions.",
      whyPoint5Title: "Connected across Cameroon",
      whyPoint5Text: "Our team spans Bamenda, Buea, and beyond, working remotely with a shared purpose. Distance doesn't divide us; it proves that great technology can come from anywhere.",
      peopleEyebrow: "The team",
      peopleTitle: "Built by a team that cares",
      peopleDesc: "A growing team of young Cameroonian engineers, designers, and community builders, united by one mission: building technology that solves real problems.",
      meetFounders: "Learn about us",
      seeJourney: "See our journey",
      liveEyebrow: "Live from NEXUS",
      liveTitle: "What's happening now",
      liveDesc: "Fresh updates from our public journey: milestones and announcements, newest first.",
      journeyUpdate: "Journey update",
      openTimeline: "Open the timeline",
      fromBlog: "From the blog",
      readPost: "Read the post",
      ctaTitle: "Ready to build digital trust with us?",
      ctaDesc: "Whether you want to learn with us, partner on projects, or simply be part of a growing tech community, there's a place for you.",
    },
    about: {
      eyebrow: "About NEXUS",
      title: "About NEXUS",
      subtitle: "Building the next generation of Cameroonian technologists.",
      description: "Empowering young Cameroonians to turn knowledge into technology that matters.",
      storyEyebrow: "Our story",
      storyTitle: "Who we are and how we started",
      storyP1: "NEXUS was founded by a group of young Cameroonian engineers from Bamenda and Buea who saw a disconnect. Talented people, growing demand for technology, but very few structured pathways to bridge the two.",
      storyP2: "We started with a question: what if young Cameroonians had a community where they could learn practical skills, build real products, and work together to solve the problems they see every day, from small business challenges to community safety?",
      storyP3: "That question became NEXUS. What started as a shared idea between engineers quickly grew into a four-division company training, building, serving clients, protecting communities, and mentoring the next generation.",
      storyP4: "Today, we operate fully remote from Bamenda and Buea, growing steadily, solving real problems, and proving that world-class technology can come from right here in Cameroon.",
      purposeEyebrow: "Our purpose",
      purposeTitle: "Why we exist and where we're going",
      missionTitle: "Our mission",
      missionText: "To bridge the gap between potential and opportunity in Cameroon by training talent, building technology, serving businesses and communities, and creating a structured environment where young technologists thrive.",
      visionTitle: "Our vision",
      visionText: "A Cameroon where technology is built locally to solve local problems where young engineers have the skills, the platforms, and the support to create solutions that serve businesses, communities, and the nation.",
      directionTitle: "Where we're going",
      directionText: "We are building toward a future where NEXUS is a leading technology company in Cameroon, delivering world-class services, training the next generation of engineers, partnering with government and institutions, and building digital solutions that move the country forward.",
      identityEyebrow: "About NEXUS",
      identityTitle: "Who we are at a glance",
      identityDesc: "NEXUS is a Cameroonian technology company with four divisions: training, engineering, community impact, and mentorship, working together to build a better digital future for Cameroon.",
      fact1Label: "Founded",
      fact1Value: "2026",
      fact2Label: "Headquarters",
      fact2Value: "Remote-first (Bamenda & Buea)",
      fact3Label: "Type",
      fact3Value: "Technology company",
      fact4Label: "Divisions",
      fact4Value: "4 active divisions",
      fact5Label: "Motto",
      fact5Value: "Learn. Build. Impact.",
      whatWeDoEyebrow: "What we do",
      whatWeDoTitle: "Technology that serves Cameroon",
      whatWeDoDesc: "NEXUS operates across four divisions: each solving a different piece of the same challenge: using technology to create real impact.",
      wd1Title: "Training the next generation",
      wd1Text: "Cohort-based programs that equip young Cameroonians with practical, job-ready skills in software development, cybersecurity, design, and AI.",
      wd2Title: "Building software & products",
      wd2Text: "From web applications to mobile platforms, we design and build digital solutions for clients and communities.",
      wd3Title: "Serving businesses & organizations",
      wd3Text: "We partner with SMEs, startups, NGOs, and institutions to deliver reliable technology services, from consulting to full-stack development.",
      wd4Title: "Partnering with government",
      wd4Text: "We work with public institutions to build digital solutions that strengthen governance, improve services, and serve citizens.",
      wd5Title: "Protecting communities",
      wd5Text: "Through public education campaigns, digital safety workshops, and awareness initiatives, we help Cameroonians navigate the digital world safely.",
      wd6Title: "Mentoring future leaders",
      wd6Text: "Connecting emerging talent with experienced professionals for structured career guidance, skill development, and leadership growth.",
      valuesEyebrow: "Our values",
      valuesTitle: "What guides us",
      valuesDesc: "The principles that shape how we learn, build, and work together.",
      val1Name: "Integrity",
      val1Text: "We do what we say, in our code, our training, and how we treat each other.",
      val2Name: "Practicality",
      val2Text: "We value skills you can apply today over theory you might use someday.",
      val3Name: "Community",
      val3Text: "We measure success by the impact we create in Cameroonian communities, not by numbers on a screen.",
      val4Name: "Collaboration",
      val4Text: "We grow by working together, sharing ideas, solving problems, and building as a team.",
      val5Name: "Excellence",
      val5Text: "Remote work doesn't mean lower standards. We hold ourselves to world-class work.",
      govTitle: "How we operate",
      govText: "NEXUS is built on structure and shared responsibility. Our team follows clear processes, communicates openly, and holds itself to high standards, because building trust means being accountable.",
      teamEyebrow: "Who we are",
      teamTitle: "The NEXUS Team",
      teamDesc: "We are a remote collective of young Cameroonian technologists. From Bamenda to Buea, our engineers, designers, and community builders work together to bridge the gap between education and real-world impact.",
      role1Title: "Chief Executive",
      role1Text: "Drives strategy, training, and engineering across the NEXUS ecosystem, ensuring every initiative creates real impact.",
      role2Title: "Chief Operations",
      role2Text: "Ensures governance, accountability, and smooth operations across all divisions, keeping NEXUS running with structure and purpose.",
      role3Title: "Engineering",
      role3Text: "Builds software, cloud infrastructure, and digital solutions for clients and communities, turning ideas into working products.",
      role4Title: "Training",
      role4Text: "Designs and delivers hands-on cohort programs that equip students with practical, job-ready tech skills.",
      role5Title: "Community",
      role5Text: "Manages outreach, mentorship, and digital safety campaigns, connecting NEXUS to the people and communities we serve.",
      ctaTitle: "Want to be part of the story?",
      ctaDesc: "Whether you want to learn with us, partner on projects, or simply be part of a growing tech community, there's a place for you.",
    },
    divisionsPage: {
      eyebrow: "Our Divisions",
      title: "One ecosystem, four focused arms.",
      description: "NEXUS operates across four distinct divisions, each solving a critical piece of the digital trust and capability gap in Cameroon.",
      overviewEyebrow: "Division breakdown",
      overviewTitle: "Explore the NEXUS ecosystem",
      overviewDesc: "Select any division below to learn about its mission, programs, and team.",
      academyTagline: "Practical tech training, cohort-based.",
      academyDesc: "Cohorts focused on software engineering, cybersecurity, product design, and digital safety. Hands-on projects over passive lectures.",
      techHubTagline: "Services, products & client work.",
      techHubDesc: "Engineering team delivering client projects, internal products, and technical consulting. Income generated supports our public programs.",
      foundationTagline: "Community impact & digital literacy.",
      foundationDesc: "Our non-profit arm tackling misinformation, Mobile Money scams, school outreach, and public digital safety campaigns across Cameroon.",
      mentorshipTagline: "Structured people development.",
      mentorshipDesc: "Connecting rising tech talent with experienced industry mentors. Structured 1-on-1 guidance, portfolio reviews, and career pathing.",
      exploreBtn: "Explore division",
      heroScroll: "Scroll to explore",
      academyH1: "Cohort-based, hands-on tracks",
      academyH2: "Portfolio-ready real projects",
      academyH3: "Verified certificates",
      techHubH1: "Custom software & client work",
      techHubH2: "Internal products & experiments",
      techHubH3: "Technical consulting",
      foundationH1: "Free community programs",
      foundationH2: "Digital safety campaigns",
      foundationH3: "Outreach to schools & rural areas",
      mentorshipH1: "Structured 1-on-1 guidance",
      mentorshipH2: "Portfolio & career reviews",
      mentorshipH3: "Industry mentor network",
      ecoEyebrow: "One connected system",
      ecoTitle: "Four divisions. One loop of impact.",
      ecoDesc: "Talent trained in the Academy flows into the Tech Hub, guidance from Mentorship sharpens both, and the Foundation carries the impact back to communities.",
      ecoHubLabel: "NEXUS Core",
      ecoAcademyFlow: "Trains talent",
      ecoTechHubFlow: "Builds products",
      ecoFoundationFlow: "Protects communities",
      ecoMentorshipFlow: "Guides careers",
      finderEyebrow: "Find your path",
      finderTitle: "Which division is right for you?",
      finderDesc: "Tell us where you are today and we will point you to the division built for you.",
      finderPickHint: "Select a profile to see your recommended divisions",
      personaStudent: "I'm a student",
      personaBusiness: "I'm a business",
      personaCommunity: "I'm a community",
      personaProfessional: "I'm a professional",
      finderRecStudent: "Start with an Academy cohort, then grow through Mentorship as you build your portfolio.",
      finderRecBusiness: "Tech Hub handles your project end-to-end: software, security and technical strategy.",
      finderRecCommunity: "Foundation runs free digital-literacy and safety programs for schools and communities.",
      finderRecProfessional: "Mentorship pairs you with rising talent, or helps you grow as a mentor yourself.",
      statsEyebrow: "Impact so far",
      statsTitle: "Numbers behind the mission",
      statDivisionsLabel: "Specialist divisions",
      statProgramsLabel: "Hands-on programs",
      statTrainedLabel: "Learners reached",
      statCommunitiesLabel: "Communities served",
      journeyEyebrow: "The journey",
      journeyTitle: "How you move through NEXUS",
      journeyDesc: "A clear path from first contact to real-world impact.",
      jStep1Title: "Discover",
      jStep1Text: "Explore the divisions and find the one that fits your goal.",
      jStep2Title: "Join",
      jStep2Text: "Apply to a cohort, brief our team, or sign up as a volunteer or mentor.",
      jStep3Title: "Build",
      jStep3Text: "Work on real projects with structured guidance and feedback.",
      jStep4Title: "Impact",
      jStep4Text: "Ship work that matters , for clients, careers and communities.",
      systemEyebrow: "How it works together",
      systemTitle: "An integrated model for impact",
      systemDesc: "The four divisions feed into each other to create a self-sustaining ecosystem.",
      s1Title: "Train in Academy",
      s1Text: "Students learn real skills in hands-on cohorts.",
      s2Title: "Build in Tech Hub",
      s2Text: "Graduates apply skills to real client products and services.",
      s3Title: "Protect in Foundation & Mentorship",
      s3Text: "Mentors guide leaders while Foundation protects the public.",
      ctaTitle: "Want to get involved in a division?",
      ctaDesc: "Whether you want to learn, hire our team, volunteer for impact, or become a mentor, there's a place for you.",
    },
    academyPage: {
      eyebrow: "NEXUS Academy",
      title: "Practical tech training for Cameroon's next generation.",
      description: "Hands-on, cohort-based training in software engineering, cybersecurity, and digital safety, designed to turn ambitious Cameroonians into capable builders.",
      whatEyebrow: "What makes us different",
      whatTitle: "Training built for real outcomes",
      whatDesc: "We don't teach theory for exams. We build skills for careers.",
      f1Title: "Cohort-based learning",
      f1Text: "Learn alongside motivated peers in structured, timed cohorts with dedicated mentors.",
      f2Title: "Real-world projects",
      f2Text: "Build production-grade applications and security tools that go into your portfolio.",
      f3Title: "Official verification",
      f3Text: "Every graduate receives a verifiable registration ID that employers and partners can confirm online.",
      cohortEyebrow: "Upcoming cohorts",
      cohortTitle: "Join an upcoming training program",
      cohortDesc: "Applications open soon for our next intensive cohorts.",
      tableProgram: "Program",
      tableCohort: "Cohort",
      tableStatus: "Status",
      cohort1Name: "Software Development",
      cohort1Label: "Cohort 1",
      cohort1Status: "Open",
      cohortNote: "New cohorts open as seats fill.",
      programGraphicDesign: "Graphic Design",
      programUiUxDesign: "UI/UX Design",
      programSoftwareDevelopment: "Software Development",
      programAiAutomation: "AI Automation",
      verifyBadge: "Employer Tool",
      verifyTitle: "Verify student & graduate certificates",
      verifyText: "Use our public verification tool to confirm the authenticity of any NEXUS Academy certificate or registration ID.",
      verifyBtn: "Open verification tool",
      ctaTitle: "Ready to start your tech journey?",
      ctaDesc: "Apply for our next cohort or join our community to get notified when applications open.",
    },
    techHubPage: {
      eyebrow: "NEXUS Tech Hub",
      title: "Engineering services & digital products built in Cameroon.",
      hugeEyebrow: "What drives the hub",
      hugeWord1: "Build.",
      hugeWord2: "Ship.",
      hugeWord3: "Scale.",
      marqueeEyebrow: "Technologies & tools we work with",
      description: "Our commercial arm provides software development, cloud solutions, and technical consulting to local and international clients, powering our public mission.",
      servicesEyebrow: "What we build",
      servicesTitle: "Engineering services for ambitious organizations",
      servicesDesc: "We bring modern software practices and deep local context to every project.",
      s1Title: "Custom Web & Mobile Apps",
      s1Text: "Full-stack web applications and cross-platform mobile apps built with React, Next.js, and modern cloud architecture.",
      s2Title: "UI/UX Design",
      s2Text: "User interface and experience design for digital products that combine modern aesthetics with local cultural relevance.",
      s3Title: "Graphic Design",
      s3Text: "Professional creation of brand identities, marketing materials, and digital assets using Adobe Creative Cloud tools.",
      s4Title: "AI Automation",
      s4Text: "Implementation of machine learning models and automated systems using TensorFlow, PyTorch, and NEXUS-developed AI frameworks.",
      approachEyebrow: "Our approach",
      approachTitle: "Why work with NEXUS Tech Hub",
      approachDesc: "We combine international technical standards with local execution.",
      a1Title: "Remote-first agility",
      a1Text: "Distributed team working asynchronously with high communication standards.",
      a2Title: "Reinvested profits",
      a2Text: "Revenue from Tech Hub directly funds our free Foundation literacy programs.",
      a3Title: "Vetted talent",
      a3Text: "Built from top graduates of NEXUS Academy under senior technical leadership.",
      targetSmes: "SMEs",
      targetNgos: "NGOs",
      targetFintechs: "Fintechs",
      targetEnterprise: "Enterprise & Institutions",
      targetMomoOperators: "MoMo Operators",
      heroTag: "// engineering division , douala · remote-first",
      scrollCue: "Scroll to explore",
      statsEyebrow: "Key figures",
      stat1Label: "Projects delivered",
      stat1Text:
        "Web platforms, mobile apps and cloud systems shipped to production.",
      stat2Label: "Client retention",
      stat2Text:
        "Clients who return for a second engagement after their first delivery.",
      stat3Label: "Weeks to first release",
      stat3Text:
        "Average time from kickoff to a first production release on a standard build.",
      orderCta: "Order this service",
      clientsEyebrow: "Who we serve",
      clientsTitle: "Built for organizations that can't afford downtime",
      clientsDesc: "Four segments. One delivery standard.",
      clientSmesSub: "Digital Transformation & Custom Portals",
      clientSmesDesc:
        "We engineer tailored operational platforms, inventory management systems, client portals, and e-commerce applications designed to automate manual tasks, cut overhead costs, and scale seamlessly as your business grows.",
      clientSmesBackTitle: "What we deliver for SMEs",
      clientSmesBack:
        "We start with discovery workshops to map your current workflows and identify automation opportunities. Our team then designs custom operational dashboards, inventory tracking interfaces, and client-facing portals that integrate seamlessly with your existing systems. Every platform includes admin controls, real-time reporting, mobile responsiveness, and cloud hosting with automatic backups. Post-launch, we provide technical support and feature enhancements as your business scales.",
      clientNgosSub: "Field Data Integrity & Beneficiary Tracking",
      clientNgosDesc:
        "We build offline-first mobile data collection tools, real-time analytics reporting dashboards, and secure beneficiary management systems that ensure donor transparency, auditing compliance, and verifiable field impact.",
      clientNgosBackTitle: "What we deliver for NGOs",
      clientNgosBack:
        "We engineer mobile-first data collection apps that work offline in remote field conditions, syncing automatically when connectivity returns. Your program managers get real-time dashboards showing beneficiary metrics, geographic distribution, and impact indicators that meet donor reporting standards. All systems include role-based access control, encrypted data storage, audit logging, and export tools for compliance reports. We train your staff on deployment and provide ongoing technical assistance.",
      clientFintechsSub: "Bank-Grade Security & Digital Wallets",
      clientFintechsDesc:
        "We architect high-concurrency digital wallet platforms, payment gateway integrations, fraud detection modules, and compliance-ready APIs engineered for maximum security and local financial ecosystem interoperability.",
      clientFintechsBackTitle: "What we deliver for Fintechs",
      clientFintechsBack:
        "We architect secure digital wallet backends with multi-currency support, transaction queuing, and real-time balance updates. Our payment gateway integrations handle mobile money, card processing, and bank transfers with automatic reconciliation. Security features include end-to-end encryption, fraud detection algorithms, PCI-DSS compliance tooling, and penetration testing. Every API endpoint is documented, versioned, and optimized for high-concurrency environments with 99.9% uptime guarantees.",
      clientEnterpriseSub: "Scalable Infrastructure & Custom Systems",
      clientEnterpriseDesc:
        "We architect robust enterprise platforms, administrative portals, multi-location management tools, and secure digital infrastructure tailored for institutions, corporations, and public sector organizations.",
      clientEnterpriseBackTitle: "What we deliver for Enterprises",
      clientEnterpriseBack:
        "We build scalable infrastructure platforms designed for multi-location operations, handling employee management, asset tracking, procurement workflows, and financial reporting from a unified dashboard. Our enterprise systems include single sign-on (SSO) integration, granular permission management, comprehensive audit trails, and API connectivity for third-party tools. We deploy on secure cloud infrastructure with automated backups, disaster recovery protocols, and dedicated technical support channels for your IT team.",
      clientMomoSub: "High-Availability Infrastructure & API Tooling",
      clientMomoDesc:
        "We deliver ultra-resilient API middleware, agent network management portals, liquidity monitoring dashboards, and automated transaction reconciliation engines built for 99.99% uptime under high daily volumes.",
      clientsCta: "Discuss your sector",
      terminalOut1: "✓ requirements captured",
      terminalOut2: "✓ team assembled , engineers matched to your stack",
      terminalOut3: "→ next step: tell us about your project",
      terminalFootnote: "// average response time: under 24 hours",
      ctaPrimaryBtn: "Start your project",
      ctaTitle: "Have a project in mind?",
      ctaDesc: "Let's discuss how NEXUS Tech Hub can build your software solution.",
      introEyebrow: "How We Operate",
      introTitle: "Engineering services built for modern businesses",
      introDesc: "NEXUS Tech Hub is the commercial arm of NEXUS, delivering professional software development, cloud solutions, and technical consulting to organizations across Cameroon and beyond. We combine international technical standards with local expertise.",
      introPoint1Title: "Agile & Transparent",
      introPoint1Text: "Weekly demos, clear documentation, and direct communication throughout the project lifecycle.",
      introPoint2Title: "Quality-Driven",
      introPoint2Text: "Every project includes automated testing, code reviews, and security best practices built-in.",
      introPoint3Title: "Academy-Backed",
      introPoint3Text: "Our engineers are top graduates from NEXUS Academy with hands-on training in modern frameworks.",
      introHoursTitle: "Active Hours",
      introHoursText: "We operate across West African Time (WAT) with flexible scheduling for international clients.",
      introHoursTime: "Mon–Fri, 8:00 AM – 6:00 PM WAT",
      introResponseTitle: "Quick Response",
      introResponseText: "Initial project inquiries receive detailed responses within 24 hours on business days.",
      introResponseTime: "< 24 hours average",
      introRemoteTitle: "Remote-First Team",
      introRemoteText: "Distributed across Douala and beyond, we collaborate seamlessly using modern project management tools and video conferencing.",
      processEyebrow: "Our Process",
      processTitle: "How we deliver quality software",
      processDesc: "A structured approach that adapts to your project needs and timeline",
      process1Title: "Discovery & Planning",
      process1Desc: "We start by understanding your business goals, technical requirements, and project constraints through collaborative workshops and analysis.",
      process1Del1: "Project roadmap",
      process1Del2: "Technical architecture",
      process1Del3: "Cost estimate",
      process2Title: "Design & Prototyping",
      process2Desc: "Our designers create intuitive interfaces and interactive prototypes, iterating based on your feedback to ensure the final product matches your vision.",
      process2Del1: "Design system",
      process2Del2: "Clickable prototype",
      process2Del3: "User flows",
      process3Title: "Development",
      process3Desc: "Using agile methodology, we build your software in sprints with weekly demos, ensuring transparency and allowing for adjustments along the way.",
      process3Del1: "Working software",
      process3Del2: "Source code",
      process3Del3: "Weekly progress reports",
      process4Title: "Quality Assurance",
      process4Desc: "Comprehensive testing including automated test suites, security scanning, and performance optimization to ensure your software is production-ready.",
      process4Del1: "Test reports",
      process4Del2: "Bug fixes",
      process4Del3: "Performance audit",
      process5Title: "Deployment & Training",
      process5Desc: "We handle production deployment, configure hosting infrastructure, train your team, and provide comprehensive documentation.",
      process5Del1: "Live application",
      process5Del2: "User guides",
      process5Del3: "Team training",
      process6Title: "Post-Launch Support",
      process6Desc: "Ongoing maintenance, bug fixes, feature enhancements, and technical assistance to ensure your software continues performing optimally.",
      process6Del1: "Support channel",
      process6Del2: "Updates & patches",
      process6Del3: "Performance monitoring",
      whyEyebrow: "Why Choose NEXUS",
      whyTitle: "Built different from day one",
      whyDesc: "We may be new, but our approach is rooted in proven practices and genuine commitment to quality",
      why1Title: "Academy-Trained Engineers",
      why1Desc: "Our team is built from top NEXUS Academy graduates with up-to-date skills in modern frameworks and industry best practices.",
      why2Title: "Mission-Driven Impact",
      why2Desc: "Revenue from Tech Hub directly funds our Foundation's digital literacy programs, creating positive social impact beyond just code.",
      why3Title: "No Bloat, No Bureaucracy",
      why3Desc: "As a lean startup, we move fast, communicate directly, and focus on what matters: delivering working software that solves real problems.",
      why4Title: "Transparent Process",
      why4Desc: "We believe in clear communication, honest timelines, and no hidden costs. What you see is what you get from discovery to deployment.",
      why5Title: "Aligned with Your Growth",
      why5Desc: "We understand startup constraints because we are one. Our pricing, flexibility, and engagement models reflect that reality.",
      why6Title: "Built for Cameroon, Ready for the World",
      why6Desc: "We understand local business challenges and infrastructure constraints while maintaining international technical standards and quality.",
      whyCta: "Learn more",
      why1Alt: "Young African tech students learning to code",
      why2Alt: "Team collaboration and social impact",
      why3Alt: "Modern software development workspace",
      why4Alt: "Forward-looking vision and strategy",
      why5Alt: "Business growth chart and metrics",
      why6Alt: "Global network with Cameroon roots",
      projectsEyebrow: "Featured Work",
      projectsTitle: "Sample projects showcasing our capabilities",
      projectsDesc: "Internal tools and practice projects built by our team to demonstrate technical expertise",
      projectsAutoPlay: "Auto-advancing every 7 seconds",
      projectTrendoraCategory: "E-Commerce Platform",
      projectTrendoraTitle: "Trendora",
      projectTrendoraDesc: "A full-featured online shopping ecosystem with multi-vendor support, real-time inventory management, secure payment processing, and mobile-responsive design built to handle high traffic volumes.",
      projectTrendoraFeature1: "Multi-vendor marketplace",
      projectTrendoraFeature2: "Payment integration",
      projectTrendoraFeature3: "Real-time inventory",
      projectTrendoraFeature4: "Admin dashboard",
      projectVIPCategory: "Farm Management System",
      projectVIPTitle: "VIP Farm",
      projectVIPDesc: "A comprehensive poultry management system designed for commercial farms, featuring livestock tracking, feed management, health monitoring, production analytics, and automated reporting for farm operations.",
      projectVIPFeature1: "Livestock tracking",
      projectVIPFeature2: "Health monitoring",
      projectVIPFeature3: "Feed management",
      projectVIPFeature4: "Production analytics",
      projectAcademyCategory: "Academic Portal",
      projectAcademyTitle: "NEXUS Academy Portal",
      projectAcademyDesc: "Internal student registration and course management system used by NEXUS Academy, featuring enrollment tracking, certificate generation, payment processing, and student verification tools.",
      projectAcademyFeature1: "Course registration",
      projectAcademyFeature2: "Certificate generation",
      projectAcademyFeature3: "Payment tracking",
      projectAcademyFeature4: "Student verification",
      projectFoundationCategory: "Campaign Management",
      projectFoundationTitle: "Foundation Campaign Tracker",
      projectFoundationDesc: "A campaign management tool built for NEXUS Foundation to track MoMo scam awareness initiatives, measuring community reach, distributing educational materials, and generating impact reports for stakeholders.",
      projectFoundationFeature1: "Campaign tracking",
      projectFoundationFeature2: "Reach analytics",
      projectFoundationFeature3: "Material distribution",
      projectFoundationFeature4: "Impact reporting",
      projectMentorshipCategory: "Matching Platform",
      projectMentorshipTitle: "Mentorship Matching System",
      projectMentorshipDesc: "An internal platform to pair NEXUS Academy graduates with industry mentors, featuring profile matching algorithms, session scheduling, progress tracking, and mentor-mentee communication tools.",
      projectMentorshipFeature1: "Smart matching",
      projectMentorshipFeature2: "Session scheduling",
      projectMentorshipFeature3: "Progress tracking",
      projectMentorshipFeature4: "Communication hub",
      engagementEyebrow: "Flexible Engagement",
      engagementTitle: "Work with us your way",
      engagementDesc: "Every project is unique. We tailor our engagement model to your scope, budget, and timeline.",
      engagementCta: "Get a custom quote",
      engagementFooterBold: "Transparent pricing:",
      engagementFooterText: "We provide detailed quotes after understanding your requirements. No hidden fees, no surprises.",
      engagement1Title: "Fixed-Scope Project",
      engagement1Desc: "Ideal when requirements are clear and scope is well-defined. We provide a fixed quote after initial discovery phase, ensuring predictable costs and timeline.",
      engagement1Best1: "MVP launches",
      engagement1Best2: "Website redesigns",
      engagement1Best3: "Specific feature builds",
      engagement1Pricing: "Based on project complexity, features, and timeline. Fixed quote provided after discovery phase with clear milestones and deliverables.",
      engagement2Title: "Dedicated Team",
      engagement2Desc: "For ongoing product development or when you need a dedicated engineering team to scale rapidly. Flexible team composition adjusted to your needs.",
      engagement2Best1: "Long-term partnerships",
      engagement2Best2: "Evolving products",
      engagement2Best3: "Scaling existing platforms",
      engagement2Pricing: "Monthly retainer based on team size and seniority level. Flexible scaling up or down with 30-day notice. Predictable monthly costs.",
      engagement3Title: "Time & Materials",
      engagement3Desc: "Pay only for the actual time spent. Perfect for exploratory projects, technical consulting, or when scope is still being defined and refined.",
      engagement3Best1: "Technical audits",
      engagement3Best2: "Proof of concepts",
      engagement3Best3: "Incremental feature additions",
      engagement3Pricing: "Hourly or daily rates based on engineer expertise level. Detailed time tracking provided weekly. Flexible engagement with no long-term commitment.",
      faqEyebrow: "FAQ",
      faqTitle: "Common questions about working with us",
      faqFooter: "Still have questions?",
      faqFooterLink: "Contact us directly",
      faq1Q: "How long does a typical project take?",
      faq1A: "Project timelines vary significantly based on scope and complexity. Simple MVPs can launch in 2-3 weeks, while complex enterprise platforms may take several months. We provide realistic timelines after the discovery phase when requirements are clear.",
      faq2Q: "Do you work with international clients?",
      faq2A: "Yes, we work remotely with clients across different time zones. Our team is experienced in asynchronous communication and we use modern project management tools, video conferencing, and collaborative platforms to ensure smooth coordination regardless of location.",
      faq3Q: "What happens after the project launches?",
      faq3A: "We offer flexible post-launch support packages including bug fixes, performance monitoring, security updates, and feature enhancements. Support terms are customized per project. We can also train your internal team to manage the platform independently.",
      faq4Q: "Can you integrate with our existing systems?",
      faq4A: "Yes, we have experience integrating with third-party APIs, legacy databases, ERP systems, and existing software platforms. Integration complexity and feasibility are assessed during the discovery phase with technical documentation review.",
      faq5Q: "What technologies do you work with?",
      faq5A: "We work with modern, production-ready technologies including React, Next.js, Node.js, Python, React Native, PostgreSQL, MongoDB, and cloud platforms like AWS. Our stack is chosen based on your specific project needs, existing infrastructure, and long-term maintainability.",
      faq6Q: "Do you provide maintenance after launch?",
      faq6A: "Yes, we offer ongoing maintenance and support contracts with flexible terms (monthly retainers or pay-per-incident). Services include bug fixes, security patches, performance optimization, minor feature updates, and technical support.",
      faq7Q: "What if our requirements change mid-project?",
      faq7A: "We use agile methodology which accommodates evolving requirements. Scope changes are documented through a formal change request process, and we transparently discuss impacts on timeline and budget before implementation. Flexibility is built into our process.",
      faq8Q: "Can we hire NEXUS engineers full-time?",
      faq8A: "While our primary model is project-based engagement, we can discuss dedicated team arrangements for long-term partnerships. We can also facilitate referrals to NEXUS Academy graduates seeking permanent positions if you're building an internal team.",
    },
    foundationPage: {
       description: "The impact arm of NEXUS, aspiring to build lasting solutions for real Cameroonian problems and open a path into tech for every young person.",
       heroEyebrow: "NEXUS Foundation · Learn. Build. Impact.",
       heroTitle: "Making life easier for everyone.",
       heroSubtitle: "The impact arm of NEXUS, aspiring to build lasting solutions for real Cameroonian problems and open a path into tech for every young person.",
       heroCtaPrimary: "Support the work",
       heroCtaSecondary: "Partner with us",
       learnLabel: "Learn.",
       buildLabel: "Build.",
       impactLabel: "Impact.",
       whoEyebrow: "Who we are",
       whoTitle: "The impact arm of NEXUS.",
       whoText1: "NEXUS Foundation connects the organisation's capabilities in learning, technology, and mentorship with the everyday needs of Cameroonian communities. We work toward practical initiatives that strengthen digital confidence, expand youth opportunity, and make technology more useful in people's lives.",
       whoText2: "We are building with care and accountability. Our ambitions set the direction; progress will be earned through listening, responsible partnerships, and work that delivers genuine value.",
      learnText: "Knowledge shared with those who need it most",
      buildText: "Solutions shaped with communities, not just for them",
      impactText: "Real change measured in everyday lives",
      drivesEyebrow: "What drives us",
      drivesTitle: "Three commitments shape everything we do",
      drivesDesc: "Broad enough to grow with us. Clear enough to hold us accountable.",
      d1Num: "01",
      d1Title: "Digital Empowerment",
      d1Text: "Working toward a Cameroon where every community can take part in the digital economy , with access, skills, and confidence.",
      d2Num: "02",
      d2Title: "Youth Opportunity",
      d2Text: "Opening doors for young Cameroonians into technology careers through exposure, guidance, and real pathways.",
      d3Num: "03",
      d3Title: "Community Upliftment",
      d3Text: "Using technology to strengthen daily life in our communities , practically, sustainably, and together.",
      ambitionsEyebrow: "Our ambitions",
      ambitionsTitle: "Where we are headed",
      ambitionsDesc: "These are goals, not achievements , the horizon we are building toward, stated openly so you can hold us to it.",
      horizonNear: "Near term",
      horizonMid: "Mid term",
      horizonLong: "Long term",
      a1Title: "Solutions worth submitting",
      a1Text: "Develop lasting, homegrown solutions mature enough to be submitted to government , approved answers to real Cameroonian problems.",
      a2Title: "A Silicon Valley in every region",
      a2Text: "Champion local tech ecosystems across all regions of Cameroon, so opportunity is never limited by geography.",
      a3Title: "Full recognition",
      a3Text: "Become a fully registered organization, recognized by the state and international bodies we aim to serve alongside.",
      a4Title: "Trusted for youth upliftment",
      a4Text: "Grow into one of Cameroon's most trusted organizations when it comes to uplifting young people.",
      a5Title: "Securing cyberspace",
      a5Text: "Venture into initiatives that help protect and secure the digital spaces Cameroonians rely on every day.",
       valueBandText: "Making life easier for everyone.",
       supportEyebrow: "Support the work",
       supportTitle: "Progress needs people behind it.",
       supportDesc: "Whether you bring time, expertise, reach, or institutional support, there is a meaningful way to help shape this work from the beginning.",
       supportTrustNote: "We are early in the journey. We invite support with clarity about what we are building toward and a commitment to earn trust through practical work.",
       supportVolunteerTitle: "Give your time",
       supportVolunteerText: "Join community-facing work and help create accessible learning experiences.",
       supportVolunteerCta: "Get involved",
       supportSkillsTitle: "Share your expertise",
       supportSkillsText: "Contribute knowledge, facilitate a session, or help strengthen an initiative.",
       supportSkillsCta: "Talk to the team",
       supportUpdatesTitle: "Follow the journey",
       supportUpdatesText: "Receive clear updates on the work, the learning, and the next opportunities to contribute.",
       supportUpdatesCta: "Subscribe for updates",
       supportPartnerTitle: "Partner for impact",
       supportPartnerText: "Support or co-deliver initiatives that respond to real community needs.",
       supportPartnerCta: "Explore partnership",
       newsEyebrow: "Stay close to the story",
      newsTitle: "Follow the journey from day one",
      newsDesc: "We are building this in the open. Subscribe for honest updates on what we launch, what we learn, and where we need help.",
      newsPlaceholder: "Your email address",
      newsButton: "Subscribe",
      newsSuccess: "Welcome aboard , you're part of the story now.",
      newsErrorInvalid: "That email doesn't look right. Please check and try again.",
      ctaTitle: "Be part of the story from day one",
      ctaDesc: "Whether you want to collaborate, volunteer your skills, or simply follow along , there is a place for you here.",
    },
    mentorshipPage: {
      eyebrow: "NEXUS Mentorship",
      title: "Guiding the next generation of Cameroonian leaders.",
      description: "Connecting emerging tech talent with experienced industry mentors for structured 1-on-1 career guidance, technical growth, and leadership development.",
      // Introduction
      introEyebrow: "What We Do",
      introTitle: "Bridging Education and Industry",
      introText: "Through structured programmes, one-on-one guidance, and institutional partnerships, NEXUS Mentorship bridges the gap between education and industry across Cameroon.",
      bullet1: "Structured youth mentorship in technology and entrepreneurship",
      bullet2: "Academia-to-industry bridge programmes",
      bullet3: "Career guidance sessions and one-on-one professional development support",
      // Programmes & Services
      programmesEyebrow: "What You Get",
      programmesTitle: "Structured programmes for real growth",
      programmesDesc: "Four focused pathways designed to take you from where you are to where you want to be , with guidance from people who've done it.",
      prog1Title: "Youth Mentorship in Technology",
      prog1Text: "Structured mentorship connecting young people with experienced technology professionals in Cameroon and beyond. Regular sessions, goal-setting, and progress tracking.",
      prog2Title: "Academia-to-Industry Bridge",
      prog2Text: "Connecting graduates with professional pathways through employer introductions, industry visits, portfolio reviews, and placement support in collaboration with NEXUS Academy.",
      prog3Title: "Career Guidance Sessions",
      prog3Text: "One-on-one career guidance covering CV development, LinkedIn optimisation, interview preparation, and professional positioning in the technology sector.",
      prog4Title: "Leadership Development",
      prog4Text: "Initiatives designed to build the next generation of technology leaders , focusing on communication, decision-making, team management, and strategic thinking.",
      // How it works
      howEyebrow: "Program structure",
      howTitle: "Mentorship built on accountability",
      howDesc: "We match mentees with mentors for structured 6-month mentorship cycles.",
      h1Title: "1-on-1 Guidance",
      h1Text: "Regular bi-weekly sessions focused on career planning, technical skill gaps, and professional growth.",
      h2Title: "Portfolio & Code Reviews",
      h2Text: "Direct feedback on projects, resume building, and job interview preparation from active industry pros.",
      h3Title: "Leadership Pathway",
      h3Text: "Mentees are groomed to become mentors for future cohorts, creating a lasting cycle of leadership.",
      // Who we serve
      whoServeEyebrow: "Who It's For",
      whoServeTitle: "Designed for the people building Cameroon's tech future",
      whoServeDesc: "Whether you're just starting out or ready to level up, there's a place for you in NEXUS Mentorship.",
      whoServe1Title: "Students & Recent Graduates",
      whoServe1Text: "Final-year university and college students, or graduates from the past two years, who are ready to transition from theory to practice. Whether you're in software engineering, cybersecurity, or tech in general , this is your launchpad. We help you build a portfolio that stands out, prepare for interviews at top companies, and make the connections that open doors.",
      whoServe2Title: "Early-Career Professionals",
      whoServe2Text: "Already working in tech but feeling stuck? Whether it's been 1 year or 5, our mentorship helps you level up , sharpen your technical skills, build your professional presence, and develop the leadership qualities that set senior engineers apart. Stop guessing, start growing with guidance from people who've already walked your path.",
      whoServe3Title: "Educators & Tech Educators",
      whoServe3Text: "Teachers, lecturers, and tech instructors looking to bridge what they teach with what the industry actually needs. Whether you're preparing students for the workforce or looking to upskill yourself, our mentorship connects you with practitioners who can bring real-world context to your teaching and career.",
      whoServe4Title: "Young Tech Professionals",
      whoServe4Text: "Young professionals in the first phase of your tech career who want more than just a job. If you're ambitious, hungry to grow, and ready to invest in yourself , we match you with mentors who've been where you are and can help you navigate the next steps with clarity and confidence.",
      // Benefits / Outcomes
      benefitsEyebrow: "What You'll Gain",
      benefitsTitle: "Real outcomes that matter",
      benefit1Title: "Career Acceleration",
      benefit1Text: "Clear pathways, expert guidance, and measurable progress toward your career goals.",
      benefit2Title: "Network Building",
      benefit2Text: "Connections to industry leaders, peers, and opportunities across Cameroon's tech ecosystem.",
      benefit3Title: "Skill Development",
      benefit3Text: "Practical expertise in technical and soft skills that translate directly to workplace success.",
      // For Mentees / For Mentors
      whoEyebrow: "Two Pathways",
      whoTitle: "Whether you're growing or giving back",
      whoDesc: "Two tracks. One mission. Find where you fit.",
      w1Title: "For Mentees",
      w1Text: "Academy graduates, junior developers, and aspiring tech professionals seeking clear career direction.",
      w2Title: "For Mentors",
      w2Text: "Senior engineers, product managers, and tech leaders looking to guide Cameroonian talent.",
      ctaEyebrow: "Get Started",
      ctaTitle: "Ready to give back or grow?",
      ctaDesc: "Apply to become a mentor or mentee in our upcoming mentorship cycle.",
      // Cycle Timeline
      cycleEyebrow: "The Journey",
      cycleTitle: "A 6-month structured cycle of growth",
      cycleDesc: "Every mentorship cycle follows a proven framework with clear milestones and real outcomes.",
      cycle1Title: "Onboarding & Matching",
      cycle1Text: "Profile assessment, mentor matching based on goals and expertise, setting expectations.",
      cycle2Title: "Foundations & Skills Building",
      cycle2Text: "Technical skill gap analysis, portfolio planning, CV and LinkedIn optimisation.",
      cycle3Title: "Leadership & Real-World Application",
      cycle3Text: "Soft skills development, communication, decision-making, team dynamics.",
      cycle4Title: "Capstone Projects",
      cycle4Text: "Mentees execute a capstone project demonstrating growth and practical skills.",
      cycle5Title: "Transition & Alumni Network",
      cycle5Text: "Final reviews, next-steps planning, and lifetime access to the NEXUS alumni network.",
      cycle6Title: "Ongoing: Lifetime Community",
      cycle6Text: "Graduates become mentors for future cycles, creating a self-sustaining cycle of leadership.",
      // Explore NEXUS
      exploreNexusEyebrow: "Explore NEXUS",
      exploreNexusTitle: "Discover our other divisions",
      exploreNexusDesc: "NEXUS Mentorship is part of a larger ecosystem. Explore our other divisions to see the full picture.",
    },
    contactPage: {
      eyebrow: "Contact Us",
      title: "Let's build together.",
      description: "Have a question, partnership proposal, or want to get involved? Reach out to the NEXUS team.",
      getInTouchEyebrow: "Get in touch",
      getInTouchTitle: "We'd love to hear from you",
      getInTouchDesc: "Send us a message and our team will get back to you within 24–48 hours.",
      directTitle: "Direct Contact Information",
      formTitle: "Send Us a Message",
      nameLabel: "Your Name",
      namePlaceholder: "e.g. Marie Ngu",
      emailLabel: "Email Address",
      emailPlaceholder: "marie@example.cm",
      divisionLabel: "Topic / Division",
      selectDivision: "Select a topic...",
      generalInquiry: "General Inquiry",
      messageLabel: "Your Message",
      messagePlaceholder: "How can we help you?",
      sendBtn: "Send Message",
      sentSuccess: "Thank you! Your message has been sent successfully.",
      whatsapp: "WhatsApp",
      email: "Email",
      phone: "Phone",
      chatOnWhatsApp: "Chat on WhatsApp",
    },
    journeyPage: {
      eyebrow: "NEXUS Journey",
      title: "Building NEXUS, one milestone at a time.",
      description: "We believe in building in public. Follow our progress as we establish NEXUS and grow our ecosystem across Cameroon.",
      heroCtaPrimary: "Follow Our Journey",
      heroCtaSecondary: "Partner With Us",
      stat1Label: "Programs Available",
      stat2Label: "Divisions",
      stat3Label: "Languages Supported",
      stat4Label: "AI Assistant",
      filterAll: "All",
      filterCompany: "Company",
      filterAcademy: "Academy",
      filterTechHub: "Tech Hub",
      filterFoundation: "Foundation",
      galleryTitle: "Our Work in Action",
      galleryDesc: "A visual showcase of what we have built and the impact we are creating.",
      newsletterEyebrow: "Stay Updated",
      newsletterTitle: "Never miss a milestone.",
      newsletterDesc: "Subscribe to receive updates on our progress, new programs, and community events.",
      newsletterPlaceholder: "Enter your email address",
      newsletterBtn: "Subscribe",
      newsletterSuccess: "You are subscribed! Welcome to the NEXUS journey.",
      newsletterInvalid: "Please enter a valid email address.",
      socialEyebrow: "Connect With Us",
      socialTitle: "Follow NEXUS on social media.",
      socialDesc: "Join our growing community across platforms. Stay updated on our latest work, events, and opportunities.",
      socialFollow: "Follow",
      ctaEyebrow: "Get Involved",
      ctaTitle: "Be part of the NEXUS story.",
      ctaDesc: "Whether you want to learn, build, or make an impact — there is a place for you at NEXUS.",
      ctaPrograms: "Explore Programs",
      ctaPartner: "Partner With Us",
      ctaBlog: "Read Our Blog",
      readMore: "Read more",
      readLess: "Read less",
      imageCount: "images",
      videoCount: "videos",
      noMedia: "No media yet",
      sharedTo: "Shared to",
    },
    blogPage: {
      eyebrow: "NEXUS Blog",
      title: "Insights, Announcements & Updates.",
      description: "Thoughts from our co-founders, recaps of our public journey, and deep dives into digital trust in Cameroon.",
      readTime: "min read",
      readMore: "Read article",
      backToBlog: "Back to all articles",
      searchPlaceholder: "Search articles...",
      noPosts: "No articles found matching your criteria.",
      relatedPosts: "Related articles",
      loadMore: "Load more",
      share: "Share",
      minRead: "min read",
      author: "Author",
      tags: "Tags",
    },
    faqPage: {
      eyebrow: "FAQ",
      title: "Frequently Asked Questions.",
      description: "Find clear answers to common questions about NEXUS, our divisions, training cohorts, and governance.",
      catAll: "All Questions",
      catGeneral: "General",
      catAcademy: "Academy",
      catTechHub: "Tech Hub",
      catFoundation: "Foundation",
      catMentorship: "Mentorship",
      q1Question: "What is NEXUS?",
      q2Question: "How does NEXUS Academy training work?",
      q3Question: "What services does NEXUS Tech Hub provide?",
      q4Question: "What is the mission of NEXUS Foundation?",
      q5Question: "How does NEXUS Mentorship work?",
      q6Question: "How can I verify an Academy registration?",
      q7Question: "How can my organization partner with NEXUS?",
      stillQuestions: "Still have questions?",
      contactSupport: "Feel free to contact our team anytime.",
    },
    joinUsPage: {
      eyebrow: "Join NEXUS",
      title: "Build the digital future of Cameroon with us.",
      description: "We are always looking for passionate builders, trainers, community leaders, and volunteers to join our team.",
      pathwayTitle: "Your Pathway",
      pathwaySubtitle: "Tell us who you are and how you want to be part of NEXUS.",
      opportunitiesTitle: "Open Opportunities",
      opportunitiesSubtitle: "Current roles available across the NEXUS ecosystem.",
      applyNote: "Submit your application through the form above, selecting the relevant pathway.",
      submitBtn: "Submit Application",
      successTitle: "Application Received",
      successDesc: "Thank you for your interest in NEXUS. We will review your application and get back to you shortly.",
      pathwayPrompt: "Select a pathway to begin",
      closeForm: "Close form",
      sideTitle: "What happens next",
      sideText: "We review every application within a few business days and reach out with clear next steps. Prefer to talk directly? Message us on WhatsApp or email anytime.",
      whatsappAlt: "Message us on WhatsApp",
      emailAlt: "Email us at",
    },
    partnerPage: {
      eyebrow: "Partner With Us",
      title: "Collaborate With NEXUS For Lasting Impact.",
      description: "We partner with organizations, institutions, tech companies, and NGOs to advance digital trust, skill building, and security in Cameroon.",
      waysEyebrow: "Partnership models",
      waysTitle: "Ways we can work together",
      waysDesc: "We tailor partnerships to align mutual goals and maximize public benefit.",
      w1Title: "Corporate & Hiring Partner",
      w1Text: "Hire top-vetted software engineers and cybersecurity talent directly from NEXUS Academy cohorts.",
      w2Title: "Foundation & Impact Partner",
      w2Text: "Sponsor digital safety campaigns, Mobile Money fraud prevention, and school outreach programs.",
      w3Title: "Technical & Project Partner",
      w3Text: "Contract NEXUS Tech Hub for software development, cloud infrastructure, or security auditing.",
      formTitle: "Partnership Inquiry Form",
      orgNameLabel: "Organization Name",
      orgPlaceholder: "e.g. Acme Tech Ltd",
      contactNameLabel: "Contact Person",
      contactPlaceholder: "e.g. Jean Dupont",
      emailLabel: "Email Address",
      typeLabel: "Organization Type",
      typeSelect: "Select type...",
      tCorporate: "Corporate / Company",
      tEducational: "Educational Institution",
      tGovernment: "Government / Agency",
      tNgo: "NGO / Non-Profit",
      tIndividual: "Individual Sponsor",
      messageLabel: "How would you like to partner?",
      messagePlaceholder: "Describe your organization and proposed collaboration...",
      submitBtn: "Submit Partnership Inquiry",
      sentSuccess: "Thank you! Our partnership team will reach out shortly.",
      // Redesign additions
      statsEyebrow: "Our ecosystem",
      statsTitle: "A growing force for digital Cameroon",
      statsDesc: "Four divisions working as one to train talent, build technology, and serve communities.",
      statDivisionsLabel: "Active divisions",
      statProgramsLabel: "Hands-on programs",
      statTrainedLabel: "Learners reached",
      statCommunitiesLabel: "Communities served",
      benefitEyebrow: "Why partner with NEXUS",
      benefitTitle: "What partnership brings you",
      benefitDesc: "Beyond goodwill, concrete value for your organization, your team, and the communities you serve.",
      benefit1Title: "Vetted tech talent",
      benefit1Text: "Tap directly into graduates of NEXUS Academy, practical, job-ready engineers and designers across software, security, and AI.",
      benefit2Title: "Build with a trusted team",
      benefit2Text: "Deliver software, cloud, and design work through NEXUS Tech Hub, combining international standards with deep local context.",
      benefit3Title: "Community & CSR reach",
      benefit3Text: "Amplify your social impact by funding digital-literacy and safety programs that reach schools and communities nationwide.",
      benefit4Title: "Local insight, global standards",
      benefit4Text: "Remote-first across Cameroon with the rigor of a world-class engineering culture, agile, transparent, and accountable.",
      typesEyebrow: "Who can partner",
      typesTitle: "Partnerships for every kind of organization",
      typesDesc: "However you engage, there is a way to create shared value with NEXUS.",
      typeCorporateTitle: "Corporate & Companies",
      typeCorporateText: "Hire talent, build products, or sponsor community programs as part of your CSR and innovation goals.",
      typeNgoTitle: "NGOs & Non-Profits",
      typeNgoText: "Co-deliver field data tools, digital-safety campaigns, and capacity building for the communities you serve.",
      typeGovernmentTitle: "Government & Institutions",
      typeGovernmentText: "Strengthen public digital services, training, and infrastructure with a local, accountable technology partner.",
      typeEducationTitle: "Educational Institutions",
      typeEducationText: "Co-create curricula, internships, and hands-on tracks that bridge the gap between study and industry.",
      typeIndividualTitle: "Individuals, Diaspora & Philanthropy",
      typeIndividualText: "Support scholarships, mentor talent, or champion NEXUS across your network and community.",
      modelEyebrow: "Ways to collaborate",
      modelTitle: "How we can work together",
      modelDesc: "Flexible models tailored to your goals and capacity.",
      model4Title: "Sponsorship & Grants",
      model4Text: "Fund cohorts, campaigns, or infrastructure and be recognized as a founding partner of digital Cameroon.",
      model5Title: "Research & Curriculum",
      model5Text: "Shape the next generation of tech training through joint research, guest lectures, and curriculum design.",
      processEyebrow: "How it works",
      processTitle: "From first conversation to lasting impact",
      processDesc: "A clear, low-friction path to partnership.",
      processCtaLabel: "Start your partnership",
      step1Title: "Submit an inquiry",
      step1Text: "Tell us about your organization and goals through the partnership form below.",
      step2Title: "Intro call",
      step2Text: "We schedule a short call to understand your needs and explore fit.",
      step3Title: "Co-scope the engagement",
      step3Text: "Together we define a concrete, mutually beneficial partnership plan.",
      step4Title: "Launch & grow",
      step4Text: "We execute, measure impact, and look for ways to deepen the relationship.",
      formWebsiteLabel: "Website or LinkedIn",
      formInterestLabel: "Partnership interest",
      interestSelect: "Select interest...",
      interestSponsorship: "Sponsorship & Grants",
      interestTech: "Tech build / Services",
      interestTalent: "Talent & Hiring",
      interestCommunity: "Community & CSR",
      interestResearch: "Research & Curriculum",
      formSideTitle: "What happens next",
      formSideText: "We review every inquiry within 2 business days and reply with clear next steps. Prefer to talk directly? Reach us on WhatsApp or email.",
      whatsappAlt: "Message us on WhatsApp",
      emailAlt: "Email us at",
      formError: "Something went wrong. Please try again or email us directly.",
    },
    verifyPage: {
      eyebrow: "Verification Portal",
      title: "Verify NEXUS Academy Certificates & Registration IDs.",
      description: "Public tool for employers, partners, and institutions to confirm student registrations and certificate authenticity.",
      searchPlaceholder: "Enter Registration ID (e.g. NX-AC-2026-001)...",
      verifyBtn: "Verify ID",
      howTitle: "How verification works",
      howText: "Every NEXUS Academy student is assigned a unique Registration ID upon enrollment. Enter the ID above to view verified records.",
      sampleCode: "Try sample code: NX-AC-2026-001",
      noResult: "No verified record found for this ID. Please check the number and try again.",
      validResult: "Verified Record Found",
      registrationId: "Registration ID",
    },
    legalPage: {
      termsTitle: "Terms of Use",
      termsSubtitle: "Rules and terms governing the use of NEXUS websites, platforms, and services.",
      privacyTitle: "Privacy Policy",
      privacySubtitle: "How NEXUS collects, protects, and handles your personal information.",
      lastUpdated: "Last updated: August 2026",
      termsIntro: "These Terms of Use govern your access to and use of the NEXUS website and all associated services, platforms, and content operated by NEXUS Technologies.",
      termsScopeTitle: "Scope",
      termsScopeText: "These Terms apply to all visitors, users, students, partners, and anyone who accesses or uses any part of the NEXUS website, including but not limited to the Academy enrollment portal, partnership inquiry forms, mentorship applications, blog content, and any interactive features. By accessing or using any part of the site, you agree to be bound by these Terms.",
      termsAcceptanceTitle: "Acceptance of Terms",
      termsAcceptanceText: "By accessing or using this website, you agree to comply with and be bound by these Terms. If you do not agree with any part of these Terms, you must not use the website. Continued use of the website following any changes to these Terms constitutes acceptance of those changes.",
      termsUseTitle: "Acceptable Use",
      termsUseText: "You may use this website for lawful purposes only, in a manner consistent with all applicable Cameroonian laws and regulations. You agree not to: (a) use the website in any way that violates applicable law or infringes on the rights of others; (b) attempt to gain unauthorized access to any part of the website, its servers, or its underlying systems; (c) transmit any harmful, offensive, defamatory, or unsolicited content through any contact form or interactive feature; (d) scrape, crawl, or systematically download content from the website without prior written permission from NEXUS; (e) use the website to impersonate NEXUS Technologies, its team members, or any of its divisions; (f) introduce viruses, malware, or any other malicious code; (g) interfere with or disrupt the integrity or performance of the website.",
      termsIpTitle: "Intellectual Property",
      termsIpText: "All content on this website, including text, graphics, logos, icons, images, audio clips, video, software, and code, is the property of NEXUS Technologies or its content suppliers and is protected by Cameroonian and international intellectual property laws. You may not reproduce, distribute, modify, transmit, display, or otherwise use any content from this website without our prior written permission, except for personal, non-commercial use where such use does not infringe our rights. The NEXUS name, logo, and all division brand identifiers are trademarks of NEXUS Technologies. Nothing on this website grants any license or right to use these marks without explicit written consent.",
      termsAccuracyTitle: "Accuracy of Information",
      termsAccuracyText: "NEXUS strives to ensure that all information on this website is accurate, current, and reliable. However, we make no warranty or representation as to the accuracy, completeness, or timeliness of any information published. Content is provided for general informational purposes only and does not constitute professional, legal, financial, or technical advice. Service descriptions, program details, pricing, schedules, and availability are subject to change without notice. Always confirm current details by contacting us directly before making any decisions based on website content.",
      termsLinksTitle: "External Links",
      termsLinksText: "This website contains links to external websites, including social media platforms, partner organizations, payment processors, and third-party tools. These links are provided for your convenience only. NEXUS does not control, endorse, or guarantee the accuracy, legality, or appropriateness of any third-party site or its content. We are not responsible for the privacy practices, data handling, or security of any external websites. We encourage you to review the terms and privacy policies of any third-party site before providing any personal information.",
      termsLiabilityTitle: "Limitation of Liability",
      termsLiabilityText: "To the fullest extent permitted by Cameroonian law, NEXUS Technologies, its directors, officers, employees, agents, partners, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of profits, or loss of goodwill, arising from: (a) your use of or inability to use the website; (b) any errors, omissions, or inaccuracies in website content; (c) unauthorized access to or alteration of your transmissions or data; (d) any other matter relating to the website. Nothing in these Terms excludes or limits liability that cannot be excluded by law, including liability for death or personal injury caused by negligence.",
      termsWarrantyTitle: "Disclaimer of Warranties",
      termsWarrantyText: "This website is provided on an 'as is' and 'as available' basis without warranties of any kind, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. NEXUS does not warrant that the website will be uninterrupted, error-free, secure, or free of viruses or other harmful components. We do not guarantee the accuracy, reliability, or completeness of any content, services, or materials available through the website.",
      termsPrivacyTitle: "Privacy",
      termsPrivacyText: "Your use of this website and the personal data you provide are also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.",
      termsGoverningTitle: "Governing Law and Jurisdiction",
      termsGoverningText: "These Terms shall be governed by and construed in accordance with the laws of the Republic of Cameroon. Any dispute arising under or in connection with these Terms or your use of the website shall be subject to the exclusive jurisdiction of the courts of the Republic of Cameroon. By using this website, you submit to the jurisdiction of the Cameroonian courts and waive any objection to proceedings in such courts.",
      termsEnrollmentTitle: "Academy enrollment and payments",
      termsEnrollmentText: "Enrollment in NEXUS Academy programs is subject to cohort availability, eligibility criteria, and successful completion of the application process. Payment is collected via Mobile Money or other specified methods, and each confirmed enrollment receives a unique Registration ID. Refunds, cancellations, and deferrals are subject to NEXUS Academy's enrollment policies and must be requested formally. NEXUS reserves the right to modify program schedules, content, and pricing with reasonable notice to enrolled students.",
      termsResponsibilityTitle: "Your responsibilities",
      termsResponsibilityText: "You agree to provide accurate, complete, and up-to-date information in any form you submit on this website. You are responsible for maintaining the confidentiality of any account credentials and for all activities under your account. You agree to use the website in a lawful and respectful manner, and not to interfere with the security, functionality, or availability of the website or its users. Attempting to access restricted areas, disrupt services, or exploit vulnerabilities is strictly prohibited and may result in legal action.",
      termsChangesTitle: "Changes to These Terms",
      termsChangesText: "NEXUS reserves the right to update, modify, or replace these Terms at any time to reflect changes in our practices, services, or legal obligations. Updated Terms will be posted on this page with a revised effective date. We encourage you to review these Terms periodically. Your continued use of the website following any changes constitutes your acceptance of the updated Terms. If you do not agree with the revised Terms, you must stop using the website.",
      termsContactTitle: "Contact Us",
      termsContactText: "For questions, concerns, or notices regarding these Terms of Use, please contact: Email: nexustechnolgies7@gmail.com | WhatsApp: +237 653 137 081 | Phone: +237 678 661 281 | NEXUS Technologies, Bamenda, Cameroon.",
      privacyIntro: "How NEXUS collects, uses, stores, and protects your personal information, in accordance with Cameroon's cybersecurity, electronic communications, and personal data protection laws.",
      pCollectTitle: "Information you provide",
      pCollectText: "When you fill out a form on our site, we collect the details you submit: your full name, email address, phone number, organization or institution name (if applicable), pathway or role selected, and the content of your message or application. Academy enrollment forms may also collect educational background, professional experience, and program preference.",
      pAutoTitle: "Information collected automatically",
      pAutoText: "Like most websites, our servers automatically record certain technical information when you visit: browser type and version, operating system, device type, pages visited, time spent on each page, referring URLs, and IP address (used only to determine approximate geographic location for analytics and security purposes).",
      pUseTitle: "How we use your information",
      pUseText: "Your information is used to: (a) respond to your partnership inquiries, job applications, mentorship requests, or contact submissions; (b) process and manage Academy enrollments, including verification of Registration IDs; (c) send you relevant updates about NEXUS programs and events; (d) improve our website content, services, and user experience; (e) comply with applicable Cameroonian laws and regulations. We do not sell, rent, lease, or trade your personal information to third parties for marketing purposes.",
      pLegalTitle: "Legal basis for processing",
      pLegalText: "NEXUS processes personal data under the following legal bases: (1) Consent; when you submit a form, subscribe to our newsletter, or opt in to communications, you consent to being contacted by NEXUS for the stated purpose. You may withdraw consent at any time. (2) Contractual necessity; when processing enrollment or program registration data required to deliver our services. (3) Legal obligation; where Cameroonian law requires retention or disclosure (e.g., under Law No. 2010/012 on cybersecurity and cybercrime). (4) Legitimate interests; to respond to communications, maintain information system security, and improve our services, provided these interests do not override your rights and freedoms.",
      pEnrollTitle: "Academy enrollment and verification",
      pEnrollText: "Academy enrollment records include payment status, cohort assignment, and a unique Registration ID. Our public certificate verification page displays only non-sensitive details: the holder's name, program name, and issuance status. Payment confirmations are stored securely and are accessible only to authorized NEXUS personnel.",
      pSecurityTitle: "Data storage and security",
      pSecurityText: "Personal data submitted through our forms is stored on NEXUS's secure internal systems, accessible only to authorized team members. We implement technical and organizational security measures including encryption of data in transit, access controls, secure authentication, and periodic security reviews. As a technology organization operating under Cameroonian law, we are committed to upholding the data security standards required of electronic service providers. In the event of a data breach likely to affect your rights or interests, we will notify affected users and relevant authorities without undue delay.",
      pRetentionTitle: "Data retention",
      pRetentionText: "Contact and inquiry data is retained for up to 24 months from the date of submission, unless a longer retention period is required by law or an ongoing contractual relationship. Academy enrollment and verification records are retained for 5 years after program completion for certification audit purposes. After these periods, data is securely deleted or anonymized.",
      pSharingTitle: "Sharing your information",
      pSharingText: "NEXUS does not share your personal information with third parties except: (a) where required by Cameroonian law or competent regulatory authority; (b) with our division partners (e.g., NEXUS Tech Hub or Foundation) where relevant to a specific service or program you have engaged with; (c) with trusted service providers who support our operations under strict data processing agreements; (d) with your explicit consent. We never sell your personal data.",
      pRightsTitle: "Your rights",
      pRightsText: "In accordance with Cameroonian law and international data protection principles, you have the right to: (a) Access: request a copy of the personal data we hold about you. (b) Rectification: request correction of inaccurate or incomplete data. (c) Erasure: request deletion of your personal data, subject to legal retention requirements. (d) Withdraw consent: at any time where consent is the processing basis. (e) Object: to processing based on legitimate interests. (f) Portability: receive your data in a structured, commonly used format. To exercise any of these rights, contact us using the details below. We will respond within 30 days.",
      pThirdTitle: "Third-party links",
      pThirdText: "Our website contains links to external websites, including social media platforms, partner organizations, and payment processors. We are not responsible for the privacy practices or content of those third-party sites. We encourage you to review their privacy policies separately before providing any personal information.",
      pChildrenTitle: "Children's privacy",
      pChildrenText: "Our services are directed at persons aged 16 and over. We do not knowingly collect personal data from children under 16. If you believe a child under 16 has submitted personal data to us through any form or application, please contact us immediately so we can take appropriate action.",
      pChangesTitle: "Changes to this policy",
      pChangesText: "We may update this Privacy Policy from time to time to reflect changes in our practices, services, or legal obligations. Any updates will be published on this page with a revised effective date. For material changes, we will notify existing contacts by email or through a prominent notice on our website.",
      pContactTitle: "Contact us",
      pContactText: "For any privacy-related queries, data access requests, or complaints: Email: nexustechnolgies7@gmail.com | WhatsApp: +237 653 137 081 | Phone: +237 678 661 281 | NEXUS Technologies, Bamenda, Cameroon.",
    },
    notFoundPage: {
      title: "Page Not Found",
      subtitle: "The page you are looking for doesn't exist or has been moved.",
      backBtn: "Return to Homepage",
    },
    common: {
      backToHome: "Back to Home",
      submit: "Submit",
      loading: "Loading...",
      success: "Success!",
      error: "An error occurred.",
    },
  },
  fr: {
    nav: {
      home: "Accueil",
      about: "À propos",
      divisions: "Divisions",
      journey: "Parcours",
      blog: "Blog",
      joinUs: "Rejoignez-nous",
      contact: "Contact",
      partnerWithUs: "Devenir Partenaire",
      ourDivisions: "Nos Divisions",
      language: "FR",
      switchLanguage: "EN",
    },
    footer: {
      tagline: "NEXUS est la jeune entreprise technologique du Cameroun, quatre divisions, une mission. Fondée en 2026. Apprendre. Construire. Impacter.",
      contactTitle: "Contactez-nous",
      contactPhoneLabel: "Appel Direct",
      contactEmailLabel: "Email",
      contactWhatsappLabel: "WhatsApp",
      site: "Site",
      resources: "Ressources",
      legal: "Mentions Légales",
      privacyPolicy: "Politique de Confidentialité",
      termsOfUse: "Conditions d'Utilisation",
      contactUs: "Contactez-nous",
      faq: "Foire Aux Questions (FAQ)",
      verifyRegistration: "Vérifier une Inscription",
      locationTitle: "Localisation",
      locationText: "100% à distance, de Buea à Bamenda. Notre équipe travaille à travers les pôles technologiques camerounais.",
      governanceNote: "100% à distance · Cameroun. Régie par notre Constitution et Code de Conduite.",
      copyright: "Tous droits réservés.",
      builtWith: "Conçu avec intégrité au Cameroun.",
    },
    splash: {
      madeInCameroon: "Conçu au Cameroun",
      builtForTheWorld: "Construit pour le Monde",
      poweredByNexus: "Propulsé par NEXUS",
      initializing: "Initialisation de l'environnement sécurisé…",
    },
    divisions: {
      academy: {
        name: "NEXUS Academy",
        tagline: "Formation technologique pratique par cohortes.",
        desc: "Doter les jeunes Camerounais de compétences numériques adaptées au marché grâce à des cohortes intensives et pratiques.",
      },
      techHub: {
        name: "NEXUS Tech Hub",
        tagline: "Services, produits et projets clients.",
        desc: "Fournir des services de développement logiciel de pointe, d'infrastructure cloud et de conseil technique aux clients locaux et internationaux.",
      },
      foundation: {
        name: "NEXUS Foundation",
        tagline: "Impact communautaire et sensibilisation numérique.",
        desc: "Promouvoir la confiance numérique, lutter contre la fraude en ligne et réduire la fracture numérique au sein des communautés camerounaises.",
      },
      mentorship: {
        name: "NEXUS Mentorship",
        tagline: "Développement structuré du potentiel humain.",
        desc: "Connecter les talents émergents en tech avec des leaders expérimentés pour l'orientation de carrière et l'évolution professionnelle.",
      },
    },
    home: {
      badge: "100% à distance · Cameroun",
      heroTitle: "Bâtir la confiance numérique pour le",
      heroCountry: "Cameroun",
      heroSubtitle: "NEXUS donne aux prochains technologues camerounais les moyens d'apprendre concrètement, de créer des projets significatifs et de résoudre les problèmes qui comptent le plus.",
      partnerBtn: "Devenir Partenaire",
      joinBtn: "Rejoindre l'Équipe",
      explorePrograms: "Découvrir nos programmes",
      gapEyebrow: "Le constat",
      gapTitle: "Le fossé entre éducation et impact réel",
      gapDesc: "Les jeunes Camerounais sont talentueux et ambitieux, mais le pont entre ce qu'ils apprennent à l'école et ce que le monde réel exige existe à peine.",
      gapPoint1Title: "Théorie sans pratique",
      gapPoint1Text: "Les étudiants obtiennent leur diplôme mais manquent de compétences pratiques. Une formation concrète change la donne.",
      gapPoint2Title: "Potentiel inexploité",
      gapPoint2Text: "Le Cameroun dispose d'une population jeune, connectée et ambitieuse, mais trop peu de parcours structurés pour transformer le talent en impact réel.",
      gapPoint3Title: "Des problèmes qui attendent des solutions",
      gapPoint3Text: "Des entreprises locales aux services publics, des problèmes concrets persistent parce que ceux qui pourraient les résoudre n'ont pas les outils.",
      gapClosing: "NEXUS existe pour combler ce fossé, en apprenant des compétences concrètes, en construisant des solutions réelles et en créant un impact durable dans nos communautés.",
      ecosystemEyebrow: "Un seul écosystème",
      ecosystemTitle: "Quatre divisions, une seule mission",
      ecosystemDesc: "Chaque division de NEXUS résout une facette différente du même défi.",
      learnMore: "En savoir plus",
      whyEyebrow: "Pourquoi NEXUS",
      whyTitle: "Pourquoi NEXUS",
      whyDesc: "Nous avons bâti NEXUS pour être aussi rigoureux que ambitieux.",
      whyPoint1Title: "Pensé pour le travail à distance",
      whyPoint1Text: "Conçu pour fonctionner partout au Cameroun, et au-delà, afin que le talent et l'impact ne soient pas limités par la géographie.",
      whyPoint2Title: "Porté par la communauté",
      whyPoint2Text: "Nous croyons que la technologie doit servir ceux qui en ont le plus besoin. NEXUS canalise le talent technique vers la résolution de défis quotidiens, protéger les communautés en ligne, créer des opportunités et construire des outils qui comptent.",
      whyPoint3Title: "Apprendre en pratiquant",
      whyPoint3Text: "La croissance chez NEXUS n'est pas théorique. Chaque cohorte, chaque projet, chaque initiative communautaire est pratique, conçu pour enseigner, défier et développer de vraies compétences durables.",
      whyPoint4Title: "L'innovation au cœur",
      whyPoint4Text: "NEXUS encourage ses membres à aller au-delà de l'emploi, nous créons des produits, explorons de nouvelles idées et cultivons un esprit entrepreneurial qui transforme les problèmes locaux en solutions technologiques.",
      whyPoint5Title: "Connectés à travers le Cameroun",
      whyPoint5Text: "Notre équipe s'étend de Bamenda à Buea et au-delà, travaillant à distance avec un objectif commun. La distance ne nous divise pas ; elle prouve que la grande technologie peut venir de n'importe où.",
      peopleEyebrow: "L'équipe",
      peopleTitle: "Construit par une équipe qui s'en soucie",
      peopleDesc: "Une équipe croissante de jeunes ingénieurs, designers et bâtisseurs communautaires camerounais, unis par une mission : construire des technologies qui résolvent de vrais problèmes.",
      meetFounders: "Découvrir l'équipe",
      seeJourney: "Découvrir notre parcours",
      liveEyebrow: "En direct de NEXUS",
      liveTitle: "Ce qui se passe en ce moment",
      liveDesc: "Dernières mises à jour de notre aventure publique, étapes clés et annonces récentes.",
      journeyUpdate: "Mise à jour du parcours",
      openTimeline: "Voir la chronologie",
      fromBlog: "Extrait du blog",
      readPost: "Lire l'article",
      ctaTitle: "Prêt à bâtir la confiance numérique avec nous ?",
      ctaDesc: "Que vous souhaitiez apprendre avec nous, collaborer sur des projets, ou simplement faire partie d'une communauté tech en croissance, vous avez votre place.",
    },
    about: {
      eyebrow: "À propos de NEXUS",
      title: "À propos de NEXUS",
      subtitle: "Bâtir la prochaine génération de technologues camerounais.",
      description: "Donner aux jeunes Camerounais les moyens de transformer leurs connaissances en technologies qui comptent.",
      storyEyebrow: "Notre histoire",
      storyTitle: "Qui nous sommes et comment tout a commencé",
      storyP1: "NEXUS a été fondé par un groupe de jeunes ingénieurs camerounais de Bamenda et Buea qui ont constaté un décalage, des gens talentueux, une forte demande de technologie, mais très peu de passerelles structurées pour relier les deux.",
      storyP2: "Nous avons commencé par une question : et si les jeunes Camerounais avaient une communauté où ils pourraient apprendre des compétences pratiques, créer de vrais produits et travailler ensemble pour résoudre les problèmes qu'ils observent chaque jour, des défis des petites entreprises à la sécurité communautaire ?",
      storyP3: "Cette question est devenue NEXUS. Ce qui a commencé comme une idée partagée entre ingénieurs est rapidement devenu une entreprise à quatre divisions, former, construire, servir les clients, protéger les communautés et mentorer la prochaine génération.",
      storyP4: "Aujourd'hui, nous opérons entièrement à distance depuis Bamenda et Buea, en croissance constante, en résolvant de vrais problèmes et en prouvant que la technologie de niveau mondial peut venir d'ici, du Cameroun.",
      purposeEyebrow: "Notre raison d'être",
      purposeTitle: "Pourquoi nous existons et où nous allons",
      missionTitle: "Notre mission",
      missionText: "Combler le fossé entre potentiel et opportunité au Cameroun, en formant les talents, en construisant des technologies, en servant les entreprises et les communautés, et en créant un environnement structuré où les jeunes technologues s'épanouissent.",
      visionTitle: "Notre vision",
      visionText: "Un Cameroun où la technologie est construite localement pour résoudre des problèmes locaux, où les jeunes ingénieurs ont les compétences, les plateformes et le soutien pour créer des solutions qui servent les entreprises, les communautés et la nation.",
      directionTitle: "Où nous allons",
      directionText: "Nous construisons un avenir où NEXUS sera une entreprise technologique de référence au Cameroun, offrant des services de niveau mondial, formant la prochaine génération d'ingénieurs, collaborant avec le gouvernement et les institutions, et développant des solutions numériques qui font avancer le pays.",
      identityEyebrow: "À propos de NEXUS",
      identityTitle: "Qui nous sommes en un coup d'œil",
      identityDesc: "NEXUS est une entreprise technologique camerounaise à quatre divisions, formation, ingénierie, impact communautaire et mentorat, travaillant ensemble pour bâtir un meilleur avenir numérique pour le Cameroun.",
      fact1Label: "Fondée",
      fact1Value: "2026",
      fact2Label: "Siège",
      fact2Value: "À distance (Bamenda et Buea)",
      fact3Label: "Type",
      fact3Value: "Entreprise technologique",
      fact4Label: "Divisions",
      fact4Value: "4 divisions actives",
      fact5Label: "Devise",
      fact5Value: "Apprendre. Construire. Impacter.",
      whatWeDoEyebrow: "Ce que nous faisons",
      whatWeDoTitle: "La technologie qui sert le Cameroun",
      whatWeDoDesc: "NEXUS opère à travers quatre divisions, chacune résolvant un aspect du même défi : utiliser la technologie pour créer un impact réel.",
      wd1Title: "Former la prochaine génération",
      wd1Text: "Des programmes par cohortes qui équipent les jeunes Camerounais de compétences pratiques et immédiatement applicables en développement, cybersécurité, design et IA.",
      wd2Title: "Développer des logiciels et produits",
      wd2Text: "Des applications web aux plateformes mobiles, nous concevons et développons des solutions numériques pour les clients et les communautés.",
      wd3Title: "Servir les entreprises et organisations",
      wd3Text: "Nous collaborons avec des PME, startups, ONG et institutions pour fournir des services technologiques fiables, du conseil au développement complet.",
      wd4Title: "Collaborer avec le gouvernement",
      wd4Text: "Nous travaillons avec les institutions publiques pour développer des solutions numériques qui renforcent la gouvernance, améliorent les services et servent les citoyens.",
      wd5Title: "Protéger les communautés",
      wd5Text: "À travers des campagnes d'éducation publique, des ateliers de sécurité numérique et des initiatives de sensibilisation, nous aidons les Camerounais à naviguer dans le monde numérique en toute sécurité.",
      wd6Title: "Mentorer les futurs leaders",
      wd6Text: "Connecter les talents émergents avec des professionnels expérimentés pour un accompagnement de carrière structuré, le développement de compétences et le leadership.",
      valuesEyebrow: "Nos valeurs",
      valuesTitle: "Ce qui nous guide",
      valuesDesc: "Les principes qui façonnent notre façon d'apprendre, de construire et de travailler ensemble.",
      val1Name: "Intégrité",
      val1Text: "Nous faisons ce que nous disons, dans notre code, notre formation et la façon dont nous traitons les uns les autres.",
      val2Name: "Pragmatisme",
      val2Text: "Nous valorisons les compétences applicables aujourd'hui plutôt que la théorie que l'on pourrait utiliser un jour.",
      val3Name: "Communauté",
      val3Text: "Nous mesurons notre succès à l'impact que nous créons dans les communautés camerounaises, pas aux chiffres sur un écran.",
      val4Name: "Collaboration",
      val4Text: "Nous grandissons en travaillant ensemble, en partageant des idées, en résolvant des problèmes et en construisant en équipe.",
      val5Name: "Excellence",
      val5Text: "Le travail à distance ne signifie pas des standards plus bas. Nous visons un travail de niveau mondial.",
      govTitle: "Comment nous fonctionnons",
      govText: "NEXUS est bâti sur la structure et la responsabilité partagée. Notre équipe suit des processus clairs, communique ouvertement et se tient à des standards élevés, parce que bâtir la confiance signifie être responsable.",
      teamEyebrow: "Qui nous sommes",
      teamTitle: "L'équipe NEXUS",
      teamDesc: "Nous sommes un collectif de jeunes technologues camerounais à distance. De Bamenda à Buea, nos ingénieurs, designers et bâtisseurs communautaires travaillent ensemble pour combler le fossé entre éducation et impact réel.",
      role1Title: "Directeur Général",
      role1Text: "Pilote la stratégie, la formation et l'ingénierie de l'écosystème NEXUS, en veillant à ce que chaque initiative crée un impact réel.",
      role2Title: "Directeur des Opérations",
      role2Text: "Assure la gouvernance, la responsabilité et le bon fonctionnement de toutes les divisions, avec structure et objectif.",
      role3Title: "Ingénierie",
      role3Text: "Développe des logiciels, des infrastructures cloud et des solutions numériques, transformant les idées en produits fonctionnels.",
      role4Title: "Formation",
      role4Text: "Conçoit et dispense des programmes pratiques qui équipent les étudiants de compétences tech concrètes et immédiatement applicables.",
      role5Title: "Communauté",
      role5Text: "Gère la sensibilisation, le mentorat et les campagnes de sécurité numérique, connectant NEXUS aux personnes et communautés que nous servons.",
      ctaTitle: "Envie de prendre part à l'aventure ?",
      ctaDesc: "Que vous souhaitiez apprendre avec nous, collaborer sur des projets, ou simplement faire partie d'une communauté tech en croissance, vous avez votre place.",
    },
    divisionsPage: {
      eyebrow: "Nos Divisions",
      title: "Un écosystème, quatre piliers spécialisés.",
      description: "NEXUS opère à travers quatre divisions distinctes, chacune résolvant un défi clé de la confiance numérique et des compétences au Cameroun.",
      overviewEyebrow: "Aperçu des divisions",
      overviewTitle: "Explorez l'écosystème NEXUS",
      overviewDesc: "Sélectionnez une division ci-dessous pour découvrir sa mission, ses programmes et son équipe.",
      academyTagline: "Formation technologique pratique par cohortes.",
      academyDesc: "Cohortes axées sur l'ingénierie logicielle, la cybersécurité, le design produit et la sécurité numérique. Des projets réels plutôt que des cours théoriques.",
      techHubTagline: "Services, produits et projets clients.",
      techHubDesc: "Équipe d'ingénierie livrant des projets clients, des produits internes et du conseil technique. Les revenus générés financent nos programmes sociaux.",
      foundationTagline: "Impact communautaire et sensibilisation numérique.",
      foundationDesc: "Notre branche à but non lucratif luttant contre la désinformation, les fraudes Mobile Money, et animant des ateliers de sécurité numérique.",
      mentorshipTagline: "Développement structuré du potentiel humain.",
      mentorshipDesc: "Mise en relation des talents émergents avec des mentors expérimentés de l'industrie. Orientation 1-sur-1 et revue de projets.",
      exploreBtn: "Découvrir la division",
      heroScroll: "Faites défiler pour explorer",
      academyH1: "Parcours pratiques par cohortes",
      academyH2: "Projets réels prêts pour votre portfolio",
      academyH3: "Certificats vérifiables",
      techHubH1: "Logiciels sur mesure et projets clients",
      techHubH2: "Produits internes et expérimentations",
      techHubH3: "Conseil technique",
      foundationH1: "Programmes communautaires gratuits",
      foundationH2: "Campagnes de sécurité numérique",
      foundationH3: "Sensibilisation dans les écoles et zones rurales",
      mentorshipH1: "Accompagnement structuré 1-sur-1",
      mentorshipH2: "Revues de portfolio et de carrière",
      mentorshipH3: "Réseau de mentors de l'industrie",
      ecoEyebrow: "Un système connecté",
      ecoTitle: "Quatre divisions. Une boucle d'impact.",
      ecoDesc: "Les talents formés à l'Academy alimentent le Tech Hub, le Mentorship affine les deux, et la Foundation ramène l'impact aux communautés.",
      ecoHubLabel: "Noyau NEXUS",
      ecoAcademyFlow: "Forme les talents",
      ecoTechHubFlow: "Construit des produits",
      ecoFoundationFlow: "Protège les communautés",
      ecoMentorshipFlow: "Guide les carrières",
      finderEyebrow: "Trouvez votre voie",
      finderTitle: "Quelle division est faite pour vous ?",
      finderDesc: "Dites-nous où vous en êtes aujourd'hui et nous vous orienterons vers la division qu'il vous faut.",
      finderPickHint: "Sélectionnez un profil pour voir vos divisions recommandées",
      personaStudent: "Je suis étudiant",
      personaBusiness: "Je suis une entreprise",
      personaCommunity: "Je suis une communauté",
      personaProfessional: "Je suis un professionnel",
      finderRecStudent: "Commencez par une cohorte de l'Academy, puis évoluez avec le Mentorship pendant que vous construisez votre portfolio.",
      finderRecBusiness: "Le Tech Hub prend en charge votre projet de bout en bout , logiciel, sécurité et stratégie technique.",
      finderRecCommunity: "La Foundation anime gratuitement des programmes de littératie et de sécurité numérique pour les écoles et les communautés.",
      finderRecProfessional: "Le Mentorship vous met en relation avec des talents prometteurs , ou vous aide à grandir comme mentor.",
      statsEyebrow: "Impact à ce jour",
      statsTitle: "Les chiffres derrière la mission",
      statDivisionsLabel: "Divisions spécialisées",
      statProgramsLabel: "Programmes pratiques",
      statTrainedLabel: "Apprenants touchés",
      statCommunitiesLabel: "Communautés servies",
      journeyEyebrow: "Le parcours",
      journeyTitle: "Votre progression chez NEXUS",
      journeyDesc: "Un chemin clair du premier contact jusqu'à l'impact réel.",
      jStep1Title: "Découvrir",
      jStep1Text: "Explorez les divisions et trouvez celle qui correspond à votre objectif.",
      jStep2Title: "Rejoindre",
      jStep2Text: "Postulez à une cohorte, contactez notre équipe ou inscrivez-vous comme bénévole ou mentor.",
      jStep3Title: "Construire",
      jStep3Text: "Travaillez sur des projets réels avec un encadrement structuré et des retours réguliers.",
      jStep4Title: "Impacter",
      jStep4Text: "Livrez un travail qui compte , pour les clients, les carrières et les communautés.",
      systemEyebrow: "Fonctionnement intégré",
      systemTitle: "Un modèle synergique pour un impact maximal",
      systemDesc: "Les quatre divisions s'alimentent mutuellement pour créer un écosystème autonome et durable.",
      s1Title: "Se former à l'Academy",
      s1Text: "Les étudiants acquièrent de vraies compétences dans des cohortes pratiques.",
      s2Title: "Créer au Tech Hub",
      s2Text: "Les diplômés appliquent leurs compétences sur des produits clients réels.",
      s3Title: "Protéger avec Foundation & Mentorship",
      s3Text: "Les mentors guident les futurs leaders tandis que la Fondation protège le grand public.",
      ctaTitle: "Souhaitez-vous vous impliquer dans une division ?",
      ctaDesc: "Que vous vouliez apprendre, faire appel à nos services, être bénévole ou devenir mentor, vous êtes le bienvenu.",
    },
    academyPage: {
      eyebrow: "NEXUS Academy",
      title: "Formation technologique pratique pour la nouvelle génération camerounaise.",
      description: "Formations intensives par cohortes en ingénierie logicielle, cybersécurité et hygiène numérique, conçues pour former des bâtisseurs accomplis.",
      whatEyebrow: "Ce qui nous distingue",
      whatTitle: "Une formation axée sur des résultats réels",
      whatDesc: "Nous n'enseignons pas de la théorie pour des examens. Nous développons des compétences pour le marché de l'emploi.",
      f1Title: "Apprentissage par cohortes",
      f1Text: "Apprenez aux côtés de pairs motivés dans des cohortes structurées avec des mentors dédiés.",
      f2Title: "Projets réels de niveau professionnel",
      f2Text: "Développez des applications et des outils de sécurité prêts à être intégrés dans votre portfolio.",
      f3Title: "Vérification officielle",
      f3Text: "Chaque diplômé reçoit un identifiant de registre vérifiable en ligne par les employeurs et partenaires.",
      cohortEyebrow: "Prochaines cohortes",
      cohortTitle: "Rejoignez un programme de formation à venir",
      cohortDesc: "Les candidatures ouvriront bientôt pour nos prochaines cohortes intensives.",
      tableProgram: "Programme",
      tableCohort: "Cohorte",
      tableStatus: "Statut",
      cohort1Name: "Développement Logiciel",
      cohort1Label: "Cohorte 1",
      cohort1Status: "Ouvert",
      cohortNote: "De nouvelles cohortes s'ouvrent au fur et à mesure que les places se remplissent.",
      programGraphicDesign: "Design Graphique",
      programUiUxDesign: "Design UI/UX",
      programSoftwareDevelopment: "Développement Logiciel",
      programAiAutomation: "Automatisation IA",
      verifyBadge: "Outil Employeurs",
      verifyTitle: "Vérifier les certificats et inscriptions des étudiants",
      verifyText: "Utilisez notre outil public de vérification pour confirmer l'authenticité de n'importe quel certificat NEXUS Academy.",
      verifyBtn: "Ouvrir l'outil de vérification",
      ctaTitle: "Prêt à démarrer votre carrière dans la tech ?",
      ctaDesc: "Postulez pour notre prochaine cohorte ou rejoignez notre communauté pour être informé des ouvertures.",
    },
    techHubPage: {
      eyebrow: "NEXUS Tech Hub",
      title: "Services d'ingénierie et produits numériques conçus au Cameroun.",
      hugeEyebrow: "Ce qui anime le hub",
      hugeWord1: "Construire.",
      hugeWord2: "Livrer.",
      hugeWord3: "Grandir.",
      marqueeEyebrow: "Technologies et outils que nous maîtrisons",
      description: "Notre branche commerciale fournit du développement logiciel, des solutions cloud et du conseil technique aux entreprises locales et internationales.",
      servicesEyebrow: "Nos réalisations",
      servicesTitle: "Services d'ingénierie pour organisations ambitieuses",
servicesDesc: "Nous apportons les meilleurs standards logiciels modernes et une fine connaissance du contexte local.",
      s1Title: "Applications Web & Mobiles sur mesure",
      s1Text: "Applications web full-stack et applications mobiles multiplateformes développées avec React, Next.js et des architectures cloud modernes.",
      s2Title: "Design UI/UX",
      s2Text: "Design d'interfaces et d'expérience utilisateur pour des produits numériques alliant esthétique moderne et pertinence culturelle locale.",
      s3Title: "Conception Graphique",
      s3Text: "Création professionnelle d'identités de marque, de supports marketing et d'actifs numériques avec les outils Adobe Creative Cloud.",
      s4Title: "Automatisation IA",
      s4Text: "Implémentation de modèles d'apprentissage automatique et de systèmes automatisés avec TensorFlow, PyTorch et les frameworks IA développés par NEXUS.",
      approachEyebrow: "Notre approche",
      approachTitle: "Pourquoi collaborer avec NEXUS Tech Hub",
      approachDesc: "Nous combinons normes techniques internationales et excellence d'exécution locale.",
      a1Title: "Agilité 100% à distance",
      a1Text: "Une équipe distribuée travaillant de manière fluide avec une excellente communication.",
      a2Title: "Bénéfices réinvestis",
      a2Text: "Les revenus du Tech Hub financent directement nos campagnes gratuites de sensibilisation communautaire.",
      a3Title: "Talents qualifiés",
      a3Text: "Équipe composée des meilleurs diplômés de la NEXUS Academy sous la supervision de seniors expérimentés.",
      targetSmes: "PME",
      targetNgos: "ONG",
      targetFintechs: "Fintechs",
      targetEnterprise: "Entreprises & Institutions",
      targetMomoOperators: "Opérateurs MoMo",
      heroTag: "// division ingénierie , douala · 100% à distance",
      scrollCue: "Faites défiler pour explorer",
      statsEyebrow: "Chiffres clés",
      stat1Label: "Projets livrés",
      stat1Text:
        "Plateformes web, applications mobiles et systèmes cloud déployés en production.",
      stat2Label: "Fidélisation client",
      stat2Text:
        "Clients qui nous confient une nouvelle mission après leur premier projet.",
      stat3Label: "Semaines avant 1ère mise en ligne",
      stat3Text:
        "Délai moyen entre le lancement et la première mise en production sur un projet standard.",
      orderCta: "Commander ce service",
      clientsEyebrow: "Pour qui nous travaillons",
      clientsTitle: "Conçu pour les organisations qui ne peuvent pas se permettre d'interrompre leur activité",
      clientsDesc: "Quatre segments. Un seul standard de livraison.",
      clientSmesSub: "Transformation Numérique & Portails Sur Mesure",
      clientSmesDesc:
        "Nous concevons des plateformes opérationnelles sur mesure, des systèmes de gestion des stocks, des portails clients et des applications e-commerce pour automatiser vos processus et accompagner la croissance de votre entreprise.",
      clientSmesBackTitle: "Ce que nous livrons pour les PME",
      clientSmesBack:
        "Nous commençons par des ateliers de découverte pour cartographier vos flux de travail actuels et identifier les opportunités d'automatisation. Notre équipe conçoit ensuite des tableaux de bord opérationnels personnalisés, des interfaces de suivi des stocks et des portails clients qui s'intègrent parfaitement à vos systèmes existants. Chaque plateforme inclut des contrôles administratifs, des rapports en temps réel, une compatibilité mobile et un hébergement cloud avec sauvegardes automatiques. Après le lancement, nous fournissons un support technique et des améliorations fonctionnelles à mesure que votre entreprise se développe.",
      clientNgosSub: "Données de Terrain & Suivi des Bénéficiaires",
      clientNgosDesc:
        "Nous développons des applications mobiles fonctionnant hors-ligne, des tableaux de bord analytiques en temps réel et des outils de gestion des bénéficiaires garantissant la transparence auprès des bailleurs de fonds.",
      clientNgosBackTitle: "Ce que nous livrons pour les ONG",
      clientNgosBack:
        "Nous concevons des applications de collecte de données mobiles fonctionnant hors ligne dans des conditions de terrain difficiles, se synchronisant automatiquement dès le retour de la connexion. Vos gestionnaires de programmes obtiennent des tableaux de bord en temps réel montrant les métriques des bénéficiaires, la répartition géographique et les indicateurs d'impact conformes aux normes de reporting des bailleurs. Tous les systèmes incluent un contrôle d'accès basé sur les rôles, un stockage de données crypté, une journalisation d'audit et des outils d'exportation pour les rapports de conformité. Nous formons votre personnel au déploiement et fournissons une assistance technique continue.",
      clientFintechsSub: "Sécurité Bancaire & Portefeuilles Numériques",
      clientFintechsDesc:
        "Nous architecturons des plateformes de portefeuilles électroniques haute performance, des passerelles de paiement sécurisées et des API prêtes pour la conformité avec l'écosystème financier local.",
      clientFintechsBackTitle: "Ce que nous livrons pour les Fintechs",
      clientFintechsBack:
        "Nous architecturons des backends de portefeuilles numériques sécurisés avec prise en charge multi-devises, mise en file d'attente des transactions et mises à jour de solde en temps réel. Nos intégrations de passerelles de paiement gèrent le mobile money, le traitement par carte et les virements bancaires avec réconciliation automatique. Les fonctionnalités de sécurité incluent le chiffrement de bout en bout, des algorithmes de détection de fraude, des outils de conformité PCI-DSS et des tests de pénétration. Chaque endpoint API est documenté, versionné et optimisé pour des environnements à haute concurrence avec des garanties de disponibilité de 99,9%.",
      clientEnterpriseSub: "Infrastructure Évolutive & Systèmes Sur Mesure",
      clientEnterpriseDesc:
        "Nous concevons des plateformes d'entreprise robustes, des portails administratifs, des outils de gestion multi-sites et des infrastructures numériques sécurisées pour les institutions et grands comptes.",
      clientEnterpriseBackTitle: "Ce que nous livrons pour les Entreprises",
      clientEnterpriseBack:
        "Nous construisons des plateformes d'infrastructure évolutives conçues pour les opérations multi-sites, gérant la gestion des employés, le suivi des actifs, les flux de travail d'approvisionnement et les rapports financiers à partir d'un tableau de bord unifié. Nos systèmes d'entreprise incluent l'intégration SSO, la gestion granulaire des permissions, des pistes d'audit complètes et une connectivité API pour les outils tiers. Nous déployons sur une infrastructure cloud sécurisée avec sauvegardes automatisées, protocoles de reprise après sinistre et canaux de support technique dédiés pour votre équipe IT.",
      clientMomoSub: "Infrastructure Haute Disponibilité & Outils API",
      clientMomoDesc:
        "Nous fournissons des passerelles API ultra-résistantes, des portails de gestion du réseau d'agents, du suivi de liquidités et des moteurs de réconciliation automatique pour une disponibilité maximale.",
      clientsCta: "Parler de votre secteur",
      terminalOut1: "✓ besoins enregistrés",
      terminalOut2: "✓ équipe constituée , ingénieurs alignés sur votre stack",
      terminalOut3: "→ étape suivante : parlez-nous de votre projet",
      terminalFootnote: "// délai de réponse moyen : moins de 24 heures",
      ctaPrimaryBtn: "Démarrer votre projet",
      ctaTitle: "Vous avez un projet en tête ?",
      ctaDesc: "Discutons de la manière dont NEXUS Tech Hub peut concrétiser vos idées technologiques.",
      introEyebrow: "Notre Mode Opératoire",
      introTitle: "Des services d'ingénierie conçus pour les entreprises modernes",
      introDesc: "NEXUS Tech Hub est la branche commerciale de NEXUS, fournissant des services professionnels de développement logiciel, de solutions cloud et de conseil technique aux organisations au Cameroun et à l'international. Nous combinons normes techniques internationales et expertise locale.",
      introPoint1Title: "Agile & Transparent",
      introPoint1Text: "Démonstrations hebdomadaires, documentation claire et communication directe tout au long du cycle de vie du projet.",
      introPoint2Title: "Axé sur la Qualité",
      introPoint2Text: "Chaque projet intègre des tests automatisés, des revues de code et les meilleures pratiques de sécurité.",
      introPoint3Title: "Adossé à l'Academy",
      introPoint3Text: "Nos ingénieurs sont les meilleurs diplômés de la NEXUS Academy, formés aux frameworks modernes.",
      introHoursTitle: "Heures d'Activité",
      introHoursText: "Nous opérons sur le fuseau horaire de l'Afrique de l'Ouest (WAT) avec des horaires flexibles pour les clients internationaux.",
      introHoursTime: "Lun–Ven, 8h00 – 18h00 WAT",
      introResponseTitle: "Réponse Rapide",
      introResponseText: "Les demandes initiales reçoivent une réponse détaillée sous 24 heures les jours ouvrés.",
      introResponseTime: "< 24 heures en moyenne",
      introRemoteTitle: "Équipe 100% à Distance",
      introRemoteText: "Distribués à Douala et au-delà, nous collaborons de manière fluide via des outils modernes de gestion de projet.",
      processEyebrow: "Notre Processus",
      processTitle: "Comment nous livrons des logiciels de qualité",
      processDesc: "Une approche structurée qui s'adapte aux besoins et au calendrier de votre projet",
      process1Title: "Découverte & Planification",
      process1Desc: "Nous commençons par comprendre vos objectifs commerciaux, vos exigences techniques et vos contraintes à travers des ateliers collaboratifs.",
      process1Del1: "Feuille de route",
      process1Del2: "Architecture technique",
      process1Del3: "Estimation des coûts",
      process2Title: "Conception & Prototypage",
      process2Desc: "Nos designers créent des interfaces intuitives et des prototypes interactifs, en itérant selon vos retours pour garantir un produit conforme à votre vision.",
      process2Del1: "Système de design",
      process2Del2: "Prototype cliquable",
      process2Del3: "Flux utilisateurs",
      process3Title: "Développement",
      process3Desc: "En utilisant la méthodologie agile, nous construisons votre logiciel par sprints avec des démos hebdomadaires, garantissant une transparence totale.",
      process3Del1: "Logiciel fonctionnel",
      process3Del2: "Code source",
      process3Del3: "Rapports hebdomadaires",
      process4Title: "Assurance Qualité",
      process4Desc: "Tests complets incluant des suites de tests automatisés, des analyses de sécurité et l'optimisation des performances avant le déploiement.",
      process4Del1: "Rapports de tests",
      process4Del2: "Correctifs",
      process4Del3: "Audit de performance",
      process5Title: "Déploiement & Formation",
      process5Desc: "Nous gérons le déploiement en production, configurons l'infrastructure d'hébergement, formons votre équipe et fournissons une documentation complète.",
      process5Del1: "Application en ligne",
      process5Del2: "Guides utilisateurs",
      process5Del3: "Formation équipe",
      process6Title: "Support Après Lancement",
      process6Desc: "Maintenance continue, corrections de bugs, améliorations fonctionnelles et assistance technique pour maintenir des performances optimales.",
      process6Del1: "Canal de support",
      process6Del2: "Mises à jour & patchs",
      process6Del3: "Suivi des performances",
      whyEyebrow: "Pourquoi Choisir NEXUS",
      whyTitle: "Différents dès le premier jour",
      whyDesc: "Nous sommes jeunes, mais notre approche repose sur des pratiques éprouvées et un engagement sincère envers la qualité",
      why1Title: "Ingénieurs Formés à l'Academy",
      why1Desc: "Notre équipe est composée des meilleurs diplômés de la NEXUS Academy, maîtrisant les frameworks modernes et les meilleures pratiques.",
      why2Title: "Impact Social Direct",
      why2Desc: "Les revenus du Tech Hub financent directement les programmes gratuits de la Fondation, créant un impact positif au-delà du code.",
      why3Title: "Sans Bureaucratie",
      why3Desc: "En tant que startup agile, nous avançons vite, communiquons directement et nous concentrons sur l'essentiel : livrer des logiciels fonctionnels.",
      why4Title: "Processus Transparent",
      why4Desc: "Nous croyons en une communication claire, des délais honnêtes et aucun coût caché. Ce que vous voyez est ce que vous obtenez.",
      why5Title: "Alignés sur Votre Croissance",
      why5Desc: "Nous comprenons les contraintes des startups car nous en sommes une. Nos prix et notre flexibilité reflètent cette réalité.",
      why6Title: "Conçu au Cameroun, Prêt pour le Monde",
      why6Desc: "Nous comprenons les défis locaux et les contraintes d'infrastructure tout en maintenant des standards techniques internationaux.",
      whyCta: "En savoir plus",
      why1Alt: "Jeunes techniciens africains apprenant à coder",
      why2Alt: "Collaboration d'équipe et impact social",
      why3Alt: "Espace de développement logiciel moderne",
      why4Alt: "Vision et stratégie tournées vers l'avenir",
      why5Alt: "Graphique de croissance et métriques d'entreprise",
      why6Alt: "Réseau mondial enraciné au Cameroun",
      projectsEyebrow: "Réalisations",
      projectsTitle: "Exemples de projets illustrant nos compétences",
      projectsDesc: "Outils internes et projets d'expérimentation conçus par notre équipe pour démontrer notre savoir-faire technique",
      projectsAutoPlay: "Défilement automatique toutes les 7 secondes",
      projectTrendoraCategory: "Plateforme E-Commerce",
      projectTrendoraTitle: "Trendora",
      projectTrendoraDesc: "Un écosystème de vente en ligne complet avec support multi-vendeurs, gestion des stocks en temps réel, traitement sécurisé des paiements et design adaptatif.",
      projectTrendoraFeature1: "Marketplace multi-vendeurs",
      projectTrendoraFeature2: "Intégration paiements",
      projectTrendoraFeature3: "Stocks en temps réel",
      projectTrendoraFeature4: "Tableau de bord admin",
      projectVIPCategory: "Gestion d'Élevage",
      projectVIPTitle: "VIP Farm",
      projectVIPDesc: "Un système complet de gestion d'élevage avicole pour fermes commerciales, incluant le suivi du cheptel, la gestion de l'alimentation, le suivi sanitaire et l'analyse de production.",
      projectVIPFeature1: "Suivi du cheptel",
      projectVIPFeature2: "Suivi sanitaire",
      projectVIPFeature3: "Gestion alimentation",
      projectVIPFeature4: "Analyses de production",
      projectAcademyCategory: "Portail Académique",
      projectAcademyTitle: "Portail NEXUS Academy",
      projectAcademyDesc: "Système interne d'inscription et de gestion des cours utilisé par NEXUS Academy, incluant le suivi des inscriptions, la génération de certificats et la vérification des étudiants.",
      projectAcademyFeature1: "Inscription aux cours",
      projectAcademyFeature2: "Génération de certificats",
      projectAcademyFeature3: "Suivi des paiements",
      projectAcademyFeature4: "Vérification des étudiants",
      projectFoundationCategory: "Gestion de Campagnes",
      projectFoundationTitle: "Suivi de Campagnes Fondation",
      projectFoundationDesc: "Outil de gestion conçu pour la NEXUS Foundation pour suivre les initiatives de sensibilisation aux arnaques MoMo, mesurer la portée communautaire et générer des rapports d'impact.",
      projectFoundationFeature1: "Suivi de campagne",
      projectFoundationFeature2: "Analyses de portée",
      projectFoundationFeature3: "Distribution de contenus",
      projectFoundationFeature4: "Rapports d'impact",
      projectMentorshipCategory: "Plateforme de Jumelage",
      projectMentorshipTitle: "Système de Jumelage Mentorat",
      projectMentorshipDesc: "Plateforme interne pour jumeler les diplômés de la NEXUS Academy avec des mentors du secteur, avec algorithme de correspondance, planification de sessions et suivi de progression.",
      projectMentorshipFeature1: "Jumelage intelligent",
      projectMentorshipFeature2: "Planification des sessions",
      projectMentorshipFeature3: "Suivi de progression",
      projectMentorshipFeature4: "Espace de communication",
      engagementEyebrow: "Engagement Flexible",
      engagementTitle: "Travaillons ensemble selon vos modalités",
      engagementDesc: "Chaque projet est unique. Nous adaptons notre modèle d'engagement à votre périmètre, votre budget et votre calendrier.",
      engagementCta: "Obtenir un devis personnalisé",
      engagementFooterBold: "Tarification transparente :",
      engagementFooterText: "Nous fournissons des devis détaillés après avoir compris vos besoins. Aucun frais caché, aucune surprise.",
      engagement1Title: "Projet à Périmètre Fixe",
      engagement1Desc: "Idéal lorsque les besoins sont clairs et le périmètre bien défini. Devis fixe fourni après la phase de découverte, garantissant des coûts et un calendrier prévisibles.",
      engagement1Best1: "Lancements de MVP",
      engagement1Best2: "Refontes de sites web",
      engagement1Best3: "Développements de fonctionnalités",
      engagement1Pricing: "Basé sur la complexité du projet et le calendrier. Devis fixe fourni après la phase de découverte avec jalons clairs.",
      engagement2Title: "Équipe Dédiée",
      engagement2Desc: "Pour le développement continu de produits ou lorsque vous avez besoin d'une équipe d'ingénieurs dédiée pour évoluer rapidement.",
      engagement2Best1: "Partenariats long terme",
      engagement2Best2: "Produits en évolution",
      engagement2Best3: "Passage à l'échelle",
      engagement2Pricing: "Forfait mensuel basé sur la taille de l'équipe. Ajustement flexible avec préavis de 30 jours. Coûts mensuels prévisibles.",
      engagement3Title: "Temps & Matériaux",
      engagement3Desc: "Payez uniquement pour le temps réellement passé. Parfait pour les projets exploratoires, le conseil technique ou les périmètres évolutifs.",
      engagement3Best1: "Audits techniques",
      engagement3Best2: "Preuves de concept",
      engagement3Best3: "Ajouts progressifs",
      engagement3Pricing: "Tarifs horaires ou journaliers selon l'expertise. Suivi détaillé du temps fourni chaque semaine. Sans engagement long terme.",
      faqEyebrow: "FAQ",
      faqTitle: "Questions fréquentes sur notre collaboration",
      faqFooter: "Vous avez d'autres questions ?",
      faqFooterLink: "Contactez-nous directement",
      faq1Q: "Combien de temps prend un projet type ?",
      faq1A: "Les délais varient selon le périmètre et la complexité. Un MVP simple peut être lancé en 2-3 semaines, tandis qu'une plateforme d'entreprise peut prendre plusieurs mois. Nous fournissons des délais réalistes après la phase de découverte.",
      faq2Q: "Travailliez-vous avec des clients internationaux ?",
      faq2A: "Oui, nous travaillons à distance avec des clients sur différents fuseaux horaires. Notre équipe est expérimentée dans la communication synchrone et asynchrone via des outils modernes de gestion de projet.",
      faq3Q: "Que se passe-t-il après le lancement du projet ?",
      faq3A: "Nous proposons des formules de support après lancement incluant la correction de bugs, la surveillance des performances, les mises à jour de sécurité et les améliorations. Nous pouvons également former votre équipe interne.",
      faq4Q: "Pouvez-vous vous intégrer à nos systèmes existants ?",
      faq4A: "Oui, nous avons de l'expérience dans l'intégration avec des API tierces, des bases de données existantes et des logiciels d'entreprise. La faisabilité d'intégration est évaluée lors de la phase de découverte.",
      faq5Q: "Avec quelles technologies travaillez-vous ?",
      faq5A: "Nous travaillons avec des technologies modernes et éprouvées comme React, Next.js, Node.js, Python, React Native, PostgreSQL, MongoDB et AWS. Notre stack est choisie selon les besoins de votre projet.",
      faq6Q: "Assurez-vous la maintenance après le lancement ?",
      faq6A: "Oui, nous proposons des contrats de maintenance continue avec des modalités flexibles (forfaits mensuels ou interventions à la demande) incluant correctifs, optimisation et support technique.",
      faq7Q: "Que se passe-t-il si nos besoins changent en cours de projet ?",
      faq7A: "Nous utilisons la méthodologie agile qui s'adapte à l'évolution des besoins. Les changements de périmètre sont documentés et nous discutons de manière transparente de l'impact sur le calendrier et le budget.",
      faq8Q: "Pouvons-nous embaucher des ingénieurs NEXUS à temps plein ?",
      faq8A: "Bien que notre modèle principal soit l'engagement par projet, nous pouvons discuter d'équipes dédiées. Nous pouvons également vous orienter vers des diplômés de la NEXUS Academy recherchant un poste permanent.",
    },
    foundationPage: {
       description: "Le bras d'impact de NEXUS, qui aspire à créer des solutions durables pour de vrais problèmes camerounais et à ouvrir la voie du numérique à chaque jeune.",
       heroEyebrow: "NEXUS Foundation · Apprendre. Construire. Impacter.",
       heroTitle: "Faciliter la vie de tous.",
       heroSubtitle: "Le bras d'impact de NEXUS, qui aspire à créer des solutions durables pour de vrais problèmes camerounais et à ouvrir la voie du numérique à chaque jeune.",
       heroCtaPrimary: "Soutenir l'action",
       heroCtaSecondary: "Devenir partenaire",
       learnLabel: "Apprendre.",
       buildLabel: "Construire.",
       impactLabel: "Impacter.",
       whoEyebrow: "Qui sommes-nous",
       whoTitle: "Le bras d'impact de NEXUS.",
       whoText1: "NEXUS Foundation relie les capacités de l'organisation en matière d'apprentissage, de technologie et de mentorat aux besoins quotidiens des communautés camerounaises. Nous travaillons à des initiatives concrètes qui renforcent la confiance numérique, élargissent les opportunités pour les jeunes et rendent la technologie plus utile dans la vie de chacun.",
       whoText2: "Nous construisons avec soin et responsabilité. Nos ambitions définissent la direction; les progrès se gagneront par l'écoute, des partenariats responsables et un travail qui apporte une valeur réelle.",
      learnText: "Le savoir partagé avec ceux qui en ont le plus besoin",
      buildText: "Des solutions façonnées avec les communautés, pas seulement pour elles",
      impactText: "Un changement réel mesuré dans la vie de tous les jours",
      drivesEyebrow: "Ce qui nous anime",
      drivesTitle: "Trois engagements guident tout ce que nous faisons",
      drivesDesc: "Assez larges pour grandir avec nous. Assez clairs pour nous tenir responsables.",
      d1Num: "01",
      d1Title: "Autonomisation Numérique",
      d1Text: "Œuvrer pour un Cameroun où chaque communauté participe à l'économie numérique , avec accès, compétences et confiance.",
      d2Num: "02",
      d2Title: "Opportunités pour la Jeunesse",
      d2Text: "Ouvrir des portes vers les carrières technologiques pour les jeunes Camerounais , exposition, orientation et parcours réels.",
      d3Num: "03",
      d3Title: "Essor des Communautés",
      d3Text: "Utiliser la technologie pour renforcer le quotidien de nos communautés , pratiquement, durablement, ensemble.",
      ambitionsEyebrow: "Nos ambitions",
      ambitionsTitle: "Notre cap",
      ambitionsDesc: "Ce sont des objectifs, pas des réalisations , l'horizon vers lequel nous construisons, énoncé ouvertement pour que vous puissiez nous le rappeler.",
      horizonNear: "Court terme",
      horizonMid: "Moyen terme",
      horizonLong: "Long terme",
      a1Title: "Des solutions dignes d'être soumises",
      a1Text: "Développer des solutions durables et locales assez mûres pour être soumises au gouvernement , des réponses approuvées aux vrais problèmes camerounais.",
      a2Title: "Une Silicon Valley dans chaque région",
      a2Text: "Porter des écosystèmes tech locaux dans toutes les régions du Cameroun, pour que l'opportunité ne dépende jamais de la géographie.",
      a3Title: "Reconnaissance complète",
      a3Text: "Devenir une organisation pleinement enregistrée, reconnue par l'État et les organismes internationaux auprès desquels nous souhaitons servir.",
      a4Title: "La référence pour la jeunesse",
      a4Text: "Devenir l'une des organisations les plus fiables du Cameroun en matière d'essor des jeunes.",
      a5Title: "Sécuriser le cyberespace",
      a5Text: "Nous aventurer dans des initiatives qui protègent et sécurisent les espaces numériques dont les Camerounais dépendent chaque jour.",
       valueBandText: "Faciliter la vie de tous.",
       supportEyebrow: "Soutenir l'action",
       supportTitle: "Le progrès a besoin de personnes engagées.",
       supportDesc: "Temps, expertise, réseau ou soutien institutionnel: il existe une manière concrète de contribuer à cette action dès le départ.",
       supportTrustNote: "Nous sommes au début du parcours. Nous invitons chacun à nous soutenir avec une vision claire de ce que nous construisons et l'engagement de mériter cette confiance par un travail concret.",
       supportVolunteerTitle: "Donnez de votre temps",
       supportVolunteerText: "Participez à des actions de proximité et aidez à créer des expériences d'apprentissage accessibles.",
       supportVolunteerCta: "S'impliquer",
       supportSkillsTitle: "Partagez votre expertise",
       supportSkillsText: "Apportez vos connaissances, animez une session ou aidez à renforcer une initiative.",
       supportSkillsCta: "Parler à l'équipe",
       supportUpdatesTitle: "Suivre le parcours",
       supportUpdatesText: "Recevez des nouvelles claires sur le travail, les apprentissages et les prochaines possibilités de contribuer.",
       supportUpdatesCta: "S'abonner aux actualités",
       supportPartnerTitle: "Créer un impact ensemble",
       supportPartnerText: "Soutenez ou co-réalisez des initiatives répondant à de vrais besoins communautaires.",
       supportPartnerCta: "Découvrir le partenariat",
       newsEyebrow: "Restez proches de l'histoire",
      newsTitle: "Suivez le voyage dès le premier jour",
      newsDesc: "Nous construisons cela en toute transparence. Abonnez-vous pour des mises à jour honnêtes sur ce que nous lançons, ce que nous apprenons et où nous avons besoin d'aide.",
      newsPlaceholder: "Votre adresse e-mail",
      newsButton: "S'abonner",
      newsSuccess: "Bienvenue à bord , vous faites maintenant partie de l'histoire.",
      newsErrorInvalid: "Cette adresse e-mail semble incorrecte. Veuillez vérifier et réessayer.",
      ctaTitle: "Faites partie de l'histoire dès le premier jour",
      ctaDesc: "Que vous vouliez collaborer, offrir vos compétences ou simplement suivre notre chemin , il y a une place pour vous ici.",
    },
    mentorshipPage: {
      eyebrow: "NEXUS Mentorship",
      title: "Guider la nouvelle génération de leaders technologiques.",
      description: "Mettre en relation les talents émergents de la tech avec des mentors expérimentés pour un accompagnement individuel structuré et une évolution de carrière.",
      // Programmes & Services
      programmesEyebrow: "Ce que vous obtenez",
      programmesTitle: "Programmes structurés pour une croissance réelle",
      programmesDesc: "Quatre axes ciblés conçus pour vous emmener de là où vous êtes à là où vous voulez être , avec l'orientation de personnes qui l'ont vécu.",
      prog1Title: "Mentorat jeunesse en technologie",
      prog1Text: "Mentorat structuré connectant les jeunes avec des professionnels expérimentés en technologie au Cameroun et au-delà. Sessions régulières, définition d'objectifs et suivi de progression.",
      prog2Title: "Pont Académie-Industrie",
      prog2Text: "Connecter les diplômés avec des voies professionnelles grâce à des introductions d'employeurs, des visites industrielles, des revues de portfolio et un soutien au placement en collaboration avec NEXUS Academy.",
      prog3Title: "Sessions de conseils de carrière",
      prog3Text: "Orientation individuelle en carrière couvrant la rédaction de CV, l'optimisation LinkedIn, la préparation aux entretiens et la positionnement professionnel dans le secteur technologique.",
      prog4Title: "Développement du leadership",
      prog4Text: "Initiatives conçues pour bâtir la prochaine génération de leaders technologiques , en se concentrant sur la communication, la prise de décision, la gestion d'équipe et la pensée stratégique.",
      // How it works
      howEyebrow: "Structure du programme",
      howTitle: "Un mentorat basé sur l'engagement réciproque",
      howDesc: "Nous associons mentors et mentorés pour des cycles de mentorat structurés de 6 mois.",
      h1Title: "Accompagnement Individuel (1-sur-1)",
      h1Text: "Sessions bimensuelles axées sur la planification de carrière, le renforcement technique et le leadership.",
      h2Title: "Revue de Portfolio & de Code",
      h2Text: "Conseils directs sur les projets, la rédaction de CV et la préparation aux entretiens par des experts du secteur.",
      h3Title: "Parcours vers le Leadership",
      h3Text: "Les mentorés sont préparés à devenir mentors à leur tour, créant ainsi un cercle vertueux durable.",
      // Who we serve
      whoServeEyebrow: "Pour qui c'est",
      whoServeTitle: "Conçu pour les personnes qui construisent l'avenir technologique du Cameroun",
      whoServeDesc: "Que vous soyez en train de commencer ou prêt à passer au niveau supérieur, il y a une place pour vous dans NEXUS Mentorship.",
      whoServe1Title: "Étudiants & Récents Diplômés",
      whoServe1Text: "Étudiants de dernière année à l'université et au collège, ou diplômés des deux dernières années, qui sont prêts à passer de la théorie à la pratique. Que vous soyez en ingénierie logicielle, cybersécurité ou tech en général , c'est votre lancement. Nous vous aidons à construire un portfolio qui se distingue, à vous préparer pour les entretiens dans les meilleures entreprises et à faire les connexions qui ouvrent des portes.",
      whoServe2Title: "Professionnels de Début de Carrière",
      whoServe2Text: "Vous travaillez déjà dans le tech mais vous sentez coincé ? Que ce soit 1 an ou 5 ans, notre mentorat vous aide à monter d'un cran , affinez vos compétences techniques, construisez votre présence professionnelle et développez les qualités de leadership qui distinguent les ingénieurs seniors. Arrêtez de deviner, commencez à grandir avec l'orientation de personnes qui ont déjà parcouru votre chemin.",
      whoServe3Title: "Éducateurs & Enseignants Tech",
      whoServe3Text: "Enseignants, professeurs et instructeurs tech à la recherche de combler le fossé entre ce qu'ils enseignent et ce que l'industrie a réellement besoin. Que vous prépariez des étudiants pour le marché du travail ou que vous cherchiez à monter vos propres compétences, notre mentorat vous connecte à des praticiens qui peuvent amener un contexte du monde réel à votre enseignement et votre carrière.",
      whoServe4Title: "Jeunes Professionnels Tech",
      whoServe4Text: "Jeunes professionnels au début de votre carrière technologique qui veulent plus qu'un simple emploi. Si vous êtes ambitieux, affamé de croissance et prêt à investir en vous-même , nous vous jumelerons avec des mentors qui ont été là où vous êtes et peuvent vous aider à naviguer les prochaines étapes avec clarté et confiance.",
      // Introduction
      introEyebrow: "Ce que nous faisons",
      introTitle: "Bridging Education and Industry",
      introText: "À travers des programmes structurés, un accompagnement individuel et des partenariats institutionnels, NEXUS Mentorship comble le fossé entre l'éducation et l'industrie au Cameroun.",
      bullet1: "Mentorat jeunesse structuré en technologie et entrepreneurship",
      bullet2: "Programmes de pont entre l'académie et l'industrie",
      bullet3: "Sessions de conseils de carrière et soutien individuel au développement professionnel",
      // Benefits / Outcomes
      benefitsEyebrow: "Ce que vous gagnerez",
      benefitsTitle: "Des résultats réels qui comptent",
      benefit1Title: "Accélération de Carrière",
      benefit1Text: "Voies claires, guidance experte et progression mesurable vers vos objectifs de carrière.",
      benefit2Title: "Construction de Réseau",
      benefit2Text: "Connexions avec des leaders d'industrie, pairs et opportunités dans l'écosystème technologique camerounais.",
      benefit3Title: "Développement de Compétences",
      benefit3Text: "Expertise pratique en compétences techniques et douces qui se traduisent directement par le succès au travail.",
      // For Mentees / For Mentors
      whoEyebrow: "Deux voies",
      whoTitle: "Que vous grandissiez ou redonniez",
      whoDesc: "Deux voies. Une mission. Trouvez où vous appartenez.",
      w1Title: "Pour les Mentorés",
      w1Text: "Diplômés d'Academy, développeurs juniors et passionnés de tech recherchant une orientation professionnelle claire.",
      w2Title: "Pour les Mentors",
      w2Text: "Ingénieurs seniors, managers produit et leaders tech désireux de faire grandir les talents camerounais.",
      ctaEyebrow: "Commencer Maintenant",
      ctaTitle: "Prêt à transmettre votre savoir ou à progresser ?",
      ctaDesc: "Postulez pour devenir mentor ou mentoré lors de notre prochain cycle de recrutement.",
      // Cycle Timeline
      cycleEyebrow: "Le Voyage",
      cycleTitle: "Un cycle structuré de 6 mois de croissance",
      cycleDesc: "Chaque cycle de mentorat suit un cadre éprouvé avec des jalons clairs et des résultats réels.",
      cycle1Title: "Onboarding et Mise en correspondance",
      cycle1Text: "Évaluation de profil, mise en correspondance selon les objectifs et l'expertise, définition des attentes.",
      cycle2Title: "Fondations et Développement des Compétences",
      cycle2Text: "Analyse des lacunes techniques, planification de portfolio, optimisation du CV et LinkedIn.",
      cycle3Title: "Leadership et Application dans le Monde Réel",
      cycle3Text: "Développement des compétences douces, communication, prise de décision, dynamique d'équipe.",
      cycle4Title: "Projets de Capstone",
      cycle4Text: "Les mentorés exécutent un projet de capstone démontrant leur croissance et compétences pratiques.",
      cycle5Title: "Transition et Réseau Alumni",
      cycle5Text: "Revues finales, planification des prochaines étapes, et accès à vie au réseau alumni NEXUS.",
      cycle6Title: "En cours: Communauté à Vie",
      cycle6Text: "Les diplômés deviennent des mentors pour les cycles futurs, créant un cycle auto-soutenant de leadership.",
      // Explore NEXUS
      exploreNexusEyebrow: "Explorez NEXUS",
      exploreNexusTitle: "Découvrez nos autres divisions",
      exploreNexusDesc: "NEXUS Mentorship fait partie d'un écosystème plus large. Explorez nos autres divisions pour voir le tableau complet.",
    },
    contactPage: {
      eyebrow: "Contactez-nous",
      title: "Construisons ensemble.",
      description: "Une question, une proposition de partenariat ou envie de vous engager ? Contactez l'équipe NEXUS.",
      getInTouchEyebrow: "Prenez contact",
      getInTouchTitle: "Nous serions ravis de vous lire",
      getInTouchDesc: "Envoyez-nous un message et notre équipe vous répondra sous 24 à 48 heures.",
      directTitle: "Coordonnées Directes",
      formTitle: "Envoyez-nous un Message",
      nameLabel: "Votre Nom",
      namePlaceholder: "ex. Marie Ngu",
      emailLabel: "Adresse Email",
      emailPlaceholder: "marie@example.cm",
      divisionLabel: "Sujet / Division",
      selectDivision: "Sélectionnez un sujet...",
      generalInquiry: "Demande Générale",
      messageLabel: "Votre Message",
      messagePlaceholder: "Comment pouvons-nous vous aider ?",
      sendBtn: "Envoyer le Message",
      sentSuccess: "Merci ! Votre message a été envoyé avec succès.",
      whatsapp: "WhatsApp",
      email: "Email",
      phone: "Téléphone",
      chatOnWhatsApp: "Discuter sur WhatsApp",
    },
    journeyPage: {
      eyebrow: "Parcours NEXUS",
      title: "Construire NEXUS, une étape à la fois.",
      description: "Nous croyons en la transparence. Suivez notre progression au fur et à mesure que nous développons NEXUS au Cameroun.",
      heroCtaPrimary: "Suivre Notre Parcours",
      heroCtaSecondary: "Devenir Partenaire",
      stat1Label: "Programmes Disponibles",
      stat2Label: "Divisions",
      stat3Label: "Langues Supportées",
      stat4Label: "Assistant IA",
      filterAll: "Tout",
      filterCompany: "Entreprise",
      filterAcademy: "Académie",
      filterTechHub: "Tech Hub",
      filterFoundation: "Fondation",
      galleryTitle: "Nos Réalisations",
      galleryDesc: "Une vitrine visuelle de ce que nous avons construit et de l'impact que nous créons.",
      newsletterEyebrow: "Restez Informé",
      newsletterTitle: "Ne manquez aucune étape.",
      newsletterDesc: "Abonnez-vous pour recevoir des mises à jour sur nos progrès, nouveaux programmes et événements communautaires.",
      newsletterPlaceholder: "Entrez votre adresse e-mail",
      newsletterBtn: "S'abonner",
      newsletterSuccess: "Vous êtes abonné ! Bienvenue dans le parcours NEXUS.",
      newsletterInvalid: "Veuillez entrer une adresse e-mail valide.",
      socialEyebrow: "Connectez-vous Avec Nous",
      socialTitle: "Suivez NEXUS sur les réseaux sociaux.",
      socialDesc: "Rejoignez notre communauté grandissante. Restez informé sur nos derniers travaux, événements et opportunités.",
      socialFollow: "Suivre",
      ctaEyebrow: "Participez",
      ctaTitle: "Faites partie de l'histoire NEXUS.",
      ctaDesc: "Que vous vouliez apprendre, construire ou avoir un impact — il y a une place pour vous chez NEXUS.",
      ctaPrograms: "Explorer les Programmes",
      ctaPartner: "Devenir Partenaire",
      ctaBlog: "Lire Notre Blog",
      readMore: "Lire la suite",
      readLess: "Lire moins",
      imageCount: "images",
      videoCount: "vidéos",
      noMedia: "Pas encore de médias",
      sharedTo: "Partagé sur",
    },
    blogPage: {
      eyebrow: "Blog NEXUS",
      title: "Analyses, annonces et actualités.",
      description: "Réflexions de nos cofondateurs, retours sur notre aventure et décryptages de la confiance numérique au Cameroun.",
      readTime: "min de lecture",
      readMore: "Lire l'article",
      backToBlog: "Retour à tous les articles",
      searchPlaceholder: "Rechercher des articles...",
      noPosts: "Aucun article trouvé pour vos critères.",
      relatedPosts: "Articles similaires",
      loadMore: "Voir plus",
      share: "Partager",
      minRead: "min de lecture",
      author: "Auteur",
      tags: "Tags",
    },
    faqPage: {
      eyebrow: "FAQ",
      title: "Foire Aux Questions.",
      description: "Trouvez des réponses claires aux questions fréquentes sur NEXUS, nos divisions, nos cohortes et notre gouvernance.",
      catAll: "Toutes les Questions",
      catGeneral: "Général",
      catAcademy: "Academy",
      catTechHub: "Tech Hub",
      catFoundation: "Foundation",
      catMentorship: "Mentorship",
      q1Question: "Qu'est-ce que NEXUS ?",
      q2Question: "Comment fonctionne la formation de NEXUS Academy ?",
      q3Question: "Quels services propose NEXUS Tech Hub ?",
      q4Question: "Quelle est la mission de NEXUS Foundation ?",
      q5Question: "Comment fonctionne le programme de mentorat NEXUS ?",
      q6Question: "Comment puis-je vérifier une inscription Academy ?",
      q7Question: "Mon organisation peut-elle devenir partenaire de NEXUS ?",
      stillQuestions: "Vous avez encore des questions ?",
      contactSupport: "N'hésitez pas à contacter notre équipe à tout moment.",
    },
    joinUsPage: {
      eyebrow: "Rejoindre NEXUS",
      title: "Construisez l'avenir numérique du Cameroun avec nous.",
      description: "Nous recherchons en permanence des bâtisseurs passionnés, des formateurs et des bénévoles pour rejoindre notre équipe.",
      pathwayTitle: "Votre Parcours",
      pathwaySubtitle: "Dites-nous qui vous êtes et comment vous souhaitez faire partie de NEXUS.",
      opportunitiesTitle: "Opportunités Disponibles",
      opportunitiesSubtitle: "Rôles actuellement disponibles dans l'écosystème NEXUS.",
      applyNote: "Soumettez votre candidature via le formulaire ci-dessus en sélectionnant le parcours correspondant.",
      submitBtn: "Soumettre la Candidature",
      successTitle: "Candidature Reçue",
      successDesc: "Merci pour votre intérêt envers NEXUS. Nous examinerons votre candidature et vous répondrons sous peu.",
      pathwayPrompt: "Sélectionnez un parcours pour commencer",
      closeForm: "Fermer le formulaire",
      sideTitle: "Que se passe-t-il ensuite",
      sideText: "Nous examinons chaque candidature sous quelques jours ouvrés et revenons vers vous avec les prochaines étapes. Préférez parler directement ? Écrivez-nous sur WhatsApp ou par email à tout moment.",
      whatsappAlt: "Écrivez-nous sur WhatsApp",
      emailAlt: "Écrivez-nous à",
    },
    partnerPage: {
      eyebrow: "Devenir Partenaire",
      title: "Collaborez avec NEXUS pour un impact durable.",
      description: "Nous mènons des partenariats avec des entreprises, institutions et ONG pour faire progresser la confiance numérique au Cameroun.",
      waysEyebrow: "Modèles de partenariat",
      waysTitle: "Comment nous pouvons collaborer",
      waysDesc: "Nous personnalisons nos partenariats pour aligner nos objectifs communs au service du public.",
      w1Title: "Partenaire Entreprise & Recrutement",
      w1Text: "Recrutez les meilleurs diplômés en ingénierie logicielle et cybersécurité directement issus de l'Academy.",
      w2Title: "Partenaire Fondation & Impact",
      w2Text: "Soutenez des campagnes de sécurité numérique, la prévention des fraudes MoMo et les ateliers scolaires.",
      w3Title: "Partenaire Technique & Projets",
      w3Text: "Faites appel au Tech Hub pour vos besoins en développement logiciel, infrastructure cloud ou audit de sécurité.",
      formTitle: "Formulaire de Demande de Partenariat",
      orgNameLabel: "Nom de l'Organisation",
      orgPlaceholder: "ex. Acme Tech Sarl",
      contactNameLabel: "Personne de Contact",
      contactPlaceholder: "ex. Jean Dupont",
      emailLabel: "Adresse Email",
      typeLabel: "Type d'Organisation",
      typeSelect: "Sélectionnez le type...",
      tCorporate: "Entreprise / Société",
      tEducational: "Établissement d'Enseignement",
      tGovernment: "Gouvernement / Organisme public",
      tNgo: "ONG / Association",
      tIndividual: "Sponsor Individuel",
      messageLabel: "Comment souhaitez-vous collaborer ?",
      messagePlaceholder: "Décrivez votre organisation et votre projet de partenariat...",
      submitBtn: "Soumettre la Demande",
      sentSuccess: "Merci ! Notre équipe chargée des partenariats vous recontactera sous peu.",
      statsEyebrow: "Notre écosystème",
      statsTitle: "Une force grandissante pour le Cameroun numérique",
      statsDesc: "Quatre divisions unies pour former les talents, construire la technologie et servir les communautés.",
      statDivisionsLabel: "Divisions actives",
      statProgramsLabel: "Programmes pratiques",
      statTrainedLabel: "Apprenants touchés",
      statCommunitiesLabel: "Communautés servies",
      benefitEyebrow: "Pourquoi nous soutenir",
      benefitTitle: "Ce que le partenariat vous apporte",
      benefitDesc: "Au-delà du bien commun, une valeur concrète pour votre organisation, vos équipes et les communautés servies.",
      benefit1Title: "Talents tech vérifiés",
      benefit1Text: "Accédez directement aux diplômés de NEXUS Academy, des ingénieurs et designers opérationnels en logiciel, sécurité et IA.",
      benefit2Title: "Construisez avec une équipe sûre",
      benefit2Text: "Réalisez vos projets logiciels, cloud et design via le Tech Hub, alliant standards internationaux et contexte local.",
      benefit3Title: "Portée communautaire & RSE",
      benefit3Text: "Amplifiez votre impact social en finançant des programmes d'alphabétisation et de sécurité numériques nationaux.",
      benefit4Title: "Vision locale, standards mondiaux",
      benefit4Text: "Remote-first à travers le Cameroun avec la rigueur d'une culture d'ingénierie de classe mondiale, agile, transparente et responsable.",
      typesEyebrow: "Qui peut s'associer",
      typesTitle: "Des partenariats pour chaque type d'organisation",
      typesDesc: "Quelle que soit votre approche, il existe un moyen de créer de la valeur partagée avec NEXUS.",
      typeCorporateTitle: "Entreprises & Sociétés",
      typeCorporateText: "Recrutez des talents, construisez des produits ou soutenez des programmes communautaires dans le cadre de votre RSE.",
      typeNgoTitle: "ONG & Associations",
      typeNgoText: "Co-portez des outils de données de terrain, des campagnes de sécurité numérique et du renforcement de capacités.",
      typeGovernmentTitle: "Gouvernement & Institutions",
      typeGovernmentText: "Renforcez les services publics numériques, la formation et l'infrastructure avec un partenaire technologique local.",
      typeEducationTitle: "Établissements d'enseignement",
      typeEducationText: "Co-créez des curricula, stages et parcours pratiques qui réduisent l'écart entre études et industrie.",
      typeIndividualTitle: "Particuliers, Diaspora & Philanthropie",
      typeIndividualText: "Soutenez des bourses, mentorisez des talents ou portez NEXUS dans votre réseau et votre communauté.",
      modelEyebrow: "Modalités de collaboration",
      modelTitle: "Comment nous pouvons travailler ensemble",
      modelDesc: "Des modèles flexibles adaptés à vos objectifs et votre capacité.",
      model4Title: "Sponsoring & Subventions",
      model4Text: "Financez des promotions, campagnes ou infrastructures et soyez reconnu comme partenaire fondateur du Cameroun numérique.",
      model5Title: "Recherche & Curriculum",
      model5Text: "Façonnez la prochaine génération de formation tech via recherche conjointe, conférences et conception de curricula.",
      processEyebrow: "Comment ça marche",
      processTitle: "De la première discussion à l'impact durable",
      processDesc: "Un cheminement clair et sans friction vers le partenariat.",
      processCtaLabel: "Démarrer un partenariat",
      step1Title: "Soumettre une demande",
      step1Text: "Présentez votre organisation et vos objectifs via le formulaire ci-dessous.",
      step2Title: "Appel de prise de contact",
      step2Text: "Nous planifions un court échange pour comprendre vos besoins et explorer la compatibilité.",
      step3Title: "Co-définir l'engagement",
      step3Text: "Ensemble, nous définissons un plan de partenariat concret et mutuellement bénéfique.",
      step4Title: "Lancer & développer",
      step4Text: "Nous exécutons, mesurons l'impact et cherchons à approfondir la relation.",
      formWebsiteLabel: "Site web ou LinkedIn",
      formInterestLabel: "Intérêt de partenariat",
      interestSelect: "Sélectionnez un intérêt...",
      interestSponsorship: "Sponsoring & Subventions",
      interestTech: "Construction tech / Services",
      interestTalent: "Talents & Recrutement",
      interestCommunity: "Communauté & RSE",
      interestResearch: "Recherche & Curriculum",
      formSideTitle: "Que se passe-t-il ensuite",
      formSideText: "Nous examinons chaque demande sous 2 jours ouvrés et répondons avec des prochaines étapes claires. Préférez parler directement ? Contactez-nous sur WhatsApp ou par email.",
      whatsappAlt: "Écrivez-nous sur WhatsApp",
      emailAlt: "Écrivez-nous à",
      formError: "Une erreur est survenue. Veuillez réessayer ou nous écrire directement.",
    },
    verifyPage: {
      eyebrow: "Portail de Vérification",
      title: "Vérifier les Certificats et Identifiants NEXUS Academy.",
      description: "Outil public permettant aux employeurs et partenaires de vérifier l'authenticité des inscriptions et diplômes.",
      searchPlaceholder: "Entrez l'identifiant (ex. NX-AC-2026-001)...",
      verifyBtn: "Vérifier l'ID",
      howTitle: "Comment fonctionne la vérification",
      howText: "Chaque étudiant de NEXUS Academy reçoit un identifiant d'inscription unique lors de son admission. Entrez cet identifiant ci-dessus.",
      sampleCode: "Exemple d'identifiant : NX-AC-2026-001",
      noResult: "Aucun enregistrement trouvé pour cet identifiant. Veuillez vérifier la saisie.",
      validResult: "Enregistrement Vérifié Trouvé",
      registrationId: "Identifiant d'inscription",
    },
    legalPage: {
      termsTitle: "Conditions d'Utilisation",
      termsSubtitle: "Règles et conditions régissant l'utilisation des sites, plateformes et services NEXUS.",
      privacyTitle: "Politique de Confidentialité",
      privacySubtitle: "Comment NEXUS collecte, protège et traite vos données personnelles.",
      lastUpdated: "Dernière mise à jour : Août 2026",
      termsIntro: "Les présentes Conditions d'Utilisation régissent votre accès et votre utilisation du site web NEXUS et de tous les services, plateformes et contenus associés exploités par NEXUS Technologies.",
      termsScopeTitle: "Portée",
      termsScopeText: "Ces Conditions s'appliquent à tous les visiteurs, utilisateurs, étudiants, partenaires et toute personne qui accède ou utilise une partie du site web NEXUS, y compris mais sans s'y limiter le portail d'inscription à l'Academy, les formulaires de demande de partenariat, les candidatures de mentorat, le contenu du blog et toute fonctionnalité interactive. En accédant ou en utilisant une partie du site, vous acceptez d'être lié par ces Conditions.",
      termsAcceptanceTitle: "Acceptation des Conditions",
      termsAcceptanceText: "En accédant ou en utilisant ce site web, vous acceptez de vous conformer aux présentes Conditions et d'y être lié. Si vous n'êtes pas d'accord avec une partie de ces Conditions, vous ne devez pas utiliser le site. L'utilisation continue du site après toute modification des présentes Conditions constitue une acceptation de ces modifications.",
      termsUseTitle: "Utilisation Acceptable",
      termsUseText: "Vous pouvez utiliser ce site web uniquement à des fins licites, d'une manière conforme à toutes les lois et réglementations camerounaises applicables. Vous acceptez de ne pas : (a) utiliser le site d'une manière qui viole la loi applicable ou porte atteinte aux droits d'autrui ; (b) tenter d'obtenir un accès non autorisé à une partie du site, de ses serveurs ou de ses systèmes sous-jacents ; (c) transmettre tout contenu nuisible, offensant, diffamatoire ou non sollicité via tout formulaire de contact ou fonctionnalité interactive ; (d) extraire, explorer ou télécharger systématiquement du contenu du site sans autorisation écrite préalable de NEXUS ; (e) utiliser le site pour usurper l'identité de NEXUS Technologies, de ses membres ou de ses divisions ; (f) introduire des virus, logiciels malveillants ou tout autre code nuisible ; (g) interférer avec l'intégrité ou les performances du site.",
      termsIpTitle: "Propriété Intellectuelle",
      termsIpText: "Tout le contenu de ce site web, y compris les textes, graphiques, logos, icônes, images, clips audio, vidéos, logiciels et code, est la propriété de NEXUS Technologies ou de ses fournisseurs de contenu et est protégé par les lois camerounaises et internationales sur la propriété intellectuelle. Vous ne pouvez pas reproduire, distribuer, modifier, transmettre, afficher ou utiliser de quelque autre manière tout contenu de ce site web sans notre autorisation écrite préalable, sauf pour un usage personnel et non commercial qui ne porte pas atteinte à nos droits. Le nom NEXUS, le logo et tous les identifiants de marque des divisions sont des marques de NEXUS Technologies. Rien sur ce site web ne confère de licence ou de droit d'utilisation de ces marques sans consentement écrit explicite.",
      termsAccuracyTitle: "Exactitude des Informations",
      termsAccuracyText: "NEXUS s'efforce de garantir que toutes les informations sur ce site web sont exactes, actuelles et fiables. Cependant, nous ne donnons aucune garantie quant à l'exactitude, l'exhaustivité ou la pertinence des informations publiées. Le contenu est fourni à des fins d'information générale uniquement et ne constitue pas un conseil professionnel, juridique, financier ou technique. Les descriptions de services, les détails des programmes, les tarifs, les horaires et la disponibilité sont susceptibles de changer sans préavis. Confirmez toujours les détails actuels en nous contactant directement avant de prendre des décisions basées sur le contenu du site.",
      termsLinksTitle: "Liens Externes",
      termsLinksText: "Ce site web contient des liens vers des sites web externes, notamment des plateformes de médias sociaux, des organisations partenaires, des prestataires de paiement et des outils tiers. Ces liens sont fournis uniquement pour votre commodité. NEXUS ne contrôle, n'approuve ni ne garantit l'exactitude, la légalité ou le caractère approprié de tout site tiers ou de son contenu. Nous ne sommes pas responsables des pratiques en matière de confidentialité, du traitement des données ou de la sécurité des sites web externes. Nous vous encourageons à consulter les conditions et les politiques de confidentialité de tout site tiers avant de fournir des informations personnelles.",
      termsLiabilityTitle: "Limitation de Responsabilité",
      termsLiabilityText: "Dans toute la mesure permise par la loi camerounaise, NEXUS Technologies, ses dirigeants, administrateurs, employés, agents, partenaires et affiliés ne pourront être tenus responsables de tout dommage indirect, accessoire, spécial, consécutif ou punitif, y compris mais sans s'y limiter la perte de données, la perte de profits ou la perte de clientèle, découlant de : (a) votre utilisation ou incapacité d'utilisation du site ; (b) toute erreur, omission ou inexactitude dans le contenu du site ; (c) tout accès non autorisé ou altération de vos transmissions ou données ; (d) toute autre question relative au site. Rien dans les présentes Conditions n'exclut ou ne limite la responsabilité qui ne peut être exclue par la loi, y compris la responsabilité pour décès ou dommages corporels causés par négligence.",
      termsWarrantyTitle: "Avis de Non-Responsabilité",
      termsWarrantyText: "Ce site web est fourni 'tel quel' et 'selon disponibilité' sans garantie d'aucune sorte, expresse ou implicite, y compris mais sans s'y limiter les garanties implicites de qualité marchande, d'adéquation à un usage particulier ou de non-violation. NEXUS ne garantit pas que le site sera ininterrompu, exempt d'erreurs, sécurisé ou exempt de virus ou d'autres composants nuisibles. Nous ne garantissons pas l'exactitude, la fiabilité ou l'exhaustivité de tout contenu, service ou matériel disponible via le site.",
      termsPrivacyTitle: "Confidentialité",
      termsPrivacyText: "Votre utilisation de ce site web et les données personnelles que vous fournissez sont également régies par notre Politique de Confidentialité, qui est incorporée dans les présentes Conditions par référence. Veuillez consulter notre Politique de Confidentialité pour comprendre comment nous collectons, utilisons et protégeons vos informations personnelles.",
      termsGoverningTitle: "Loi Applicable et Juridiction",
      termsGoverningText: "Les présentes Conditions sont régies par et interprétées conformément aux lois de la République du Cameroun. Tout litige découlant de ou en relation avec les présentes Conditions ou votre utilisation du site web est soumis à la juridiction exclusive des tribunaux de la République du Cameroun. En utilisant ce site web, vous vous soumettez à la juridiction des tribunaux camerounais et renoncez à toute objection relative aux procédures devant ces tribunaux.",
      termsEnrollmentTitle: "Inscription et paiements à l'Academy",
      termsEnrollmentText: "L'inscription aux programmes NEXUS Academy est soumise à la disponibilité des cohortes, aux critères d'éligibilité et à la réussite du processus de candidature. Le paiement est effectué via Mobile Money ou d'autres méthodes spécifiées, et chaque inscription confirmée reçoit un ID d'inscription unique. Les remboursements, annulations et reports sont soumis aux politiques d'inscription de NEXUS Academy et doivent être demandés formellement. NEXUS se réserve le droit de modifier les horaires, le contenu et les tarifs des programmes avec un préavis raisonnable aux étudiants inscrits.",
      termsResponsibilityTitle: "Vos responsabilités",
      termsResponsibilityText: "Vous acceptez de fournir des informations exactes, complètes et à jour dans tout formulaire soumis sur ce site web. Vous êtes responsable de la confidentialité des identifiants de compte et de toutes les activités effectuées sous votre compte. Vous acceptez d'utiliser le site de manière légale et respectueuse, et de ne pas porter atteinte à la sécurité, à la fonctionnalité ou à la disponibilité du site ou de ses utilisateurs. Toute tentative d'accès à des zones restreintes, de perturbation des services ou d'exploitation de vulnérabilités est strictement interdite et peut entraîner des poursuites judiciaires.",
      termsChangesTitle: "Modifications de ces Conditions",
      termsChangesText: "NEXUS se réserve le droit de mettre à jour, modifier ou remplacer ces Conditions à tout moment pour refléter les changements dans nos pratiques, services ou obligations légales. Les Conditions mises à jour seront publiées sur cette page avec une date d'entrée en vigueur révisée. Nous vous encourageons à consulter ces Conditions périodiquement. Votre utilisation continue du site après toute modification constitue votre acceptation des Conditions mises à jour. Si vous n'êtes pas d'accord avec les Conditions révisées, vous devez cesser d'utiliser le site.",
      termsContactTitle: "Nous Contacter",
      termsContactText: "Pour toute question, préoccupation ou notification concernant ces Conditions d'Utilisation, veuillez contacter : Email : nexustechnolgies7@gmail.com | WhatsApp : +237 653 137 081 | Téléphone : +237 678 661 281 | NEXUS Technologies, Bamenda, Cameroun.",
      privacyIntro: "Comment NEXUS collecte, utilise, stocke et protège vos informations personnelles, conformément aux lois camerounaises sur la cybersécurité, les communications électroniques et la protection des données personnelles.",
      pCollectTitle: "Informations que vous fournissez",
      pCollectText: "Lorsque vous remplissez un formulaire sur notre site, nous collectons les détails que vous soumettez : votre nom complet, adresse email, numéro de téléphone, nom de l'organisation ou de l'institution (le cas échéant), parcours ou rôle sélectionné, et le contenu de votre message ou candidature. Les formulaires d'inscription à l'Academy peuvent également collecter le parcours éducatif, l'expérience professionnelle et la préférence de programme.",
      pAutoTitle: "Informations collectées automatiquement",
      pAutoText: "Comme la plupart des sites web, nos serveurs enregistrent automatiquement certaines informations techniques lors de votre visite : type et version du navigateur, système d'exploitation, type d'appareil, pages visitées, temps passé sur chaque page, URLs de référence et adresse IP (utilisée uniquement pour déterminer la localisation géographique approximative à des fins d'analyse et de sécurité).",
      pUseTitle: "Comment nous utilisons vos informations",
      pUseText: "Vos informations sont utilisées pour : (a) répondre à vos demandes de partenariat, candidatures, demandes de mentorat ou messages de contact ; (b) traiter et gérer les inscriptions à l'Academy, y compris la vérification des ID d'inscription ; (c) vous envoyer des informations pertinentes sur les programmes et événements NEXUS ; (d) améliorer notre site, nos services et l'expérience utilisateur ; (e) nous conformer aux lois et réglementations camerounaises applicables. Nous ne vendons, ne louons, ni n'échangeons vos données personnelles à des tiers à des fins marketing.",
      pLegalTitle: "Base légale du traitement",
      pLegalText: "NEXUS traite les données personnelles sur les bases légales suivantes : (1) Consentement ; lorsque vous soumettez un formulaire, vous consentez à être contacté par NEXUS pour le but déclaré. Vous pouvez retirer ce consentement à tout moment. (2) Nécessité contractuelle ; lors du traitement des données d'inscription ou d'enrôlement nécessaires à la prestation de nos services. (3) Obligation légale ; lorsque la loi camerounaise exige la rétention ou la divulgation (par exemple, en vertu de la loi n° 2010/012 sur la cybersécurité et la cybercriminalité). (4) Intérêts légitimes ; pour répondre aux communications, maintenir la sécurité de nos systèmes et améliorer nos services, dans la mesure où ces intérêts ne l'emportent pas sur vos droits et libertés.",
      pEnrollTitle: "Inscription et vérification",
      pEnrollText: "Les dossiers d'inscription à l'Academy incluent le statut de paiement et un ID d'inscription unique. Notre page publique de vérification de certificats n'affiche que des informations non sensibles : le nom du titulaire, le programme et le statut d'émission. Les confirmations de paiement sont stockées en sécurité et accessibles uniquement au personnel NEXUS autorisé.",
      pSecurityTitle: "Stockage et sécurité des données",
      pSecurityText: "Les données personnelles soumises via nos formulaires sont stockées sur les systèmes internes sécurisés de NEXUS, accessibles uniquement aux membres de l'équipe autorisés. Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles, notamment le chiffrement des données en transit, des contrôles d'accès, une authentification sécurisée et des revues de sécurité périodiques. En tant qu'organisation technologique opérant sous la loi camerounaise, nous nous engageons à respecter les normes de sécurité des données attendues des fournisseurs de services électroniques. En cas de violation de données susceptible d'affecter vos droits ou intérêts, nous notifierons les utilisateurs concernés et les autorités compétentes sans délai indu.",
      pRetentionTitle: "Conservation des données",
      pRetentionText: "Les données de contact et de demande sont conservées jusqu'à 24 mois à compter de la date de soumission, sauf si une période de conservation plus longue est requise par la loi ou une relation contractuelle en cours. Les dossiers d'inscription et de vérification de l'Academy sont conservés pendant 5 ans après la fin du programme à des fins d'audit de certification. Après ces délais, les données sont supprimées ou anonymisées de manière sécurisée.",
      pSharingTitle: "Partage de vos informations",
      pSharingText: "NEXUS ne partage vos informations personnelles avec des tiers que dans les cas suivants : (a) lorsque la loi camerounaise ou une autorité de régulation compétente l'exige ; (b) avec nos divisions partenaires (par exemple, NEXUS Tech Hub ou Foundation) lorsque cela est pertinent pour un service ou un programme spécifique avec lequel vous avez interagi ; (c) avec des prestataires de services de confiance qui soutiennent nos opérations dans le cadre d'accords stricts de traitement des données ; (d) avec votre consentement explicite. Nous ne vendons jamais vos données personnelles.",
      pRightsTitle: "Vos droits",
      pRightsText: "Conformément à la loi camerounaise et aux principes internationaux de protection des données, vous avez le droit de : (a) Accès : demander une copie des données personnelles que nous détenons à votre sujet. (b) Rectification : demander la correction de données inexactes ou incomplètes. (c) Effacement : demander la suppression de vos données personnelles, sous réserve des exigences légales de conservation. (d) Retrait du consentement : à tout moment lorsque le consentement est la base du traitement. (e) Opposition : au traitement fondé sur des intérêts légitimes. (f) Portabilité : recevoir vos données dans un format structuré et couramment utilisé. Pour exercer l'un de ces droits, contactez-nous en utilisant les coordonnées ci-dessous. Nous vous répondrons dans les 30 jours.",
      pThirdTitle: "Liens vers des sites tiers",
      pThirdText: "Notre site contient des liens vers des sites web externes, notamment des plateformes de médias sociaux, des organisations partenaires et des prestataires de paiement. Nous ne sommes pas responsables des pratiques en matière de confidentialité ni du contenu de ces sites tiers. Nous vous encourageons à examiner leurs politiques de confidentialité séparément avant de fournir des informations personnelles.",
      pChildrenTitle: "Confidentialité des enfants",
      pChildrenText: "Nos services s'adressent aux personnes âgées de 16 ans et plus. Nous ne collectons pas sciemment de données personnelles auprès d'enfants de moins de 16 ans. Si vous pensez qu'un enfant de moins de 16 ans a soumis des données personnelles via l'un de nos formulaires ou candidatures, veuillez nous contacter immédiatement afin que nous puissions prendre les mesures appropriées.",
      pChangesTitle: "Modifications de cette politique",
      pChangesText: "Nous pouvons mettre à jour cette Politique de Confidentialité de temps à autre pour refléter les changements dans nos pratiques, services ou obligations légales. Toute mise à jour sera publiée sur cette page avec une date d'entrée en vigueur révisée. Pour les changements importants, nous notifierons les contacts existants par email ou par un avis visible sur notre site web.",
      pContactTitle: "Nous contacter",
      pContactText: "Pour toute question relative à la confidentialité, demande d'accès aux données ou réclamation : Email : nexustechnolgies7@gmail.com | WhatsApp : +237 653 137 081 | Téléphone : +237 678 661 281 | NEXUS Technologies, Bamenda, Cameroun.",
    },
    notFoundPage: {
      title: "Page Non Trouvée",
      subtitle: "La page que vous recherchez n'existe pas ou a été déplacée.",
      backBtn: "Retourner à l'Accueil",
    },
    common: {
      backToHome: "Retour à l'accueil",
      submit: "Soumettre",
      loading: "Chargement...",
      success: "Succès !",
      error: "Une erreur est survenue.",
    },
  },
};

const monthMap: Record<string, Record<Language, string>> = {
  January: { en: "January", fr: "Janvier" },
  February: { en: "February", fr: "Février" },
  March: { en: "March", fr: "Mars" },
  April: { en: "April", fr: "Avril" },
  May: { en: "May", fr: "Mai" },
  June: { en: "June", fr: "Juin" },
  July: { en: "July", fr: "Juillet" },
  August: { en: "August", fr: "Août" },
  September: { en: "September", fr: "Septembre" },
  October: { en: "October", fr: "Octobre" },
  November: { en: "November", fr: "Novembre" },
  December: { en: "December", fr: "Décembre" },
};

export function translateDate(dateStr: string, lang: Language): string {
  if (lang === "en") return dateStr;
  let result = dateStr;
  for (const [enMonth, names] of Object.entries(monthMap)) {
    result = result.replace(enMonth, names.fr);
  }
  return result;
}
