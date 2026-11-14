import { askOutro } from "../../engines/ask-outro";
import { P, StoryDioramaSchema, type StoryDiorama, type StoryDioramaInput } from "../../engines/story-diorama/src/model";

/**
 * DHARM SANKAT — mythology + logic debate Shorts on EpicBharatSaga (second daily slot).
 * Each post: hook question -> context -> side A (with its source) -> side B (with its source) -> AskOutro "A ya B?".
 * There is no "right answer": both sides come from the texts, the viewer decides in the comments.
 * Rules: respectful, never mock a deity or tradition; where versions differ say so; sources in the comment above each post
 * and in the description. Post n = QUESTIONS[n - 1]; unwritten posts fail closed.
 */

type Fig = Record<string, unknown>;
export interface Side { label: string; hi: string; en: string; card: string[] }
export interface Q {
  /** Hook headline (2 lines, <=16 chars each) + spoken hook. */
  h1: string; h2: string; hookHi: string; hookEn: string;
  ctxHi: string; ctxEn: string; c1: string; c2: string;
  a: Side; b: Side;
  /** AskOutro question (caps, short) + spoken question. */
  ask: string; askHi: string;
  left: Fig; right: Fig; leftName: string; rightName: string;
  /** Short title for YouTube + sources line for the description. */
  title: string; sources: string;
}

const KING = { robe: "#F28C28", head: "crown", item: "abhaya" };
const KARNA = { robe: "#C9861A", head: "crown", item: "bow", sash: "#F6B93B" };
const ARJUN = { robe: "#4A78B8", head: "crown", item: "bow", sash: "#F6B93B" };
const DRAUPADI = { robe: "#D6336C", head: "bun", item: "namaste", sash: "#F6B93B" };
const YUDHISHTHIR = { robe: "#F6B93B", head: "crown", item: "namaste" };
const BHISHMA = { robe: "#F2F2F2", head: "sage", item: "abhaya", sash: "#C9861A" };
const RAM = { robe: "#F6B93B", skin: "#4A78B8", head: "crown", item: "bow", sash: "#F0533F" };
const VANAR = { robe: "#8A5A2E", skin: "#B5864A", head: "crown", item: "abhaya" };
const DRONA = { robe: "#E06A1B", head: "sage", item: "bow" };
const EKALAVYA = { robe: "#5E3015", skin: "#8A5A3A", head: "feather", item: "bow" };
const KUNTI = { robe: "#F2F2F2", head: "bun", item: "namaste", sash: "#C9861A" };
const DURYODHAN = { robe: "#5A2A6A", head: "crown", item: "sword", sash: "#F6B93B" };
const RAKSHAS = { robe: "#3A2A4A", skin: "#7A5A8A", head: "crown", horns: true };
const KRISHNA = { robe: "#F6B93B", skin: "#4A78B8", head: "feather", item: "flute" };
const ABHIMANYU = { robe: "#4A78B8", head: "child", item: "sword" };

/** Global post order. Sources are cited per question (book / chapter). */
const QUESTIONS: Q[] = [
  // 1. Sources: Mahabharata Adi Parva 126 (Karna at the tournament), Vana Parva 254 (Karna's digvijaya),
  //    Virata Parva 54-60 (Arjuna routs the Kaurava host incl. Karna), Vana Parva 40 (Pashupata from Shiva), Karna Parva 90-91.
  {
    h1: "KARNA YA", h2: "ARJUN?", hookHi: "महाभारत का सबसे बड़ा सवाल। सबसे बड़ा धनुर्धर कौन, कर्ण या अर्जुन?", hookEn: "Mahabharat ka sabse bada sawaal: sabse bada dhanurdhar kaun, Karna ya Arjun?",
    ctxHi: "दोनों ने एक ही युग में धनुष उठाया। दोनों को दिव्य अस्त्र मिले। पर फ़ैसला आज तक बहस में है।", ctxEn: "Dono ne ek hi yug mein dhanush uthaya. Dono ko divya astra mile. Par faisla aaj tak behas mein hai.", c1: "EK YUG,", c2: "DO DHANURDHAR",
    a: { label: "KARNA", hi: "कर्ण के पक्ष में: रंगभूमि में उसने अर्जुन के हर करतब को दोहराया, और दिग्विजय में अकेले कई राजाओं को जीता। अंत में भी वो शापों से बँधा था।", en: "Karna ke paksh mein: rangbhoomi mein Arjun ka har kartab dohraya, digvijay mein kai raja jeete, aur ant mein shaapon se bandha tha.", card: ["ARJUN JAISA HUNAR", "AKELE DIGVIJAY", "SHAAP SE BANDHA"] },
    b: { label: "ARJUN", hi: "अर्जुन के पक्ष में: विराट युद्ध में उसने अकेले पूरी कौरव सेना को हराया, जिसमें कर्ण भी था। शिव से पाशुपत अस्त्र पाया, और युद्ध में कर्ण पर जीत भी उसी की हुई।", en: "Arjun ke paksh mein: Virat yuddh mein akele poori Kaurav sena haraayi, Karna bhi. Shiv se Pashupat paaya, aur ant mein jeet bhi.", card: ["VIRAT MEIN JEET", "PASHUPAT ASTRA", "ANTIM YUDDH JEETA"] },
    ask: "BADA DHANURDHAR KAUN?", askHi: "आपके हिसाब से बड़ा धनुर्धर कौन? A, कर्ण, या B, अर्जुन?",
    left: KARNA, right: ARJUN, leftName: "KARNA", rightName: "ARJUN",
    title: "Karna ya Arjun — sabse bada dhanurdhar kaun?", sources: "Mahabharat: Adi Parva 126, Vana Parva 40 & 254, Virata Parva 54–60, Karna Parva 90–91"
  },
  // 2. Sources: Sabha Parva 60-61 (Draupadi's question; Vikarna's argument; Bhishma: "dharma is subtle").
  {
    h1: "DRAUPADI KA", h2: "SAWAAL", hookHi: "भरी सभा में द्रौपदी का एक सवाल, जिसका जवाब भीष्म भी नहीं दे पाए।", hookEn: "Bhari sabha mein Draupadi ka ek sawaal, jiska jawab Bhishma bhi nahi de paaye.",
    ctxHi: "जुए में युधिष्ठिर पहले ख़ुद को हारे, फिर द्रौपदी को दाँव पर लगाया। द्रौपदी ने पूछा, जो ख़ुद को हार चुका, क्या वो मुझे दाँव पर लगा सकता था?", ctxEn: "Yudhishthir pehle khud ko haare, phir Draupadi ko daav pe lagaya. Draupadi ne poocha: jo khud ko haar chuka, kya wo mujhe daav pe laga sakta tha?", c1: "PEHLE KHUD HAARE", c2: "PHIR DRAUPADI?",
    a: { label: "HAQ NAHI THA", hi: "पहला पक्ष, जो सभा में विकर्ण ने रखा: जो ख़ुद दास बन चुका, उसका किसी पर हक़ नहीं बचता। इसलिए द्रौपदी हारी ही नहीं।", en: "Pehla paksh (Vikarna): jo khud daas ban chuka, uska kisi par haq nahi bachta. Draupadi haari hi nahi.", card: ["DAAS = HAQ KHATAM", "VIKARNA KA TARK"] },
    b: { label: "HAQ THA", hi: "दूसरा पक्ष: पत्नी पर पति का अधिकार ख़त्म नहीं होता, ये भी कहा गया। भीष्म बोले, धर्म बहुत सूक्ष्म है, मैं फ़ैसला नहीं कर सकता।", en: "Doosra paksh: pati ka adhikaar khatam nahi hota. Bhishma bole: dharm bahut sookshm hai, main faisla nahi kar sakta.", card: ["PATI KA ADHIKAAR", "DHARM SOOKSHM HAI"] },
    ask: "KYA YUDHISHTHIR KO HAQ THA?", askHi: "आप बताइए, क्या युधिष्ठिर को हक़ था? A, हक़ नहीं था, या B, हक़ था?",
    left: DRAUPADI, right: YUDHISHTHIR, leftName: "DRAUPADI", rightName: "YUDHISHTHIR",
    title: "Draupadi ka sawaal jiska jawab Bhishma bhi nahi de paaye", sources: "Mahabharat: Sabha Parva 60–61"
  },
  // 3. Sources: Sabha Parva 61-62 (Bhishma's answer), Udyoga/Shanti Parva (Bhishma bound to Hastinapur's throne by his vow).
  {
    h1: "BHISHMA CHUP", h2: "KYUN RAHE?", hookHi: "चीरहरण के समय, सबसे शक्तिशाली भीष्म चुप क्यों रहे?", hookEn: "Cheerharan ke samay sabse shaktishaali Bhishma chup kyun rahe?",
    ctxHi: "भीष्म ने पिता के लिए प्रतिज्ञा ली थी, हस्तिनापुर के सिंहासन की रक्षा की। उस दिन सभा में वो कुछ नहीं बोले।", ctxEn: "Bhishma ne pita ke liye pratigya li thi, Hastinapur ke sinhasan ki raksha ki. Us din sabha mein wo kuch nahi bole.", c1: "BHARI SABHA,", c2: "BHISHMA MAUN",
    a: { label: "MAJBOOR THE", hi: "पहला पक्ष: भीष्म प्रतिज्ञा से सिंहासन से बँधे थे। और उन्होंने कहा, धर्म सूक्ष्म है, युधिष्ठिर ही बताएँ।", en: "Pehla paksh: Bhishma pratigya se sinhasan se bandhe the, aur kaha dharm sookshm hai.", card: ["PRATIGYA BANDHAN", "DHARM SOOKSHM"] },
    b: { label: "GALAT THE", hi: "दूसरा पक्ष: अन्याय के सामने चुप रहना भी अन्याय है। उनकी एक आवाज़ सब रोक सकती थी।", en: "Doosra paksh: anyaay ke saamne chup rehna bhi anyaay hai. Unki ek awaaz sab rok sakti thi.", card: ["MAUN = SAATH DENA", "EK AWAAZ KAAFI THI"] },
    ask: "BHISHMA KA MAUN?", askHi: "भीष्म का मौन, A, मजबूरी था, या B, ग़लती?",
    left: BHISHMA, right: DRAUPADI, leftName: "BHISHMA", rightName: "DRAUPADI",
    title: "Bhishma cheerharan pe chup kyun rahe? Majboori ya galti", sources: "Mahabharat: Sabha Parva 61–62, Adi Parva 94 (Bhishma pratigya)"
  },
  // 4. Sources: Valmiki Ramayana Kishkindha Kanda 17 (Vali's charge) and 18 (Rama's reply: Ruma, Bharata's rule; Vali accepts).
  {
    h1: "BALI VADH:", h2: "DHARM YA ADHARM?", hookHi: "राम ने बाली को छुपकर बाण मारा। ये धर्म था या अधर्म?", hookEn: "Ram ne Bali ko chhupkar baan maara. Ye dharm tha ya adharm?",
    ctxHi: "सुग्रीव और बाली का द्वंद्व चल रहा था। तभी पेड़ों की आड़ से राम का बाण चला, और बाली गिर पड़ा।", ctxEn: "Sugreev aur Bali ka dwandwa chal raha tha. Tabhi pedon ki aad se Ram ka baan chala aur Bali gir pada.", c1: "PEDON KI AAD", c2: "SE BAAN",
    a: { label: "DHARM", hi: "राम का जवाब, वाल्मीकि रामायण में: बाली ने भाई सुग्रीव की पत्नी रुमा को छीना था। राजा भरत के राज्य में इसका दंड मृत्यु है। बाली ने भी अंत में बात मानी।", en: "Ram ka jawab (Valmiki): Bali ne bhai ki patni Ruma ko chheena, iska dand mrityu hai. Bali ne bhi ant mein maana.", card: ["RUMA KO CHHEENA", "RAJ-DAND", "BALI NE MAANA"] },
    b: { label: "ADHARM", hi: "बाली का सवाल: मैं आपसे लड़ ही नहीं रहा था। आड़ से वार करना वीरों का धर्म नहीं।", en: "Bali ka sawaal: main aapse lad hi nahi raha tha. Aad se vaar karna veeron ka dharm nahi.", card: ["SAAMNE NAHI LADE", "BALI KA AAROP"] },
    ask: "BALI VADH?", askHi: "बाली वध, A, धर्म था, या B, अधर्म?",
    left: RAM, right: VANAR, leftName: "RAM", rightName: "BALI",
    title: "Ram ne Bali ko chhupkar kyun maara? Dharm ya adharm", sources: "Valmiki Ramayan: Kishkindha Kand 17–18"
  },
  // 5. Sources: Mahabharata Adi Parva 123 (Ekalavya; Drona asks for the right thumb as guru-dakshina; promise to Arjuna).
  {
    h1: "EKALAVYA KA", h2: "ANGUTHA", hookHi: "गुरु ने शिष्य से दक्षिणा में अंगूठा माँग लिया। द्रोण सही थे?", hookEn: "Guru ne shishya se dakshina mein angutha maang liya. Drona sahi the?",
    ctxHi: "एकलव्य ने द्रोण की मूर्ति बनाकर, अकेले धनुर्विद्या सीखी। वो अर्जुन से भी आगे निकल गया।", ctxEn: "Ekalavya ne Drona ki murti banakar akele dhanurvidya seekhi, aur Arjun se bhi aage nikal gaya.", c1: "MURTI SE", c2: "SEEKHA",
    a: { label: "SAHI", hi: "द्रोण के पक्ष में: उन्होंने अर्जुन को वचन दिया था, कि उससे बड़ा धनुर्धर कोई नहीं होगा। गुरु का वचन टूट रहा था।", en: "Drona ke paksh mein: Arjun ko vachan diya tha ki usse bada dhanurdhar koi nahi hoga.", card: ["ARJUN KO VACHAN", "GURU KA DHARM"] },
    b: { label: "GALAT", hi: "एकलव्य के पक्ष में: उसने ख़ुद मेहनत से सीखा, द्रोण ने उसे सिखाया तक नहीं। फिर भी उसने बिना सवाल अंगूठा दे दिया।", en: "Ekalavya ke paksh mein: khud mehnat se seekha, Drona ne sikhaya tak nahi. Phir bhi bina sawaal angutha de diya.", card: ["KHUD KI MEHNAT", "BINA SAWAAL DIYA"] },
    ask: "DRONA KA FAISLA?", askHi: "द्रोण का फ़ैसला, A, सही था, या B, ग़लत?",
    left: DRONA, right: EKALAVYA, leftName: "DRONA", rightName: "EKALAVYA",
    title: "Ekalavya ka angutha — kya Drona sahi the?", sources: "Mahabharat: Adi Parva 123"
  },
  // 6. Sources: Adi Parva 104 (Kunti and Karna's birth), Udyoga Parva 144-146 (Kunti meets Karna before the war).
  {
    h1: "KUNTI KA", h2: "RAAZ", hookHi: "कुंती ने कर्ण का सच क्यों छुपाया? क्या इससे युद्ध रुक सकता था?", hookEn: "Kunti ne Karna ka sach kyun chhupaya? Kya isse yuddh ruk sakta tha?",
    ctxHi: "विवाह से पहले कुंती को सूर्य से पुत्र हुआ, कर्ण। उन्होंने उसे नदी में बहा दिया, और सच युद्ध से ठीक पहले बताया।", ctxEn: "Vivah se pehle Kunti ko Surya se putra hua, Karna. Use nadi mein baha diya, aur sach yuddh se theek pehle bataya.", c1: "NADI MEIN", c2: "BAHAYA BETA",
    a: { label: "MAJBOORI", hi: "पहला पक्ष: वो अविवाहित थीं, बहुत छोटी थीं। उस समाज में ये सच उनका जीवन बर्बाद कर देता।", en: "Pehla paksh: wo avivahit thin, bahut chhoti thin. Us samaj mein ye sach unka jeevan barbaad kar deta.", card: ["AVIVAHIT, KAM UMAR", "SAMAJ KA DAR"] },
    b: { label: "GALTI", hi: "दूसरा पक्ष: अगर सच पहले बताया होता, तो कर्ण पांडवों का बड़ा भाई होता। शायद युद्ध ही न होता।", en: "Doosra paksh: sach pehle bataya hota to Karna Pandavon ka bada bhai hota. Shayad yuddh hi na hota.", card: ["KARNA = BADA BHAI", "YUDDH TAL JAATA"] },
    ask: "KUNTI KA CHUP RAHNA?", askHi: "कुंती का चुप रहना, A, मजबूरी था, या B, ग़लती?",
    left: KUNTI, right: KARNA, leftName: "KUNTI", rightName: "KARNA",
    title: "Kunti ne Karna ka sach kyun chhupaya?", sources: "Mahabharat: Adi Parva 104, Udyoga Parva 144–146"
  },
  // 7. Sources: Drona Parva 164 (critical ed. 7.164): "Ashvatthama hatah", "kunjara" said softly; Yudhishthira's chariot touches the ground.
  {
    h1: "ASHWATTHAMA", h2: "HATO…", hookHi: "युधिष्ठिर ने कहा, अश्वत्थामा मारा गया। पर कौन सा अश्वत्थामा?", hookEn: "Yudhishthir ne kaha: Ashwatthama maara gaya. Par kaunsa Ashwatthama?",
    ctxHi: "द्रोण को रोकना ज़रूरी था। भीम ने अश्वत्थामा नाम का हाथी मारा, और द्रोण ने सच युधिष्ठिर से पूछा।", ctxEn: "Drona ko rokna zaroori tha. Bheem ne Ashwatthama naam ka haathi maara, aur Drona ne sach Yudhishthir se poocha.", c1: "HAATHI KA", c2: "NAAM",
    a: { label: "SACH THA", hi: "पहला पक्ष: युधिष्ठिर ने झूठ नहीं बोला। हाथी सच में मरा था, और उन्होंने धीरे से कहा, कुंजर, यानी हाथी।", en: "Pehla paksh: jhooth nahi bola. Haathi sach mein mara tha, aur dheere se kaha: kunjar, yaani haathi.", card: ["HAATHI SACH MARA", "\"KUNJAR\" BOLA"] },
    b: { label: "JHOOTH THA", hi: "दूसरा पक्ष: इरादा धोखा देने का था। महाभारत कहता है, उसी पल उनका रथ ज़मीन छू गया।", en: "Doosra paksh: irada dhokha dene ka tha. Mahabharat kehta hai, usi pal unka rath zameen chhoo gaya.", card: ["IRADA DHOKHA", "RATH ZAMEEN PE"] },
    ask: "AADHA SACH?", askHi: "युधिष्ठिर का आधा सच, A, सच था, या B, झूठ?",
    left: YUDHISHTHIR, right: DRONA, leftName: "YUDHISHTHIR", rightName: "DRONA",
    title: "Ashwatthama hato — Yudhishthir ka aadha sach jhooth tha?", sources: "Mahabharat: Drona Parva 164"
  },
  // 8. Sources: Adi Parva 126-127 (Duryodhana makes Karna king of Anga), Udyoga Parva 141 (Karna refuses Krishna's offer, loyalty).
  {
    h1: "KARNA KI", h2: "DOSTI", hookHi: "कर्ण ने आख़िर तक दुर्योधन का साथ दिया। ये दोस्ती थी, या अधर्म का साथ?", hookEn: "Karna ne aakhir tak Duryodhan ka saath diya. Dosti thi ya adharm ka saath?",
    ctxHi: "रंगभूमि में सबने कर्ण को सूत-पुत्र कहकर ठुकराया। तब दुर्योधन ने उसे अंग देश का राजा बना दिया।", ctxEn: "Rangbhoomi mein sabne Karna ko soot-putra kehkar thukraya. Tab Duryodhan ne use Ang desh ka raja bana diya.", c1: "ANG DESH", c2: "KA RAJA",
    a: { label: "DOSTI", hi: "पहला पक्ष: जिसने अपमान के समय सम्मान दिया, उसे छोड़ना कृतघ्नता होती। कृष्ण के प्रस्ताव पर भी कर्ण ने वचन नहीं तोड़ा।", en: "Pehla paksh: jisne apmaan ke samay samman diya, use chhodna kritaghnata hoti. Krishna ke prastav pe bhi vachan nahi toda.", card: ["SAMMAN KA BADLA", "VACHAN NAHI TODA"] },
    b: { label: "ADHARM", hi: "दूसरा पक्ष: दोस्त ग़लत हो तो रोकना ही सच्ची दोस्ती है। कर्ण ने सभा में द्रौपदी के अपमान में भी साथ दिया।", en: "Doosra paksh: dost galat ho to rokna hi sachchi dosti hai. Karna ne sabha mein bhi saath diya.", card: ["ROKNA HI DOSTI", "SABHA MEIN SAATH"] },
    ask: "KARNA KA SAATH?", askHi: "कर्ण का साथ, A, सच्ची दोस्ती, या B, अधर्म?",
    left: KARNA, right: DURYODHAN, leftName: "KARNA", rightName: "DURYODHAN",
    title: "Karna aur Duryodhan — dosti ya adharm ka saath?", sources: "Mahabharat: Adi Parva 126–127, Sabha Parva 61, Udyoga Parva 141"
  },
  // 9. Sources: Bhishma Parva 107-109 (Bhishma tells Yudhishthira he will not fight Shikhandi; Arjuna shoots from behind Shikhandi).
  {
    h1: "SHIKHANDI KE", h2: "PEECHHE SE?", hookHi: "शिखंडी को आगे रखकर भीष्म पर बाण चले। ये धर्म-युद्ध था?", hookEn: "Shikhandi ko aage rakhkar Bhishma par baan chale. Ye dharm-yuddh tha?",
    ctxHi: "भीष्म को कोई हरा नहीं पा रहा था। तब युधिष्ठिर ख़ुद भीष्म से पूछने गए, आपको कैसे हराएँ?", ctxEn: "Bhishma ko koi hara nahi pa raha tha. Tab Yudhishthir khud Bhishma se poochne gaye: aapko kaise harayein?", c1: "BHISHMA SE HI", c2: "POOCHHA",
    a: { label: "DHARM", hi: "पहला पक्ष: रास्ता भीष्म ने ख़ुद बताया, कि वो शिखंडी पर शस्त्र नहीं उठाएँगे। ये उनकी अपनी इच्छा थी।", en: "Pehla paksh: rasta Bhishma ne khud bataya ki wo Shikhandi pe shastra nahi uthayenge. Unki apni ichchha thi.", card: ["KHUD BATAYA", "UNKI ICHCHHA"] },
    b: { label: "ADHARM", hi: "दूसरा पक्ष: जो योद्धा वार नहीं कर रहा, उस पर पीछे से बाण चलाना, वीरता नहीं।", en: "Doosra paksh: jo yoddha vaar nahi kar raha, us par peechhe se baan chalana veerta nahi.", card: ["NIHATTHE PE VAAR", "PEECHHE SE"] },
    ask: "BHISHMA KA PATAN?", askHi: "भीष्म का पतन, A, धर्म-युद्ध था, या B, अधर्म?",
    left: BHISHMA, right: ARJUN, leftName: "BHISHMA", rightName: "ARJUN",
    title: "Shikhandi ke peechhe se Bhishma par baan — dharm-yuddh tha?", sources: "Mahabharat: Bhishma Parva 107–109"
  },
  // 10. Sources: Drona Parva 33-35 (Abhimanyu knows how to enter the chakravyuha but not how to exit; Yudhishthira asks him to break in).
  {
    h1: "ABHIMANYU KO", h2: "KYUN BHEJA?", hookHi: "सोलह साल का अभिमन्यु, चक्रव्यूह में अकेला। उसे भेजना सही था?", hookEn: "Solah saal ka Abhimanyu, chakravyuh mein akela. Use bhejna sahi tha?",
    ctxHi: "अभिमन्यु चक्रव्यूह में घुसना जानता था, पर बाहर निकलना नहीं। अर्जुन उस दिन दूर लड़ रहे थे।", ctxEn: "Abhimanyu chakravyuh mein ghusna jaanta tha, par bahar nikalna nahi. Arjun us din door lad rahe the.", c1: "ANDAR JAANA,", c2: "BAHAR NAHI",
    a: { label: "SAHI THA", hi: "पहला पक्ष: व्यूह तोड़ना ज़रूरी था, और सिर्फ़ वही जानता था। योजना थी कि बाकी योद्धा उसके पीछे घुसेंगे।", en: "Pehla paksh: vyuh todna zaroori tha, sirf wahi jaanta tha. Yojana thi ki baaki peechhe ghusenge.", card: ["SIRF WAHI JAANTA", "SENA PEECHHE THI"] },
    b: { label: "GALAT THA", hi: "दूसरा पक्ष: बाहर निकलना नहीं आता था, फिर भी भेजा। जयद्रथ ने बाकी सबको रोक लिया, और वो अकेला रह गया।", en: "Doosra paksh: bahar nikalna nahi aata tha, phir bhi bheja. Jaydrath ne baaki sabko rok liya.", card: ["BAHAR NAHI AATA", "AKELA REH GAYA"] },
    ask: "ABHIMANYU KO BHEJNA?", askHi: "अभिमन्यु को भेजना, A, सही फ़ैसला था, या B, ग़लती?",
    left: ABHIMANYU, right: YUDHISHTHIR, leftName: "ABHIMANYU", rightName: "YUDHISHTHIR",
    title: "Abhimanyu ko chakravyuh mein akela kyun bheja?", sources: "Mahabharat: Drona Parva 33–35, 43"
  },
  // 11. Sources: Valmiki Ramayana Yuddha Kanda 9-17 (Vibhishana advises Ravana to return Sita, is insulted, joins Rama).
  {
    h1: "VIBHISHAN:", h2: "BHAKT YA GADDAR?", hookHi: "विभीषण ने भाई रावण को छोड़कर राम का साथ दिया। भक्त या गद्दार?", hookEn: "Vibhishan ne bhai Ravan ko chhodkar Ram ka saath diya. Bhakt ya gaddar?",
    ctxHi: "विभीषण ने रावण को समझाया, सीता को लौटा दो। रावण ने भरी सभा में उनका अपमान किया।", ctxEn: "Vibhishan ne Ravan ko samjhaya: Sita ko lauta do. Ravan ne bhari sabha mein unka apmaan kiya.", c1: "SITA LAUTA", c2: "DO!",
    a: { label: "BHAKT", hi: "पहला पक्ष: उन्होंने पहले भाई को सही राह दिखाई। जब रावण नहीं माना, तो उन्होंने धर्म चुना, भाई नहीं।", en: "Pehla paksh: pehle bhai ko sahi raah dikhayi. Jab Ravan nahi maana, to dharm chuna.", card: ["PEHLE SAMJHAYA", "DHARM CHUNA"] },
    b: { label: "GADDAR", hi: "दूसरा पक्ष: युद्ध के बीच अपना देश और भाई छोड़ना, और दुश्मन को लंका के राज़ बताना। इसलिए कहावत बनी, घर का भेदी।", en: "Doosra paksh: yuddh ke beech desh aur bhai chhodna, dushman ko raaz batana. Isliye kahavat bani: ghar ka bhedi.", card: ["DESH CHHODA", "\"GHAR KA BHEDI\""] },
    ask: "VIBHISHAN?", askHi: "विभीषण, A, सच्चे भक्त, या B, गद्दार?",
    left: RAKSHAS, right: RAM, leftName: "VIBHISHAN", rightName: "RAM",
    title: "Vibhishan — bhakt ya gaddar?", sources: "Valmiki Ramayan: Yuddha Kand 9–17"
  },
  // 12. Sources: Valmiki Ramayana Yuddha Kanda 63-65 (Kumbhakarna tells Ravana he erred, then fights for him out of affection).
  {
    h1: "KUMBHAKARNA", h2: "KA FAISLA", hookHi: "कुंभकर्ण जानता था कि रावण ग़लत है। फिर भी वो उसके लिए लड़ा। सही या ग़लत?", hookEn: "Kumbhakarna jaanta tha Ravan galat hai. Phir bhi uske liye lada. Sahi ya galat?",
    ctxHi: "नींद से जागते ही कुंभकर्ण ने रावण से साफ़ कहा, तुमने ग़लती की है। फिर भी भाई के लिए युद्ध में उतर गया।", ctxEn: "Neend se jaagte hi Kumbhakarna ne Ravan se saaf kaha: tumne galti ki hai. Phir bhi bhai ke liye yuddh mein utar gaya.", c1: "\"TUMNE GALTI", c2: "KI HAI\"",
    a: { label: "SAHI", hi: "पहला पक्ष: उसने सच बोलकर अपना धर्म निभाया, और फिर भाई और देश के लिए जान दी। ये वफ़ादारी है।", en: "Pehla paksh: sach bolkar dharm nibhaya, phir bhai aur desh ke liye jaan di. Ye wafadaari hai.", card: ["SACH BOLA", "DESH KE LIYE LADA"] },
    b: { label: "GALAT", hi: "दूसरा पक्ष: जानते हुए भी अधर्म के लिए लड़ना, अधर्म का ही साथ है। विभीषण ने दूसरा रास्ता चुना था।", en: "Doosra paksh: jaante hue bhi adharm ke liye ladna, adharm ka hi saath hai. Vibhishan ne doosra rasta chuna.", card: ["JAANTE HUE BHI", "ADHARM KA SAATH"] },
    ask: "KUMBHAKARNA?", askHi: "कुंभकर्ण का फ़ैसला, A, सही था, या B, ग़लत?",
    left: RAKSHAS, right: { ...RAKSHAS, heads: 10 }, leftName: "KUMBHAKARNA", rightName: "RAVAN",
    title: "Kumbhakarna jaanta tha Ravan galat hai, phir bhi kyun lada?", sources: "Valmiki Ramayan: Yuddha Kand 63–65"
  },
  // 13. Sources: Sabha Parva 52 & 76 (Yudhishthira: "summoned, I do not refuse; this is my vow").
  {
    h1: "YUDHISHTHIR NE", h2: "JUA KYUN KHELA?", hookHi: "धर्मराज युधिष्ठिर ने जुआ क्यों खेला, जब वो जानते थे कि ये बर्बादी है?", hookEn: "Dharmraj Yudhishthir ne jua kyun khela, jab wo jaante the ki ye barbaadi hai?",
    ctxHi: "शकुनि ने बुलावा भेजा। युधिष्ठिर बोले, मैं खेलना नहीं चाहता, पर बुलाया जाऊँ तो मना नहीं करता।", ctxEn: "Shakuni ne bulawa bheja. Yudhishthir bole: main khelna nahi chahta, par bulaya jaun to mana nahi karta.", c1: "BULAWA AAYA,", c2: "MANA NAHI KIYA",
    a: { label: "MAJBOORI", hi: "पहला पक्ष: क्षत्रिय का नियम था, चुनौती ठुकराई नहीं जाती। और बुलावा राजा धृतराष्ट्र का था।", en: "Pehla paksh: kshatriya ka niyam tha, chunauti thukrayi nahi jaati. Aur bulawa Raja Dhritarashtra ka tha.", card: ["KSHATRIYA NIYAM", "RAJA KA BULAWA"] },
    b: { label: "GALTI", hi: "दूसरा पक्ष: खेलना एक बात, पर भाइयों और पत्नी को दाँव पर लगाना, ये कोई नियम नहीं कहता।", en: "Doosra paksh: khelna ek baat, par bhaiyon aur patni ko daav pe lagana, ye koi niyam nahi kehta.", card: ["BHAI DAAV PE", "PATNI DAAV PE"] },
    ask: "YUDHISHTHIR KA JUA?", askHi: "युधिष्ठिर का जुआ खेलना, A, मजबूरी, या B, ग़लती?",
    left: YUDHISHTHIR, right: KING, leftName: "YUDHISHTHIR", rightName: "SHAKUNI",
    title: "Dharmraj Yudhishthir ne jua kyun khela?", sources: "Mahabharat: Sabha Parva 52, 58–60, 76"
  },
  // 14. Sources: Skanda Purana, Maheshvara Khanda, Kaumarika Khanda 66 (Krishna beheads Barbarika). Not in the core Mahabharata;
  //     the "always joins the weaker side" reason is from later tradition, so the narration says "parampara kehti hai".
  {
    h1: "BARBARIK KA", h2: "SHEESH", hookHi: "जो तीन बाणों में युद्ध ख़त्म कर सकता था, कृष्ण ने उसी का शीश क्यों माँगा?", hookEn: "Jo teen baanon mein yuddh khatam kar sakta tha, Krishna ne usi ka sheesh kyun maanga?",
    ctxHi: "भीम का पोता बर्बरीक युद्ध देखने आया। ये कथा स्कंद पुराण और लोक परंपरा में है, मूल महाभारत में नहीं।", ctxEn: "Bheem ka pota Barbarik yuddh dekhne aaya. Ye katha Skand Puran aur lok parampara mein hai, mool Mahabharat mein nahi.", c1: "TEEN BAAN,", c2: "POORA YUDDH",
    a: { label: "SAHI", hi: "पहला पक्ष: परंपरा कहती है, उसका प्रण था कि वो हारने वाले पक्ष से लड़ेगा। तो वो बार बार पक्ष बदलता, और युद्ध कभी ख़त्म न होता।", en: "Pehla paksh: parampara kehti hai, uska pran tha haarne wale paksh se ladna. Yuddh kabhi khatam na hota.", card: ["KAMZOR KA SAATH", "YUDDH ANANT"] },
    b: { label: "GALAT", hi: "दूसरा पक्ष: उसने अभी कुछ ग़लत किया ही नहीं था। सिर्फ़ शक पर किसी का बलिदान माँगना कठोर है।", en: "Doosra paksh: usne abhi kuch galat kiya hi nahi tha. Sirf shak pe balidaan maangna kathor hai.", card: ["KOI GALTI NAHI", "SIRF SHAK PE"] },
    ask: "BARBARIK KA BALIDAAN?", askHi: "बर्बरीक का बलिदान माँगना, A, सही था, या B, ग़लत?",
    left: KRISHNA, right: { ...EKALAVYA, robe: "#3E5A8A", head: "crown" }, leftName: "KRISHNA", rightName: "BARBARIK",
    title: "Krishna ne Barbarik ka sheesh kyun maanga?", sources: "Skand Puran: Maheshwar Khand, Kaumarika Khand 66 (lok parampara; mool Mahabharat mein nahi)"
  }
];

const PAL = { paper: "#F5EEDF", ink: "#1C1A17", accent: "#F0533F", accent2: "#F6B93B", accent3: "#5BD17A" };
const SKIES: [string, string][] = [["#1E1A3A", "#4A2A4A"], ["#2A1440", "#6B3A2A"], ["#14121E", "#3A3046"], ["#1B2233", "#3A4A5E"]];

export const DHARM_SANKAT_HANDLE = "@EpicBharatSaga";
export const DHARM_SANKAT_CTA_VOICE = "अपनी राय कमेंट में लिखो, A या B! और रोज़ नए सवाल के लिए फॉलो करो।";
export const dharmSankatCount = () => QUESTIONS.length;

export function dharmSankatQuestion(n: number): Q {
  const q = QUESTIONS[Math.floor(n) - 1];
  if (!q) throw new Error(`Dharm Sankat #${n} is not written yet in content/dharm-sankat/questions.ts`);
  return q;
}

type Scene = Omit<StoryDioramaInput["scenes"][number], "fig">;

/** Post n -> a Short on the story-diorama engine with the shared AskOutro ending. */
export function dharmSankatForDay(n: number): StoryDiorama {
  const q = dharmSankatQuestion(n);
  const sky = SKIES[(n - 1) % SKIES.length]!;
  const duo = (at = 0.4) => [
    P("figure", 290, 1560, { depth: 1, at, enter: "slideRight", scale: 0.85, data: q.left }),
    P("figure", 790, 1560, { depth: 1, at: at + 0.2, enter: "slideLeft", scale: 0.85, flip: true, data: q.right })
  ];
  const names = [{ text: q.leftName, x: 290, y: 980, toX: 290, toY: 1120, at: 1 }, { text: q.rightName, x: 790, y: 980, toX: 790, toY: 1120, at: 1.3 }];
  const side = (s: Side, k: "A" | "B", fig: Record<string, unknown>, x: number): Scene => ({
    id: `side-${k.toLowerCase()}`, seconds: 8.5, location: `PAKSH ${k} · ${s.label}`, sky, particles: "embers", camera: "still",
    narration: s.hi, caption: s.en,
    headlines: [{ at: 0, lines: [{ text: `PAKSH ${k}:` }, { text: s.label, tone: k === "A" ? "accent2" : "accent3" }] }],
    layers: [
      P("figure", x, 1600, { depth: 1, at: 0.2, enter: "rise", scale: 0.8, data: { ...fig, halo: true } }),
      P("noteCard", x === 290 ? 720 : 340, 1060, { depth: 0.7, at: 0.8, enter: "drop", scale: 0.8, data: { title: `${k}: ${s.label}`, items: s.card } })
    ]
  });
  const scenes: Scene[] = [
    {
      id: "hook", seconds: 5, location: `DHARM SANKAT #${String(n).padStart(2, "0")}`, sky, particles: "stars",
      narration: q.hookHi, caption: q.hookEn,
      headlines: [{ at: 0, lines: [{ text: q.h1 }, { text: q.h2, tone: "accent2" }] }],
      layers: duo(0.3), labels: names
    },
    {
      id: "context", seconds: 7, location: "KAHANI", sky, particles: "stars",
      narration: q.ctxHi, caption: q.ctxEn,
      headlines: [{ at: 0, lines: [{ text: q.c1 }, { text: q.c2, tone: "accent" }] }],
      layers: [P("moon", 540, 860, { depth: 0.1, idle: "pulse" }), ...duo(0.2)]
    },
    side(q.a, "A", q.left, 290),
    side(q.b, "B", q.right, 790),
    {
      id: "ask", seconds: 9.5, location: "AAPKI RAAY", sky, particles: "stars", camera: "still",
      narration: `${q.askHi} ${DHARM_SANKAT_CTA_VOICE}`, caption: "",
      headlines: [{ at: 0, lines: [{ text: "A YA B?" }] }],
      layers: duo(0)
    }
  ];
  return StoryDioramaSchema.parse({
    brand: "EPIC BHARAT SAGA", handle: DHARM_SANKAT_HANDLE,
    tag: "DHARM SANKAT · #", tagAccent: String(n).padStart(2, "0"),
    palette: PAL, transitionFrames: 10,
    scenes: scenes.map((s, i) => ({ ...s, fig: `SCENE ${i + 1}` })),
    ask: askOutro({
      question: q.ask, options: [`A: ${q.a.label}`, `B: ${q.b.label}`], voiceQuestion: q.askHi,
      cta: "APNI RAAY COMMENT MEIN! 👇", ctaSub: "Roz naya sawaal — FOLLOW karo!", voiceCta: DHARM_SANKAT_CTA_VOICE,
      handle: DHARM_SANKAT_HANDLE, questionSeconds: 4, ctaSeconds: 5.5
    })
  });
}

export function dharmSankatMeta(n: number) {
  const q = dharmSankatQuestion(n);
  return {
    title: `${q.title} 🤔 | Dharm Sankat #${n} #shorts`,
    description: [
      `${q.title}`,
      `A: ${q.a.label} · B: ${q.b.label} — apni raay comment mein likho 👇`,
      "Dono paksh granthon se liye gaye hain; faisla aapka.",
      `Source: ${q.sources}`,
      "", "Roz ek naya Dharm Sankat + roz ek Epic Bharat Saga episode — subscribe @EpicBharatSaga",
      "#mahabharat #ramayan #dharmsankat #sanatandharma #hindumythology #shorts"
    ].join("\n"),
    tags: ["dharm sankat", "mahabharat", "ramayan", "mahabharat facts", "hindu mythology", "sanatan dharma", q.leftName.toLowerCase(), q.rightName.toLowerCase(), "epic bharat saga", "shorts"],
    caption: `${q.title} 🤔\nA: ${q.a.label} ya B: ${q.b.label}? Comment karo 👇\n#mahabharat #ramayan #dharmsankat #reels`,
    language: "hi",
    categoryId: "27"
  };
}
