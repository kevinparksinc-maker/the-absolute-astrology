/**
 * FIRMAMENT CANON MIGRATION — Legacy Planet-in-House Interpretation Library
 *
 * 144 records total: 12 bodies × 12 houses.
 * - 108 records cover the nine classical Jyotish grahas: Sun, Moon, Mars,
 *   Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu.
 * - 36 records cover the modern outer planets: Uranus, Neptune, and Pluto.
 *
 * EPISTEMIC / PROVENANCE NOTICE:
 * The legacy file attributes its nine-graha material to Brihat Parashara Hora
 * Shastra, Phaladeepika, Saravali, Jataka Parijata, and Uttara Kalamrita, but
 * supplies no record-level citations. These records are therefore classified
 * as traditional-source-attributed but unverified—not quotations or proof that
 * each statement appears in a named classical text. The outer-planet records
 * are modern astrological synthesis and have no classical Vedic equivalent.
 *
 * The descriptive content is preserved for review. Always use
 * getPlanetInHouseKnowledge() when retrieving records so the caller receives
 * epistemic status, source caveats, and interpretive guardrails.
 *
 * Each record covers core meaning, life domain, career, relationships,
 * challenge, gift, and a Vedic-term/qualification field.
 */

export interface PlanetInHouseMeaning {
  planet: string;
  house: number;
  domain: string; // what life area this primarily activates
  core: string; // the essential meaning in 1-2 sentences
  career: string; // career and vocation themes
  relationships: string; // relationship and family themes
  challenge: string; // the core difficulty to navigate
  gift: string; // the core strength this brings
  vedic: string; // traditional Vedic name/concept if applicable
}

export const PLANET_IN_HOUSE: PlanetInHouseMeaning[] = [
  // ═══════════════════════════════════════════════════════════════
  // SUN (Surya) — Soul, authority, father, government, vitality
  // ═══════════════════════════════════════════════════════════════

  {
    planet: "Sun",
    house: 1,
    domain: "Self and Identity",
    core: "The Sun in the 1st house places the soul's full radiance directly in the body and personality. This person was born to be seen. Their presence commands attention without effort.",
    career:
      "Leadership roles, government, politics, medicine, executive positions. They are drawn to positions of authority and perform best when given autonomy and recognition.",
    relationships:
      "Can be dominant in relationships. The partner must respect their authority or conflict arises. Father relationship is significant — either deeply influential or notably absent.",
    challenge:
      "Ego inflation, difficulty accepting criticism, tendency to make everything about self-expression. Must learn that true authority is earned through service, not demanded.",
    gift: "Natural leadership, strong constitution, magnetic presence, unshakeable sense of self when developed correctly. Others instinctively follow them.",
    vedic:
      "Surya in Lagna — considered highly auspicious in traditional texts. The native carries the dignity of royalty.",
  },
  {
    planet: "Sun",
    house: 2,
    domain: "Wealth, Voice, and Family",
    core: "The Sun illuminates the house of resources, giving this person a powerful voice and strong opinions about money and values. Self-worth is tied to material achievement.",
    career:
      "Finance, banking, government treasury, family business, public speaking, teaching. The voice is an instrument of authority.",
    relationships:
      "Family of origin is central to identity — either a source of pride or a wound around authority. Tends to be the financial provider and decision-maker in their own family.",
    challenge:
      "Arrogance about money and possessions, difficulty admitting financial difficulty, tendency to measure self-worth by wealth. Father-related financial issues possible.",
    gift: "Powerful voice, natural financial authority, ability to build and hold resources, strong family loyalty and pride.",
    vedic:
      "Surya in Dhana Bhava — wealth comes through authority and government connections.",
  },
  {
    planet: "Sun",
    house: 3,
    domain: "Communication and Courage",
    core: "The Sun in the 3rd house creates a bold communicator and natural writer or speaker. Courage in expression is the signature theme — this person says what others won't.",
    career:
      "Writing, journalism, media, public relations, teaching, sales, military. The hands and voice are primary instruments of work.",
    relationships:
      "Sibling relationships are significant — either a dominant older sibling or the native themselves plays a leadership role among siblings. Short journeys and local community matter.",
    challenge:
      "Can be domineering in communication, talks over others, uses words as weapons. Must learn to listen as powerfully as they speak.",
    gift: "Extraordinary communicative courage, ability to articulate complex ideas clearly, natural storytelling ability, physical vitality and manual skill.",
    vedic:
      "Surya in Sahaja Bhava — self-effort and courage of expression are the primary life tools.",
  },
  {
    planet: "Sun",
    house: 4,
    domain: "Home, Mother, and Inner Foundation",
    core: "The Sun in the 4th house places solar energy in the private realm. Home is a source of pride and identity. The mother relationship is defining — for good or ill.",
    career:
      "Real estate, property, agriculture, education, psychology, anything connected to the home or roots. May work from home or in a home-like environment.",
    relationships:
      "The home must be a place of dignity and beauty — cannot live in conditions that feel beneath them. Mother relationship is central and complex.",
    challenge:
      "The Sun in the 4th is not considered its strongest position — there can be difficulty with father, authority figures, or a sense of inner conflict between public and private self.",
    gift: "Deep emotional intelligence, strong connection to ancestral wisdom, ability to create sanctuaries for others, genuine understanding of what constitutes a real home.",
    vedic:
      "Surya in Sukha Bhava — happiness comes through establishing a dignified private life.",
  },
  {
    planet: "Sun",
    house: 5,
    domain: "Creativity, Children, and Intelligence",
    core: "One of the Sun's most powerful positions. The 5th house is the house of the Sun's natural joy — creativity, romance, children, and intelligence all flourish here.",
    career:
      "Creative arts, entertainment, education, speculation, politics, sports. Any field where self-expression and creative intelligence are rewarded.",
    relationships:
      "Romantic life is passionate and dramatic. Children are a source of great pride. The native tends to be the one others look to for creative inspiration.",
    challenge:
      "Ego in romance — can be self-centered in love, expects adoration. Gambling or speculative tendencies. Must distinguish genuine creativity from performance.",
    gift: "Brilliant intelligence, creative genius, natural performer, inspiring teacher, deep joy in life's pleasures. Children benefit from their leonine warmth.",
    vedic:
      "Surya in Putra Bhava — traditionally one of the strongest Sun placements. Intelligent, creative, fortunate with children.",
  },
  {
    planet: "Sun",
    house: 6,
    domain: "Service, Health, and Obstacles",
    core: "The Sun in the 6th house produces a powerful overcomer. This person defeats enemies, wins competitions, and excels in service-oriented work. Health requires attention.",
    career:
      "Medicine, military, law, competitive sports, government service, social work. Excel in any field requiring stamina and the defeat of opposition.",
    relationships:
      "Work relationships are significant — the native is often in a position of authority over subordinates. Tends to attract competitive colleagues or hidden enemies.",
    challenge:
      "Health of the father or issues with authority figures at work. The ego can be bruised by service-oriented roles. Must learn dignity in service.",
    gift: "Extraordinary stamina and resilience, ability to overcome obstacles that would defeat others, natural competitive edge, excellent at crisis management.",
    vedic:
      "Surya in Ripu Bhava — enemy-destroyer. Traditional texts say this placement gives victory over opponents.",
  },
  {
    planet: "Sun",
    house: 7,
    domain: "Partnership and Marriage",
    core: "The Sun in the 7th house creates powerful but challenging partnerships. The native attracts strong, solar partners — or projects their own solar qualities onto others.",
    career:
      "Law, diplomacy, public relations, business partnerships, consulting. Work often involves one-on-one relationships or public-facing roles.",
    relationships:
      "Marriage to a strong, perhaps dominant partner. Can create ego conflicts in partnership. The native must learn to share the spotlight. Business partnerships are significant.",
    challenge:
      "The Sun in the 7th (facing the 1st) creates tension between self and other. Ego conflicts in marriage. Possible later marriage or difficulty sustaining partnerships.",
    gift: "Ability to attract powerful, capable partners, natural diplomat, success through collaboration and public dealings, strong negotiation ability.",
    vedic:
      "Surya in Kalatra Bhava — spouse may be of high status or from government/authority background.",
  },
  {
    planet: "Sun",
    house: 8,
    domain: "Transformation and Hidden Knowledge",
    core: "The Sun in the 8th house descends into the underworld of the chart. This placement creates investigators, healers of the psyche, and those who work with death and transformation.",
    career:
      "Research, investigation, psychology, occult sciences, surgery, inheritance management, insurance, tax. Work with hidden things.",
    relationships:
      "Relationships involve power dynamics and transformation. Joint resources are significant. The native may benefit or suffer through inheritance.",
    challenge:
      "The Sun is weakened in the 8th — there can be health challenges, issues with the father, or a sense of the ego being repeatedly dissolved and reformed.",
    gift: "Extraordinary depth of perception, ability to navigate crisis, access to hidden knowledge, resilience through transformation, understanding of what lies beneath surfaces.",
    vedic:
      "Surya in Mrityu Bhava — longevity and occult knowledge are primary themes.",
  },
  {
    planet: "Sun",
    house: 9,
    domain: "Dharma, Father, and Higher Knowledge",
    core: "One of the most auspicious Sun placements. The 9th house is the house of dharma — right action, higher learning, and divine grace. The Sun here is on a philosophical mission.",
    career:
      "Religion, philosophy, teaching, law, publishing, travel, foreign connections, government. Any role involving the transmission of wisdom.",
    relationships:
      "Father relationship is defining and generally fortunate. Gurus and teachers play significant roles. Long-distance relationships or cross-cultural partnerships possible.",
    challenge:
      "Can become dogmatic about beliefs, may impose philosophy on others. Father may be larger-than-life or absent. Must distinguish genuine wisdom from ego-based belief.",
    gift: "Natural philosopher and teacher, blessed by fortune and dharmic alignment, strong ethical sense, ability to inspire others toward higher purpose.",
    vedic:
      "Surya in Dharma Bhava — highly auspicious. The native lives according to principles and is protected by divine grace.",
  },
  {
    planet: "Sun",
    house: 10,
    domain: "Career, Status, and Public Life",
    core: "The Sun in the 10th house is at the peak of the chart — its most powerful and visible position. This person is destined for public recognition and professional prominence.",
    career:
      "Government, executive leadership, politics, medicine, law, any high-visibility career. They reach the top of whatever field they commit to.",
    relationships:
      "Father may be a public figure or hold high status. The native's career dominates the life. Partners must accept that public life comes before private comfort.",
    challenge:
      "Workaholic tendencies, difficulty separating identity from career status. When career falters, the entire sense of self can collapse.",
    gift: "Natural executive ability, powerful public presence, career achievement beyond the norm, ability to influence large numbers of people through their work.",
    vedic:
      "Surya in Karma Bhava — perhaps the most auspicious position for career. Digbala (directional strength) in the 10th.",
  },
  {
    planet: "Sun",
    house: 11,
    domain: "Community, Networks, and Gains",
    core: "The Sun in the 11th house creates a natural community leader. Large social networks, influential friendships, and steady income from multiple sources characterize this placement.",
    career:
      "Community leadership, politics, NGOs, large organizations, technology, media. Work through networks and collective endeavors.",
    relationships:
      "Friendships are with prominent, successful people. Older siblings or mentors play important roles. The native often becomes the social hub of their circle.",
    challenge:
      "Can be too socially oriented — spreading energy across too many connections without depth. Must distinguish genuine allies from those attracted to their solar radiance.",
    gift: "Extraordinary network builder, ability to realize long-term goals through collective effort, steady financial gains, natural ability to organize communities around shared vision.",
    vedic:
      "Surya in Labha Bhava — gains and income are significant. Elder siblings are prominent.",
  },
  {
    planet: "Sun",
    house: 12,
    domain: "Liberation, Loss, and the Hidden Self",
    core: "The Sun in the 12th house retreats from public life into the realm of retreat, spirituality, and hidden work. This person does their most important work behind the scenes or in service of something transcendent.",
    career:
      "Spiritual work, hospitals, prisons, foreign countries, meditation, research, behind-the-scenes creative work. Often works in isolation or in institutions.",
    relationships:
      "Father may be absent, foreign, or connected to spiritual life. Relationships have a private, somewhat hidden quality. Foreign connections are significant.",
    challenge:
      "The ego dissolves in the 12th — there can be low vitality, difficulty asserting self, sense of invisibility or lack of recognition. The father relationship may be painful.",
    gift: "Deep spiritual sensitivity, ability to work in service without need for recognition, access to transcendent states, powerful dream life and intuitive connection to the unseen.",
    vedic:
      "Surya in Vyaya Bhava — expenses, liberation, and foreign travel are primary themes.",
  },

  // ═══════════════════════════════════════════════════════════════
  // MOON (Chandra) — Mind, mother, emotions, public, nourishment
  // ═══════════════════════════════════════════════════════════════

  {
    planet: "Moon",
    house: 1,
    domain: "Self and Emotional Identity",
    core: "The Moon in the 1st house creates a highly sensitive, emotionally expressive person whose inner world is immediately visible. The face changes with every feeling.",
    career:
      "Public life, hospitality, caregiving, food industry, counseling, any work with the public. They read audiences instinctively.",
    relationships:
      "Mother relationship is primary and often defines patterns for all relationships. Highly empathic — absorbs others' emotions. Needs emotionally nurturing partnerships.",
    challenge:
      "Emotional instability, mood swings that affect all areas of life, tendency to be too influenced by others' emotional states. The self can feel undefined without external reflection.",
    gift: "Extraordinary empathy and emotional intelligence, ability to connect with any type of person, magnetic approachability, natural caregiving instinct.",
    vedic:
      "Chandra in Lagna — the native has a beautiful, attractive appearance and a mind that is immediately visible in the face.",
  },
  {
    planet: "Moon",
    house: 2,
    domain: "Wealth, Food, and Family",
    core: "The Moon in the 2nd house creates a strong connection between emotions and resources. Food, family traditions, and financial security are deeply important to this person's sense of wellbeing.",
    career:
      "Food industry, hospitality, banking, family business, real estate, caregiving, retail. Income fluctuates with the Moon's cycles.",
    relationships:
      "Family of origin and food traditions are central to identity. The native is often the emotional and financial nurturer of the family. Voice is soft but influential.",
    challenge:
      "Emotional eating or using food/money to manage feelings. Income instability — money comes and goes. Family financial entanglements.",
    gift: "Generous with resources, ability to make others feel nourished and cared for, strong connection to family wealth and traditions, beautiful speaking voice.",
    vedic:
      "Chandra in Dhana Bhava — wealth through maternal connections and public dealings.",
  },
  {
    planet: "Moon",
    house: 3,
    domain: "Communication and Emotional Expression",
    core: "The Moon in the 3rd house creates a writer and communicator whose work is deeply emotional and resonant. They write and speak from the heart, touching people where logic cannot reach.",
    career:
      "Writing, journalism, poetry, music, counseling, social media, education. Communication that carries emotional weight.",
    relationships:
      "Sibling relationships are emotionally charged and significant. Short journeys and local community provide emotional nourishment. Communicates emotions directly.",
    challenge:
      "Emotional volatility in communication — can say things in the heat of feeling and regret them. Mind is restless and changeable. Inconsistency in commitments.",
    gift: "Poetic sensitivity in communication, ability to move others through words, versatile and adaptable mind, natural storyteller.",
    vedic:
      "Chandra in Sahaja Bhava — the mind is curious, communicative, and emotionally expressive.",
  },
  {
    planet: "Moon",
    house: 4,
    domain: "Home, Mother, and Inner Peace",
    core: "The Moon in the 4th house is in its natural home — this is one of the Moon's most powerful positions. Deep emotional roots, strong mother connection, and genuine domestic happiness are possible.",
    career:
      "Real estate, education, agriculture, psychology, hospitality, any work connected to home or land. Often works from home or in a nurturing environment.",
    relationships:
      "Mother relationship is the most defining of all relationships. Home life is the emotional center. Partner must honor the domestic realm.",
    challenge:
      "Over-attachment to the past and to mother. Difficulty leaving home psychologically even when physically away. Emotional security depends too much on external comfort.",
    gift: "Deep emotional security when home life is stable, extraordinary capacity for nurturing, strong intuition, genuine connection to ancestral wisdom.",
    vedic:
      "Chandra in Sukha Bhava — considered one of the best Moon placements. Digbala (directional strength). Happiness through home and mother.",
  },
  {
    planet: "Moon",
    house: 5,
    domain: "Creativity, Children, and Joy",
    core: "The Moon in the 5th house creates a naturally creative, playful, and emotionally expressive person. The inner child is close to the surface. Creativity flows from feeling.",
    career:
      "Arts, entertainment, teaching, childcare, creative writing, music, theater. Work where emotional spontaneity is an asset.",
    relationships:
      "Deep love of children — either has many or works with them. Romantic relationships are emotionally intense and idealized. Needs a partner who can play.",
    challenge:
      "Emotional instability in romance — falling in and out of love quickly. Over-identification with children. Can be childlike in ways that avoid adult responsibility.",
    gift: "Genuine creative joy, natural connection with children and youth, romantic warmth that others find irresistible, emotional spontaneity that makes life vivid.",
    vedic:
      "Chandra in Putra Bhava — blessed with children and creative gifts. Emotional intelligence is high.",
  },
  {
    planet: "Moon",
    house: 6,
    domain: "Service, Health, and Daily Life",
    core: "The Moon in the 6th house connects emotional wellbeing directly to daily work and health. This person processes emotions through service and is deeply affected by their work environment.",
    career:
      "Healthcare, nutrition, social work, counseling, hospitality, service industries. Work with those who are vulnerable or in need.",
    relationships:
      "Work relationships are emotionally significant. May attract emotionally needy colleagues or subordinates. Health of family members is a concern.",
    challenge:
      "Emotional absorption from work environment causes health issues. Cannot easily separate professional and personal emotional life. May sacrifice own wellbeing in service of others.",
    gift: "Extraordinary capacity for compassionate service, natural healer, ability to sense what others need before they ask, emotional resilience built through daily challenge.",
    vedic:
      "Chandra in Ripu Bhava — health fluctuates with emotional state. Service is a primary path to growth.",
  },
  {
    planet: "Moon",
    house: 7,
    domain: "Partnership and Marriage",
    core: "The Moon in the 7th house places the emotional self in the realm of partnership. This person finds their emotional completeness through relationship and is deeply affected by their partner's moods.",
    career:
      "Consulting, counseling, law, diplomacy, public-facing work, marriage counseling. Work through partnerships and collaboration.",
    relationships:
      "Marriage or primary partnership is the central emotional anchor of the life. Spouse may be nurturing, Cancerian in nature, or connected to public life. Multiple significant relationships possible.",
    challenge:
      "Emotional dependency on partners. Mood is too influenced by relationship status. Cannot find inner peace independently of what is happening in primary relationship.",
    gift: "Extraordinary partnership instinct, ability to make others feel genuinely seen and cared for in relationship, natural diplomat, emotional generosity in partnership.",
    vedic:
      "Chandra in Kalatra Bhava — spouse is caring and connected to public life. Partnership is the primary emotional path.",
  },
  {
    planet: "Moon",
    house: 8,
    domain: "Transformation and Emotional Depth",
    core: "The Moon in the 8th house dives into the deepest emotional waters. This person has access to profound psychological insight and transformative emotional experiences, but at a cost.",
    career:
      "Psychology, research, occult sciences, crisis counseling, inheritance management, hospice care. Work with death, transformation, or hidden emotional material.",
    relationships:
      "Deeply intense emotional bonds — relationships are transformative and sometimes crisis-prone. Mother relationship may be complex or involve loss. Joint resources are significant.",
    challenge:
      "Emotional turmoil, anxiety, fear of loss, tendency toward obsessive emotional patterns. The Moon is not comfortable in the 8th — the inner world can be turbulent.",
    gift: "Extraordinary psychological depth, ability to help others through crisis and transformation, access to intuitive and psychic levels of knowing, resilience forged through emotional difficulty.",
    vedic:
      "Chandra in Mrityu Bhava — the mind is drawn to hidden and transformative subjects. Emotional resilience is built through deep experience.",
  },
  {
    planet: "Moon",
    house: 9,
    domain: "Philosophy, Dharma, and Higher Mind",
    core: "The Moon in the 9th house creates a person whose emotional home is in the realm of philosophy, religion, and higher learning. They feel most nourished when exploring meaning.",
    career:
      "Teaching, philosophy, religion, foreign travel, publishing, law. Work that expands understanding and connects to higher purpose.",
    relationships:
      "Mother may be religious, philosophical, or foreign. Gurus and teachers play important emotional roles. Long-distance or cross-cultural relationships are significant.",
    challenge:
      "Can be emotionally dogmatic — feelings about beliefs are as strong as the beliefs themselves. May be restless, always seeking the next philosophical horizon.",
    gift: "Natural philosopher and wisdom-seeker, emotional nourishment through learning, ability to transmit wisdom with emotional warmth, blessed luck through dharmic alignment.",
    vedic:
      "Chandra in Dharma Bhava — the mind is philosophical and fortunate. Mother may be spiritually inclined.",
  },
  {
    planet: "Moon",
    house: 10,
    domain: "Career and Public Recognition",
    core: "The Moon in the 10th house creates a public figure whose emotional life is on display. This person is emotionally invested in their career and the public responds to their authentic feeling.",
    career:
      "Public life, politics, entertainment, social work, caregiving at scale, food industry, real estate. Career involves the public directly.",
    relationships:
      "Mother's influence on career is significant. The native may build a career around caregiving or public service. Fame or public recognition is possible.",
    challenge:
      "Career fluctuates with lunar cycles — there are visible rises and falls. Emotional wellbeing is too tied to professional status. Private life is difficult to maintain.",
    gift: "Natural public appeal, ability to emotionally connect with large audiences, career that genuinely serves public needs, strong maternal instinct applied to professional life.",
    vedic:
      "Chandra in Karma Bhava — the native is known publicly and may have fame. Career in public service.",
  },
  {
    planet: "Moon",
    house: 11,
    domain: "Community, Networks, and Fulfillment",
    core: "The Moon in the 11th house creates a person who finds emotional fulfillment through community and friendship. Large social networks and group belonging are essential to inner peace.",
    career:
      "Community work, NGOs, social media, politics, group therapy, large organizations. Work through networks and collective endeavors.",
    relationships:
      "Friendships are emotionally nourishing and numerous. Elder siblings or maternal figures in the friend group. The native is emotionally generous with their community.",
    challenge:
      "Emotional dependence on group approval. Income and emotional wellbeing fluctuate together. Must learn that the crowd's approval cannot substitute for inner peace.",
    gift: "Natural community builder, ability to create emotional safety in groups, steady income through multiple channels, fulfillment through collective achievement.",
    vedic:
      "Chandra in Labha Bhava — gains through public dealings and community connections.",
  },
  {
    planet: "Moon",
    house: 12,
    domain: "Retreat, Spirituality, and the Hidden Self",
    core: "The Moon in the 12th house creates a deeply private, spiritually sensitive person whose inner emotional life is rich and hidden. They process feelings in solitude and through dreams.",
    career:
      "Spiritual work, hospitals, retreats, foreign countries, behind-the-scenes creative work, psychology. Work in quiet, private, or institutional settings.",
    relationships:
      "Mother may be absent, foreign, or connected to spiritual life. Deep private emotional life that partners rarely fully access. Foreign connections are emotionally significant.",
    challenge:
      "Emotional isolation, difficulty expressing feelings, tendency to withdraw when hurt. Sleep may be troubled by vivid dreams. Can feel emotionally invisible.",
    gift: "Extraordinary spiritual sensitivity, rich inner emotional life, powerful dream and intuitive access, ability to find peace through solitude and spiritual practice.",
    vedic:
      "Chandra in Vyaya Bhava — the mind is drawn to solitude, spiritual practice, and foreign lands.",
  },

  // ═══════════════════════════════════════════════════════════════
  // MARS (Mangala) — Energy, courage, brothers, land, action
  // ═══════════════════════════════════════════════════════════════

  {
    planet: "Mars",
    house: 1,
    domain: "Self and Physical Vitality",
    core: "Mars in the 1st house creates a warrior personality — direct, energetic, competitive, and physically powerful. This person acts first and thinks second. Their presence is forceful.",
    career:
      "Military, sports, surgery, engineering, firefighting, entrepreneurship, competition of any kind. They excel where courage and decisive action are required.",
    relationships:
      "Intense and passionate but potentially aggressive in relationships. Can dominate partners or attract conflict. Manglik consideration in Vedic tradition.",
    challenge:
      "Aggression, impatience, accident-prone, tendency to create conflict unconsciously. The warrior energy must be channeled constructively or it turns destructive.",
    gift: "Extraordinary physical vitality and courage, natural athletic ability, pioneering energy, ability to act decisively in crisis, magnetic physical presence.",
    vedic:
      "Mangala in Lagna — Manglik placement. Strong constitution, warrior nature, potential for great achievement through self-effort.",
  },
  {
    planet: "Mars",
    house: 2,
    domain: "Wealth, Voice, and Resources",
    core: "Mars in the 2nd house drives the pursuit of wealth with aggressive energy. This person earns through their own effort and force of will. The voice is sharp and direct.",
    career:
      "Finance, real estate, construction, military contracting, competitive business, entrepreneurship. Earns through bold action and calculated risk.",
    relationships:
      "Sharp tongue in family settings — can wound with words. Family financial conflicts possible. The native fights for their family's resources.",
    challenge:
      "Impulsive spending, financial conflicts, harsh speech that damages relationships. The drive for wealth can override ethical considerations.",
    gift: "Powerful earning ability through self-effort, financial courage, ability to recover from financial setbacks, strong protective instinct toward family resources.",
    vedic:
      "Mangala in Dhana Bhava — wealth through competition and self-effort. Speech is direct and forceful.",
  },
  {
    planet: "Mars",
    house: 3,
    domain: "Communication, Courage, and Siblings",
    core: "Mars in the 3rd house is in its natural home — the house of courage and self-effort. This person is extraordinarily courageous in communication and action. They will not back down.",
    career:
      "Writing, journalism, military, athletics, sales, public speaking, entrepreneurship. The hands and voice are primary instruments.",
    relationships:
      "Sibling relationships are competitive or conflictual. The native is often the bold one in their peer group. Short-distance travel for competition or conquest.",
    challenge:
      "Aggression in communication, tendency to argue, impatience with slower thinkers, accidents involving hands or short journeys.",
    gift: "Extraordinary courage in expression, natural athletic ability, remarkable self-reliance, ability to act independently and effectively under pressure.",
    vedic:
      "Mangala in Sahaja Bhava — one of Mars's best positions. Self-effort and courage bring success.",
  },
  {
    planet: "Mars",
    house: 4,
    domain: "Home, Mother, and Emotional Foundation",
    core: "Mars in the 4th house brings conflict and intensity to the home. The native may have grown up in a household with conflict or a strong, forceful mother. Home is a battleground or a fortress.",
    career:
      "Real estate, construction, military, engineering, agriculture, mining. Work connected to land and property.",
    relationships:
      "Domestic conflicts are likely. The home may feel unsafe or in need of protection. Mother relationship is intense and possibly combative. Manglik consideration.",
    challenge:
      "Conflict in the home, difficulty finding inner peace, tendency to create domestic turbulence. The 4th house Mars requires conscious effort to create domestic harmony.",
    gift: "Fierce protectiveness of home and family, ability to build and defend a physical domain, practical competence in the domestic realm, courage in private life.",
    vedic:
      "Mangala in Sukha Bhava — property and land acquisitions are possible. Domestic life requires conscious work.",
  },
  {
    planet: "Mars",
    house: 5,
    domain: "Creativity, Children, and Intelligence",
    core: "Mars in the 5th house creates a competitive, passionate, and sometimes impulsive approach to creativity, romance, and speculation. The native plays hard and loves hard.",
    career:
      "Sports, entertainment, competitive games, stock trading, military strategy, teaching. Creative work with an edge.",
    relationships:
      "Passionate and intense romantic life. May have conflicts around children. First romantic relationships are often dramatic. Competitive rather than cooperative in love.",
    challenge:
      "Impulsive in romance and speculation, gambling tendencies, conflicts with children, tendency to dominate creative partners.",
    gift: "Passionate creative fire, athletic and competitive excellence, intense romantic magnetism, courageous self-expression, strong protective instinct toward children.",
    vedic:
      "Mangala in Putra Bhava — competitive intelligence and passionate creativity. Children may have strong personalities.",
  },
  {
    planet: "Mars",
    house: 6,
    domain: "Service, Health, and Competition",
    core: "Mars in the 6th house is one of its most powerful positions — the warrior in the house of enemies and competition. This person defeats obstacles, wins legal battles, and excels in service.",
    career:
      "Military, medicine, law, sports, surgery, competitive business, social activism. Any field requiring the defeat of opposition.",
    relationships:
      "Work relationships may be competitive. The native attracts and defeats rivals. Health of siblings may be a concern.",
    challenge:
      "Health issues related to Mars — inflammation, accidents, blood pressure. Work conflicts. The need to fight must be channeled or it becomes self-destructive.",
    gift: "Extraordinary competitive ability, natural enemy-defeater, exceptional stamina and physical resilience, ability to win legal and professional battles.",
    vedic:
      "Mangala in Ripu Bhava — one of Mars's best positions. Victory over enemies and competitors. Strong constitution.",
  },
  {
    planet: "Mars",
    house: 7,
    domain: "Partnership and Marriage",
    core: "Mars in the 7th house creates passionate but potentially turbulent partnerships. The spouse is often strong-willed, Martian in nature, or the relationship itself becomes a field of competition.",
    career:
      "Business partnerships, law, negotiation, public-facing competitive work. Work through one-on-one relationships.",
    relationships:
      "Marriage may be delayed or challenged. Spouse is dynamic, independent, and potentially argumentative. Manglik consideration — requires careful compatibility assessment.",
    challenge:
      "Conflict in marriage, dominance battles with partners, tendency to choose partners who mirror Martian energy (which creates clashes). Multiple relationships possible.",
    gift: "Passionate partnership energy, ability to build a strong working relationship with a compatible partner, natural negotiation skill, courage in public dealings.",
    vedic:
      "Mangala in Kalatra Bhava — Manglik placement. Marriage requires careful consideration of compatibility.",
  },
  {
    planet: "Mars",
    house: 8,
    domain: "Transformation and Hidden Power",
    core: "Mars in the 8th house is a powerful and dangerous placement. The native has access to occult power, transformation energy, and the ability to regenerate after crisis — but also faces significant life challenges.",
    career:
      "Surgery, research, occult sciences, crisis management, military intelligence, investigation. Work with hidden or dangerous material.",
    relationships:
      "Transformative relationships that change both people fundamentally. Joint resources are contested. Inheritance or insurance may be significant.",
    challenge:
      "Longevity concerns in traditional texts. Accidents, violence, or sudden crisis are possible. The 8th house Mars requires conscious channeling of intense energy.",
    gift: "Access to regenerative power beyond the norm, ability to survive what would destroy others, penetrating insight into hidden matters, transformation through crisis.",
    vedic:
      "Mangala in Mrityu Bhava — requires careful life management. Occult ability and transformative power are available.",
  },
  {
    planet: "Mars",
    house: 9,
    domain: "Dharma, Father, and Higher Purpose",
    core: "Mars in the 9th house creates a crusader — someone who fights for their beliefs and defends their philosophy with warrior energy. Religion and ethics become competitive arenas.",
    career:
      "Law, religion, military chaplaincy, philosophy, international business, expedition work. Fighting for dharmic causes.",
    relationships:
      "Father relationship may be conflictual or the father is a warrior/defender figure. Gurus or teachers may clash with the native's independent spirit.",
    challenge:
      "Religious or philosophical fanaticism, tendency to impose beliefs, conflict with authority figures over principles. The native may crusade at personal cost.",
    gift: "Courageous defender of principles, ability to fight for what is right regardless of consequence, adventurous spirit, physical courage in pursuit of higher goals.",
    vedic:
      "Mangala in Dharma Bhava — dharmic warrior. Fights for truth and higher principles.",
  },
  {
    planet: "Mars",
    house: 10,
    domain: "Career and Public Achievement",
    core: "Mars in the 10th house places warrior energy at the peak of the chart. This person is driven to achieve public recognition and professional dominance. They compete to win.",
    career:
      "Military, surgery, engineering, sports, politics, executive leadership, any highly competitive field. They climb to the top through courage and decisive action.",
    relationships:
      "Career dominates the personal life. May attract competition from peers. Professional ambition can strain domestic relationships.",
    challenge:
      "Aggression in professional settings, tendency to create enemies at work, impatience with slower organizational processes. The drive to dominate must be tempered.",
    gift: "Extraordinary professional drive and competitive edge, natural executive courage, ability to take bold action when others hesitate, career achievements that exceed the norm.",
    vedic:
      "Mangala in Karma Bhava — one of Mars's strongest career positions. Professional achievement through courage and competition.",
  },
  {
    planet: "Mars",
    house: 11,
    domain: "Community, Networks, and Gains",
    core: "Mars in the 11th house channels competitive energy into community leadership and income generation. This person earns aggressively and builds networks through bold social action.",
    career:
      "Community organizing, political activism, competitive business networks, technology, sports organizations. Income through multiple competitive channels.",
    relationships:
      "Competitive friendships — the social circle includes rivals as well as allies. Elder siblings may be in military or competitive fields.",
    challenge:
      "Conflict within friend groups, tendency to dominate social networks, income instability from overly aggressive financial strategies.",
    gift: "Strong income through self-effort, ability to lead and organize communities toward action, competitive social intelligence, achievement of long-term goals through persistent effort.",
    vedic:
      "Mangala in Labha Bhava — income through competition and courage. Elder siblings are significant.",
  },
  {
    planet: "Mars",
    house: 12,
    domain: "Retreat, Liberation, and Hidden Action",
    core: "Mars in the 12th house operates in hidden or behind-the-scenes ways. The warrior energy is either directed toward spiritual practice and liberation, or it manifests as hidden aggression and self-sabotage.",
    career:
      "Spiritual practice, foreign work, hospitals, prisons, research, behind-the-scenes operations, military intelligence. Action in private or institutional settings.",
    relationships:
      "Hidden conflicts in relationships. The native may have hidden anger or aggression that surfaces unexpectedly. Foreign romantic connections possible.",
    challenge:
      "Hidden enemies, self-undermining behavior, expenses outpacing income, sleep disturbances from suppressed anger. The warrior energy must find constructive outlet.",
    gift: "Ability to work effectively in secrecy or behind the scenes, spiritual warrior energy, courage in retreat and spiritual practice, foreign adventures.",
    vedic:
      "Mangala in Vyaya Bhava — expenses are high. Foreign lands or spiritual practice are where the energy finds its best expression.",
  },

  // ═══════════════════════════════════════════════════════════════
  // MERCURY (Budha) — Intelligence, communication, trade, skill
  // ═══════════════════════════════════════════════════════════════

  {
    planet: "Mercury",
    house: 1,
    domain: "Self and Intelligence",
    core: "Mercury in the 1st house creates a person who is defined by their intelligence and communication. Quick-witted, curious, and verbally skilled, they process the world through analysis.",
    career:
      "Writing, teaching, journalism, consulting, technology, linguistics, law. Any field where mental agility and communication are primary tools.",
    relationships:
      "Needs intellectually stimulating partners. Communicates feelings through analysis rather than emotion. Can talk their way into and out of anything.",
    challenge:
      "Over-intellectualization of everything including emotions, nervous energy, inconsistency, tendency to analyze rather than feel.",
    gift: "Extraordinary intelligence and communication ability, natural teacher, versatile and adaptable mind, ability to learn anything quickly.",
    vedic:
      "Budha in Lagna — intelligent, educated, skilled in multiple fields. Youthful appearance throughout life.",
  },
  {
    planet: "Mercury",
    house: 2,
    domain: "Wealth, Speech, and Values",
    core: "Mercury in the 2nd house creates a skilled orator and financial mind. This person earns through their intelligence and words. They have a gift for trade, negotiation, and financial analysis.",
    career:
      "Finance, trading, teaching, writing, public speaking, law, accounting. The voice and mind are primary earning instruments.",
    relationships:
      "Family communication is important — the native is often the family spokesperson or mediator. Earns well and spends wisely.",
    challenge:
      "May use words to deceive in financial matters. Can be too calculating about emotional value. Financial instability from over-intellectualizing money decisions.",
    gift: "Natural trading and negotiation ability, skilled financial mind, eloquent speaker, ability to earn through multiple mental channels simultaneously.",
    vedic:
      "Budha in Dhana Bhava — wealth through trade, education, and communication.",
  },
  {
    planet: "Mercury",
    house: 3,
    domain: "Communication and Skill",
    core: "Mercury in the 3rd house is in its natural sign of Gemini territory — this is one of Mercury's most powerful positions. The native is an extraordinary communicator, writer, and teacher.",
    career:
      "Writing, journalism, teaching, broadcasting, marketing, trade, crafts. Any field where mental dexterity and communication are prized.",
    relationships:
      "Sibling relationships are intellectually stimulating and significant. The native is the communicator of the family. Short travels for learning and trade.",
    challenge:
      "Mental restlessness, inability to stay in one intellectual territory, superficiality from spreading attention too widely.",
    gift: "Extraordinary writing and speaking ability, versatile intelligence, manual dexterity, natural ability to learn and teach simultaneously.",
    vedic:
      "Budha in Sahaja Bhava — one of Mercury's best positions. Master communicator and skilled craftsperson.",
  },
  {
    planet: "Mercury",
    house: 4,
    domain: "Home, Education, and Inner Mind",
    core: "Mercury in the 4th house connects the analytical mind to home, roots, and emotional foundation. This person thinks deeply about their origins and often works or studies from home.",
    career:
      "Education, psychology, real estate, working from home, writing, family business. Mental work in private or domestic settings.",
    relationships:
      "Home is an intellectual sanctuary. Mother relationship involves communication and education. Family discussions are intellectually oriented.",
    challenge:
      "Overthinking about home and emotional security. May intellectualize emotions rather than feeling them. Mental restlessness in private life.",
    gift: "Sharp analytical mind applied to home and family matters, natural educator within the family, ability to create intellectually stimulating domestic environments.",
    vedic:
      "Budha in Sukha Bhava — educated, intelligent, loves learning. Home is a place of intellectual activity.",
  },
  {
    planet: "Mercury",
    house: 5,
    domain: "Creativity and Intelligence",
    core: "Mercury in the 5th house creates a brilliantly creative and intellectually playful person. They think in games, puzzles, and creative problems. Intelligence is their primary creative medium.",
    career:
      "Creative writing, games, puzzles, education, entertainment, stock trading, child education. Creative work with intellectual content.",
    relationships:
      "Romantic attraction to intelligent partners. Communicative and playful in love. Children are intellectually gifted. Love is expressed through wit.",
    challenge:
      "Over-intellectualization in romance, difficulty with emotional spontaneity, speculative tendencies in finance.",
    gift: "Creative brilliance through intelligence, natural teacher and storyteller, playful mind, ability to make complex ideas entertaining.",
    vedic:
      "Budha in Putra Bhava — intelligent children, creative intelligence, gift for games and strategy.",
  },
  {
    planet: "Mercury",
    house: 6,
    domain: "Service, Health, and Work",
    core: "Mercury in the 6th house creates a skilled analyst of problems — health, work, and service issues are approached with precision and intelligence.",
    career:
      "Medicine, law, accounting, health consulting, editing, writing for service industries. Analytical work in service settings.",
    relationships:
      "Work relationships are intellectually engaged. The native is the smart problem-solver in the workplace. Health discussions are significant.",
    challenge:
      "Hypochondria, overthinking health matters, excessive mental energy spent on daily work concerns, conflict with coworkers through sharp speech.",
    gift: "Extraordinary analytical ability applied to practical problems, natural diagnostician, skill in health, legal, and service matters, efficient and precise in daily work.",
    vedic:
      "Budha in Ripu Bhava — skilled in defeating arguments and winning disputes. Health through mental discipline.",
  },
  {
    planet: "Mercury",
    house: 7,
    domain: "Partnership and Communication",
    core: "Mercury in the 7th house places communicative intelligence in the realm of partnership. This person seeks intellectual peers as partners and processes relationships through discussion.",
    career:
      "Law, diplomacy, consulting, counseling, public relations, business partnerships. Work through communication and negotiation.",
    relationships:
      "Intellectual compatibility is essential in partnerships. Spouse may be a teacher, writer, or communicator. Relationships are sustained through conversation.",
    challenge:
      "Over-analysis of relationships, tendency to intellectualize rather than feel, multiple relationships or delayed commitment from too much thinking.",
    gift: "Natural diplomat and negotiator, ability to communicate across differences, partnerships that are intellectually stimulating and growth-oriented.",
    vedic:
      "Budha in Kalatra Bhava — spouse is intelligent and communicative. Partnership through shared intellectual interests.",
  },
  {
    planet: "Mercury",
    house: 8,
    domain: "Research and Hidden Knowledge",
    core: "Mercury in the 8th house creates an investigative mind drawn to secrets, hidden knowledge, and the depths of psychology. This person thinks about what others refuse to examine.",
    career:
      "Research, investigation, psychology, occult, tax, insurance, writing about taboo subjects. Any field requiring penetration of hidden material.",
    relationships:
      "Communication in relationships tends to go deep — surface talk is unsatisfying. May uncover hidden truths in relationships that others prefer buried.",
    challenge:
      "Obsessive thinking about dark or hidden subjects, anxiety, tendency to uncover secrets that create conflict, nervous system issues.",
    gift: "Penetrating investigative intelligence, natural researcher and psychologist, ability to communicate about difficult topics with precision, access to hidden knowledge.",
    vedic:
      "Budha in Mrityu Bhava — occult intelligence, research ability, and penetrating insight.",
  },
  {
    planet: "Mercury",
    house: 9,
    domain: "Philosophy and Higher Learning",
    core: "Mercury in the 9th house creates a philosopher and teacher of philosophy. The mind seeks ultimate truths and communicates them with precision and depth.",
    career:
      "Teaching, philosophy, law, publishing, translation, religious education, international business. Transmission of wisdom across cultures.",
    relationships:
      "Father relationship involves communication and education. Gurus and teachers are significant intellectual relationships. Cross-cultural friendships.",
    challenge:
      "Intellectual arrogance about philosophical positions, tendency to debate rather than embody wisdom, restlessness from always seeking the next idea.",
    gift: "Natural philosopher and wisdom-transmitter, ability to understand and communicate across philosophical traditions, multilingual potential, travel for learning.",
    vedic:
      "Budha in Dharma Bhava — philosophical mind, natural teacher, fortunate through education and dharmic work.",
  },
  {
    planet: "Mercury",
    house: 10,
    domain: "Career and Public Reputation",
    core: "Mercury in the 10th house creates a career built on communication and intelligence. This person is publicly known for their mind and their ability to articulate complex realities.",
    career:
      "Writing, journalism, teaching, politics, law, technology, consulting. Career through the public expression of intelligence.",
    relationships:
      "Career reputation is for intelligence and communication skill. May be publicly known as a writer, teacher, or communicator.",
    challenge:
      "Career instability from mercurial changes, tendency to scatter professional energy across too many directions, reputation for cleverness can overshadow depth.",
    gift: "Natural public intellectual, career that leverages communication and intelligence, ability to adapt professionally to changing circumstances, public recognition for mental gifts.",
    vedic:
      "Budha in Karma Bhava — career through communication and intelligence. Public recognition for mental achievements.",
  },
  {
    planet: "Mercury",
    house: 11,
    domain: "Community and Networks",
    core: "Mercury in the 11th house creates a networker and community connector. This person builds and manages information networks and earns through communication with large groups.",
    career:
      "Technology, media, publishing, community organizing, teaching large groups, social media, trade networks. Work through information and community.",
    relationships:
      "Friendships are intellectually stimulating and numerous. The native is the information hub of their social circle. Elder siblings are communicative and intelligent.",
    challenge:
      "Superficiality in friendships — many contacts but few deep connections. Income instability from scattered mental energy.",
    gift: "Natural connector and information networker, ability to earn through multiple communication channels, intelligence about community trends, fulfillment through intellectual community.",
    vedic:
      "Budha in Labha Bhava — income through communication and trade networks. Intelligent elder siblings.",
  },
  {
    planet: "Mercury",
    house: 12,
    domain: "Spiritual Intelligence and Hidden Knowledge",
    core: "Mercury in the 12th house creates an inner philosopher and spiritual writer. The mind works best in solitude, in dream states, or in foreign environments. Hidden intelligence.",
    career:
      "Spiritual writing, foreign language work, research, hospitals, behind-the-scenes intellectual work, translation, meditation. Private intellectual life.",
    relationships:
      "Private intellectual life that partners may not fully access. Foreign or spiritual connections. Communication is more powerful in writing than in speech.",
    challenge:
      "Difficulty communicating effectively in person, tendency toward mental isolation, scattered focus, possible deception in communication.",
    gift: "Extraordinary inner mental life, access to spiritual and intuitive intelligence, natural ability with foreign languages and cultures, powerful writing from solitude.",
    vedic:
      "Budha in Vyaya Bhava — spiritual intelligence, foreign connections, inner philosophical life.",
  },

  // ═══════════════════════════════════════════════════════════════
  // VENUS (Shukra) — Love, beauty, luxury, arts, relationships
  // ═══════════════════════════════════════════════════════════════

  {
    planet: "Venus",
    house: 1,
    domain: "Self, Beauty, and Charm",
    core: "Venus in the 1st house creates a naturally beautiful, charming, and artistically inclined person. Their presence radiates grace and others are drawn to them effortlessly.",
    career:
      "Arts, beauty industry, fashion, luxury goods, entertainment, diplomacy. Any field where aesthetic sense and personal charm are assets.",
    relationships:
      "Extremely attractive and magnetic in romantic contexts. Must be careful not to use charm manipulatively. Relationships are central to identity.",
    challenge:
      "Vanity, over-dependence on being liked, tendency to avoid conflict through false harmony, indulgence in pleasure at expense of discipline.",
    gift: "Natural beauty and grace, extraordinary charm, artistic talent, ability to create beauty and harmony in all environments, genuine love of life's pleasures.",
    vedic:
      "Shukra in Lagna — beautiful appearance, artistic nature, love of luxury. Very attractive to others.",
  },
  {
    planet: "Venus",
    house: 2,
    domain: "Wealth, Beauty, and Voice",
    core: "Venus in the 2nd house creates wealth through beauty, art, and charm. The voice is musical and pleasing. Resources flow toward aesthetic experiences and luxury.",
    career:
      "Arts, luxury goods, food, beauty industry, banking, singing, entertainment. Earns through beauty and charm.",
    relationships:
      "Family life is aesthetically oriented and harmonious. The native is generous with family resources. Voice is beautiful and persuasive.",
    challenge:
      "Overspending on luxury and pleasure, valuing people for their material worth, superficiality in family relationships.",
    gift: "Natural wealth accumulation through Venus-ruled activities, beautiful voice, generous family spirit, ability to create beautiful and abundant domestic environments.",
    vedic:
      "Shukra in Dhana Bhava — wealth through Venus-ruled work. Beautiful family life and voice.",
  },
  {
    planet: "Venus",
    house: 3,
    domain: "Arts, Communication, and Siblings",
    core: "Venus in the 3rd house creates an artistically expressive communicator. Writing, music, and all forms of aesthetic expression are natural gifts.",
    career:
      "Creative writing, music, arts, media, advertising, public relations. Communication with beauty and persuasion.",
    relationships:
      "Sibling relationships are harmonious and mutually supportive. Short journeys for pleasure and art. Communication is charming and artistic.",
    challenge:
      "Superficiality in communication, using charm to avoid difficult conversations, over-dependence on sibling relationships.",
    gift: "Natural artistic communicator, beautiful writer or speaker, ability to bring grace and harmony to communication, skilled at persuasion through charm.",
    vedic:
      "Shukra in Sahaja Bhava — artistic communication, harmonious sibling relationships.",
  },
  {
    planet: "Venus",
    house: 4,
    domain: "Home, Beauty, and Inner Peace",
    core: "Venus in the 4th house creates a beautiful home and deep domestic happiness. The native invests in creating an aesthetically perfect domestic environment. Mother is gracious and beautiful.",
    career:
      "Interior design, real estate, hospitality, arts connected to home, education. Work that creates beautiful environments.",
    relationships:
      "Home life is harmonious and aesthetically cultivated. Mother relationship is loving and gracious. The domestic realm is a source of genuine happiness.",
    challenge:
      "Over-investment in material comfort and domestic beauty, difficulty leaving home, attachment to luxury that impedes growth.",
    gift: "Extraordinary domestic happiness, ability to create beautiful sanctuaries, harmonious family relationships, genuine inner peace through aesthetic cultivation of home.",
    vedic:
      "Shukra in Sukha Bhava — domestic happiness, beautiful home, loving mother.",
  },
  {
    planet: "Venus",
    house: 5,
    domain: "Creativity, Romance, and Joy",
    core: "Venus in the 5th house is in its most joyful position — creativity, romance, and pleasure all flourish here. This person is a natural artist and lover who lives for beauty and joy.",
    career:
      "Arts, entertainment, creative industry, teaching, romance writing, luxury goods. Work that is genuinely pleasurable.",
    relationships:
      "Rich romantic life with genuine depth of feeling. Children are artistic and beautiful. Love is expressed through creative acts and shared pleasure.",
    challenge:
      "Over-indulgence in pleasure, romantic idealism leading to disappointment, speculative financial losses from love of risk.",
    gift: "Natural artistic genius, rich and joyful romantic life, ability to inspire others through creative expression, genuine joie de vivre.",
    vedic:
      "Shukra in Putra Bhava — artistic gifts, beautiful children, joyful romantic life.",
  },
  {
    planet: "Venus",
    house: 6,
    domain: "Service, Health, and Work Relationships",
    core: "Venus in the 6th house brings beauty and harmony to service and work environments. This person creates aesthetic workplaces and heals through beauty.",
    career:
      "Healthcare (especially aesthetic medicine), beauty industry, service work, healing arts, nutrition, fashion. Work in service of health and beauty.",
    relationships:
      "Work relationships are harmonious and may become romantic. The native is popular in the workplace. Health through beauty practices.",
    challenge:
      "Venus is not entirely comfortable in the 6th — indulgence can affect health. Romantic relationships with coworkers create complications.",
    gift: "Natural workplace harmonizer, ability to bring beauty to service work, health through aesthetic practices, popular and well-liked by colleagues.",
    vedic:
      "Shukra in Ripu Bhava — harmony in work environment. Health through beauty and pleasure.",
  },
  {
    planet: "Venus",
    house: 7,
    domain: "Partnership and Marriage",
    core: "Venus in the 7th house is one of the best placements for partnership and marriage. The native attracts beautiful, artistic, and harmonious partners and genuinely thrives in relationship.",
    career:
      "Law, diplomacy, public relations, partnership-based business, arts. Work through beautiful partnerships.",
    relationships:
      "Marriage is generally blessed — the spouse is attractive, artistic, and loving. Business partnerships are harmonious. Public dealings are graceful.",
    challenge:
      "May idealize partners beyond what is real, over-dependence on partnership for happiness, difficulty with conflict in relationships.",
    gift: "Extraordinary partnership luck, ability to create lasting and beautiful relationships, natural diplomat, public grace and charm.",
    vedic:
      "Shukra in Kalatra Bhava — one of the best placements for marriage. Beautiful and loving spouse.",
  },
  {
    planet: "Venus",
    house: 8,
    domain: "Transformation and Shared Resources",
    core: "Venus in the 8th house creates deep, transformative romantic and financial connections. Relationships involve shared resources and profound emotional depth.",
    career:
      "Arts connected to transformation, beauty industry, inheritance, luxury goods, occult arts, psychology. Work with shared resources.",
    relationships:
      "Deeply intense romantic bonds that transform both people. Inheritance or partner's wealth is significant. Relationships have a quality of beauty within darkness.",
    challenge:
      "Possessiveness in relationships, financial entanglements with partners, tendency to experience loss through love or luxury.",
    gift: "Deep capacity for transformative love, access to beauty within darkness, benefit through inheritance or partners' resources, artistic depth that others cannot match.",
    vedic:
      "Shukra in Mrityu Bhava — longevity is supported. Transformative beauty and depth in relationships.",
  },
  {
    planet: "Venus",
    house: 9,
    domain: "Dharma, Beauty, and Higher Truth",
    core: "Venus in the 9th house creates a person who finds beauty in philosophy, religion, and higher truth. They are drawn to the aesthetic dimensions of spiritual life.",
    career:
      "Religious arts, philosophy, international luxury trade, travel, law, teaching. Work where beauty and wisdom intersect.",
    relationships:
      "Father is gracious and artistic. Guru relationships involve beauty and aesthetic wisdom. Cross-cultural romantic connections possible.",
    challenge:
      "Indulgence in philosophical luxury, tendency to seek pleasure rather than genuine wisdom, romantic idealism applied to spiritual teachers.",
    gift: "Natural sense for the beauty within truth, ability to make philosophy and religion accessible and beautiful, fortunate through travel and cross-cultural connections.",
    vedic:
      "Shukra in Dharma Bhava — dharmic beauty, fortune through Venus-ruled higher work.",
  },
  {
    planet: "Venus",
    house: 10,
    domain: "Career and Public Beauty",
    core: "Venus in the 10th house creates a career built on beauty, art, and charm. This person is publicly recognized for their aesthetic gifts and gracious manner.",
    career:
      "Arts, entertainment, fashion, luxury goods, diplomacy, public relations, beauty industry. Career through public aesthetic expression.",
    relationships:
      "Career is characterized by grace and beauty. Professional relationships are harmonious. May find romantic connections through career.",
    challenge:
      "Career can be too dependent on maintaining a beautiful image. May prioritize being liked over being effective. Venus in the 10th can indicate multiple marriages in traditional texts.",
    gift: "Natural career success through charm and beauty, public recognition for artistic gifts, gracious professional manner, ability to make work feel like pleasure.",
    vedic:
      "Shukra in Karma Bhava — career success through Venus-ruled activities. Public recognition for beauty and art.",
  },
  {
    planet: "Venus",
    house: 11,
    domain: "Community, Gains, and Social Harmony",
    core: "Venus in the 11th house creates a socially brilliant and financially fortunate person. Income flows easily and the social circle is filled with beautiful, artistic people.",
    career:
      "Social work with an aesthetic dimension, luxury networks, arts community, entertainment business, social media. Work through beautiful networks.",
    relationships:
      "Friendships are harmonious and with artistically or aesthetically oriented people. Elder siblings are attractive and supportive. Income through beauty-related work.",
    challenge:
      "Superficial social connections, over-spending in social contexts, using charm to maintain popularity rather than building genuine community.",
    gift: "Natural social grace, ability to build harmonious and productive networks, steady income through Venus-ruled work, genuine fulfillment through beautiful community.",
    vedic:
      "Shukra in Labha Bhava — wealth and social harmony. Beautiful social life and steady income.",
  },
  {
    planet: "Venus",
    house: 12,
    domain: "Spiritual Beauty and Hidden Love",
    core: "Venus in the 12th house creates a person whose deepest love is private, spiritual, or hidden. They may have secret relationships or find love in foreign lands or spiritual settings.",
    career:
      "Spiritual arts, foreign work, hospitals, behind-the-scenes creative work, meditation retreat centers. Beauty in private or institutional settings.",
    relationships:
      "Love relationships may be secret, foreign, or spiritually oriented. The deepest emotional life is private. Great capacity for self-giving love in spiritual contexts.",
    challenge:
      "Hidden relationships causing complications, high expenses on pleasure and luxury, tendency to retreat from love rather than engage directly.",
    gift: "Extraordinary capacity for unconditional love, natural spiritual aesthete, beauty in solitude and retreat, ability to find the sacred in all of life's pleasures.",
    vedic:
      "Shukra in Vyaya Bhava — expenditure on pleasure and beauty. Spiritual love and hidden romantic connections.",
  },

  // ═══════════════════════════════════════════════════════════════
  // JUPITER (Guru) — Wisdom, expansion, dharma, teacher, fortune
  // ═══════════════════════════════════════════════════════════════

  {
    planet: "Jupiter",
    house: 1,
    domain: "Self and Wisdom",
    core: "Jupiter in the 1st house creates a naturally wise, expansive, and fortunate personality. This person carries an aura of benevolence and others seek their guidance.",
    career:
      "Teaching, philosophy, law, religion, medicine, counseling. Any field where wisdom and expansive thinking are valued.",
    relationships:
      "Generous and wise in relationships. Partners are drawn to their philosophical depth. May attract people seeking guidance.",
    challenge:
      "Over-expansion, weight gain, tendency toward excess, can be preachy or over-confident in their wisdom.",
    gift: "Natural wisdom and fortune, expansive mind, genuine benevolence, ability to inspire and guide others toward higher understanding.",
    vedic:
      "Guru in Lagna — wise, fortunate, generous, and spiritually inclined. Often physically large or commanding.",
  },
  {
    planet: "Jupiter",
    house: 2,
    domain: "Wealth and Wisdom",
    core: "Jupiter in the 2nd house creates genuine wealth and financial abundance. The voice carries wisdom and authority. Family life is expansive and fortunate.",
    career:
      "Finance, teaching, law, philosophy, banking, luxury goods. Earns through wisdom and knowledge.",
    relationships:
      "Family of origin is educated and fortunate. The native is generous with family resources. Voice carries natural authority.",
    challenge:
      "Over-spending from excessive generosity, over-confidence about financial matters, tendency to accumulate without discernment.",
    gift: "Natural wealth accumulation, generous financial spirit, authoritative and wise voice, fortunate family connections.",
    vedic:
      "Guru in Dhana Bhava — significant wealth and financial wisdom. Generous family life.",
  },
  {
    planet: "Jupiter",
    house: 3,
    domain: "Communication and Wisdom Transmission",
    core: "Jupiter in the 3rd house creates a wise communicator and teacher. Writing and speaking carry philosophical depth and genuine wisdom that transforms audiences.",
    career:
      "Writing, teaching, publishing, journalism, philosophy, law. Communication that carries genuine wisdom.",
    relationships:
      "Sibling relationships are fortunate and expansive. Short journeys lead to wisdom. The native teaches through conversation.",
    challenge:
      "Over-expansion in communication, tendency to lecture rather than converse, restless philosophical mind.",
    gift: "Natural wisdom-transmitter, ability to teach through all forms of communication, fortunate sibling relationships, philosophical depth in expression.",
    vedic:
      "Guru in Sahaja Bhava — philosophical communication, fortunate siblings, wisdom through short journeys.",
  },
  {
    planet: "Jupiter",
    house: 4,
    domain: "Home, Mother, and Inner Fortune",
    core: "Jupiter in the 4th house creates a fortunate home life and deep emotional wisdom. The mother is wise and benevolent. The inner life is rich with philosophical understanding.",
    career:
      "Education, real estate, agriculture, philosophy, hospitality. Work connected to home and wisdom.",
    relationships:
      "Mother relationship is fortunate and philosophically rich. Home is a place of wisdom and abundance. Domestic life is genuinely happy.",
    challenge:
      "Over-attachment to comfort of home, expansive domestic expenses, tendency to expand the home beyond practical necessity.",
    gift: "Deep domestic happiness, wise and benevolent mother relationship, rich inner philosophical life, fortune through property and land.",
    vedic:
      "Guru in Sukha Bhava — fortunate home life, wise mother, genuine domestic happiness.",
  },
  {
    planet: "Jupiter",
    house: 5,
    domain: "Creativity, Children, and Intelligence",
    core: "Jupiter in the 5th house is one of its most powerful positions — the Panchamesh in the fifth creates profound intelligence, fortunate children, and genuine creative gifts.",
    career:
      "Teaching, creative arts, entertainment, philosophy, education, speculation. Work through creative intelligence.",
    relationships:
      "Children are extraordinarily gifted and bring great joy. Romantic life is fortunate and philosophically oriented. Love is generous and wise.",
    challenge:
      "Excess in pleasure and speculation, over-confidence in creative or romantic matters, too many children or responsibilities.",
    gift: "Brilliant creative intelligence, fortunate children, wise romantic nature, natural teacher of the young, genuine philosophical creativity.",
    vedic:
      "Guru in Putra Bhava — highly auspicious. Gifted and fortunate children. Deep intelligence and creative wisdom.",
  },
  {
    planet: "Jupiter",
    house: 6,
    domain: "Service and Healing",
    core: "Jupiter in the 6th house creates a wise healer and compassionate servant. The native defeats enemies through wisdom rather than force and heals others through generous service.",
    career:
      "Medicine, law, social work, healing arts, teaching in service contexts. Work that combines wisdom with service.",
    relationships:
      "Work relationships are fortunate. The native is respected by colleagues. Defeats enemies through wisdom and magnanimity.",
    challenge:
      "Jupiter in the 6th can create challenges with weight and liver. Over-expansion in service leading to burnout.",
    gift: "Natural healer and wise servant, ability to defeat obstacles through philosophical understanding, generous and compassionate in service, fortunate with health overall.",
    vedic:
      "Guru in Ripu Bhava — defeats enemies through wisdom. Healing and service are primary expressions.",
  },
  {
    planet: "Jupiter",
    house: 7,
    domain: "Partnership and Wisdom",
    core: "Jupiter in the 7th house creates fortunate partnerships and a wise, expansive spouse. Marriage is generally blessed with wisdom, growth, and mutual philosophical development.",
    career:
      "Law, diplomacy, counseling, consulting, partnership-based business. Work through wise partnerships.",
    relationships:
      "Spouse is wise, generous, and philosophically oriented. Marriage brings expansion and fortune. Business partnerships are fortunate.",
    challenge:
      "Tendency to over-idealize partners, may attract partners who are too expansive or too philosophical for practical partnership.",
    gift: "Extraordinary partnership fortune, wise and generous spouse, natural diplomat, ability to grow through partnership.",
    vedic:
      "Guru in Kalatra Bhava — fortunate marriage, wise spouse, growth through partnership.",
  },
  {
    planet: "Jupiter",
    house: 8,
    domain: "Transformation and Hidden Wisdom",
    core: "Jupiter in the 8th house creates a person with access to occult wisdom and transformative philosophical understanding. Longevity is supported and death may come peacefully.",
    career:
      "Research, occult sciences, philosophy of death and transformation, inheritance management, psychology. Hidden wisdom work.",
    relationships:
      "Benefit through partner's resources or inheritance. Transformative relationships that expand philosophical understanding.",
    challenge:
      "Can become obsessed with occult or dark philosophical matters, over-expansion in joint financial matters.",
    gift: "Access to profound occult and transformative wisdom, longevity, benefit through inheritance, philosophical depth about life's deepest mysteries.",
    vedic:
      "Guru in Mrityu Bhava — longevity, occult wisdom, benefit through inheritance.",
  },
  {
    planet: "Jupiter",
    house: 9,
    domain: "Dharma and Highest Fortune",
    core: "Jupiter in the 9th house is one of the most fortunate placements possible — Jupiter in its own house of dharma creates a naturally wise, fortunate, and spiritually guided person.",
    career:
      "Philosophy, religion, law, teaching, publishing, foreign connections. Work that transmits wisdom and upholds dharma.",
    relationships:
      "Father relationship is fortunate and philosophically rich. Gurus play transformative roles. Long-distance and foreign connections are blessed.",
    challenge:
      "Dogmatism, tendency to impose philosophy, over-confidence in own righteousness.",
    gift: "Extraordinary philosophical wisdom and fortune, natural teacher and spiritual guide, blessed through dharmic alignment, fortunate father relationship.",
    vedic:
      "Guru in Dharma Bhava — one of the most auspicious placements. Dharmic wisdom, fortune, and spiritual guidance.",
  },
  {
    planet: "Jupiter",
    house: 10,
    domain: "Career and Dharmic Achievement",
    core: "Jupiter in the 10th house creates a career of genuine wisdom and public service. This person is publicly recognized as a teacher, philosopher, or wise guide.",
    career:
      "Teaching, law, religion, philosophy, medicine, government, any career involving wisdom transmission. Career of genuine service.",
    relationships:
      "Career brings public respect and recognition. Professional relationships are with wise and accomplished people.",
    challenge:
      "Over-expansion in career aspirations, tendency to be preachy in professional settings, weight of public expectations.",
    gift: "Natural career wisdom and public recognition, genuine dharmic career, ability to inspire large numbers through professional work, fortune through career.",
    vedic:
      "Guru in Karma Bhava — career success through wisdom and dharmic work. Public recognition and respect.",
  },
  {
    planet: "Jupiter",
    house: 11,
    domain: "Community, Gains, and Fulfillment",
    core: "Jupiter in the 11th house creates extraordinary financial gains and a wise, expansive social network. This person attracts fortunate friendships and achieves long-term goals with relative ease.",
    career:
      "Large organizations, community work, philosophy networks, teaching communities, financial networks. Work through expansive community.",
    relationships:
      "Friendships with wise and fortunate people. Elder siblings are successful and supportive. Large and benevolent social circle.",
    challenge:
      "Over-expansion in social commitments, tendency to promise more than can be delivered, financial over-confidence.",
    gift: "Extraordinary financial fortune, wise and fortunate friendships, ability to achieve large-scale goals through community, natural fulfillment through group endeavors.",
    vedic:
      "Guru in Labha Bhava — significant financial gains, fortunate elder siblings, wise community.",
  },
  {
    planet: "Jupiter",
    house: 12,
    domain: "Spiritual Liberation and Hidden Fortune",
    core: "Jupiter in the 12th house creates a deeply spiritual person whose fortune comes through retreat, foreign lands, and invisible spiritual work. Liberation (moksha) is a primary life theme.",
    career:
      "Spiritual teaching, foreign work, hospitals, retreat centers, philosophy in private settings. Work in service of liberation.",
    relationships:
      "Spiritual relationships are the deepest. Foreign connections are significant. The native gives generously with little concern for return.",
    challenge:
      "Financial extravagance, difficulty in practical worldly matters, tendency to give everything away.",
    gift: "Extraordinary spiritual wisdom and fortune, genuine access to liberated states, generous and selfless service, fortune through foreign and spiritual connections.",
    vedic:
      "Guru in Vyaya Bhava — liberation and spiritual fortune. Generosity and foreign blessings.",
  },

  // ═══════════════════════════════════════════════════════════════
  // SATURN (Shani) — Discipline, karma, time, obstacles, wisdom
  // ═══════════════════════════════════════════════════════════════

  {
    planet: "Saturn",
    house: 1,
    domain: "Self and Karmic Identity",
    core: "Saturn in the 1st house creates a serious, disciplined, and often late-blooming person. Life improves with age as Saturn's demands are met through persistent effort.",
    career:
      "Law, government, engineering, architecture, mining, any long-term structured work. Career built through decades of patient effort.",
    relationships:
      "Serious in relationships, may delay marriage. Partners appreciate their reliability but must accept their need for structure and solitude.",
    challenge:
      "Depression, loneliness, late start in life, tendency to be overly serious or self-limiting. The early years may feel burdensome.",
    gift: "Extraordinary discipline and endurance, wisdom that deepens with age, genuine achievement through sustained effort, reliability that becomes a life asset.",
    vedic:
      "Shani in Lagna — serious nature, late bloomer. Life improves significantly after 36. Wisdom through discipline.",
  },
  {
    planet: "Saturn",
    house: 2,
    domain: "Wealth, Discipline, and Speech",
    core: "Saturn in the 2nd house creates financial challenges early in life that are overcome through discipline and hard work. Wealth comes slowly and is held firmly once accumulated.",
    career:
      "Finance, banking, accounting, law, any structured financial work. Wealth through long-term discipline.",
    relationships:
      "Family of origin involves discipline or hardship. Speech is measured and serious. Financial responsibility to family is real.",
    challenge:
      "Financial difficulties in early life, harsh or limited speech, family hardships, slow wealth accumulation.",
    gift: "Extraordinary financial discipline, ability to build lasting wealth through sustained effort, measured and trustworthy speech, family responsibility that builds character.",
    vedic:
      "Shani in Dhana Bhava — wealth comes through discipline and hard work. Financial wisdom through challenge.",
  },
  {
    planet: "Saturn",
    house: 3,
    domain: "Communication and Disciplined Effort",
    core: "Saturn in the 3rd house creates a disciplined communicator whose words carry weight and authority. Writing is done with care and precision. Self-effort is extraordinary.",
    career:
      "Technical writing, engineering, structured teaching, law, structured crafts. Communication with authority and precision.",
    relationships:
      "Sibling relationships involve responsibility or distance. Communication is careful and sometimes limited. Short journeys for work rather than pleasure.",
    challenge:
      "Communication can be too heavy or serious, difficulty with spontaneous expression, sibling responsibilities or separation.",
    gift: "Extraordinary self-discipline and effort, words that carry lasting authority, technical communication mastery, ability to teach through structured and precise language.",
    vedic:
      "Shani in Sahaja Bhava — disciplined self-effort, structured communication, serious siblings.",
  },
  {
    planet: "Saturn",
    house: 4,
    domain: "Home, Mother, and Karmic Foundation",
    core: "Saturn in the 4th house creates a challenging home environment in early life that becomes the foundation for extraordinary inner strength. Home is earned rather than given.",
    career:
      "Real estate, government, engineering, agriculture, any structured work connected to land or property. Career built from a secure foundation.",
    relationships:
      "Mother relationship involves discipline, distance, or difficulty. Home life requires sustained effort to maintain. Inner emotional security is built through challenge.",
    challenge:
      "Difficult home life in early years, mother relationship involves hardship or distance, difficulty finding inner peace, property challenges.",
    gift: "Extraordinary inner strength built through early difficulty, ability to create lasting and solid home foundations, genuine emotional maturity earned through hardship.",
    vedic:
      "Shani in Sukha Bhava — inner peace earned through discipline. Home life improves with age.",
  },
  {
    planet: "Saturn",
    house: 5,
    domain: "Creativity and Disciplined Expression",
    core: "Saturn in the 5th house creates a disciplined creative person whose work is serious, structured, and enduring. Creativity comes through sustained effort rather than spontaneous inspiration.",
    career:
      "Structured arts, classical music, architecture, engineering with aesthetic dimensions, education. Creative work that requires long-term commitment.",
    relationships:
      "Romantic life is serious and may be delayed. Children come later or through difficulty. Love is expressed through commitment rather than spontaneity.",
    challenge:
      "Delayed or difficult romance, challenges with children, inhibited creative spontaneity, tendency to take play too seriously.",
    gift: "Enduring creative work that stands the test of time, profound romantic commitment once established, disciplined approach to creativity that produces masterworks.",
    vedic:
      "Shani in Putra Bhava — children come late or with difficulty. Creative work is serious and lasting.",
  },
  {
    planet: "Saturn",
    house: 6,
    domain: "Service, Discipline, and Health",
    core: "Saturn in the 6th house is one of its most powerful positions — the planet of discipline in the house of service creates an extraordinary worker who defeats all obstacles through sustained effort.",
    career:
      "Medicine, law, government service, military, engineering, any structured service work. Career through disciplined service.",
    relationships:
      "Work relationships involve structure and responsibility. The native is the most reliable person in the workplace. May carry burdens for others.",
    challenge:
      "Health challenges related to Saturn — bones, joints, chronic conditions. Work can feel like unending obligation.",
    gift: "Extraordinary work ethic and discipline, natural enemy-defeater through persistence, health through structured discipline, genuine competence built over decades.",
    vedic:
      "Shani in Ripu Bhava — one of Saturn's strongest positions. Defeats enemies and obstacles through sustained effort.",
  },
  {
    planet: "Saturn",
    house: 7,
    domain: "Partnership and Karmic Relationships",
    core: "Saturn in the 7th house creates serious, karmic partnerships. Marriage may be delayed or to an older partner. What is built in partnership is built to last.",
    career:
      "Law, structured business partnerships, counseling, mediation, government relations. Work through serious long-term partnerships.",
    relationships:
      "Marriage is karmic and serious — often delayed or to an older/more disciplined partner. The relationship requires sustained work but can be extraordinarily durable.",
    challenge:
      "Delayed marriage, serious or heavy partnership dynamics, difficulty with spontaneity in relationship, loneliness within partnership.",
    gift: "Extraordinarily durable partnerships built on genuine commitment, karmic depth in relationship, wisdom about partnership, ability to sustain relationships through difficulty.",
    vedic:
      "Shani in Kalatra Bhava — marriage is delayed or to older partner. Karmic and serious partnership.",
  },
  {
    planet: "Saturn",
    house: 8,
    domain: "Transformation, Longevity, and Karma",
    core: "Saturn in the 8th house creates extraordinary longevity and the capacity to transform through the hardest life experiences. This person faces death and crisis repeatedly and emerges wiser.",
    career:
      "Research, occult sciences, inheritance management, psychology, government, mining, archaeology. Work with time, depth, and transformation.",
    relationships:
      "Joint resources require careful management. Inheritance may come with complications. Transformative karmic relationships.",
    challenge:
      "Chronic health concerns related to Saturn, financial difficulties through joint resources, isolation in transformation, fear of death or loss.",
    gift: "Extraordinary longevity, wisdom through transformation, resilience through crisis, access to karmic wisdom, ability to work with the deepest layers of existence.",
    vedic:
      "Shani in Mrityu Bhava — longevity. Saturn disciplines and slows even death. Occult wisdom.",
  },
  {
    planet: "Saturn",
    house: 9,
    domain: "Dharma, Discipline, and Philosophical Rigor",
    core: "Saturn in the 9th house creates a serious philosophical and spiritual seeker whose dharmic path is disciplined and often lonely. Wisdom is earned through sustained practice.",
    career:
      "Law, structured religious work, philosophy, teaching, government, any disciplined dharmic career. Wisdom through structured inquiry.",
    relationships:
      "Father relationship involves discipline, distance, or hardship. Gurus may be strict and demanding. Long philosophical journeys undertaken alone.",
    challenge:
      "Rigid or overly serious approach to philosophy and religion, difficult relationship with father, loneliness on the dharmic path.",
    gift: "Extraordinary philosophical discipline, genuine wisdom earned through sustained practice, ability to teach dharma with authority and structure.",
    vedic:
      "Shani in Dharma Bhava — dharmic discipline, serious philosophical practice, wisdom earned through sustained effort.",
  },
  {
    planet: "Saturn",
    house: 10,
    domain: "Career and Worldly Achievement",
    core: "Saturn in the 10th house creates one of the most significant career placements in the chart. Achievement comes late but is extraordinary, enduring, and publicly recognized.",
    career:
      "Government, law, engineering, architecture, politics, any structured high-achievement career. Career built over decades of disciplined effort.",
    relationships:
      "Career demands dominate the life. Professional reputation is for seriousness and reliability. Career achievements endure beyond the person.",
    challenge:
      "Career comes late, early professional life involves significant obstacles and hardship, tendency to work too hard at expense of personal life.",
    gift: "Extraordinary career achievement built through sustained effort, enduring professional legacy, genuine authority earned through decades of discipline.",
    vedic:
      "Shani in Karma Bhava — significant career achievements that come with time and discipline. Digbala in the 7th, but powerful in the 10th through effort.",
  },
  {
    planet: "Saturn",
    house: 11,
    domain: "Community, Gains, and Long-term Goals",
    core: "Saturn in the 11th house creates slow but steady financial gains and serious, long-term community relationships. What is built here endures.",
    career:
      "Large organizations, government, structured community work, engineering firms. Work through serious long-term networks.",
    relationships:
      "Friendships are few but deeply loyal. Elder siblings may be burdened. Social circle is serious and accomplished.",
    challenge:
      "Slow financial gains in early life, difficulty in casual social settings, few but weighty friendships.",
    gift: "Extraordinary long-term financial accumulation, deeply loyal and serious friendships, ability to achieve large-scale goals through patient sustained effort.",
    vedic:
      "Shani in Labha Bhava — gains come slowly but steadily. Serious elder siblings. Long-term financial discipline.",
  },
  {
    planet: "Saturn",
    house: 12,
    domain: "Liberation, Karma, and Spiritual Discipline",
    core: "Saturn in the 12th house creates a deeply spiritual and often solitary person whose karmic work is done in hidden or institutional settings. Liberation through discipline.",
    career:
      "Spiritual practice, government institutions, hospitals, prisons, foreign work, monasteries. Work in service of liberation and karmic resolution.",
    relationships:
      "Private life involves significant karmic work. Foreign connections involve discipline or hardship. The inner life is the primary relationship.",
    challenge:
      "Expenses exceed income, difficulty with sleep and solitude, loneliness in spiritual work, karmic burdens that must be worked through.",
    gift: "Extraordinary spiritual discipline, genuine access to liberation through sustained practice, ability to work with karmic material others cannot face, solitude as a genuine gift.",
    vedic:
      "Shani in Vyaya Bhava — spiritual discipline, karmic liberation. Works best in foreign lands or spiritual institutions.",
  },

  // ═══════════════════════════════════════════════════════════════
  // RAHU — Desire, obsession, foreign, illusion, ambition
  // ═══════════════════════════════════════════════════════════════

  {
    planet: "Rahu",
    house: 1,
    domain: "Self and Destiny",
    core: "Rahu in the 1st house creates an unusual, magnetic, and sometimes enigmatic personality. The native is driven by an intense desire to express a unique self that may not fully form until midlife.",
    career:
      "Unusual or groundbreaking careers, foreign work, technology, media, anything cutting-edge. Success through doing the unprecedented.",
    relationships:
      "Unusual in relationships — may attract or be attracted to foreign, unconventional, or taboo partners. Identity in relationship is complex.",
    challenge:
      "Identity confusion, obsessive self-focus, tendency toward illusion about the self, health issues related to the head.",
    gift: "Magnetic presence, ability to reinvent the self, success in foreign or unusual fields, extraordinary ambition that can move mountains.",
    vedic:
      "Rahu in Lagna — unusual, magnetic, destined for extraordinary experiences. The self is a project of continuous becoming.",
  },
  {
    planet: "Rahu",
    house: 2,
    domain: "Wealth and Obsessive Resource-Building",
    core: "Rahu in the 2nd house creates an obsessive drive for wealth and material resources. The native is never satisfied with what they have financially and always seeks more.",
    career:
      "Finance, unusual wealth-building methods, foreign trade, technology, media. Earns through unconventional means.",
    relationships:
      "Family of origin may be unusual or foreign. Voice can be hypnotic or deceptive. Financial matters in family are complex.",
    challenge:
      "Obsession with wealth, deceptive speech, foreign family complications, financial excess or instability.",
    gift: "Extraordinary wealth-building drive, ability to generate resources through unconventional means, hypnotic and persuasive voice.",
    vedic:
      "Rahu in Dhana Bhava — intense focus on wealth accumulation. Foreign income sources.",
  },
  {
    planet: "Rahu",
    house: 3,
    domain: "Communication and Courageous Obsession",
    core: "Rahu in the 3rd house creates an obsessive and often brilliant communicator. The mind is restless, bold, and drawn to unusual or taboo subjects.",
    career:
      "Media, technology, unusual writing, foreign communication, marketing, advertising. Communication that breaks conventions.",
    relationships:
      "Unusual sibling relationships — often with foreign or unconventional siblings. Short journeys for unusual purposes.",
    challenge:
      "Obsessive thinking, unconventional communication that alienates some, restless and never-satisfied curiosity.",
    gift: "Extraordinary communicative ambition, ability to communicate across boundaries, courage in expression, cutting-edge communication skills.",
    vedic:
      "Rahu in Sahaja Bhava — unconventional communication, bold self-effort, unusual sibling connections.",
  },
  {
    planet: "Rahu",
    house: 4,
    domain: "Home, Roots, and Inner Obsession",
    core: "Rahu in the 4th house creates an unusual or foreign home environment and an obsessive desire for inner security that is never quite satisfied. The roots are complex.",
    career:
      "Real estate with foreign or unusual dimensions, technology connected to home, agriculture, psychology. Work to build an unusual domestic foundation.",
    relationships:
      "Mother may be foreign, unusual, or absent. Home environment is unconventional. Inner emotional life is complex and seeking.",
    challenge:
      "Inner restlessness that a home never fully satisfies, unusual or disrupted early home life, difficulty with mother relationship.",
    gift: "Ability to create a unique and unusual home environment, foreign domestic connections, deep desire for inner security that drives significant personal development.",
    vedic:
      "Rahu in Sukha Bhava — unusual home life, foreign roots, obsessive search for inner security.",
  },
  {
    planet: "Rahu",
    house: 5,
    domain: "Creativity, Children, and Obsessive Intelligence",
    core: "Rahu in the 5th house creates an obsessive, unconventional, and often brilliant creative mind. Intelligence is unusual and breaks conventional patterns.",
    career:
      "Unusual creative work, technology, entertainment, speculation, education of unusual subjects. Creative work that breaks boundaries.",
    relationships:
      "Unusual romantic connections — often foreign or unconventional. Children may be unusual or come through unconventional means.",
    challenge:
      "Obsessive speculation, unusual or difficult pregnancy experiences, unconventional romance that creates social complications.",
    gift: "Extraordinary and unusual creative intelligence, ability to produce innovative work, magnetic romantic presence, unconventional approach that breaks new creative ground.",
    vedic:
      "Rahu in Putra Bhava — unusual intelligence and creativity, foreign or unconventional children.",
  },
  {
    planet: "Rahu",
    house: 6,
    domain: "Service, Competition, and Unusual Work",
    core: "Rahu in the 6th house creates an unusually effective competitor and problem-solver. This person defeats enemies through unconventional means and excels in unusual service work.",
    career:
      "Medicine (especially unusual or foreign), law, technology, social work with unconventional populations. Service through unusual means.",
    relationships:
      "Work relationships are unusual or with foreign colleagues. Competitors are defeated through unconventional strategy.",
    challenge:
      "Health issues of an unusual or hard-to-diagnose nature, deceptive competitors, obsession with work to the detriment of health.",
    gift: "Extraordinary ability to defeat enemies through unconventional means, success in foreign or unusual service work, resilience in health through unconventional methods.",
    vedic:
      "Rahu in Ripu Bhava — defeats enemies through unusual strategy. Foreign medical or legal connections.",
  },
  {
    planet: "Rahu",
    house: 7,
    domain: "Partnership and Foreign Connections",
    core: "Rahu in the 7th house creates a desire for unusual, foreign, or unconventional partnerships. The native is magnetically attractive in relationship but may never feel fully satisfied.",
    career:
      "Foreign business, unusual partnerships, diplomacy, international trade, consulting. Work through unconventional partnerships.",
    relationships:
      "Strong attraction to foreign or unconventional partners. Marriage may be unconventional or to someone from a different background. Obsessive attachment possible.",
    challenge:
      "Relationship obsession, unconventional marriage that may not satisfy social expectations, multiple significant relationships.",
    gift: "Magnetic partnership energy, ability to attract powerful and unusual partners, success through foreign or unconventional business connections.",
    vedic:
      "Rahu in Kalatra Bhava — foreign or unusual spouse. Intense partnership energy.",
  },
  {
    planet: "Rahu",
    house: 8,
    domain: "Transformation and Occult Obsession",
    core: "Rahu in the 8th house creates an obsessive interest in occult, hidden, and transformative subjects. The native may have unusual experiences of death, rebirth, and psychic phenomena.",
    career:
      "Occult sciences, research, unusual inheritance situations, crisis counseling, foreign occult or transformative work. Work with hidden knowledge.",
    relationships:
      "Transformative relationships that involve obsession or unusual depth. Joint resources may be complicated or foreign.",
    challenge:
      "Obsession with death or dark subjects, unusual health crises, financial complications through joint resources or inheritance.",
    gift: "Extraordinary access to occult and hidden knowledge, transformative life experiences that build unusual wisdom, ability to work with the deepest levels of existence.",
    vedic:
      "Rahu in Mrityu Bhava — occult obsession, unusual transformative experiences, foreign inheritance.",
  },
  {
    planet: "Rahu",
    house: 9,
    domain: "Dharma and Philosophical Obsession",
    core: "Rahu in the 9th house creates an obsessive seeker of truth who may pursue multiple philosophical or religious traditions. The dharmic path is unconventional and often foreign.",
    career:
      "Foreign religion, unconventional philosophy, international law, unusual teaching. Dharmic work across cultural boundaries.",
    relationships:
      "Father may be foreign or follow an unusual path. Gurus may be unconventional or foreign. Cross-cultural philosophical connections.",
    challenge:
      "Philosophical or religious obsession, tendency toward false gurus or misleading philosophies, difficulty finding a stable dharmic home.",
    gift: "Extraordinary philosophical ambition and breadth, ability to synthesize multiple wisdom traditions, fortune through foreign philosophical connections.",
    vedic:
      "Rahu in Dharma Bhava — unconventional philosophical path, foreign dharmic connections.",
  },
  {
    planet: "Rahu",
    house: 10,
    domain: "Career and Worldly Ambition",
    core: "Rahu in the 10th house creates extraordinary worldly ambition and the drive for public recognition. This person wants to make their mark on the world and often succeeds unconventionally.",
    career:
      "Unusual or groundbreaking careers, foreign work, technology, media, politics. Success through doing what has not been done before.",
    relationships:
      "Career dominates the life. Professional relationships are with unusual, foreign, or powerful people. Public image is complex.",
    challenge:
      "Obsessive career ambition that sacrifices everything else, public scandals or exposure, career built on illusion that eventually collapses.",
    gift: "Extraordinary career ambition and achievement, ability to succeed in unprecedented ways, foreign career success, public recognition that exceeds expectations.",
    vedic:
      "Rahu in Karma Bhava — worldly ambition, unconventional career success, foreign professional connections.",
  },
  {
    planet: "Rahu",
    house: 11,
    domain: "Community and Unusual Gains",
    core: "Rahu in the 11th house creates extraordinary financial gains through unusual or foreign channels and builds unconventional but powerful social networks.",
    career:
      "Technology, foreign trade, unusual financial instruments, media, large unconventional organizations. Work through unusual networks.",
    relationships:
      "Social circle is unusual, foreign, or diverse. Elder siblings may be foreign or unconventional. Large network of unusual connections.",
    challenge:
      "Obsessive financial ambition, unusual or unreliable income sources, social circle that is difficult to trust fully.",
    gift: "Extraordinary financial gains through unusual channels, ability to build large and diverse networks, fulfillment through unconventional community connections.",
    vedic:
      "Rahu in Labha Bhava — unusual financial gains, foreign networks, extraordinary community ambitions.",
  },
  {
    planet: "Rahu",
    house: 12,
    domain: "Liberation, Foreign Lands, and Hidden Obsession",
    core: "Rahu in the 12th house creates a person whose deepest obsessions are private, spiritual, or foreign. The hidden life is rich with unusual experiences and desires.",
    career:
      "Foreign work, spiritual technology, unusual retreat work, behind-the-scenes powerful operations. Hidden or foreign career dimensions.",
    relationships:
      "Hidden relationships, foreign connections, spiritual obsessions. Private life contains the deepest desires.",
    challenge:
      "Hidden obsessions and addictions, unusual expenses, sleep disturbances from psychic activity, deceptive hidden enemies.",
    gift: "Access to unusual spiritual and psychic experiences, success in foreign lands, ability to work effectively in hidden or behind-the-scenes contexts.",
    vedic:
      "Rahu in Vyaya Bhava — foreign liberation, unusual spiritual experiences, hidden power.",
  },

  // ═══════════════════════════════════════════════════════════════
  // KETU — Liberation, past karma, spirituality, disconnection
  // ═══════════════════════════════════════════════════════════════

  {
    planet: "Ketu",
    house: 1,
    domain: "Self and Karmic Release",
    core: "Ketu in the 1st house creates a person who came into this life already somewhat detached from the body and personal identity. The self feels transparent or undefined at times.",
    career:
      "Spiritual work, healing, unusual or psychic abilities applied to career. Work that serves liberation rather than ego.",
    relationships:
      "Difficulty with consistent self-presentation in relationships. Partners may feel they never fully know this person. Deep spiritual connections possible.",
    challenge:
      "Identity dissolution, lack of physical vitality, difficulty with consistent self-expression, tendency to be misunderstood.",
    gift: "Natural spiritual wisdom accumulated from past lives, psychic sensitivity, ability to detach from ego when needed, access to deep karmic intelligence.",
    vedic:
      "Ketu in Lagna — karmic release through self, spiritual gifts, natural detachment from ego identity.",
  },
  {
    planet: "Ketu",
    house: 2,
    domain: "Wealth and Karmic Release of Attachment",
    core: "Ketu in the 2nd house creates a person with past-life mastery of wealth and resources who is being asked to release attachment to material accumulation in this life.",
    career:
      "Spiritual economics, unusual relationship with money, service that transcends financial concern. Past-life financial wisdom available.",
    relationships:
      "Family connections feel karmic and may be releasing. Voice carries unusual or spiritual quality.",
    challenge:
      "Financial instability, difficulty with material accumulation, speech that creates misunderstanding, detachment from family.",
    gift: "Past-life financial wisdom available when needed, natural non-attachment to material things, ability to speak with unusual spiritual authority.",
    vedic:
      "Ketu in Dhana Bhava — release of material attachment, past-life wealth wisdom.",
  },
  {
    planet: "Ketu",
    house: 3,
    domain: "Communication and Karmic Release of Mental Patterns",
    core: "Ketu in the 3rd house brings past-life mastery of communication and courage that can be freely drawn upon, while releasing old mental patterns and sibling karma.",
    career:
      "Spiritual writing, unusual communication work, releasing work connected to siblings or local community. Past-life communication mastery.",
    relationships:
      "Sibling karma is being resolved. Communication has unusual depth or spiritual quality. Short journeys for spiritual purposes.",
    challenge:
      "Unusual communication patterns that others find hard to follow, sibling separations or difficulties, mental disconnection.",
    gift: "Natural access to past-life communication wisdom, spiritual writing ability, unusual courage in expression, ability to communicate what cannot easily be said.",
    vedic:
      "Ketu in Sahaja Bhava — past-life communication mastery, sibling karma resolution.",
  },
  {
    planet: "Ketu",
    house: 4,
    domain: "Home and Inner Liberation",
    core: "Ketu in the 4th house creates a person releasing deep karmic attachments to home, mother, and inner security. The inner life has a quality of spiritual detachment.",
    career:
      "Work that serves liberation, spiritual home-building, releasing work connected to roots and land. Inner spiritual work as career.",
    relationships:
      "Mother relationship has a karmic quality of resolution or release. Home life feels temporary or transparent. Inner emotional detachment.",
    challenge:
      "Difficulty finding inner peace through conventional domestic means, mother relationship involves separation or unusual dynamic.",
    gift: "Natural inner spiritual stability that transcends circumstances, past-life wisdom about home and roots, ability to find sanctuary within the self.",
    vedic:
      "Ketu in Sukha Bhava — inner liberation, karmic release of domestic attachment.",
  },
  {
    planet: "Ketu",
    house: 5,
    domain: "Creativity and Karmic Release of Ego-Expression",
    core: "Ketu in the 5th house creates a person with past-life creative and intellectual mastery who is releasing ego-based creative expression in this life.",
    career:
      "Spiritual creativity, unusual teaching of past-life wisdom, releasing work connected to children or creative ego. Wisdom-based rather than ego-based creation.",
    relationships:
      "Children carry karmic quality. Romantic connections have past-life resonance. Creative expression is unusual and spiritually informed.",
    challenge:
      "Creative blocks or unusual creative path, unusual situations with children, romantic detachment.",
    gift: "Past-life creative wisdom available as resource, natural wisdom-based intelligence, unusual and spiritually informed creative work.",
    vedic:
      "Ketu in Putra Bhava — past-life intelligence, karmic children, spiritual creativity.",
  },
  {
    planet: "Ketu",
    house: 6,
    domain: "Service and Karmic Release of Conflict",
    core: "Ketu in the 6th house creates a person with past-life mastery of service and the defeat of enemies. Old conflict karma is being released and service is a vehicle for liberation.",
    career:
      "Spiritual healing, unusual service work, releasing work connected to past-life conflicts. Service through spiritual detachment.",
    relationships:
      "Work relationships have a karmic quality. Past-life enemies are present in the current life's work environment. Health has unusual or spiritual dimensions.",
    challenge:
      "Unusual health issues of karmic origin, spiritual enemies, difficulty with conventional service work.",
    gift: "Natural immunity to many conventional challenges, past-life healing wisdom, ability to serve from a place of genuine spiritual detachment.",
    vedic:
      "Ketu in Ripu Bhava — past-life mastery of service, karmic release of conflict.",
  },
  {
    planet: "Ketu",
    house: 7,
    domain: "Partnership and Karmic Release of Relationship",
    core: "Ketu in the 7th house creates a person releasing deep karmic partnership patterns. Relationships have a quality of completion or release rather than new beginning.",
    career:
      "Work in service of partnership liberation, unusual consulting or counseling. Career through releasing old relationship patterns.",
    relationships:
      "Marriage or significant partnerships carry strong karmic energy of completion. The spouse may feel like a past-life connection being resolved.",
    challenge:
      "Partnership detachment, unusual or difficult marriage, tendency to withdraw from relationship intimacy.",
    gift: "Access to past-life partnership wisdom, natural ability to see through relationship illusions, spiritual depth in partnership that transcends conventional romance.",
    vedic:
      "Ketu in Kalatra Bhava — karmic marriage, past-life partnership resolution.",
  },
  {
    planet: "Ketu",
    house: 8,
    domain: "Transformation and Natural Spiritual Access",
    core: "Ketu in the 8th house creates natural access to occult, spiritual, and transformative wisdom accumulated over lifetimes. The mysteries are not mysterious to this person.",
    career:
      "Spiritual teaching of occult subjects, healing, research that draws on past-life wisdom. Natural access to hidden knowledge.",
    relationships:
      "Transformative relationships that feel deeply karmic. Death and rebirth are familiar territories. Joint resources may be complex.",
    challenge:
      "Tendency to become too absorbed in occult or spiritual matters, detachment from joint resources, unusual health through karmic causes.",
    gift: "Extraordinary natural access to occult and spiritual wisdom, healing ability from past lives, natural understanding of transformation, fearlessness about death.",
    vedic:
      "Ketu in Mrityu Bhava — natural spiritual wisdom, past-life occult mastery.",
  },
  {
    planet: "Ketu",
    house: 9,
    domain: "Dharma and Past-Life Wisdom",
    core: "Ketu in the 9th house creates a person with past-life mastery of philosophy, religion, and dharma. They came in knowing things others spend lifetimes seeking.",
    career:
      "Spiritual teaching, unusual philosophical work, releasing work connected to past-life dharmic roles. Teaching from accumulated wisdom.",
    relationships:
      "Father relationship has unusual or karmic quality. Past-life gurus are present. Cross-cultural philosophical connections.",
    challenge:
      "Detachment from conventional religious or philosophical paths, father separation, difficulty finding dharmic direction in current life.",
    gift: "Natural philosophical wisdom from past lives, ability to teach dharma without needing to learn it in this life, spiritual authority without institutional sanction.",
    vedic:
      "Ketu in Dharma Bhava — past-life philosophical mastery, natural dharmic wisdom.",
  },
  {
    planet: "Ketu",
    house: 10,
    domain: "Career and Karmic Release of Worldly Ambition",
    core: "Ketu in the 10th house creates a person releasing past-life career karma. Worldly achievement is available but may feel ultimately unsatisfying.",
    career:
      "Spiritual career, unusual professional path, work that serves liberation rather than status. Past-life professional mastery available.",
    relationships:
      "Career relationships have karmic quality. Professional identity feels temporary or transparent.",
    challenge:
      "Career detachment, unusual professional path that others don't understand, worldly success that feels empty.",
    gift: "Natural professional wisdom from past lives, ability to achieve without ego-attachment, work that serves liberation, unusual public impact.",
    vedic:
      "Ketu in Karma Bhava — past-life career mastery, spiritual professional path.",
  },
  {
    planet: "Ketu",
    house: 11,
    domain: "Community and Karmic Release of Social Attachment",
    core: "Ketu in the 11th house creates a person releasing past-life social and community karma. Group belonging is not a primary driver — liberation through non-attachment to social identity.",
    career:
      "Work in service of community liberation, unusual network or technology work. Past-life community wisdom.",
    relationships:
      "Social connections have karmic quality of completion. Elder siblings may be involved in spiritual or unusual paths.",
    challenge:
      "Social detachment, unusual or difficult community connections, income instability from non-attachment to financial gains.",
    gift: "Natural freedom from social expectations, past-life community wisdom, ability to contribute to groups without ego-attachment.",
    vedic:
      "Ketu in Labha Bhava — past-life community wisdom, release of social attachment.",
  },
  {
    planet: "Ketu",
    house: 12,
    domain: "Liberation and Spiritual Mastery",
    core: "Ketu in the 12th house is one of the most spiritually powerful placements. The native has accumulated deep liberation-oriented karma over many lifetimes and is close to genuine moksha.",
    career:
      "Advanced spiritual practice, spiritual teaching, work in service of liberation. Career in private or institutional spiritual settings.",
    relationships:
      "Private life is deeply spiritually oriented. Foreign and spiritual connections carry karmic completion energy.",
    challenge:
      "Complete withdrawal from worldly life, difficulty with material engagement, expenses connected to spiritual pursuits.",
    gift: "Extraordinary access to liberation and spiritual mastery, natural ability to dissolve into the absolute, genuine moksha energy available in this lifetime.",
    vedic:
      "Ketu in Vyaya Bhava — moksha placement. Liberation is available. Deep past-life spiritual accumulation.",
  },

  // ═══════════════════════════════════════════════════════════════
  // URANUS — Disruption, liberation, genius, awakening, rebellion
  // ═══════════════════════════════════════════════════════════════

  {
    planet: "Uranus",
    house: 1,
    domain: "Identity and Self-Expression",
    core: "Uranus in the 1st house means the self is a site of constant reinvention. This person doesn't settle into a fixed identity — they break out of every version of themselves that starts to feel like a cage. They arrived here to be different, and some part of them always knew it.",
    career:
      "Innovators, inventors, tech, activism, design, any field where originality is an asset. They cannot sustain work that demands conformity. They need to be the disruptor, not the one being disrupted.",
    relationships:
      "Partners often feel they're with someone who keeps changing. That's accurate. Deep intimacy requires a partner who finds freedom attractive rather than threatening. They push away anyone who tries to define or contain them.",
    challenge:
      "Instability mistaken for freedom. The loop: constraint appears → rebel → break free → rebuild → feel constrained again. Learning when to stay through discomfort instead of breaking the structure.",
    gift: "Authentic originality that can't be faked. When others finally catch up to where they were five years ago, they're already somewhere new. True visionary energy when the nervous system is regulated.",
    vedic:
      "No classical Vedic equivalent. In modern hybrid charts, Uranus in the 1st amplifies the impulse toward self-reinvention and radical authenticity.",
  },
  {
    planet: "Uranus",
    house: 2,
    domain: "Money, Values, and Resources",
    core: "Uranus in the 2nd house creates an erratic relationship with money. Income arrives in sudden surges and unexpected gaps. The financial story of this life doesn't follow a straight line — it pulses, breaks, and rebuilds in unfamiliar shapes. The deeper issue is that conventional security was never fully real to this person.",
    career:
      "Tech entrepreneurship, freelancing, cryptocurrency, unconventional finance, invention. Traditional employment often feels like a slow suffocation. Income tends to be nonlinear.",
    relationships:
      "Values are unusual or ahead of their time. Partners may find their relationship with money either exciting or unsettling. Family money may arrive in unexpected windfalls or collapse without warning.",
    challenge:
      "Treating financial instability as proof of freedom. The real work is building security without sacrificing independence — structure that is chosen, not imposed.",
    gift: "The ability to generate income through unconventional means others haven't thought of yet. When they stop fearing financial disruption, they become remarkably creative at building wealth in entirely new ways.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Uranus in the 2nd disrupts traditional wealth-building — the native must innovate their relationship to value and income.",
  },
  {
    planet: "Uranus",
    house: 3,
    domain: "Communication, Thought, and Siblings",
    core: "Uranus in the 3rd house produces a mind that thinks in sudden leaps. Ideas arrive in flashes. This person can't always explain how they got from A to Z — they just jumped. The way they communicate is often ahead of what the room is ready to hear.",
    career:
      "Writing, technology, media, broadcasting, coding — any field that values nonlinear thinking or disruptive communication. They thrive where originality is rewarded over convention.",
    relationships:
      "Sibling relationships may be unusual or marked by sudden distance and reconnection. They need conversations that genuinely challenge them. Small talk is a drain.",
    challenge:
      "Scattered thinking, difficulty finishing what's started. The loop: brilliant insight → can't fully translate it → abandon it → new insight replaces it. Ideas leave before they land.",
    gift: "Genuinely original thinking. The ability to spot connections others miss entirely. When channeled, this is the mind of an inventor, a writer who breaks form, or a strategist who sees three moves ahead.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Uranus in the 3rd activates sudden, erratic, genius-level communication and nonlinear perception.",
  },
  {
    planet: "Uranus",
    house: 4,
    domain: "Home, Roots, and Emotional Foundation",
    core: "Uranus in the 4th means the foundation never fully stayed still. The home life was either literally unstable — multiple moves, sudden disruptions, unconventional family structure — or emotionally unpredictable in ways that made home feel unreliable. The result: this person built their inner world to be self-sufficient, because the outer one couldn't be counted on.",
    career:
      "Real estate innovation, remote work, architecture, environmental work. They need work that doesn't chain them to a fixed location or routine.",
    relationships:
      "Home life with a partner may go through dramatic reinventions. Traditional domestic arrangements often feel suffocating. May relocate multiple times or maintain an unconventional living setup.",
    challenge:
      "Emotional unpredictability underneath the surface. The loop: seek stability → start to feel settled → something disrupts it → rebuild again. Learning that emotional security is built inside, not outside.",
    gift: "Radical emotional self-reliance. They've had to find their center without a stable container, which means their center is genuinely portable. They can feel at home inside themselves, anywhere.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Uranus in the 4th (Sukha Bhava) disrupts the emotional foundation — inner stability must be constructed, not inherited.",
  },
  {
    planet: "Uranus",
    house: 5,
    domain: "Creativity, Joy, and Self-Expression",
    core: "Uranus in the 5th house makes creativity an act of disruption. This person doesn't create inside existing forms — they break the form to find out what's actually alive inside it. Their art, their play, their self-expression is always doing something unexpected.",
    career:
      "Avant-garde art, experimental music, tech-based creative work, unconventional teaching, innovation labs. Anywhere creativity is expected to be safe is the wrong environment.",
    relationships:
      "Romantic attractions are sudden, electric, and sometimes over just as fast as they started. They need romance that feels alive, not routine. Children, if present, tend to be unusually independent.",
    challenge:
      "Creative inconsistency — brilliant starts, abandoned midway. The loop: electric beginning → routine sets in → disruption → exit. Chasing the spark instead of building the fire.",
    gift: "The ability to create things that feel genuinely new. Their best work doesn't fit categories. When they stop chasing novelty for its own sake, the originality that emerges is the real thing.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Uranus in the 5th brings sudden creative genius, unconventional joy, and erratic but electric romantic experiences.",
  },
  {
    planet: "Uranus",
    house: 6,
    domain: "Work, Health, and Daily Rhythm",
    core: "Uranus in the 6th house means routine is the enemy of vitality — or at least that's how it feels. The nervous system runs hot. When the daily structure is wrong, the body communicates first: unusual symptoms, restlessness, or a slow erosion of energy that doesn't have a clean diagnosis.",
    career:
      "Alternative health fields, tech-based environments, freelance or contract work, process innovation. They need variation built into their work structure or the work slowly breaks them.",
    relationships:
      "Coworkers may find them unpredictable. They work in bursts rather than steady rhythms. Service to others happens on their own terms and with their own unconventional methods.",
    challenge:
      "Health issues connected to stress, nervous system overload, or ignoring the body until something breaks suddenly. The loop: push through → crash → recover → repeat.",
    gift: "The ability to revolutionize systems, processes, and health practices. They find solutions to problems others have stopped questioning. A well-regulated Uranus 6th is one of the most innovative problem-solvers in the chart.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Uranus in the 6th creates erratic but inspired health patterns and unconventional approaches to daily work and service.",
  },
  {
    planet: "Uranus",
    house: 7,
    domain: "Partnership and Commitment",
    core: "Uranus in the 7th house creates a deep tension between wanting closeness and needing space. The person attracts partners who are unusual, unpredictable, or who arrive and exit their life suddenly. Commitment feels like a wire that keeps getting cut — not because love isn't real, but because containment feels like erasure.",
    career:
      "Business partnerships may be brilliant and unstable. Consulting, negotiation, legal fields. Best in partnerships where both parties maintain clear autonomy.",
    relationships:
      "This is the core arena. Relationships begin suddenly and can end just as fast. Long-term partnerships require unusual amounts of freedom. Open relationships, long-distance, or unconventional structures may be more sustainable than the traditional model.",
    challenge:
      "Sabotaging stability once intimacy deepens. The loop: connect intensely → start to feel confined → create distance or disruption → grieve the loss → repeat. Learning that freedom and commitment can coexist.",
    gift: "When they find a partner who can hold freedom inside love, the partnership becomes one of the most electric and evolutionary bonds possible. Radical honesty and genuine individuality inside closeness.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Uranus in the 7th disrupts the marriage house — partnerships are unconventional, sudden, or structured around mutual liberation.",
  },
  {
    planet: "Uranus",
    house: 8,
    domain: "Transformation, Power, and the Hidden",
    core: "Uranus in the 8th house creates someone for whom transformation isn't a season — it's a permanent condition. Their relationship with change, death, power, and the hidden dimensions of life is electric and relentless. They don't just go through cycles — they go through revolutions.",
    career:
      "Psychology, crisis work, occult research, technology applied to finance or death care, investigative work. They are drawn to places most people avoid.",
    relationships:
      "Deeply intense bonds that alter both people permanently. Shared finances go through sudden upheavals. They may attract partners carrying significant unresolved psychological depth.",
    challenge:
      "Compulsive transformation — changing for the sake of change, mistaking chaos for depth. Crisis can become a comfort zone because it feels more real than stability.",
    gift: "Extraordinary ability to survive and metabolize experiences that would break others. They carry knowledge from the edges of human experience that, when integrated, becomes a form of genuine power.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Uranus in the 8th intensifies the house of transformation — sudden encounters with mortality, inheritance, and radical psychological overhaul.",
  },
  {
    planet: "Uranus",
    house: 9,
    domain: "Belief, Philosophy, and Higher Truth",
    core: "Uranus in the 9th house means the belief system never stays fixed. Every philosophy or worldview adopted becomes a launching pad to something beyond it. They are constitutionally incapable of inheriting a belief system unchanged — they have to break it open and find out what's actually true.",
    career:
      "Higher education, philosophy, cross-cultural work, revolutionary teaching, publishing, law reform. They need to be where ideas are being challenged, not preserved.",
    relationships:
      "May attract partners from radically different cultures or belief systems. They need philosophical freedom inside their close bonds. Teachers and mentors may arrive and depart suddenly.",
    challenge:
      "Chronic restlessness in the search for truth — always one more system away from landing. The loop: adopt a worldview → find its limits → abandon it → search again.",
    gift: "The ability to synthesize across traditions and arrive at insight not borrowed from any single source. At their best, they become the author of a new framework, not a student of an old one.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Uranus in the 9th disrupts inherited dharma and pushes toward a self-constructed philosophical path.",
  },
  {
    planet: "Uranus",
    house: 10,
    domain: "Career, Public Life, and Legacy",
    core: "Uranus in the 10th house means the career path will not look like what anyone expected — including the person living it. The public role shifts, sometimes dramatically. What looks like instability from the outside is actually the life finding its real shape through a series of necessary reinventions.",
    career:
      "Technology leadership, social innovation, entrepreneurship, activism, revolutionary work in any field. They cannot spend their life climbing a ladder someone else built. They need to build — or rebuild — the ladder.",
    relationships:
      "Public reputation may be polarizing or unconventional. The relationship with authority figures and institutions is uneasy. They do better as the disruptor than as the one being managed.",
    challenge:
      "Career instability from burning bridges before new ones are built. The loop: rise in a field → feel constrained → disrupt → exit → rebuild. Learning to time the disruptions with intention.",
    gift: "The capacity to build something genuinely new in their field. Their legacy isn't a longer version of what already existed — it's a departure. The world often catches up to them later.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Uranus in the 10th creates sudden public shifts and a career built on innovation rather than inherited tradition.",
  },
  {
    planet: "Uranus",
    house: 11,
    domain: "Community, Vision, and the Future",
    core: "Uranus in the 11th house — the natural domain of Aquarius, Uranus's sign — amplifies everything Uranus does. This person's social world is unusual, their friendships are with outliers and innovators, and their vision for what the future should look like is genuinely ahead of where most people are standing.",
    career:
      "Social innovation, technology communities, activism, network building, humanitarian work. They are most alive when working toward a collective future that doesn't exist yet.",
    relationships:
      "Friendships are electric and nonlinear — people enter and exit their life unexpectedly. They don't collect acquaintances; they collect awakeners. They need community that doesn't require them to be smaller than they are.",
    challenge:
      "Social detachment disguised as independence. Being among others without fully landing. The loop: find community → start to feel boxed in → pull back → feel isolated → find new community.",
    gift: "The ability to see where things are going before they arrive. When channeled into genuine collective work, they become a catalyst for change that ripples far beyond what they can directly observe.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Uranus in the 11th is considered its strongest placement — gains through innovation, technology, and collective vision.",
  },
  {
    planet: "Uranus",
    house: 12,
    domain: "Solitude, the Hidden Self, and Liberation",
    core: "Uranus in the 12th house means the awakening happens in private. The most electric insights and radical self-discoveries come in solitude, in dreams, in the spaces between. The inner life is far more revolutionary than the outer life suggests.",
    career:
      "Research, behind-the-scenes innovation, spiritual technology, psychology, work in isolated or institutional environments. The most important work may never be public-facing.",
    relationships:
      "Hidden aspects of the self may surface unexpectedly in close relationships. They may keep their most unconventional beliefs private. Spiritual experiences can arrive suddenly and restructure everything.",
    challenge:
      "Suppressed rebellion that leaks out sideways — sudden exits, behavior that even they don't fully understand. The loop: contain the self → pressure builds → sudden eruption → retreat to solitude → rebuild the container.",
    gift: "Access to genuine spiritual insight that arrives through disruption of the ordinary mind. The unconscious is a laboratory. When they stop fearing what's in there, they find something extraordinary.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Uranus in the 12th produces sudden spiritual breakthroughs, unusual dream states, and liberation through disruption of unconscious patterns.",
  },

  // ═══════════════════════════════════════════════════════════════
  // NEPTUNE — Dissolution, transcendence, illusion, compassion, the infinite
  // ═══════════════════════════════════════════════════════════════

  {
    planet: "Neptune",
    house: 1,
    domain: "Identity and Self-Expression",
    core: "Neptune in the 1st house creates a self that is permeable. This person absorbs the emotional atmosphere of every room they enter, and sometimes can't find where they end and others begin. The identity is fluid, almost shapeshifting. People often project onto them, seeing something they need reflected back.",
    career:
      "Art, film, music, healing arts, psychology, spiritual work, acting. Most alive in work that requires imagination, empathy, or the ability to dissolve into something larger than the self.",
    relationships:
      "Deep empathy that can become enmeshment. Partners may idealize them early, then struggle when the projection meets reality. They need relationships that honor spiritual depth without losing structure.",
    challenge:
      "Loss of self in others, difficulty knowing their own desires versus what they've absorbed, vulnerability to deception because they see the best in people even when evidence says otherwise.",
    gift: "Extraordinary capacity for empathy and compassion. When the identity is grounded, this becomes a rare ability to truly meet another person — and to create art or healing that touches something deep.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Neptune in the 1st creates a mystical, emotionally porous personality — a vessel for inspiration that requires strong inner grounding.",
  },
  {
    planet: "Neptune",
    house: 2,
    domain: "Money, Values, and Resources",
    core: "Neptune in the 2nd house dissolves the edges around money and material security. Finances can feel like water — hard to hold, easy to lose, occasionally abundant in ways that seem almost magical. The deeper issue is that material security has never felt fully real to this person in the way it seems to be for others.",
    career:
      "Art, music, spiritual commerce, work in service of ideals. They often make money in unusual or nonlinear ways. Practical financial structure is essential and often absent until consciously built.",
    relationships:
      "May be idealistic about money in relationships — giving without accounting, or attracting partners who need financial rescue. Values are spiritually oriented and resist placing too much importance on material things.",
    challenge:
      "Financial confusion or avoidance. The loop: earn → diffuse without accounting → feel unexpectedly depleted → rebuild → repeat. Deception in financial dealings is a real risk.",
    gift: "A genuinely non-materialistic relationship to value. When practical systems are in place, they can build something financially meaningful around their deepest beliefs — and attract resources almost intuitively.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Neptune in the 2nd softens material accumulation — the native must find a way to make the spiritual practical.",
  },
  {
    planet: "Neptune",
    house: 3,
    domain: "Communication, Thought, and Siblings",
    core: "Neptune in the 3rd house creates a mind that thinks in images, impressions, and felt senses rather than linear logic. This person communicates in ways that are evocative and poetic — but they can also struggle to be precise, and what they meant and what was heard can be two completely different things.",
    career:
      "Poetry, songwriting, visual storytelling, spiritual teaching, therapy, photography, filmmaking — any work that translates inner experience into form.",
    relationships:
      "Sibling relationships may carry confusion or unspoken emotional undercurrents. They need conversations that go beneath the surface. Small talk drains them.",
    challenge:
      "Miscommunication and vagueness. The loop: express something true → it lands differently than intended → confusion → self-doubt about whether they can communicate at all.",
    gift: "The ability to say things that reach people below the level of words. The best creative work from Neptune 3rd carries something that can't be explained — only felt.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Neptune in the 3rd spiritualizes communication — the native's words can heal or confuse, depending on how much clarity is cultivated.",
  },
  {
    planet: "Neptune",
    house: 4,
    domain: "Home, Roots, and Emotional Foundation",
    core: "Neptune in the 4th house means the emotional foundation was built on something that wasn't entirely solid. Maybe the home life was spiritually rich but practically unstable. Maybe a parent was idealized and the reality was complicated. The person carries both deep sensitivity and a longing for a home that feels the way they always imagined it could.",
    career:
      "Work from home, spiritual community building, interior design, caregiving, real estate with a healing purpose. The home needs to feel like a sanctuary.",
    relationships:
      "Home life tends toward the spiritual and aesthetic — they create environments people exhale in. But Neptune here can mean staying in a situation longer than they should because it feels sacred.",
    challenge:
      "Idealizing the past or the idea of home so heavily that the present never quite measures up. A parent may have been absent, addicted, or mysterious — leaving a longing that's hard to name.",
    gift: "The capacity to create a home that feels genuinely sacred — not just decorated, but imbued with something real. A deep reservoir of emotional compassion that others feel immediately.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Neptune in the 4th can indicate a spiritually gifted but emotionally fluid early home environment.",
  },
  {
    planet: "Neptune",
    house: 5,
    domain: "Creativity, Joy, and Self-Expression",
    core: "Neptune in the 5th house is one of the most potent creative placements in the chart. The imagination is oceanic. When this person creates, they are accessing something that feels like it comes through them rather than from them. The challenge is that the real world rarely matches the inner vision — and the gap can be paralyzing.",
    career:
      "Fine art, music composition, film, dance, spiritual performance, teaching with a creative dimension. They need creative work that allows for genuine transcendence, not just technical execution.",
    relationships:
      "Romance is deeply idealized — they fall in love with a feeling as much as a person. When reality sets in, there can be real disappointment. Children, if present, may be spiritually sensitive.",
    challenge:
      "Creative avoidance — the gap between inner vision and finished work can feel so large that starting becomes painful. Romantic illusion and the grief when it dissolves.",
    gift: "Access to creative states most people can't reach. When they trust the channel and commit to the work, what emerges is genuinely moving. Their art doesn't just entertain — it transports.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Neptune in the 5th blesses creative expression with transcendent quality — the native may produce work that outlives them.",
  },
  {
    planet: "Neptune",
    house: 6,
    domain: "Work, Health, and Daily Rhythm",
    core: "Neptune in the 6th house means the body is a sensitive instrument that picks up on everything the conscious mind tries to ignore. Physical symptoms are often the first sign that something in daily life or inner life is off. The work must feel like genuine service or meaning leaks out of it entirely.",
    career:
      "Healing arts, nursing, spiritual counseling, music therapy, social work, holistic medicine, animal care. Any work that serves something the person truly believes in.",
    relationships:
      "May overextend in service to others at their own expense. Pets and animals often provide grounding and a quality of love that feels especially pure.",
    challenge:
      "Health issues that are hard to diagnose or seem to have no clear physical origin. Martyrdom in work — giving everything and ignoring personal limits until the body forces the stop.",
    gift: "Extraordinary capacity for service and healing. When they hold their own limits while still giving, they become the kind of caregiver people never forget — because they actually see the whole person.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Neptune in the 6th dissolves clear boundaries around service — the native struggles with victimhood but carries genuine healing capacity.",
  },
  {
    planet: "Neptune",
    house: 7,
    domain: "Partnership and Commitment",
    core: "Neptune in the 7th house is the placement of the idealized partner. This person has a vision of love so complete, so luminous, that almost no real human can fully occupy it. Not because love isn't real for them — it is, intensely — but because Neptune here merges the partner with the dream.",
    career:
      "Creative partnerships, therapeutic alliances, counseling or mediation. Business partnerships require unusually clear contracts because Neptune dissolves the edges around agreements.",
    relationships:
      "This is the central arena. They may attract partners who need saving, or project spiritual significance onto relationships that aren't carrying that weight. The loop: idealize → merge → reality arrives → disillusionment → grieve → idealize again.",
    challenge:
      "Seeing who's actually in front of them rather than who they need the person to be. Staying in unclear or dissolving situations because they feel sacred.",
    gift: "The capacity for a love that is genuinely transcendent. When both people are real to each other, the depth possible here is rare — a partner who feels completely seen and cherished in ways that are hard to describe.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Neptune in the 7th creates spiritual depth in partnerships but requires grounded partners and clear structures to function.",
  },
  {
    planet: "Neptune",
    house: 8,
    domain: "Transformation, Power, and the Hidden",
    core: "Neptune in the 8th house creates someone who moves through transformation like water through stone — slowly, completely, invisibly. Their relationship with death, the occult, and the deep unconscious is natural and unafraid. They were born close to the veil between worlds, and they know it.",
    career:
      "Depth psychology, hospice work, mediumship, esoteric research, investigative journalism, work with hidden financial structures. They belong where most people are afraid to look.",
    relationships:
      "Intimate relationships carry a spiritual quality that feels fated. Sexual and emotional merging is intense. Shared finances can be confused or subject to subtle deception.",
    challenge:
      "Losing the self in transformation — becoming so fluid there is no stable center. Vulnerability to deception in intimate and financial spheres. Difficulty distinguishing intuition from projection.",
    gift: "Genuine access to the hidden layers of human experience. They understand grief, death, sexuality, and power from the inside. When the self is solid enough to hold it, this becomes profound healing capacity.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Neptune in the 8th deepens the house of transformation — the native is a natural mystic with access to genuine occult knowledge.",
  },
  {
    planet: "Neptune",
    house: 9,
    domain: "Belief, Philosophy, and Higher Truth",
    core: "Neptune in the 9th house creates a person whose spiritual life is vast and beyond any single doctrine. They don't just believe — they experience. The divine is not abstract. It arrives in visions, in synchronicities, in moments of grace that reorganize everything. The challenge is keeping both feet on the ground while holding that much sky.",
    career:
      "Spiritual teaching, mystical writing, interfaith work, philosophy, religious art, long-distance humanitarian work. They carry a transmission, not just information.",
    relationships:
      "May idealize teachers, gurus, or spiritual traditions. Long-distance relationships or foreign partners may carry spiritual significance. They need partners who honor their inner life.",
    challenge:
      "Spiritual bypassing — using transcendence as escape from ordinary life. Guru projection that eventually collapses. Confusion between genuine spiritual experience and wishful thinking.",
    gift: "Direct access to something larger than themselves that they can genuinely transmit. At their best, they don't just describe the path — they embody it. Their belief has a quality of lived experience that moves people.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Neptune in the 9th blesses the native with a deeply mystical, boundary-dissolving relationship with truth and the divine.",
  },
  {
    planet: "Neptune",
    house: 10,
    domain: "Career, Public Life, and Legacy",
    core: "Neptune in the 10th house creates a public image that is somewhat mythologized — people project onto this person, seeing in them whatever they need to see. The career itself may be in the arts, healing, or spiritual work. Or it may be that the way they move through their work carries a quality that can't quite be explained.",
    career:
      "Film, music, visual art, healing professions, spiritual leadership, charitable work, fashion, anything where image, empathy, or inspiration is the core product. The career must mean something or it dissolves from the inside.",
    relationships:
      "Public perception may not match who they actually are. Authority figures may be idealized or deeply disappointing. They may carry a quality of renown that they themselves find bewildering.",
    challenge:
      "Lack of clarity about career direction. Susceptibility to being misrepresented professionally. The loop: rise with an idealized image → reality complicates the image → confusion → reinvention.",
    gift: "The ability to inspire at scale. When work is genuinely aligned with the soul, what they create carries something that lingers in people's lives long after the interaction ends.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Neptune in the 10th dissolves conventional career ambition, replacing it with a calling that serves something beyond the self.",
  },
  {
    planet: "Neptune",
    house: 11,
    domain: "Community, Vision, and the Future",
    core: "Neptune in the 11th house creates someone whose vision for what's possible is compassionate and boundless — and who can lose themselves inside collective movements or causes. The future they dream of is beautiful. The challenge is staying grounded inside the actual work of building it.",
    career:
      "Nonprofit leadership, spiritual community building, music or art collectives, visionary social work, humanitarian organizations. They need to be working toward something that genuinely matters.",
    relationships:
      "Friendships carry an almost spiritual quality. They attract idealistic, artistic, or spiritually oriented people — and can also attract those who mistake their compassion for endless availability.",
    challenge:
      "Dissolving into causes or groups in ways that cost them their own center. The loop: invest in a vision → pour in without limits → feel depleted or betrayed → withdraw → find a new collective.",
    gift: "The ability to hold and transmit a vision of what's possible that genuinely moves people. When their feet are on the ground, they become the person a community organizes around.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Neptune in the 11th spiritualizes collective gains — material success arrives as a byproduct of service rather than direct pursuit.",
  },
  {
    planet: "Neptune",
    house: 12,
    domain: "Solitude, the Hidden Self, and Liberation",
    core: "Neptune in the 12th house — its natural home — means this person has the most direct access of any placement to the infinite. The inner life is vast, oceanic, and sometimes overwhelming. Solitude is not a preference — it's a necessity. What lives behind the curtain of ordinary consciousness is, for them, very close to the surface.",
    career:
      "Contemplative spiritual practice, retreat settings, mystical arts, dream work, depth psychology, behind-the-scenes work in film or music. The most significant contributions may never be fully visible.",
    relationships:
      "A rich, mostly unshared inner world. Compassion that extends to strangers and the forgotten. Partners may sense there is always something just out of reach — not hidden maliciously, but genuinely oceanic.",
    challenge:
      "Escapism, addiction, and dissolution of boundaries as ways to manage an overwhelming inner life. The loop: feel too much → escape → surface → feel too much again.",
    gift: "The most direct mystical access in the chart. When the escapism is released, what remains is genuine union with something vast. At the deepest level, this placement carries the potential for extraordinary spiritual realization.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Neptune in the 12th is considered one of its strongest placements — spiritual dissolution, retreat, and genuine transcendence are available here.",
  },

  // ═══════════════════════════════════════════════════════════════
  // PLUTO — Transformation, power, death/rebirth, the underworld, compulsion
  // ═══════════════════════════════════════════════════════════════

  {
    planet: "Pluto",
    house: 1,
    domain: "Identity and Self-Expression",
    core: "Pluto in the 1st house means this person arrived here with intensity already built in. Their presence is felt before they speak. There is something in them others sense — a depth, an edge, a quality that suggests they have already been through something most people haven't. Because they have, or they will.",
    career:
      "Leadership in transformative fields — psychology, medicine, research, law, investigative work, crisis management. Most effective when the work asks them to go somewhere others won't.",
    relationships:
      "Relationships are never surface-level, even when they try to keep them there. People are either drawn to their depth or unsettled by it. Power dynamics in relationships require conscious attention.",
    challenge:
      "Control issues, intensity that can overwhelm others, compulsive self-reinvention. The loop: build an identity → circumstances force it to die → rebuild from scratch → repeat. Learning that this cycle is not punishment — it's the design.",
    gift: "The capacity to be reborn. They know how to go all the way down and come back with something real. Whatever they build after loss carries an authenticity that only comes from having lost before.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Pluto in the 1st creates a transformative, psychologically intense personality that moves through life with a quality of regeneration.",
  },
  {
    planet: "Pluto",
    house: 2,
    domain: "Money, Values, and Resources",
    core: "Pluto in the 2nd house creates a profound, sometimes obsessive relationship with money, resources, and self-worth. Financial life tends to move in extremes — real accumulation and real loss, sometimes within the same chapter. The deeper story is always about power: what this person believes they are worth, and who gets to decide.",
    career:
      "Finance, banking, investment, estate work, psychology of wealth, resource management. They can build significant material power when the psychological underpinnings are solid.",
    relationships:
      "Money and possessions may become a source of control or conflict. They hold their values with tremendous conviction, and partnerships that challenge core values rarely survive.",
    challenge:
      "Using money as control, or allowing financial fear to drive compulsive accumulation. The deeper wound is often around worth — the belief that value must be earned, proven, or protected.",
    gift: "The ability to understand the psychological dimensions of money and use material resources as instruments of genuine transformation. Powerful builders who know exactly what they're building and why.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Pluto in the 2nd transforms the relationship to wealth — gains come through crisis, inheritance, or radical restructuring of values.",
  },
  {
    planet: "Pluto",
    house: 3,
    domain: "Communication, Thought, and Siblings",
    core: "Pluto in the 3rd house means words are never just words for this person. They say things that land in the body. Their communication has a quality of excavation — they are not interested in the surface. They want what's underneath, and they are willing to go there even when it's uncomfortable.",
    career:
      "Investigative journalism, research, psychology, persuasive writing, legal argument, strategic communication. Any work that requires getting to the truth of something hidden.",
    relationships:
      "Sibling relationships may carry power dynamics or unspoken intensity. Local environment tends to be more charged than average. They need conversations that actually mean something.",
    challenge:
      "Communication that becomes controlling or weaponized. Seeing beneath what others say can be a gift or a source of chronic suspicion. Obsessive thinking patterns that loop.",
    gift: "The ability to communicate in ways that shift something in the listener. At their best, they say the thing no one else will say, and the room changes. Writing that carries real depth.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Pluto in the 3rd gives penetrating communication and the ability to transform through language.",
  },
  {
    planet: "Pluto",
    house: 4,
    domain: "Home, Roots, and Emotional Foundation",
    core: "Pluto in the 4th house means the roots ran deep — and something in those roots was complicated by power. The family of origin may have carried unspoken intensity, control, grief, or secrets. This person's inner life was shaped by something that didn't fully make sense until later. The work of the life is to excavate it, integrate it, and stop carrying what isn't theirs.",
    career:
      "Psychology, family therapy, ancestral healing, real estate, archaeology, work that involves going beneath the surface. The career often becomes more meaningful in proportion to how deeply the inner work has been done.",
    relationships:
      "Home life in adulthood can re-enact family of origin dynamics unless the patterns are made conscious. Deep loyalty and deep intensity with family members. The home environment must feel secure or the person cannot function.",
    challenge:
      "Carrying family trauma as personal identity. The loop: uncover something from the roots → integrate it → think you're done → find the next layer → repeat. This process can span decades.",
    gift: "The most thorough emotional self-knowledge available. They have had to understand themselves from the foundation up. When they've done that work, they become an anchor for others — someone people trust with their deepest material.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Pluto in the 4th intensifies ancestral karma — the native carries significant family-line material that is available for transformation.",
  },
  {
    planet: "Pluto",
    house: 5,
    domain: "Creativity, Joy, and Self-Expression",
    core: "Pluto in the 5th house means creativity is not a hobby — it's a compulsion and a survival mechanism. When this person creates, they are processing something. The work carries weight because the person carries weight. What they make doesn't just express them — it transforms them.",
    career:
      "Art in any serious form, depth psychology with creative applications, film, theater, intense athletic competition, teaching that challenges students to genuinely grow.",
    relationships:
      "Romantic life carries Plutonian intensity — deep attractions, power dynamics, relationships that change both people permanently. Children, if present, are often intense or deeply connected to the parent's own unresolved material.",
    challenge:
      "Compulsive romantic or creative cycles. The loop: deep connection → power struggle surfaces → the form dies → grief → rebirth → repeat. Learning to let things be joyful, without that feeling like a threat.",
    gift: "Art or self-expression that carries genuine power. The best work from this placement doesn't decorate reality — it reveals it. People remember it. It changes them.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Pluto in the 5th intensifies creative output and romantic depth — what is created here tends to carry lasting significance.",
  },
  {
    planet: "Pluto",
    house: 6,
    domain: "Work, Health, and Daily Rhythm",
    core: "Pluto in the 6th house means the body keeps score, and does not do so quietly. Physical health is directly connected to what's been suppressed, the work poured into, and the power dynamics tolerated. The body will not stay silent indefinitely — eventually it demands a reckoning.",
    career:
      "Medicine, surgery, intensive research, military service, crisis management, transformative coaching. They need work that challenges them completely and serves a genuine purpose. Mediocre work makes them ill.",
    relationships:
      "Work relationships may carry power imbalances that need to be addressed directly. Service to others can become a site of control or martyrdom if the boundaries aren't clear.",
    challenge:
      "Work obsession as avoidance of deeper material. Health crises that force a reckoning with what's been suppressed. The loop: push through → body breaks down → forced rest → insight → rebuild.",
    gift: "Extraordinary capacity for focused, transformative work. When aligned, they work with a power and purpose that produces results that are hard to explain. They are the person you want in the crisis.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Pluto in the 6th intensifies the relationship to illness and service — crises become catalysts for profound transformation.",
  },
  {
    planet: "Pluto",
    house: 7,
    domain: "Partnership and Commitment",
    core: "Pluto in the 7th house means partnership is the arena of transformation. Every significant relationship enters them and changes them — not gently, but completely. They attract partners who carry depth, intensity, or power. What gets worked out in the relationship is often the most important psychological work of the life.",
    career:
      "Business partnerships may be powerful and volatile. Law, mediation, consulting, any work involving negotiation of power. Contractual relationships tend toward intensity.",
    relationships:
      "This is the core arena. Relationships are never casual. Power dynamics are central and must be made conscious. There may be controlling partners, or they themselves hold control without realizing it. The best partnerships are ones where both people are genuinely committed to each other's growth.",
    challenge:
      "Repeated cycles of intense union followed by crisis or dissolution. The loop: deep merging → power struggle surfaces → the relationship either transforms or ends → grief → rebuild. Learning that the intensity is the gift, not the problem.",
    gift: "The capacity for the most transformative partnership possible. When both people are conscious and willing, a Pluto 7th relationship becomes a crucible that produces something neither person could have built alone.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Pluto in the 7th intensifies marriage and partnership — the native's deepest transformation happens through the mirror of the other.",
  },
  {
    planet: "Pluto",
    house: 8,
    domain: "Transformation, Power, and the Hidden",
    core: "Pluto in the 8th house — its natural home — creates someone for whom depth is not optional. They were born understanding that beneath the surface of ordinary life runs something older, heavier, and more real. Death, power, sex, money, and the invisible forces that move through people are not abstract. They live inside all of it.",
    career:
      "Depth psychology, forensics, research into hidden systems, financial power structures, occult or esoteric work, surgery, crisis counseling. They belong wherever the truth has been buried.",
    relationships:
      "Intimacy carries the full weight of Pluto — complete merging, complete vulnerability, and the transformation that follows. Shared resources and inheritances may be significant or contentious. Sexual and emotional depth is non-negotiable.",
    challenge:
      "The obsessive quality of Pluto in its own house — the inability to release what needs to die, or conversely, the compulsive need to destroy what's actually worth keeping. Learning to trust the cycle rather than control it.",
    gift: "The most complete version of Pluto's gift: the ability to go all the way into darkness and come back with genuine knowledge. This is the placement of the shaman, the depth psychologist — the person who has seen what most people spend their lives avoiding, and who can hold space for others to do the same.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Pluto in the 8th is considered its most powerful placement — the native is an instrument of deep transformation, for themselves and those around them.",
  },
  {
    planet: "Pluto",
    house: 9,
    domain: "Belief, Philosophy, and Higher Truth",
    core: "Pluto in the 9th house means the belief system must be earned through direct encounter — not inherited, not borrowed. This person has had their worldview destroyed and rebuilt at least once, often more. What they believe at the end of that process is real in a way that untested belief never can be.",
    career:
      "Philosophy, religious scholarship, transformative education, legal reform, cross-cultural power analysis, spiritual leadership that has passed through the fire.",
    relationships:
      "Teachers and spiritual figures may be powerful presences — empowering or controlling. Foreign travel and cross-cultural exposure carries transformative weight. They need partners who can handle the depth of their worldview.",
    challenge:
      "Replacing one rigid worldview with another just as inflexible after transformation. The loop: receive a philosophy → deconstruct it → feel the loss → build a new one → eventually deconstruct that too.",
    gift: "A philosophy of life that has actually been tested. What they know, they know in their bones. When they speak about what they believe, people feel the weight of lived experience behind the words. This is wisdom, not opinion.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Pluto in the 9th transforms the native's relationship to truth itself — dharma must be earned through death and rebirth of the belief system.",
  },
  {
    planet: "Pluto",
    house: 10,
    domain: "Career, Public Life, and Legacy",
    core: "Pluto in the 10th house means the career is a site of power — either the person accumulates it, confronts it, or both. The public role carries weight, sometimes controversy. They don't just build careers — they transform industries, institutions, or public conversations. The professional life moves in seismic shifts rather than gradual climbs.",
    career:
      "Leadership in any serious form — government, corporate power, activist leadership, medicine, law, media. Most effective when the work needs the full force of their power.",
    relationships:
      "The relationship to authority is central — either they become the authority, or they spend years confronting one. Public reputation may be complicated or polarizing. Career demands can consume personal life.",
    challenge:
      "Power struggles in the professional arena. Destruction of the public persona at key points — either by external forces or their own compulsion. The loop: build a position of power → something forces its death → rebuild → often more powerful than before.",
    gift: "A legacy that actually means something. Not because it was played safe, but because it was built through the full truth of who they are. The most significant Pluto 10th careers are the ones that changed something.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Pluto in the 10th creates career-level transformation — the native's public role is an instrument of power and eventual regeneration.",
  },
  {
    planet: "Pluto",
    house: 11,
    domain: "Community, Vision, and the Future",
    core: "Pluto in the 11th house means the relationship to groups, communities, and collective vision carries real weight — and real danger. This person has the ability to move through social structures and change them from the inside. They also have the capacity to be consumed by them. The group either transforms under their influence, or they get burned by it.",
    career:
      "Collective leadership, social transformation, political organizing, technology that reshapes communities, investigative work into institutional power. They don't join movements — they catalyze them.",
    relationships:
      "Friendships tend to be intense, purposeful, or transformative. Casual social connection often feels like a waste. They may experience powerful betrayals within groups that alter their understanding of collective trust permanently.",
    challenge:
      "Using power in group settings unconsciously, or being subject to group power in destabilizing ways. The loop: invest in a collective vision → the group's shadow surfaces → rupture → transformation → new relationship to community.",
    gift: "The ability to see the power structures beneath the social surface and help collective systems evolve into something more honest. The communities they touch become genuinely more powerful and self-aware.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Pluto in the 11th transforms community and collective gains — power in groups, reforming networks, long-term vision that outlasts the individual.",
  },
  {
    planet: "Pluto",
    house: 12,
    domain: "Solitude, the Hidden Self, and Liberation",
    core: "Pluto in the 12th house means the most intense material lives in the place that is hardest to see. The unconscious holds something powerful — ancestral, karmic, or deeply personal — that surfaces through dreams, through crisis, through what emerges in solitude. This person cannot outrun what's in the 12th house. It will find them.",
    career:
      "Depth psychology, spiritual direction, prison or hospital work, research into hidden systems, work with the dying or marginalized. The most important work happens where most people won't go.",
    relationships:
      "There may be a hidden inner life that is rarely fully shared. Sacrifices made in private. A quality of carrying weight that partners sense but can't name. Solitude is not optional — it's where the real self lives.",
    challenge:
      "The unconscious Pluto is one of the most complex placements to navigate — power, compulsion, and shadow operate below the threshold of awareness until something forces them up. Addiction, self-undoing, or a chronic sense of being undermined from within.",
    gift: "Access to the deepest possible transformation. When the 12th house Pluto material has been genuinely met — not bypassed — what emerges is a quality of spiritual power and psychological freedom that very few people ever reach. The genuine inner alchemist.",
    vedic:
      "No classical Vedic equivalent. In hybrid charts, Pluto in the 12th creates deep karmic transformation through loss, hidden power, and eventual liberation — the native's greatest work is internal.",
  },
];

// ─── Lookup Function ──────────────────────────────────────────────────────────

export function getPlanetInHouse(
  planet: string,
  house: number
): PlanetInHouseMeaning | null {
  const normalized =
    planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
  return (
    PLANET_IN_HOUSE.find(p => p.planet === normalized && p.house === house) ??
    null
  );
}

export function getHouseMeanings(
  planets: Array<{ name: string; house: number }>
): PlanetInHouseMeaning[] {
  const results: PlanetInHouseMeaning[] = [];
  for (const p of planets) {
    const meaning = getPlanetInHouse(p.name, p.house);
    if (meaning) results.push(meaning);
  }
  return results;
}


/**
 * Epistemic status of the legacy source material.
 *
 * "tradition-attributed-unverified" means the legacy dataset named a tradition
 * or classical source family, but did not supply a pinpoint source for this
 * exact record. It must not be presented as a verified quotation.
 *
 * "modern-synthesis" identifies the Uranus, Neptune, and Pluto entries as
 * modern astrological interpretations, not classical Jyotish doctrine.
 */
export type PlanetInHouseEpistemicStatus =
  | "tradition-attributed-unverified"
  | "modern-synthesis";

export type PlanetInHouseKnowledgeRecord = PlanetInHouseMeaning & {
  epistemicStatus: PlanetInHouseEpistemicStatus;
  tradition: "vedic" | "western";
  sourceTitle: string;
  sourceCaveat: string;
  interpretiveGuardrail: string;
  ruleId: string;
};

const CLASSICAL_JYOTISH_GRAHAS = new Set([
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
]);

const PLANET_IN_HOUSE_INTERPRETIVE_GUARDRAIL =
  "Interpret this as a symbolic possibility, not a deterministic claim about a person's character, family, relationships, health, career, or future. Use contextual language such as 'may describe' or 'can symbolize,' compare it with other chart evidence, and test it against the person's lived experience. Do not infer a diagnosis or guarantee an event.";

/**
 * Canon-safe lookup for the expanded legacy library.
 *
 * The original text remains available, but each returned record carries an
 * explicit provenance label and a guardrail for evidence-packet / interpreter
 * use. Matching is case-insensitive and the 12-house range is validated.
 */
export function getPlanetInHouseKnowledge(
  planet: string,
  house: number
): PlanetInHouseKnowledgeRecord | null {
  if (!Number.isInteger(house) || house < 1 || house > 12) return null;

  const record = getPlanetInHouse(planet, house);
  if (!record) return null;

  const isClassicalJyotishGraha = CLASSICAL_JYOTISH_GRAHAS.has(record.planet);

  return {
    ...record,
    epistemicStatus: isClassicalJyotishGraha
      ? "tradition-attributed-unverified"
      : "modern-synthesis",
    tradition: isClassicalJyotishGraha ? "vedic" : "western",
    sourceTitle: isClassicalJyotishGraha
      ? "Legacy dataset attribution: Brihat Parashara Hora Shastra; Phaladeepika; Saravali; Jataka Parijata; Uttara Kalamrita (no record-level citation supplied)"
      : "Legacy Firmament modern outer-planet interpretation (no record-level citation supplied)",
    sourceCaveat: isClassicalJyotishGraha
      ? "The legacy dataset attributes the nine-graha subset to named Jyotish texts, but does not cite a specific passage for this placement. Treat this as a traditional-source-attributed synthesis, not a verified quotation or a claim of universal agreement across Jyotish lineages."
      : "Uranus, Neptune, and Pluto are modern additions to this library. This entry is modern astrological synthesis and must not be described as classical Vedic doctrine.",
    interpretiveGuardrail: PLANET_IN_HOUSE_INTERPRETIVE_GUARDRAIL,
    ruleId: isClassicalJyotishGraha
      ? "legacy-vedic-planet-in-house-attributed-unverified"
      : "legacy-modern-outer-planet-in-house-synthesis",
  };
}
