import { P, StoryDioramaSchema, type StoryDiorama, type StoryDioramaInput, type StoryLayer } from "../../engines/story-diorama/src/model";

/**
 * MINDNEST TALES — original animal fables with Chintu (cheetah cub) and his mother Rani, ONE master story rendered in
 * every language channel: same scenes and art, only narration, captions and titles change. That is what keeps 7+
 * language channels on schedule (the old setup made each one separately and most stopped on 13-21 Oct 2026).
 * Story-diorama engine, storybook finish, no comment ask (children's content: comments are off on "made for kids").
 * Five scenes: once upon a time -> problem -> mistake / try -> turn -> moral (card) + subscribe line.
 * Add a language: one entry in LANGS + a `text` entry in every fable + a channel in channels/channels.ts.
 */

export const MINDNEST_LANGS = ["hi", "es", "ar", "de", "ja", "ko", "fil", "en", "pt", "fr", "vi"] as const;
export type MindNestLang = (typeof MINDNEST_LANGS)[number];

interface LangInfo {
  /** YouTube defaultLanguage. */
  code: string;
  name: string;
  handle: string;
  /** "Moral" label on the card. */
  moral: string;
  /** Last line spoken after the moral: subscribe CTA. `{m}` = the moral. */
  outro: string;
  /** Latin script: headlines can split words; others are kept as one unit per line (bidi / CJK safe). */
  latin: boolean;
  hashtags: string;
  series: string;
}

export const LANGS: Record<MindNestLang, LangInfo> = {
  hi: { code: "hi", name: "Hindi", handle: "@HindiMindNestTales", moral: "आज की सीख", outro: "आज की सीख: {m} नई कहानी के लिए सब्सक्राइब करें!", latin: false, hashtags: "#kahani #bachonkikahani #moralstories #hindistories #shorts", series: "Bachchon ki Kahani" },
  es: { code: "es", name: "Spanish", handle: "@SpanishMindNestTales", moral: "MORALEJA", outro: "La moraleja de hoy: {m} ¡Suscríbete para un nuevo cuento!", latin: true, hashtags: "#cuentos #cuentosinfantiles #fabulas #cuentosparaniños #shorts", series: "Cuentos" },
  ar: { code: "ar", name: "Arabic", handle: "@ArabicMindNestTales", moral: "العبرة", outro: "عبرة اليوم: {m} اشتركوا لقصة جديدة!", latin: false, hashtags: "#قصص_اطفال #حكايات #قصص #shorts", series: "قصص أطفال" },
  de: { code: "de", name: "German", handle: "@GermanMindNestTales", moral: "DIE MORAL", outro: "Die Moral von heute: {m} Abonniere für eine neue Geschichte!", latin: true, hashtags: "#gutenachtgeschichte #kindergeschichten #fabeln #märchen #shorts", series: "Geschichten" },
  ja: { code: "ja", name: "Japanese", handle: "@JapaneseMindNestTales", moral: "きょうのおしえ", outro: "きょうのおしえ。{m} あたらしいおはなしは、チャンネル登録してね！", latin: false, hashtags: "#絵本 #童話 #読み聞かせ #子供向け #shorts", series: "おはなし" },
  ko: { code: "ko", name: "Korean", handle: "@KoreanMindNestTales", moral: "오늘의 교훈", outro: "오늘의 교훈: {m} 새로운 이야기를 보려면 구독해 주세요!", latin: false, hashtags: "#동화 #어린이동화 #교훈 #동화책 #shorts", series: "동화" },
  en: { code: "en", name: "English", handle: "@EnglishMindNestTales", moral: "MORAL", outro: "Today's moral: {m} Subscribe for a new story!", latin: true, hashtags: "#bedtimestories #kidsstories #moralstories #fables #shorts", series: "Bedtime Stories" },
  pt: { code: "pt", name: "Portuguese", handle: "@PortugueseMindNestTales", moral: "MORAL", outro: "A moral de hoje: {m} Inscreva-se para uma nova história!", latin: true, hashtags: "#historinhas #historiasinfantis #fabulas #historiaparadormir #shorts", series: "Historinhas" },
  fr: { code: "fr", name: "French", handle: "@FrenchMindNestTales", moral: "LA MORALE", outro: "La morale du jour : {m} Abonne-toi pour une nouvelle histoire !", latin: true, hashtags: "#histoirepourenfants #contes #fables #histoiredusoir #shorts", series: "Histoires" },
  vi: { code: "vi", name: "Vietnamese", handle: "@VietnameseMindNestTales", moral: "BÀI HỌC", outro: "Bài học hôm nay: {m} Hãy đăng ký kênh để nghe chuyện mới nhé!", latin: true, hashtags: "#truyenthieunhi #truyenngungon #truyenkechobe #shorts", series: "Truyện thiếu nhi" },
  fil: { code: "fil", name: "Filipino", handle: "@FilipinoMindNestTales", moral: "ARAL", outro: "Ang aral ngayon: {m} Mag-subscribe para sa bagong kuwento!", latin: true, hashtags: "#kwentongpambata #pabula #kwento #aralingbuhay #shorts", series: "Kwentong Pambata" }
};

interface Text { title: [string, string]; s: [string, string, string, string]; moral: [string, string] }
interface Fable { id: string; scenes: (() => StoryLayer[])[]; skies: [string, string][]; night: boolean[]; text: Record<MindNestLang, Text> }

const A = (kind: string, x: number, y: number, extra: Record<string, unknown> = {}, layer: Partial<StoryLayer> = {}) =>
  P("animal", x, y, { depth: 0.9, enter: "rise", idle: "bob", ...layer, data: { kind, ...extra } }) as StoryLayer;
const CHINTU = (x: number, y: number, mood = "happy", layer: Partial<StoryLayer> = {}) => A("cheetah", x, y, { small: true, mood, scarf: "#F0533F" }, layer);
const RANI = (x: number, y: number, mood = "happy", layer: Partial<StoryLayer> = {}) => A("cheetah", x, y, { mood }, layer);
const meadow = (night = false): StoryLayer[] => [
  P(night ? "moon" : "sun", 820, 640, { depth: 0.1, idle: "pulse" }) as StoryLayer,
  P("clouds", 540, 760, { depth: 0.2, idle: "drift" }) as StoryLayer,
  P("hills", 540, 1380, { depth: 0.3, data: { color: night ? "#2C4A3E" : "#6FB86A" } }) as StoryLayer,
  P("tree", 110, 1480, { depth: 0.5, scale: 0.85, idle: "sway" }) as StoryLayer,
  P("tree", 990, 1470, { depth: 0.5, scale: 0.75, idle: "sway" }) as StoryLayer
];
const DAY: [string, string] = ["#8FD3F0", "#D9F2D0"];
const DUSK: [string, string] = ["#F6B27A", "#F7D9A8"];
const NIGHT: [string, string] = ["#1B2550", "#3A3F7A"];
const STORM: [string, string] = ["#2A2F45", "#4A5070"];

/** Seven fables = one week on every language channel. Public-domain motifs (thirsty crow) retold originally. */
const FABLES: Fable[] = [
  {
    id: "patience",
    skies: [DAY, DAY, DAY, DAY, DAY], night: [false, false, false, false, false],
    scenes: [
      () => [...meadow(), RANI(330, 1560), CHINTU(700, 1580)],
      () => [...meadow(), P("butterfly", 600, 1000, { depth: 0.8, enter: "pop" }) as StoryLayer, CHINTU(380, 1580, "proud")],
      () => [...meadow(), P("water", 540, 1600, { depth: 0.6, data: { color: "#7A5A3A" } }) as StoryLayer, CHINTU(540, 1600, "sad"), P("butterfly", 760, 900, { depth: 0.8 }) as StoryLayer],
      () => [...meadow(), RANI(300, 1560), CHINTU(680, 1580, "sleepy"), P("butterfly", 680, 1310, { depth: 1, at: 2.5, enter: "drop", data: { path: "rest" } }) as StoryLayer],
      () => [...meadow(), RANI(260, 1580), CHINTU(820, 1600), P("moralCard", 540, 1020, { depth: 0.8, at: 0.3, enter: "pop" }) as StoryLayer]
    ],
    text: {
      hi: { title: ["चिंटू ने", "सीखा सब्र"], moral: ["सब्र का फल", "मीठा होता है।"], s: [
        "एक हरे भरे जंगल में, चिंटू नाम का एक छोटा सा चीता अपनी माँ रानी के साथ रहता था। चिंटू को तेज़ दौड़ना बहुत पसंद था।",
        "एक सुबह उसने एक चमकती नीली तितली देखी। मैं इसे पकड़ूँगा! वो चिल्लाया, और उसके पीछे भागा।",
        "पर वो जितना तेज़ भागता, तितली उतनी तेज़ उड़ती। छपाक! चिंटू फिसला और कीचड़ में गिर गया।",
        "रानी मुस्कुराई। चुपचाप बैठो और इंतज़ार करो, बेटा। चिंटू शांत बैठा, और तितली धीरे से उसकी नाक पर आ बैठी!"] },
      es: { title: ["Chintu aprende", "a esperar"], moral: ["La paciencia trae", "cosas buenas."], s: [
        "En un bosque verde vivía Chintu, un pequeño cachorro de guepardo, con su mamá Rani. A Chintu le encantaba correr rápido.",
        "Una mañana vio una mariposa azul brillante. ¡La voy a atrapar!, gritó, y corrió tras ella.",
        "Pero cuanto más rápido corría, más rápido volaba ella. ¡Plaf! Chintu resbaló y cayó en el lodo.",
        "Rani sonrió. Quédate quieto y espera, mi amor. Chintu se sentó en silencio... ¡y la mariposa se posó suavemente en su nariz!"] },
      ar: { title: ["شينتو", "يتعلم الصبر"], moral: ["الصبر مفتاح", "الفرج."], s: [
        "في غابة خضراء، عاش شينتو، شبل فهد صغير، مع أمه راني. كان شينتو يحب الركض بسرعة.",
        "في صباح ما، رأى فراشة زرقاء لامعة. صاح: سأمسك بها! وركض خلفها.",
        "لكن كلما ركض أسرع، طارت هي أسرع. طاخ! انزلق شينتو ووقع في الطين.",
        "ابتسمت راني وقالت: اجلس بهدوء وانتظر يا صغيري. جلس شينتو بهدوء، فحطت الفراشة برفق على أنفه!"] },
      de: { title: ["Chintu lernt", "zu warten"], moral: ["Geduld bringt", "Gutes."], s: [
        "In einem grünen Wald lebte Chintu, ein kleines Gepardenjunges, mit seiner Mama Rani. Chintu rannte für sein Leben gern schnell.",
        "Eines Morgens sah er einen leuchtend blauen Schmetterling. Den fange ich!, rief er und rannte hinterher.",
        "Doch je schneller er rannte, desto schneller flog der Schmetterling. Platsch! Chintu rutschte aus und fiel in den Matsch.",
        "Rani lächelte. Sitz still und warte, mein Schatz. Chintu saß ganz ruhig... und der Schmetterling landete sanft auf seiner Nase!"] },
      ja: { title: ["チントゥの", "がまん"], moral: ["まつことで、", "いいことがくる。"], s: [
        "みどりの森に、チーターの子ども、チントゥが、ママのラニとくらしていました。チントゥは、はやく走るのが大すき。",
        "ある朝、きらきら光る青いちょうちょを見つけました。「つかまえるぞ！」チントゥはさけんで、走りだしました。",
        "でも、はやく走れば走るほど、ちょうちょもはやくとんでいきます。ばしゃん！チントゥはすべって、どろの中へ。",
        "ラニはにっこり。「じっとすわって、まってごらん。」チントゥがしずかにまっていると、ちょうちょがそっと鼻にとまりました！"] },
      ko: { title: ["기다림을", "배운 친투"], moral: ["기다리면", "좋은 일이 와요."], s: [
        "푸른 숲속에 아기 치타 친투가 엄마 라니와 함께 살았어요. 친투는 빨리 달리는 걸 정말 좋아했어요.",
        "어느 아침, 친투는 반짝이는 파란 나비를 보았어요. 내가 잡을 거야! 친투는 외치며 달려갔어요.",
        "하지만 빨리 달릴수록 나비도 더 빨리 날아갔어요. 철퍼덕! 친투는 미끄러져 진흙에 넘어졌어요.",
        "라니가 웃으며 말했어요. 가만히 앉아서 기다려 보렴. 친투가 조용히 기다리자, 나비가 살포시 코에 앉았어요!"] },
      fil: { title: ["Si Chintu at", "ang Paghihintay"], moral: ["Ang pasensya ay", "may magandang bunga."], s: [
        "Sa isang luntiang gubat, nakatira si Chintu, isang maliit na batang cheetah, kasama ang nanay niyang si Rani. Mahilig tumakbo nang mabilis si Chintu.",
        "Isang umaga, nakakita siya ng makintab na asul na paru-paro. Huhulihin kita! sigaw niya, at hinabol niya ito.",
        "Pero habang pabilis siya nang pabilis, pabilis din ang lipad ng paru-paro. Plak! Nadulas si Chintu at nahulog sa putik.",
        "Ngumiti si Rani. Umupo ka lang at maghintay, anak. Tahimik na naghintay si Chintu... at dahan-dahang dumapo ang paru-paro sa ilong niya!"] },
      en: { title: ["Chintu Learns", "to Wait"], moral: ["Patience brings", "good things."], s: [
        "In a green forest lived Chintu, a little cheetah cub, with his mother Rani. Chintu loved to run fast.",
        "One morning he saw a bright blue butterfly. I will catch it! he shouted, and rushed after it.",
        "But the faster he ran, the faster it flew. Splash! Chintu slipped and fell into the mud.",
        "Rani smiled. Sit still and wait, my dear. Chintu sat quietly... and the butterfly landed softly on his nose!"] },
      pt: { title: ["Chintu aprende", "a esperar"], moral: ["A paciência traz", "coisas boas."], s: [
        "Numa floresta verde vivia Chintu, um filhotinho de guepardo, com sua mamãe Rani. Chintu adorava correr rápido.",
        "Uma manhã, ele viu uma borboleta azul brilhante. Vou pegar você!, gritou, e correu atrás dela.",
        "Mas quanto mais rápido ele corria, mais rápido ela voava. Splash! Chintu escorregou e caiu na lama.",
        "Rani sorriu. Fique quietinho e espere, meu amor. Chintu sentou em silêncio... e a borboleta pousou de leve no nariz dele!"] },
      fr: { title: ["Chintu apprend", "à attendre"], moral: ["La patience apporte", "de belles choses."], s: [
        "Dans une forêt verte vivait Chintu, un petit bébé guépard, avec sa maman Rani. Chintu adorait courir vite.",
        "Un matin, il vit un papillon bleu tout brillant. Je vais l'attraper !, cria-t-il, et il courut derrière lui.",
        "Mais plus il courait vite, plus le papillon volait vite. Splash ! Chintu glissa et tomba dans la boue.",
        "Rani sourit. Assieds-toi sans bouger et attends, mon chéri. Chintu s'assit tout calme... et le papillon se posa doucement sur son nez !"] },
      vi: { title: ["Chintu học", "cách chờ đợi"], moral: ["Kiên nhẫn sẽ mang lại", "điều tốt đẹp."], s: [
        "Trong một khu rừng xanh, có chú báo con Chintu sống cùng mẹ Rani. Chintu rất thích chạy thật nhanh.",
        "Một buổi sáng, cậu thấy một chú bướm xanh lấp lánh. Mình sẽ bắt được nó! cậu reo lên, rồi chạy theo.",
        "Nhưng cậu chạy càng nhanh, bướm càng bay nhanh. Bõm! Chintu trượt chân ngã xuống bùn.",
        "Mẹ Rani mỉm cười. Con ngồi yên và chờ nhé. Chintu ngồi im lặng... và chú bướm nhẹ nhàng đậu lên mũi cậu!"] }
    }
  },
  {
    id: "kindness",
    skies: [DUSK, DUSK, DUSK, DUSK, DUSK], night: [false, false, false, false, false],
    scenes: [
      () => [...meadow(), CHINTU(320, 1580), A("rabbit", 760, 1600, { mood: "sad" }, { at: 1.2 })],
      () => [...meadow(), CHINTU(300, 1580), A("rabbit", 760, 1600, { mood: "scared" })],
      () => [...meadow(), CHINTU(420, 1580, "proud"), A("rabbit", 800, 1600, { mood: "happy" })],
      () => [...meadow(), P("tree", 540, 1480, { depth: 0.6, scale: 1.6 }) as StoryLayer, A("rabbit", 320, 1600, { color: "#D9CFC2" }), A("rabbit", 470, 1610, { small: true }), A("rabbit", 640, 1600, {}), CHINTU(880, 1600, "proud")],
      () => [...meadow(), CHINTU(300, 1600), A("rabbit", 800, 1600, {}), P("moralCard", 540, 1020, { depth: 0.8, at: 0.3, enter: "pop" }) as StoryLayer]
    ],
    text: {
      hi: { title: ["चिंटू और", "खोया खरगोश"], moral: ["दया से अजनबी भी", "दोस्त बन जाते हैं।"], s: [
        "एक शाम, चिंटू ने झाड़ी के पीछे किसी के रोने की आवाज़ सुनी। वहाँ मीमी नाम की एक छोटी खरगोश अकेली बैठी थी।",
        "मैं रास्ता भूल गई हूँ, घर नहीं मिल रहा, मीमी रोई। चिंटू को देखकर वो काँप गई। तुम मुझे डराओगे?",
        "नहीं! चिंटू ने प्यार से कहा। मैं तुम्हारी मदद करूँगा। उसने ज़मीन सूँघी, और खरगोश के छोटे छोटे पैरों के निशान ढूँढ लिए।",
        "निशानों के पीछे चलते चलते, वो एक बड़े खोखले पेड़ तक पहुँचे। मीमी का परिवार उससे लिपट गया, और सबने चिंटू को धन्यवाद कहा।"] },
      es: { title: ["Chintu y la", "conejita perdida"], moral: ["La bondad convierte a", "extraños en amigos."], s: [
        "Una tarde, Chintu oyó a alguien llorar detrás de un arbusto. Era Mimi, una conejita, muy solita.",
        "Me perdí y no encuentro mi casa, lloraba Mimi. Al ver a Chintu, tembló. ¿Me vas a asustar?",
        "¡No!, dijo Chintu con dulzura. Te voy a ayudar. Olfateó el suelo y encontró pequeñas huellas de conejo.",
        "Siguieron las huellas hasta un gran árbol hueco. La familia de Mimi la abrazó, y todos le dieron las gracias a Chintu."] },
      ar: { title: ["شينتو", "والأرنبة"], moral: ["اللطف يجعل الغرباء", "أصدقاء."], s: [
        "في إحدى الأمسيات، سمع شينتو صوت بكاء خلف شجيرة. كانت ميمي، أرنبة صغيرة، وحيدة تمامًا.",
        "قالت ميمي وهي تبكي: لقد ضعت ولا أجد بيتي. وعندما رأت شينتو ارتجفت: هل ستخيفني؟",
        "قال شينتو بلطف: لا! سأساعدك. وشمّ الأرض فوجد آثار أقدام أرنب صغيرة.",
        "تبعا الآثار حتى وصلا إلى شجرة كبيرة مجوفة. عانقت عائلة ميمي ابنتها، وشكر الجميع شينتو."] },
      de: { title: ["Chintu und das", "kleine Häschen"], moral: ["Freundlichkeit macht", "Fremde zu Freunden."], s: [
        "Eines Abends hörte Chintu jemanden hinter einem Busch weinen. Es war Mimi, ein kleines Häschen, ganz allein.",
        "Ich habe mich verlaufen und finde mein Zuhause nicht, schluchzte Mimi. Als sie Chintu sah, zitterte sie. Willst du mir Angst machen?",
        "Nein!, sagte Chintu sanft. Ich helfe dir. Er schnupperte am Boden und fand winzige Hasenspuren.",
        "Sie folgten den Spuren bis zu einem großen hohlen Baum. Mimis Familie umarmte sie, und alle bedankten sich bei Chintu."] },
      ja: { title: ["チントゥと", "まいごのうさぎ"], moral: ["やさしさは、", "ともだちをつくる。"], s: [
        "ある夕方、チントゥはしげみのうしろから、なき声を聞きました。小さなうさぎのミミが、ひとりぼっちでないていました。",
        "「まいごになって、おうちがわからないの。」ミミはチントゥを見て、ぶるぶるふるえました。「わたしをこわがらせるの？」",
        "「ちがうよ！」チントゥはやさしく言いました。「たすけてあげる。」地面のにおいをかぐと、小さなうさぎの足あとが見つかりました。",
        "足あとをたどると、大きな木のうろにつきました。ミミの家族はミミをだきしめ、みんなでチントゥにありがとうと言いました。"] },
      ko: { title: ["친투와", "길 잃은 토끼"], moral: ["친절은 낯선 이를", "친구로 만들어요."], s: [
        "어느 저녁, 친투는 덤불 뒤에서 우는 소리를 들었어요. 아기 토끼 미미가 혼자 울고 있었어요.",
        "길을 잃어서 집을 못 찾겠어. 미미는 친투를 보고 덜덜 떨었어요. 나를 겁주려는 거야?",
        "아니야! 친투가 다정하게 말했어요. 내가 도와줄게. 친투는 땅 냄새를 맡고 작은 토끼 발자국을 찾았어요.",
        "발자국을 따라가니 커다란 나무 구멍 집이 나왔어요. 미미의 가족은 미미를 꼭 안아 주고, 모두 친투에게 고맙다고 했어요."] },
      fil: { title: ["Si Chintu at", "ang Kuneho"], moral: ["Ang kabaitan ay", "nagdudulot ng kaibigan."], s: [
        "Isang gabi, may narinig si Chintu na umiiyak sa likod ng halaman. Si Mimi pala, isang maliit na kuneho, mag-isa.",
        "Naliligaw ako, hindi ko mahanap ang bahay ko, iyak ni Mimi. Nang makita niya si Chintu, nanginig siya. Tatakutin mo ba ako?",
        "Hindi! malumanay na sabi ni Chintu. Tutulungan kita. Inamoy niya ang lupa at nakita ang maliliit na bakas ng kuneho.",
        "Sinundan nila ang mga bakas hanggang sa isang malaking guwang na puno. Niyakap si Mimi ng kanyang pamilya, at nagpasalamat silang lahat kay Chintu."] },
      en: { title: ["Chintu and the", "Lost Bunny"], moral: ["Kindness turns strangers", "into friends."], s: [
        "One evening, Chintu heard someone crying behind a bush. It was Mimi, a little bunny, all alone.",
        "I'm lost, and I can't find my home, sobbed Mimi. When she saw Chintu, she shivered. Are you going to scare me?",
        "No! said Chintu gently. I'll help you. He sniffed the ground and found tiny bunny footprints.",
        "They followed the footprints to a big hollow tree. Mimi's family hugged her, and everyone thanked Chintu."] },
      pt: { title: ["Chintu e a", "coelhinha"], moral: ["A bondade transforma", "estranhos em amigos."], s: [
        "Uma tarde, Chintu ouviu alguém chorando atrás de um arbusto. Era Mimi, uma coelhinha, sozinha.",
        "Eu me perdi e não acho minha casa, chorava Mimi. Quando viu Chintu, ela tremeu. Você vai me assustar?",
        "Não!, disse Chintu com carinho. Eu vou te ajudar. Ele farejou o chão e encontrou pegadinhas de coelho.",
        "Eles seguiram as pegadas até uma grande árvore oca. A família de Mimi a abraçou, e todos agradeceram a Chintu."] },
      fr: { title: ["Chintu et la", "petite lapine"], moral: ["La gentillesse change", "les inconnus en amis."], s: [
        "Un soir, Chintu entendit quelqu'un pleurer derrière un buisson. C'était Mimi, une petite lapine, toute seule.",
        "Je suis perdue et je ne trouve pas ma maison, sanglotait Mimi. En voyant Chintu, elle trembla. Tu vas me faire peur ?",
        "Non !, dit Chintu doucement. Je vais t'aider. Il renifla le sol et trouva de toutes petites traces de lapin.",
        "Ils suivirent les traces jusqu'à un grand arbre creux. La famille de Mimi la serra fort, et tout le monde remercia Chintu."] },
      vi: { title: ["Chintu và", "thỏ con đi lạc"], moral: ["Lòng tốt biến người lạ", "thành bạn bè."], s: [
        "Một buổi chiều, Chintu nghe tiếng ai khóc sau bụi cây. Đó là Mimi, một cô thỏ nhỏ, chỉ có một mình.",
        "Mình bị lạc, không tìm thấy nhà, Mimi nức nở. Thấy Chintu, cô run lên. Bạn định làm mình sợ à?",
        "Không đâu! Chintu dịu dàng nói. Mình sẽ giúp bạn. Cậu ngửi mặt đất và tìm thấy những dấu chân thỏ nhỏ xíu.",
        "Họ đi theo dấu chân đến một cây lớn có hốc rỗng. Gia đình Mimi ôm chầm lấy cô, và mọi người cảm ơn Chintu."] }
    }
  },
  {
    id: "sharing",
    skies: [DAY, DAY, DAY, DAY, DAY], night: [false, false, false, false, false],
    scenes: [
      () => [...meadow(), P("mango", 540, 1080, { depth: 0.7, enter: "drop", idle: "sway" }) as StoryLayer, CHINTU(300, 1580), A("monkey", 790, 1600)],
      () => [...meadow(), P("mango", 540, 1300, { depth: 0.9, idle: "bob" }) as StoryLayer, CHINTU(300, 1580, "proud"), A("monkey", 790, 1600, { mood: "proud" })],
      () => [...meadow(), P("water", 540, 1560, { depth: 0.6 }) as StoryLayer, P("mango", 700, 1470, { depth: 0.8, idle: "drift" }) as StoryLayer, CHINTU(260, 1600, "sad"), A("monkey", 840, 1620, { mood: "sad" })],
      () => [...meadow(), P("mango", 540, 1280, { depth: 0.9, data: { half: true } }) as StoryLayer, CHINTU(300, 1580), A("monkey", 790, 1600)],
      () => [...meadow(), CHINTU(280, 1600), A("monkey", 800, 1610), P("moralCard", 540, 1020, { depth: 0.8, at: 0.3, enter: "pop" }) as StoryLayer]
    ],
    text: {
      hi: { title: ["एक आम,", "दो दोस्त"], moral: ["बाँटकर खाने का", "मज़ा ही अलग है।"], s: [
        "चिंटू और बंदर भोलू को, नीची डाल पर एक पका हुआ सुनहरा आम मिला।",
        "ये मेरा है! चिंटू बोला। नहीं, मेरा! भोलू बोला। दोनों खींचतान करने लगे, और झगड़ने लगे।",
        "धप! आम फिसला, नदी में गिरा, और बहकर दूर चला गया। अब किसी के पास आम नहीं था।",
        "अगले दिन उन्हें एक और आम मिला। इस बार भोलू ने उसके दो हिस्से किए, और दोनों ने हँसते हँसते साथ में खाया।"] },
      es: { title: ["Un mango,", "dos amigos"], moral: ["Compartir es más dulce", "que pelear."], s: [
        "Chintu y el mono Bholu encontraron un mango maduro y dorado en una rama baja.",
        "¡Es mío!, dijo Chintu. ¡No, es mío!, dijo Bholu. Jalaban y jalaban, y discutían.",
        "¡Plop! El mango se resbaló, cayó al río y se fue flotando lejos. Ahora nadie tenía mango.",
        "Al día siguiente encontraron otro mango. Esta vez Bholu lo partió a la mitad, y se lo comieron juntos, riendo."] },
      ar: { title: ["مانجو واحدة", "وصديقان"], moral: ["المشاركة أحلى", "من الشجار."], s: [
        "وجد شينتو والقرد بولو حبة مانجو ناضجة ذهبية على غصن منخفض.",
        "قال شينتو: إنها لي! وقال بولو: لا، إنها لي! وأخذا يشدّان ويتجادلان.",
        "بلوب! انزلقت المانجو، وسقطت في النهر، وطفت بعيدًا. والآن لم يعد لدى أحد مانجو.",
        "في اليوم التالي وجدا مانجو أخرى. هذه المرة قسمها بولو نصفين، وأكلاها معًا وهما يضحكان."] },
      de: { title: ["Eine Mango,", "zwei Freunde"], moral: ["Teilen ist süßer", "als Streiten."], s: [
        "Chintu und Bholu, der Affe, fanden eine reife, goldene Mango an einem niedrigen Ast.",
        "Die gehört mir!, sagte Chintu. Nein, mir!, sagte Bholu. Sie zogen und zerrten und stritten.",
        "Plumps! Die Mango rutschte weg, fiel in den Fluss und trieb davon. Jetzt hatte keiner eine Mango.",
        "Am nächsten Tag fanden sie wieder eine Mango. Diesmal teilte Bholu sie in zwei Hälften, und sie aßen sie lachend zusammen."] },
      ja: { title: ["ひとつの", "マンゴー"], moral: ["わけあうと、", "もっとおいしい。"], s: [
        "チントゥとおさるのボールーは、ひくいえだに、じゅくした金色のマンゴーをひとつ見つけました。",
        "「ぼくのだ！」とチントゥ。「ちがう、ぼくのだ！」とボールー。ふたりはひっぱりあって、けんかをはじめました。",
        "ぽちゃん！マンゴーはすべって川におち、とおくへながれていきました。これでだれもたべられません。",
        "つぎの日、またマンゴーを見つけました。こんどはボールーがはんぶんにわけて、ふたりでわらいながらたべました。"] },
      ko: { title: ["망고 하나,", "친구 둘"], moral: ["나누면", "더 달콤해요."], s: [
        "친투와 원숭이 볼루는 낮은 나뭇가지에서 잘 익은 황금빛 망고 하나를 발견했어요.",
        "내 거야! 친투가 말했어요. 아니, 내 거야! 볼루가 말했어요. 둘은 서로 잡아당기며 다투었어요.",
        "퐁당! 망고가 미끄러져 강물에 빠지더니 멀리 떠내려갔어요. 이제 아무도 망고를 먹을 수 없었어요.",
        "다음 날 둘은 또 망고를 찾았어요. 이번에는 볼루가 반으로 나누었고, 둘은 웃으며 함께 먹었어요."] },
      fil: { title: ["Isang Mangga", "Para sa Dalawa"], moral: ["Mas matamis ang", "pagbabahagi."], s: [
        "Nakakita sina Chintu at Bholu na unggoy ng isang hinog at gintong mangga sa mababang sanga.",
        "Akin 'yan! sabi ni Chintu. Hindi, akin! sabi ni Bholu. Hinila nila nang hinila at nag-away sila.",
        "Plop! Nadulas ang mangga, nahulog sa ilog, at inanod palayo. Ngayon, wala nang mangga ang kahit sino.",
        "Kinabukasan, may nakita silang isa pang mangga. Hinati ito ni Bholu sa dalawa, at sabay nila itong kinain habang tumatawa."] },
      en: { title: ["One Mango,", "Two Friends"], moral: ["Sharing is sweeter", "than fighting."], s: [
        "Chintu and Bholu the monkey found one ripe, golden mango on a low branch.",
        "It's mine! said Chintu. No, mine! said Bholu. They pulled and tugged and argued.",
        "Plop! The mango slipped, fell into the river, and floated far away. Now nobody had a mango.",
        "The next day they found another mango. This time Bholu cut it in half, and they ate it together, laughing."] },
      pt: { title: ["Uma manga,", "dois amigos"], moral: ["Dividir é mais doce", "que brigar."], s: [
        "Chintu e o macaco Bholu encontraram uma manga madura e dourada num galho baixo.",
        "É minha!, disse Chintu. Não, é minha!, disse Bholu. Eles puxavam e puxavam, e brigavam.",
        "Ploft! A manga escorregou, caiu no rio e foi boiando para longe. Agora ninguém tinha manga.",
        "No dia seguinte, encontraram outra manga. Desta vez, Bholu cortou ao meio, e eles comeram juntos, rindo."] },
      fr: { title: ["Une mangue,", "deux amis"], moral: ["Partager est plus doux", "que se disputer."], s: [
        "Chintu et Bholu le singe trouvèrent une mangue mûre et dorée sur une branche basse.",
        "C'est à moi !, dit Chintu. Non, à moi !, dit Bholu. Ils tiraient, tiraient, et se disputaient.",
        "Plouf ! La mangue glissa, tomba dans la rivière et partit au fil de l'eau. Plus personne n'avait de mangue.",
        "Le lendemain, ils trouvèrent une autre mangue. Cette fois, Bholu la coupa en deux, et ils la mangèrent ensemble en riant."] },
      vi: { title: ["Một quả xoài,", "hai người bạn"], moral: ["Chia sẻ ngọt ngào", "hơn tranh giành."], s: [
        "Chintu và khỉ Bholu tìm thấy một quả xoài chín vàng trên cành thấp.",
        "Của mình! Chintu nói. Không, của mình! Bholu nói. Hai bạn kéo qua kéo lại và cãi nhau.",
        "Tõm! Quả xoài tuột tay, rơi xuống sông và trôi đi xa. Giờ chẳng ai có xoài cả.",
        "Hôm sau, họ tìm được một quả xoài khác. Lần này Bholu bổ đôi, và hai bạn vừa ăn vừa cười vui vẻ."] }
    }
  },
  {
    id: "bravery",
    skies: [NIGHT, STORM, STORM, NIGHT, NIGHT], night: [true, true, true, true, true],
    scenes: [
      () => [...meadow(true), A("owl", 900, 1180, { mood: "scared" }, { idle: "none" })],
      () => [P("clouds", 540, 600, { depth: 0.2, idle: "drift", data: { dark: true } }) as StoryLayer, P("hills", 540, 1300, { depth: 0.3 }) as StoryLayer, P("tree", 900, 1450, { depth: 0.5, scale: 1.2, idle: "sway" }) as StoryLayer, CHINTU(400, 1600, "scared")],
      () => [P("clouds", 540, 600, { depth: 0.2, idle: "drift" }) as StoryLayer, P("hills", 540, 1300, { depth: 0.3 }) as StoryLayer, CHINTU(360, 1600, "scared"), A("owl", 720, 1560, { mood: "happy" }, { enter: "drop" })],
      () => [...meadow(true), CHINTU(420, 1600, "happy"), A("owl", 680, 1560, { mood: "happy" })],
      () => [...meadow(true), CHINTU(300, 1600), A("owl", 800, 1580), P("moralCard", 540, 1020, { depth: 0.8, at: 0.3, enter: "pop" }) as StoryLayer]
    ],
    text: {
      hi: { title: ["साथ में", "बहादुर"], moral: ["दोस्त साथ हों,", "तो डर भाग जाता है।"], s: [
        "नीनी नाम की एक छोटी उल्लू को अँधेरे से डर लगता था। पर उल्लू तो रात को ही जागते हैं! हर शाम वो अपने पेड़ में छिप जाती।",
        "एक रात बड़ा तूफ़ान आया। धड़ाम! बादल गरजे, और चिंटू, जो कभी नहीं डरता था, काँपने लगा।",
        "नीनी नीचे उड़ आई। मुझे अँधेरे से डर लगता है, तुम्हें बादलों से। चलो, साथ बैठते हैं, उसने धीरे से कहा।",
        "दोनों पास पास बैठकर बारिश की बूँदें गिनते रहे, जब तक तूफ़ान चला नहीं गया। चाँदनी में अँधेरा अब डरावना नहीं लगा।"] },
      es: { title: ["Valientes", "juntos"], moral: ["Los amigos nos", "hacen valientes."], s: [
        "Nini, una pequeña lechuza, le tenía miedo a la oscuridad. ¡Pero las lechuzas despiertan de noche! Cada tarde se escondía en su árbol.",
        "Una noche llegó una gran tormenta. ¡Bum! Retumbó el trueno, y Chintu, que nunca tenía miedo, empezó a temblar.",
        "Nini bajó volando. Yo le tengo miedo a la oscuridad, tú al trueno. Sentémonos juntos, susurró.",
        "Lado a lado, contaron las gotas de lluvia hasta que pasó la tormenta. Bajo la luna, la oscuridad ya no daba miedo."] },
      ar: { title: ["شجعان", "معًا"], moral: ["الأصدقاء", "يجعلوننا شجعانًا."], s: [
        "كانت نيني، بومة صغيرة، تخاف من الظلام. لكن البوم يستيقظ في الليل! وكل مساء كانت تختبئ في شجرتها.",
        "في إحدى الليالي جاءت عاصفة كبيرة. بوم! دوّى الرعد، فبدأ شينتو، الذي لا يخاف أبدًا، يرتجف.",
        "طارت نيني إليه وهمست: أنا أخاف من الظلام، وأنت تخاف من الرعد. لنجلس معًا.",
        "جلسا جنبًا إلى جنب يعدّان قطرات المطر حتى مرّت العاصفة. وفي ضوء القمر، لم يعد الظلام مخيفًا."] },
      de: { title: ["Zusammen", "mutig"], moral: ["Freunde machen", "uns mutig."], s: [
        "Nini, eine kleine Eule, hatte Angst im Dunkeln. Dabei werden Eulen doch nachts wach! Jeden Abend versteckte sie sich in ihrem Baum.",
        "Eines Nachts kam ein großes Gewitter. Bumm! Der Donner grollte, und Chintu, der nie Angst hatte, begann zu zittern.",
        "Nini flog herunter. Ich habe Angst im Dunkeln, du hast Angst vor Donner. Setzen wir uns zusammen, flüsterte sie.",
        "Seite an Seite zählten sie die Regentropfen, bis das Gewitter vorbei war. Im Mondlicht sah die Dunkelheit gar nicht mehr gruselig aus."] },
      ja: { title: ["いっしょなら", "こわくない"], moral: ["ともだちが", "ゆうきをくれる。"], s: [
        "小さなふくろうのニニは、くらやみがこわいのです。でも、ふくろうは夜におきるもの！ニニは毎晩、木の中にかくれていました。",
        "ある夜、大きなあらしがきました。ゴロゴロ、ドーン！かみなりがなると、なにもこわくないチントゥが、ふるえだしました。",
        "ニニがとんできて、そっと言いました。「わたしはくらやみがこわい。あなたはかみなりがこわい。いっしょにすわろう。」",
        "ふたりはならんで、あらしがすぎるまで雨つぶをかぞえました。月の光の中で、くらやみはもうこわくありませんでした。"] },
      ko: { title: ["함께라면", "용감해"], moral: ["친구가 있으면", "용감해져요."], s: [
        "아기 부엉이 니니는 어둠이 무서웠어요. 하지만 부엉이는 밤에 깨어나는걸요! 니니는 매일 저녁 나무 속에 숨었어요.",
        "어느 밤, 큰 폭풍이 왔어요. 우르르 쾅! 천둥이 치자, 한 번도 무서워한 적 없던 친투가 떨기 시작했어요.",
        "니니가 날아와 속삭였어요. 나는 어둠이 무섭고, 너는 천둥이 무섭구나. 우리 같이 앉아 있자.",
        "둘은 나란히 앉아 폭풍이 지나갈 때까지 빗방울을 세었어요. 달빛 아래, 어둠은 더 이상 무섭지 않았어요."] },
      fil: { title: ["Magkasamang", "Matapang"], moral: ["Ang kaibigan ay", "nagbibigay ng tapang."], s: [
        "Takot sa dilim si Nini, isang maliit na kuwago. Pero gising ang mga kuwago tuwing gabi! Tuwing gabi, nagtatago siya sa kanyang puno.",
        "Isang gabi, dumating ang malakas na bagyo. Bum! Kumulog nang malakas, at si Chintu, na hindi kailanman natatakot, ay nanginig.",
        "Lumipad pababa si Nini. Takot ako sa dilim, takot ka sa kulog. Magtabi tayo, bulong niya.",
        "Magkatabi nilang binilang ang mga patak ng ulan hanggang lumipas ang bagyo. Sa liwanag ng buwan, hindi na nakakatakot ang dilim."] },
      en: { title: ["Brave", "Together"], moral: ["Friends make", "us brave."], s: [
        "Nini, a little owl, was afraid of the dark. But owls wake up at night! Every evening, she hid in her tree.",
        "One night a big storm came. Boom! Thunder rolled, and Chintu, who was never scared, began to tremble.",
        "Nini flew down. I'm scared of the dark, you're scared of thunder. Let's sit together, she whispered.",
        "Side by side, they counted the raindrops until the storm passed. In the moonlight, the dark didn't look scary anymore."] },
      pt: { title: ["Corajosos", "juntos"], moral: ["Os amigos nos", "deixam corajosos."], s: [
        "Nini, uma corujinha, tinha medo do escuro. Mas as corujas acordam à noite! Toda tarde ela se escondia na sua árvore.",
        "Uma noite chegou uma grande tempestade. Bum! O trovão rugiu, e Chintu, que nunca tinha medo, começou a tremer.",
        "Nini desceu voando. Eu tenho medo do escuro, você tem medo do trovão. Vamos ficar juntos, ela sussurrou.",
        "Lado a lado, eles contaram as gotas de chuva até a tempestade passar. Sob a lua, o escuro não dava mais medo."] },
      fr: { title: ["Courageux", "ensemble"], moral: ["Les amis nous", "rendent courageux."], s: [
        "Nini, une petite chouette, avait peur du noir. Pourtant, les chouettes se réveillent la nuit ! Chaque soir, elle se cachait dans son arbre.",
        "Une nuit, un gros orage arriva. Boum ! Le tonnerre gronda, et Chintu, qui n'avait jamais peur, se mit à trembler.",
        "Nini descendit en volant. Moi, j'ai peur du noir, et toi, du tonnerre. Asseyons-nous ensemble, chuchota-t-elle.",
        "Côte à côte, ils comptèrent les gouttes de pluie jusqu'à la fin de l'orage. Sous la lune, le noir ne faisait plus peur du tout."] },
      vi: { title: ["Cùng nhau", "dũng cảm"], moral: ["Bạn bè giúp ta", "dũng cảm hơn."], s: [
        "Nini, một cô cú nhỏ, rất sợ bóng tối. Nhưng cú lại thức dậy vào ban đêm! Chiều nào cô cũng trốn trong cây.",
        "Một đêm, cơn bão lớn ập đến. Ầm! Sấm rền vang, và Chintu, người chưa bao giờ sợ, bắt đầu run rẩy.",
        "Nini bay xuống. Mình sợ bóng tối, bạn sợ sấm. Mình ngồi cạnh nhau nhé, cô thì thầm.",
        "Ngồi sát bên nhau, hai bạn đếm từng giọt mưa cho đến khi bão tan. Dưới ánh trăng, bóng tối chẳng còn đáng sợ nữa."] }
    }
  },
  {
    id: "truth",
    skies: [DAY, DAY, DAY, DAY, DAY], night: [false, false, false, false, false],
    scenes: [
      () => [...meadow(), P("kalash", 360, 1560, { depth: 0.8 }) as StoryLayer, A("elephant", 760, 1600, {})],
      () => [...meadow(), P("kalash", 420, 1580, { depth: 0.8, enter: "drop" }) as StoryLayer, P("water", 420, 1640, { depth: 0.7 }) as StoryLayer, CHINTU(760, 1600, "scared")],
      () => [...meadow(), A("elephant", 320, 1600, { mood: "sad" }), CHINTU(760, 1600, "sad")],
      () => [...meadow(), A("elephant", 320, 1600, { mood: "happy" }), CHINTU(700, 1600, "happy"), P("kalash", 520, 1600, { depth: 0.9, at: 3 }) as StoryLayer],
      () => [...meadow(), A("elephant", 260, 1600, {}), CHINTU(820, 1600), P("moralCard", 540, 1020, { depth: 0.8, at: 0.3, enter: "pop" }) as StoryLayer]
    ],
    text: {
      hi: { title: ["चिंटू ने", "सच बोला"], moral: ["सच बोलने से", "मन हल्का होता है।"], s: [
        "हाथी गजू ने एक बड़े मिट्टी के घड़े में नदी का ठंडा पानी भरा, और उसे पेड़ के नीचे रख दिया।",
        "चिंटू पकड़म पकड़ाई खेल रहा था, और धड़ाम! घड़ा गिर गया। सारा पानी बह गया।",
        "मेरा घड़ा किसने गिराया? गजू ने पूछा। चिंटू का दिल ज़ोर से धड़का। शायद, हवा ने? उसने पंजों को देखते हुए कहा।",
        "पर उसका मन भारी हो गया। गजू, वो मैं था, माफ़ करना। गजू मुस्कुराया। सच बोलने के लिए शुक्रिया, चलो साथ में नया भरते हैं।"] },
      es: { title: ["Chintu dice", "la verdad"], moral: ["La verdad aligera", "el corazón."], s: [
        "Gaju, el elefante, llenó una gran olla de barro con agua fresca del río y la dejó bajo un árbol.",
        "Chintu jugaba a las atrapadas y... ¡crash! Tiró la olla. Toda el agua se derramó.",
        "¿Quién tiró mi olla?, preguntó Gaju. El corazón de Chintu latía rápido. ¿Quizás el viento?, dijo, mirando sus patitas.",
        "Pero sentía la pancita pesada. Gaju, fui yo. Lo siento. Gaju sonrió. Gracias por decir la verdad. Llenemos otra juntos."] },
      ar: { title: ["شينتو", "يقول الصدق"], moral: ["الصدق يجعل القلب", "خفيفًا."], s: [
        "ملأ الفيل جاجو جرة فخارية كبيرة بماء النهر البارد، وتركها تحت شجرة.",
        "كان شينتو يلعب لعبة المطاردة، و... طاخ! أوقع الجرة. وانسكب كل الماء.",
        "سأل جاجو: من أوقع جرتي؟ خفق قلب شينتو بسرعة، وقال وهو ينظر إلى كفّيه: ربما الريح؟",
        "لكنه شعر بثقل في قلبه، فقال: جاجو، أنا من فعلها. أنا آسف. ابتسم جاجو: شكرًا لأنك قلت الصدق. هيا نملأ جرة جديدة معًا."] },
      de: { title: ["Chintu sagt", "die Wahrheit"], moral: ["Die Wahrheit macht", "das Herz leicht."], s: [
        "Gaju, der Elefant, füllte einen großen Tonkrug mit kühlem Flusswasser und stellte ihn unter einen Baum.",
        "Chintu spielte Fangen und, krach! Er stieß den Krug um. Das ganze Wasser lief aus.",
        "Wer hat meinen Krug umgeworfen?, fragte Gaju. Chintus Herz klopfte schnell. Vielleicht der Wind?, sagte er und schaute auf seine Pfoten.",
        "Aber sein Bauch fühlte sich schwer an. Gaju, das war ich. Es tut mir leid. Gaju lächelte. Danke, dass du ehrlich bist. Komm, wir füllen zusammen einen neuen."] },
      ja: { title: ["チントゥの", "ほんとうのこと"], moral: ["ほんとうのことを言うと、", "心がかるくなる。"], s: [
        "ぞうのガジュは、大きなつぼに、川のつめたい水をいっぱい入れて、木の下におきました。",
        "おにごっこをしていたチントゥが、ガシャン！つぼをたおしてしまいました。水はぜんぶこぼれてしまいました。",
        "「だれがつぼをたおしたの？」とガジュ。チントゥの胸はドキドキ。「かぜ、かな？」と、足もとを見ながら言いました。",
        "でも、心がずっとおもいのです。「ガジュ、ぼくがやったんだ。ごめんね。」ガジュはにっこり。「ほんとうのことを言ってくれて、ありがとう。いっしょに水をくもう。」"] },
      ko: { title: ["친투의", "솔직한 마음"], moral: ["솔직하면", "마음이 가벼워요."], s: [
        "코끼리 가주는 커다란 항아리에 시원한 강물을 가득 담아 나무 아래에 두었어요.",
        "술래잡기를 하던 친투가, 와장창! 항아리를 넘어뜨렸어요. 물이 모두 쏟아졌어요.",
        "누가 내 항아리를 넘어뜨렸지? 가주가 물었어요. 친투의 가슴이 두근두근. 바람인가? 친투는 발만 보며 말했어요.",
        "하지만 마음이 무거웠어요. 가주야, 사실 나였어. 미안해. 가주는 웃었어요. 솔직하게 말해 줘서 고마워. 같이 새로 물을 담자."] },
      fil: { title: ["Nagsabi ng", "Totoo si Chintu"], moral: ["Gumagaan ang loob", "kapag nagsasabi ng totoo."], s: [
        "Pinuno ni Gaju, ang elepante, ang isang malaking banga ng malamig na tubig mula sa ilog, at iniwan ito sa ilalim ng puno.",
        "Naglalaro ng habulan si Chintu at, bag! Natumba niya ang banga. Tumapon ang lahat ng tubig.",
        "Sino ang nagtumba ng banga ko? tanong ni Gaju. Bumilis ang tibok ng puso ni Chintu. Baka ang hangin? sabi niya habang nakatingin sa paa niya.",
        "Pero bumigat ang loob niya. Gaju, ako ang may gawa. Patawad. Ngumiti si Gaju. Salamat sa pagsasabi ng totoo. Halika, punuin natin ang bago."] },
      en: { title: ["Chintu Tells", "the Truth"], moral: ["The truth makes", "your heart light."], s: [
        "Gaju the elephant filled a big clay pot with cool river water and left it under a tree.",
        "Chintu was playing chase and, crash! He knocked the pot over. All the water spilled out.",
        "Who knocked over my pot? asked Gaju. Chintu's heart beat fast. Maybe the wind? he said, looking at his paws.",
        "But his tummy felt heavy. Gaju, it was me. I'm sorry. Gaju smiled. Thank you for telling the truth. Let's fill a new one together."] },
      pt: { title: ["Chintu fala", "a verdade"], moral: ["A verdade deixa", "o coração leve."], s: [
        "Gaju, o elefante, encheu um grande pote de barro com água fresquinha do rio e deixou embaixo de uma árvore.",
        "Chintu brincava de pega-pega e, crash! Derrubou o pote. Toda a água se derramou.",
        "Quem derrubou meu pote?, perguntou Gaju. O coração de Chintu batia rápido. Talvez o vento?, disse ele, olhando para as patinhas.",
        "Mas a barriguinha ficou pesada. Gaju, fui eu. Desculpa. Gaju sorriu. Obrigado por falar a verdade. Vamos encher outro juntos."] },
      fr: { title: ["Chintu dit", "la vérité"], moral: ["La vérité rend", "le cœur léger."], s: [
        "Gaju l'éléphant remplit une grande jarre d'eau fraîche de la rivière et la laissa sous un arbre.",
        "Chintu jouait à chat et, crac ! Il renversa la jarre. Toute l'eau se répandit.",
        "Qui a renversé ma jarre ?, demanda Gaju. Le cœur de Chintu battait vite. Peut-être le vent ?, dit-il en regardant ses pattes.",
        "Mais il avait le ventre tout lourd. Gaju, c'était moi. Pardon. Gaju sourit. Merci de dire la vérité. Allons en remplir une autre ensemble."] },
      vi: { title: ["Chintu nói", "sự thật"], moral: ["Nói thật giúp", "lòng nhẹ nhàng."], s: [
        "Voi Gaju đổ đầy nước sông mát lạnh vào một chiếc chum đất lớn rồi để dưới gốc cây.",
        "Chintu đang chơi đuổi bắt thì, choang! Cậu làm đổ chiếc chum. Nước chảy hết ra ngoài.",
        "Ai làm đổ chum của mình? Gaju hỏi. Tim Chintu đập thình thịch. Chắc là gió? cậu nói, mắt nhìn xuống chân.",
        "Nhưng lòng cậu nặng trĩu. Gaju ơi, là mình đấy. Mình xin lỗi. Gaju mỉm cười. Cảm ơn bạn đã nói thật. Mình cùng múc chum mới nhé."] }
    }
  },
  {
    id: "clever-crow",
    skies: [DAY, DAY, DAY, DAY, DAY], night: [false, false, false, false, false],
    scenes: [
      () => [...meadow(), P("kalash", 600, 1590, { depth: 0.8 }) as StoryLayer, A("crow", 760, 1440, {}, { enter: "drop" }), CHINTU(260, 1600)],
      () => [...meadow(), P("kalash", 600, 1590, { depth: 0.8 }) as StoryLayer, A("crow", 740, 1440, { mood: "sad" }), CHINTU(260, 1600, "sad")],
      () => [...meadow(), P("kalash", 600, 1590, { depth: 0.8 }) as StoryLayer, A("crow", 740, 1440, { mood: "proud" }), CHINTU(260, 1600)],
      () => [...meadow(), P("kalash", 600, 1590, { depth: 0.8 }) as StoryLayer, A("crow", 660, 1420, { mood: "happy" }), CHINTU(260, 1600, "happy")],
      () => [...meadow(), A("crow", 800, 1500, {}), CHINTU(280, 1600), P("moralCard", 540, 1020, { depth: 0.8, at: 0.3, enter: "pop" }) as StoryLayer]
    ],
    text: {
      hi: { title: ["चतुर कौआ", "कालू"], moral: ["सोचो, और कभी", "हार मत मानो।"], s: [
        "गर्मी के एक दिन, कालू कौए को बहुत प्यास लगी थी। चिंटू ने देखा, वो एक पुराने घड़े के पास जाकर बैठा।",
        "घड़े में नीचे थोड़ा सा पानी था, पर कालू की चोंच वहाँ तक नहीं पहुँची। चिंटू बोला, छोड़ दो कालू।",
        "पर कालू ने सोचा। फिर उसने एक कंकड़ उठाकर घड़े में डाला। टन! फिर एक और, फिर एक और।",
        "धीरे धीरे पानी ऊपर आता गया, और कालू ने भरपेट पानी पिया! वाह, चिंटू बोला। तुमने तो दिमाग़ लगाया!"] },
      es: { title: ["Kalu, el cuervo", "listo"], moral: ["Piensa bien y", "nunca te rindas."], s: [
        "Un día caluroso de verano, Kalu el cuervo tenía mucha sed. Chintu lo vio posarse junto a una olla vieja.",
        "Había un poquito de agua en el fondo, pero el pico de Kalu no alcanzaba. Chintu suspiró: Ríndete, Kalu.",
        "Pero Kalu pensó y pensó. Luego tomó una piedrita y la dejó caer. ¡Plin! Y otra, y otra más.",
        "Poco a poco el agua subió y subió, ¡hasta que Kalu pudo beber! ¡Guau!, dijo Chintu. ¡Usaste tu cabeza!"] },
      ar: { title: ["كالو", "الغراب الذكي"], moral: ["فكّر جيدًا،", "ولا تستسلم أبدًا."], s: [
        "في يوم صيفي حار، كان الغراب كالو عطشانًا جدًا. ورآه شينتو يحط بجانب جرة قديمة.",
        "كان في قاع الجرة قليل من الماء، لكن منقار كالو لم يصل إليه. تنهد شينتو وقال: استسلم يا كالو.",
        "لكن كالو فكّر طويلًا. ثم التقط حصاة وأسقطها في الجرة. بلينك! ثم أخرى، وأخرى.",
        "شيئًا فشيئًا ارتفع الماء، حتى استطاع كالو أن يشرب! قال شينتو: رائع! لقد استخدمت عقلك!"] },
      de: { title: ["Kalu, der", "kluge Rabe"], moral: ["Denk nach und", "gib niemals auf."], s: [
        "An einem heißen Sommertag hatte Kalu, der Rabe, großen Durst. Chintu sah, wie er neben einem alten Krug landete.",
        "Unten im Krug war ein bisschen Wasser, aber Kalus Schnabel kam nicht heran. Chintu seufzte: Gib auf, Kalu.",
        "Aber Kalu dachte nach. Dann hob er einen Kieselstein auf und ließ ihn hineinfallen. Plink! Dann noch einen und noch einen.",
        "Langsam stieg das Wasser höher und höher, bis Kalu trinken konnte! Wow, sagte Chintu. Du hast deinen Kopf benutzt!"] },
      ja: { title: ["かしこい", "カラスのカルー"], moral: ["よく考えて、", "あきらめない。"], s: [
        "あつい夏の日、カラスのカルーは、のどがからからでした。チントゥは、カルーが古いつぼのそばにおりるのを見ました。",
        "つぼのそこに水が少しありますが、くちばしがとどきません。チントゥはため息。「あきらめなよ、カルー。」",
        "でもカルーはよく考えました。そして小石をひとつ、つぼに入れました。ポチャン！またひとつ、またひとつ。",
        "水はだんだん上がってきて、とうとうカルーは水をのめました！「すごい！」とチントゥ。「あたまをつかったんだね！」"] },
      ko: { title: ["똑똑한", "까마귀 칼루"], moral: ["잘 생각하고,", "포기하지 마세요."], s: [
        "무더운 여름날, 까마귀 칼루는 몹시 목이 말랐어요. 친투는 칼루가 낡은 항아리 옆에 내려앉는 걸 보았어요.",
        "항아리 바닥에 물이 조금 있었지만, 칼루의 부리가 닿지 않았어요. 친투가 한숨을 쉬었어요. 포기해, 칼루.",
        "하지만 칼루는 곰곰이 생각했어요. 그리고 조약돌 하나를 물어 항아리에 떨어뜨렸어요. 퐁! 또 하나, 또 하나.",
        "물이 조금씩 차오르더니, 마침내 칼루가 물을 마실 수 있었어요! 우와! 친투가 말했어요. 머리를 썼구나!"] },
      fil: { title: ["Si Kalu, ang", "Matalinong Uwak"], moral: ["Mag-isip nang mabuti", "at huwag sumuko."], s: [
        "Isang mainit na araw ng tag-init, uhaw na uhaw si Kalu, ang uwak. Nakita ni Chintu na dumapo siya sa tabi ng isang lumang banga.",
        "May kaunting tubig sa ilalim, pero hindi ito maabot ng tuka ni Kalu. Napabuntong-hininga si Chintu. Sumuko ka na, Kalu.",
        "Pero nag-isip nang mabuti si Kalu. Pumulot siya ng maliit na bato at inihulog ito. Plink! Isa pa, at isa pa.",
        "Dahan-dahang tumaas ang tubig, hanggang nakainom si Kalu! Wow, sabi ni Chintu. Ginamit mo ang isip mo!"] },
      en: { title: ["Kalu the", "Clever Crow"], moral: ["Think hard and", "never give up."], s: [
        "On a hot summer day, Kalu the crow was very thirsty. Chintu watched him land beside an old pot.",
        "There was a little water at the bottom, but Kalu's beak couldn't reach it. Chintu sighed. Give up, Kalu.",
        "But Kalu thought hard. Then he picked up a pebble and dropped it in. Plink! Then another, and another.",
        "Slowly the water rose higher and higher, until Kalu could drink! Wow, said Chintu. You used your brain!"] },
      pt: { title: ["Kalu, o corvo", "esperto"], moral: ["Pense bem e", "nunca desista."], s: [
        "Num dia quente de verão, Kalu, o corvo, estava com muita sede. Chintu viu quando ele pousou ao lado de um pote velho.",
        "Tinha um pouquinho de água no fundo, mas o bico de Kalu não alcançava. Chintu suspirou. Desiste, Kalu.",
        "Mas Kalu pensou bastante. Então pegou uma pedrinha e jogou dentro. Plim! Depois outra, e mais outra.",
        "Pouco a pouco a água foi subindo, até Kalu conseguir beber! Uau!, disse Chintu. Você usou a cabeça!"] },
      fr: { title: ["Kalu, le", "corbeau malin"], moral: ["Réfléchis bien et", "n'abandonne jamais."], s: [
        "Par une chaude journée d'été, Kalu le corbeau avait très soif. Chintu le vit se poser près d'une vieille jarre.",
        "Il y avait un peu d'eau au fond, mais le bec de Kalu ne l'atteignait pas. Chintu soupira. Abandonne, Kalu.",
        "Mais Kalu réfléchit. Puis il prit un caillou et le laissa tomber dedans. Plic ! Puis un autre, et encore un autre.",
        "Peu à peu, l'eau monta, monta, jusqu'à ce que Kalu puisse boire ! Waouh, dit Chintu. Tu as utilisé ta tête !"] },
      vi: { title: ["Kalu, chú quạ", "thông minh"], moral: ["Hãy suy nghĩ và", "đừng bao giờ bỏ cuộc."], s: [
        "Vào một ngày hè nóng nực, quạ Kalu khát nước lắm. Chintu thấy cậu đáp xuống cạnh một chiếc chum cũ.",
        "Dưới đáy chum có một ít nước, nhưng mỏ của Kalu không với tới. Chintu thở dài. Bỏ cuộc đi, Kalu.",
        "Nhưng Kalu suy nghĩ thật kỹ. Rồi cậu nhặt một viên sỏi thả vào chum. Tõm! Thêm một viên, rồi một viên nữa.",
        "Nước dâng lên từ từ, cho đến khi Kalu uống được! Ồ, Chintu nói. Bạn đã dùng trí thông minh!"] }
    }
  },
  {
    id: "thank-you",
    skies: [DAY, DAY, DUSK, DUSK, DUSK], night: [false, false, false, false, false],
    scenes: [
      () => [...meadow(), P("water", 540, 1640, { depth: 0.6 }) as StoryLayer, A("deer", 300, 1560, {}), A("bear", 790, 1600, {}), CHINTU(540, 1500, "happy", { at: 1 })],
      () => [...meadow(), CHINTU(540, 1600, "happy", { idle: "walk" })],
      () => [...meadow(), RANI(320, 1580), CHINTU(740, 1600, "scared")],
      () => [...meadow(), A("deer", 260, 1560, { mood: "happy" }), CHINTU(540, 1600, "proud"), A("bear", 830, 1600, { mood: "happy" })],
      () => [...meadow(), RANI(260, 1580), CHINTU(820, 1600), P("moralCard", 540, 1020, { depth: 0.8, at: 0.3, enter: "pop" }) as StoryLayer]
    ],
    text: {
      hi: { title: ["जादुई", "शब्द"], moral: ["हमेशा", "धन्यवाद कहो।"], s: [
        "एक दिन चिंटू लंबी सैर पर गया। हिरण ने उसे ठंडा झरना दिखाया, और भालू ने उसे मीठा शहद दिया।",
        "चिंटू ने ख़ुशी ख़ुशी पानी पिया, शहद खाया, और घर भाग आया। पर वो एक छोटा सा शब्द कहना भूल गया।",
        "रानी ने पूछा, तुमने दोस्तों को धन्यवाद कहा? चिंटू रुक गया। अरे नहीं, मैं भूल गया!",
        "वो वापस दौड़ा। धन्यवाद हिरण! धन्यवाद भालू! दोस्त ख़ूब मुस्कुराए, और चिंटू का मन ख़ुशी से भर गया।"] },
      es: { title: ["Las palabras", "mágicas"], moral: ["Siempre di", "gracias."], s: [
        "Un día Chintu salió a dar un largo paseo. Un venado le mostró un arroyo fresco, y un oso le regaló miel dulce.",
        "Chintu bebió y comió feliz, y corrió a casa. Pero olvidó decir una palabrita.",
        "Rani le preguntó: ¿Les diste las gracias a tus amigos? Chintu se detuvo. ¡Ay, no, se me olvidó!",
        "Corrió de regreso. ¡Gracias, Venado! ¡Gracias, Oso! Sus amigos sonrieron mucho, y Chintu sintió un calorcito por dentro."] },
      ar: { title: ["الكلمة", "السحرية"], moral: ["قل شكرًا", "دائمًا."], s: [
        "في أحد الأيام، خرج شينتو في نزهة طويلة. أراه الغزال جدولًا باردًا، وأعطاه الدب عسلًا حلوًا.",
        "شرب شينتو وأكل بسعادة، ثم ركض إلى البيت. لكنه نسي أن يقول كلمة صغيرة.",
        "سألته راني: هل شكرت أصدقاءك؟ توقف شينتو وقال: أوه لا، لقد نسيت!",
        "ركض عائدًا وقال: شكرًا أيها الغزال! شكرًا أيها الدب! ابتسم أصدقاؤه ابتسامة كبيرة، وشعر شينتو بالدفء في قلبه."] },
      de: { title: ["Das", "Zauberwort"], moral: ["Sag immer", "Danke."], s: [
        "Eines Tages machte Chintu einen langen Spaziergang. Ein Reh zeigte ihm einen kühlen Bach, und ein Bär schenkte ihm süßen Honig.",
        "Chintu trank und aß fröhlich und rannte nach Hause. Aber er vergaß, ein kleines Wort zu sagen.",
        "Rani fragte: Hast du dich bei deinen Freunden bedankt? Chintu blieb stehen. Oh nein, das habe ich vergessen!",
        "Er rannte den ganzen Weg zurück. Danke, Reh! Danke, Bär! Seine Freunde strahlten, und Chintu wurde es ganz warm ums Herz."] },
      ja: { title: ["まほうの", "ことば"], moral: ["いつでも", "ありがとう。"], s: [
        "ある日、チントゥは長いさんぽに出かけました。シカはつめたい小川をおしえてくれて、クマはあまいはちみつをくれました。",
        "チントゥはうれしくてのんだりたべたりして、おうちへかけもどりました。でも、ひとことを言いわすれていました。",
        "ラニがききました。「おともだちに、ありがとうって言った？」チントゥはとまりました。「あっ、わすれてた！」",
        "チントゥは走ってもどりました。「シカさん、ありがとう！クマさん、ありがとう！」みんなはにっこり。チントゥの心もぽかぽかになりました。"] },
      ko: { title: ["마법의", "말"], moral: ["언제나", "고맙다고 말해요."], s: [
        "어느 날 친투는 긴 산책을 나갔어요. 사슴은 시원한 시냇물을 알려 주고, 곰은 달콤한 꿀을 주었어요.",
        "친투는 신나게 마시고 먹은 뒤 집으로 달려갔어요. 하지만 짧은 한마디를 잊어버렸어요.",
        "라니가 물었어요. 친구들에게 고맙다고 말했니? 친투가 멈춰 섰어요. 앗, 깜빡했어요!",
        "친투는 다시 달려갔어요. 고마워, 사슴아! 고마워, 곰아! 친구들은 활짝 웃었고, 친투의 마음도 따뜻해졌어요."] },
      fil: { title: ["Ang Mahiwagang", "Salita"], moral: ["Laging", "magpasalamat."], s: [
        "Isang araw, namasyal nang malayo si Chintu. Itinuro sa kanya ng usa ang malamig na batis, at binigyan siya ng oso ng matamis na pulot.",
        "Masayang uminom at kumain si Chintu, at tumakbo pauwi. Pero nakalimutan niyang magsabi ng isang maliit na salita.",
        "Tanong ni Rani, Nagpasalamat ka ba sa mga kaibigan mo? Natigilan si Chintu. Naku, nakalimutan ko!",
        "Tumakbo siya pabalik. Salamat, Usa! Salamat, Oso! Ngiting-ngiti ang mga kaibigan niya, at uminit ang puso ni Chintu."] },
      en: { title: ["The Magic", "Word"], moral: ["Always say", "thank you."], s: [
        "One day Chintu went on a long walk. A deer showed him a cool stream, and a bear gave him sweet honey.",
        "Chintu drank and ate happily, and ran home. But he forgot to say one small word.",
        "Rani asked, Did you thank your friends? Chintu stopped. Oh no, I forgot!",
        "He ran all the way back. Thank you, Deer! Thank you, Bear! His friends smiled so wide, and Chintu felt warm inside."] },
      pt: { title: ["A palavra", "mágica"], moral: ["Sempre diga", "obrigado."], s: [
        "Um dia, Chintu saiu para um longo passeio. Um veado mostrou um riacho fresquinho, e um urso deu mel docinho para ele.",
        "Chintu bebeu e comeu feliz, e correu para casa. Mas esqueceu de dizer uma palavrinha.",
        "Rani perguntou: Você agradeceu aos seus amigos? Chintu parou. Ai, não, eu esqueci!",
        "Ele correu de volta. Obrigado, Veado! Obrigado, Urso! Os amigos sorriram muito, e Chintu sentiu um quentinho no coração."] },
      fr: { title: ["Le mot", "magique"], moral: ["Dis toujours", "merci."], s: [
        "Un jour, Chintu partit faire une longue promenade. Un cerf lui montra un ruisseau frais, et un ours lui offrit du miel tout doux.",
        "Chintu but et mangea joyeusement, puis rentra en courant. Mais il oublia de dire un petit mot.",
        "Rani demanda : As-tu dit merci à tes amis ? Chintu s'arrêta. Oh non, j'ai oublié !",
        "Il repartit en courant. Merci, Cerf ! Merci, Ours ! Ses amis eurent un grand sourire, et Chintu sentit son cœur tout chaud."] },
      vi: { title: ["Lời nói", "kỳ diệu"], moral: ["Hãy luôn nói", "cảm ơn."], s: [
        "Một ngày, Chintu đi dạo thật xa. Chú nai chỉ cho cậu một dòng suối mát, và bác gấu cho cậu mật ong ngọt lịm.",
        "Chintu vui vẻ uống nước, ăn mật, rồi chạy về nhà. Nhưng cậu quên nói một lời nhỏ.",
        "Mẹ Rani hỏi: Con đã cảm ơn các bạn chưa? Chintu khựng lại. Ôi không, con quên mất!",
        "Cậu chạy ngược trở lại. Cảm ơn chú Nai! Cảm ơn bác Gấu! Các bạn cười thật tươi, và lòng Chintu ấm áp vô cùng."] }
    }
  }
];

const PAL = { paper: "#FFF8EA", ink: "#2A2018", accent: "#E8553A", accent2: "#F6B93B", accent3: "#4BB37A" };

export const mindNestCount = () => FABLES.length;

function fable(n: number): Fable {
  const f = FABLES[Math.floor(n) - 1];
  if (!f) throw new Error(`MindNest fable #${n} is not written yet in content/mindnest/fables.ts`);
  return f;
}

/** Non-Latin lines must not be split into word spans (the headline animates words left-to-right). */
const keep = (lang: MindNestLang, s: string) => (LANGS[lang].latin ? s : s.replace(/ /g, " "));
const strip = (s: string) => s.trim();

type Scene = Omit<StoryDioramaInput["scenes"][number], "fig">;

/** Post n on the `lang` channel: the same fable n in every language. */
export function mindNestForDay(lang: MindNestLang, n: number): StoryDiorama {
  const f = fable(n);
  const t = f.text[lang];
  const L = LANGS[lang];
  const moralLine = `${t.moral[0]} ${t.moral[1]}`;
  const texts = [...t.s, L.outro.replace("{m}", moralLine)];
  const scenes: Scene[] = f.scenes.map((layers, i) => {
    const night = f.night[i]!;
    const lay = layers().map((l) => (l.kind === "prop" && l.prop === "moralCard" ? { ...l, data: { title: L.moral, text: `${t.moral[0]}\n${t.moral[1]}` } } : l));
    return {
      id: `page-${i + 1}`, seconds: 7, location: `${L.series} · ${i + 1}/5`, sky: f.skies[i]!, tone: night ? "light" : "dark",
      ground: { color: night ? "#24402F" : "#8ACB6E", y: 1520 },
      particles: f.id === "bravery" && (i === 1 || i === 2) ? "rain" : night ? "fireflies" : "none",
      camera: i % 2 ? "panLeft" : "push",
      narration: strip(texts[i]!), caption: strip(texts[i]!),
      headlines: [{ at: 0, lines: i === 4 ? [{ text: keep(lang, L.moral), tone: "accent" }] : [{ text: keep(lang, t.title[0]) }, { text: keep(lang, t.title[1]), tone: "accent" }] }],
      layers: lay
    };
  });
  return StoryDioramaSchema.parse({
    music: "sfx/music_story.mp3",
    brand: "MINDNEST TALES", handle: L.handle,
    tag: `${L.code.toUpperCase()} · #`, tagAccent: String(n).padStart(2, "0"),
    palette: PAL, transitionFrames: 10, finish: "storybook",
    scenes: scenes.map((s, i) => ({ ...s, fig: `${i + 1}/5` }))
  });
}

export function mindNestMeta(lang: MindNestLang, n: number) {
  const t = fable(n).text[lang];
  const L = LANGS[lang];
  const title = `${t.title[0]} ${t.title[1]}`.replace(/\s+/g, " ");
  const moral = `${t.moral[0]} ${t.moral[1]}`;
  return {
    title: `${title} | MindNest Tales #${n} #shorts`.slice(0, 100),
    description: [title, `${L.moral}: ${moral}`, "", `MindNest Tales · ${L.series}`, `Subscribe ${L.handle}`, L.hashtags].join("\n"),
    tags: ["mindnest tales", "chintu", "kids story", "moral story", "animated story", "fable", L.series.toLowerCase(), "shorts"],
    caption: `${title} 🐆\n${L.moral}: ${moral}\n${L.hashtags.replace(" #shorts", "")} #reels`,
    language: L.code,
    categoryId: "1",
    madeForKids: true
  };
}
