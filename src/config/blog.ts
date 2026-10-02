export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  content: {
    intro: string;
    sections: {
      heading: string;
      paragraphs: string[];
      checklist?: string[];
      tip?: string;
    }[];
    conclusion: string;
  };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-verify-property-title-before-token-advance",
    title: "How to Verify if a Property Title is Legally Clear Before Paying Token Advance",
    excerpt: "Crucial checks every buyer must conduct—from checking 45-year ECs to verifying parental title lineage and village A-register matching.",
    category: "Legal Advice",
    date: "February 2025",
    readTime: "5 min read",
    author: "AKS Legal Advisory Team",
    authorRole: "Senior Property Advocates",
    content: {
      intro: "Paying a token advance is often the first formal step in acquiring real estate in Tamil Nadu. However, handing over advance money without verifying fundamental ownership and encumbrance records is the primary cause of disputes, financial loss, and prolonged litigation.",
      sections: [
        {
          heading: "1. Demand the Complete Chain of Parent Title Deeds",
          paragraphs: [
            "Never rely solely on the latest registered sale deed. A property transfer is only as valid as the preceding links in its chain of title. You must trace the original title deed back at least 30 to 45 years to confirm how the current seller acquired ownership.",
            "Verify whether earlier transfers occurred through registered sale deeds, gift deeds (Dhana Settilment), partition deeds (Baaga Pirivinai), or release deeds. If acquired through inheritance, confirm that all legal heirs signed the document."
          ],
          checklist: [
            "Original parent sale deed copies for past 30-45 years",
            "Legal heir certificates for inherited properties",
            "Release deeds from siblings or partition deed confirmation"
          ]
        },
        {
          heading: "2. Verify 45-Year Encumbrance Certificates (EC)",
          paragraphs: [
            "An Encumbrance Certificate (EC) reflects all transactions registered at the Sub-Registrar Office (SRO) concerning a specific survey number and sub-division.",
            "Online ECs are available on the TNREGINET portal, but older manual registers must be physically verified at the SRO to ensure there are no registered bank mortgages, court attachments, or prior sale agreements."
          ],
          tip: "Check for pending or cancelled Sale Agreements in the EC. An uncancelled agreement to sell can create severe legal bottlenecks."
        },
        {
          heading: "3. Cross-Check Revenue Records: Patta, Chitta & A-Register",
          paragraphs: [
            "A registered deed proves ownership, but revenue records (Patta) prove actual legal possession recognized by the Tamil Nadu Revenue Department.",
            "Verify that the Patta stands in the seller's name and that the extent in the computerized Patta matches the deed measurement."
          ],
          checklist: [
            "Computerized Patta (Anytime Anywhere portal)",
            "Chitta land classification check",
            "A-Register survey entry confirmation"
          ]
        },
        {
          heading: "4. Physical Ground Inspection & Boundary Survey",
          paragraphs: [
            "A title might be legally clear on paper, but physically encroached on the ground. Always conduct a physical inspection with licensed surveyors to confirm that the four boundaries (North, South, East, West) match the deed description."
          ]
        }
      ],
      conclusion: "Taking these essential precautions before executing an advance token ensures your capital remains safe and your dream property is dispute-free from day one."
    }
  },
  {
    slug: "understanding-patta-chitta-and-fmb-tamil-nadu-land-records",
    title: "Understanding Patta, Chitta, and FMB: The Holy Trinity of Tamil Nadu Land Records",
    excerpt: "A simple guide to understanding your computerized patta document, reading field measurement sketches, and correcting sub-division errors.",
    category: "Revenue Records",
    date: "February 2025",
    readTime: "7 min read",
    author: "AKS Revenue Advisory Team",
    authorRole: "Revenue & Land Survey Specialists",
    content: {
      intro: "In Tamil Nadu, real estate transactions require harmony between two government entities: the Registration Department (Sub-Registrar Office) and the Revenue Department (Taluk Office). Understanding Patta, Chitta, and the Field Measurement Book (FMB) is vital for every property owner.",
      sections: [
        {
          heading: "1. What is a Patta?",
          paragraphs: [
            "A Patta is an official document issued by the Tahsildar certifying that a specific parcel of land stands registered under a particular owner's name in government revenue records.",
            "It specifies District, Taluk, Village, Patta Number, Survey Number, Sub-division, Land Type (Nanjai/Punjai), and Extent in Hectares/Ares."
          ]
        },
        {
          heading: "2. Understanding Chitta and Adangal",
          paragraphs: [
            "Chitta is the village revenue account book maintained by the Village Administrative Officer (VAO). It details land classification, ownership, and tax assessments.",
            "Adangal records seasonal cultivation details for agricultural land, noting the crop grown and the person cultivating it."
          ]
        },
        {
          heading: "3. Field Measurement Book (FMB)",
          paragraphs: [
            "The FMB sketch is the precise graphic map of the survey field showing exact boundary dimensions, sub-division lines, stone markings, and adjoining survey numbers.",
            "Comparing your deed's measurement against the official FMB ensures there are no survey discrepancies or missing boundary points."
          ],
          tip: "Always ensure the FMB ladder measurements match the plot layout approved by the Directorate of Town and Country Planning (DTCP) or Local Planning Authority (LPA)."
        },
        {
          heading: "4. Resolving Joint Patta Bottlenecks",
          paragraphs: [
            "If your land is registered under a 'Joint Patta' with multiple co-owners, applying for sub-division (UDR Patta separation) ensures you get an exclusive individual Patta with independent boundaries."
          ]
        }
      ],
      conclusion: "Keeping your Patta updated and verified against FMB sketches protects your property rights against accidental encroachments and false ownership claims."
    }
  },
  {
    slug: "how-to-locate-inherited-ancestral-lands-with-missing-documents",
    title: "How to Locate Inherited Ancestral Lands with Missing Documents",
    excerpt: "Steps to rediscover long-lost family lands, reconstructing archival title chains, and securing physical possession through digital surveying.",
    category: "Property Tracing",
    date: "January 2025",
    readTime: "6 min read",
    author: "AKS Field Survey Team",
    authorRole: "Archival Research & GPS Surveyors",
    content: {
      intro: "Many families in Tamil Nadu and abroad inherit property parcels mentioned only in old family conversations or decades-old partition deeds with vague descriptions. Locating these non-traceable properties requires a blend of archival detective work and digital GPS surveying.",
      sections: [
        {
          heading: "1. Archival Document Retrieval from Sub-Registrar Offices",
          paragraphs: [
            "Even if you lack the original document, having a rough document number, registration year, or village name allows certified copies (CC) of the parent deed to be extracted from the Registration Department.",
            "Old deeds often contain reference numbers of parent title transactions that date back 50 to 100 years."
          ]
        },
        {
          heading: "2. Correlating Four Boundaries with Village Cadastral Maps",
          paragraphs: [
            "Ancestral deeds frequently identify lands using traditional boundaries such as adjoining owners' family names, village cart-tracks (Vandi Paathai), or irrigation canals (Vaaikaal).",
            "Our team cross-references these historical landmarks with pre-UDR (Updating Registry Scheme) records and current village survey maps to locate the exact survey block."
          ]
        },
        {
          heading: "3. Field GPS Survey & DGPS Pinpointing",
          paragraphs: [
            "Once the survey number and sub-division are traced in revenue records, licensed field surveyors use Differential GPS (DGPS) and Total Station instruments to pinpoint the exact perimeter coordinates.",
            "Physical boundary stones are planted and geocoded to eliminate future ambiguity."
          ],
          tip: "Engaging adjacent landowners during the boundary survey fosters peaceful neighborhood relationships and prevents border friction."
        }
      ],
      conclusion: "Unidentified ancestral land can be transformed from an intangible asset into a secure, high-value, legally cleared property through systematic tracing."
    }
  },
  {
    slug: "vacant-plot-maintenance-for-nris-preventing-encroachment",
    title: "Vacant Plot Maintenance for NRIs: Preventing Encroachment and Fraudulent Deeds",
    excerpt: "Essential on-ground protective steps—periodic physical inspections, boundary stone fixation, barbed wire fencing, and warning boards.",
    category: "Maintenance",
    date: "January 2025",
    readTime: "4 min read",
    author: "AKS Property Management Team",
    authorRole: "Field Security & Compliance Officers",
    content: {
      intro: "Non-Resident Indians (NRIs) and absentee landowners face significant risks of encroachment, unauthorized waste dumping, or even fraudulent registration on unattended vacant plots. Establishing active physical possession is the most effective shield.",
      sections: [
        {
          heading: "1. The Doctrine of Adverse Possession in India",
          paragraphs: [
            "Under Indian limitation laws, if an unauthorized occupant remains in uninterrupted, open, and hostile possession of a private property for over 12 years without owner protest, they may attempt to claim title under adverse possession.",
            "Regular inspections and physical oversight prevent any third party from establishing squatters' rights."
          ]
        },
        {
          heading: "2. Erect Sturdy Fencing and Prominent Warning Boards",
          paragraphs: [
            "A well-built stone-pillar barbed wire fence or compound wall clearly defines possession to the public and revenue authorities.",
            "Install a weather-resistant signboard stating: 'This property belongs to [Owner Name]. Trespassers will be prosecuted under IPC Section 441/447. Contact AKS Property Checklist for enquiries.'"
          ],
          tip: "Take geo-tagged, timestamped photographs of the fence and sign board every time maintenance is performed."
        },
        {
          heading: "3. Routine Weed Clearing and Site Inspections",
          paragraphs: [
            "Overgrown brush and wild vegetation encourage illegal garbage dumping and obscure boundary markers. Scheduled cleaning ensures the land looks actively managed and well-guarded.",
            "Our team conducts scheduled on-site inspections, providing live video calls and detailed inspection reports to overseas owners."
          ]
        }
      ],
      conclusion: "Proactive property maintenance costs a tiny fraction of what prolonged court litigation demands. Keeping your land fenced, surveyed, and actively inspected ensures absolute peace of mind."
    }
  }
];
