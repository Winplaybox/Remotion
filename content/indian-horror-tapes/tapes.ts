import { askOutro } from "../../engines/ask-outro";
import { P, StoryDioramaSchema, type StoryDiorama, type StoryDioramaInput } from "../../engines/story-diorama/src/model";

/**
 * INDIAN HORROR TAPES — found-footage folklore Shorts ("TAPE #NN") on the story-diorama engine with the VHS finish.
 * Replaces the old Python + Pexels pipeline (stopped 8 Nov 2026; titles were cut mid-word and every title was the same
 * "X ka khaufnaak sach" template). Each tape is ONE real, well-known place and the legend locals tell about it:
 *   cold open (VHS, place + time) -> the place (verifiable facts) -> the legend ("log kehte hain") -> today (facts)
 *   -> AskOutro "SACH YA AFWAAH?".
 * Rules: legends are always framed as legends, never as a "sachi ghatna"; no gore, no self-harm, no real private people,
 * no instructions to trespass; the description says it is folklore told for entertainment. Post n = TAPES[n - 1].
 */

type RuinKind = "fort" | "haveli" | "mill" | "stepwell" | "bungalow" | "tomb";
export interface Tape {
  /** Headline lines, <= 16 chars each. */
  h1: string; h2: string;
  place: string; region: string; stamp: string;
  ruin: RuinKind | "road" | "forest" | "shore";
  shadow: "woman" | "boy" | "man";
  hookHi: string; hookEn: string;
  placeHi: string; placeEn: string;
  legendHi: string; legendEn: string;
  todayTitle: string; today: string[]; todayHi: string; todayEn: string;
  /** Short YouTube title (no channel boilerplate) and what the description cites. */
  title: string; sources: string; tags: string[];
}

const TAPES: Tape[] = [
  {
    h1: "BHANGARH", h2: "KILA", place: "BHANGARH FORT", region: "ALWAR, RAJASTHAN", stamp: "TAPE 01 · 06:58 PM", ruin: "fort", shadow: "man",
    hookHi: "सूरज ढलने के बाद, इस किले के दरवाज़े बंद हो जाते हैं। और ये नियम सरकारी है।",
    hookEn: "Suraj dhalne ke baad is kile ke darwaaze band ho jaate hain. Aur ye niyam sarkari hai.",
    placeHi: "राजस्थान का भानगढ़ किला, सत्रहवीं सदी में बसा एक पूरा शहर। आज यहाँ सिर्फ़ खंडहर हैं, बाज़ार, मंदिर और महल।",
    placeEn: "Rajasthan ka Bhangarh kila, 17vi sadi mein basa ek poora shehar. Aaj yahan sirf khandhar hain: bazaar, mandir aur mahal.",
    legendHi: "लोक कथा कहती है, एक तांत्रिक ने राजकुमारी रत्नावती पर जादू करना चाहा। जादू उल्टा पड़ा, और मरते मरते उसने पूरे शहर को श्राप दे दिया।",
    legendEn: "Lok katha kehti hai, ek tantrik ne rajkumari Ratnavati par jaadu karna chaha. Jaadu ulta pada, aur marte marte usne poore shehar ko shraap de diya.",
    todayTitle: "AAJ KA SACH", today: ["ASI KA BOARD", "SHAAM KE BAAD NO ENTRY"],
    todayHi: "सच ये है कि पुरातत्व विभाग का बोर्ड, सूर्यास्त के बाद और सूर्योदय से पहले यहाँ जाने से मना करता है।",
    todayEn: "Sach ye hai ki ASI ka board suryast ke baad aur suryoday se pehle yahan jaane se mana karta hai.",
    title: "Bhangarh Kila — suraj dhalte hi entry band kyun?", sources: "ASI notice at Bhangarh (no entry before sunrise / after sunset); local folklore of Ratnavati and the tantrik", tags: ["bhangarh fort", "bhangarh", "rajasthan", "haunted fort"]
  },
  {
    h1: "KULDHARA:", h2: "EK RAAT MEIN", place: "KULDHARA VILLAGE", region: "JAISALMER, RAJASTHAN", stamp: "TAPE 02 · 11:40 PM", ruin: "haveli", shadow: "man",
    hookHi: "एक पूरा गाँव, जो एक ही रात में ख़ाली हो गया। और फिर कभी कोई वापस नहीं बसा।",
    hookEn: "Ek poora gaon, jo ek hi raat mein khaali ho gaya. Aur phir kabhi koi wapas nahi basa.",
    placeHi: "जैसलमेर के पास कुलधरा, जहाँ कभी पालीवाल ब्राह्मण रहते थे। आज पत्थर के सैकड़ों घर, बिना छत के, ख़ामोश खड़े हैं।",
    placeEn: "Jaisalmer ke paas Kuldhara, jahan kabhi Paliwal Brahmin rehte the. Aaj patthar ke saikdon ghar, bina chhat ke, khamosh khade hain.",
    legendHi: "कहानी कहती है, एक दीवान के ज़ुल्म से बचने के लिए, गाँव वाले रातों रात चले गए। जाते जाते श्राप दे गए, कि यहाँ अब कोई नहीं बस पाएगा।",
    legendEn: "Kahani kehti hai, ek diwan ke zulm se bachne ke liye gaon wale raaton raat chale gaye. Jaate jaate shraap de gaye ki yahan ab koi nahi bas paayega.",
    todayTitle: "AAJ", today: ["HERITAGE SITE", "DIN MEIN TOURIST"],
    todayHi: "आज कुलधरा एक संरक्षित धरोहर है। दिन में सैलानी आते हैं, पर गाँव आज भी वीरान है।",
    todayEn: "Aaj Kuldhara ek sanrakshit dharohar hai. Din mein sailani aate hain, par gaon aaj bhi veeran hai.",
    title: "Kuldhara — ek raat mein khaali hua gaon", sources: "Rajasthan Tourism (Kuldhara, abandoned Paliwal village); local folklore of the curse", tags: ["kuldhara", "jaisalmer", "abandoned village", "rajasthan"]
  },
  {
    h1: "DOW HILL", h2: "KA JUNGLE", place: "DOW HILL", region: "KURSEONG, WEST BENGAL", stamp: "TAPE 03 · 05:12 PM", ruin: "forest", shadow: "boy",
    hookHi: "पहाड़ी जंगल, घना कोहरा, और एक लड़का, जो पीछे मुड़ते ही ग़ायब हो जाता है।",
    hookEn: "Pahadi jungle, ghana kohra, aur ek ladka jo peechhe mudte hi gaayab ho jaata hai.",
    placeHi: "दार्जिलिंग के पास कर्सियांग का डाउ हिल। देवदार के ऊँचे पेड़, और अंग्रेज़ों के ज़माने का एक पुराना स्कूल।",
    placeEn: "Darjeeling ke paas Kurseong ka Dow Hill. Devdar ke oonche ped, aur angrezon ke zamaane ka ek purana school.",
    legendHi: "स्थानीय लोग कहते हैं, शाम को कोहरे में एक लड़का पेड़ों के बीच चलता दिखता है। जो उसके पीछे जाता है, उसे रास्ता नहीं मिलता।",
    legendEn: "Sthaniya log kehte hain, shaam ko kohre mein ek ladka pedon ke beech chalta dikhta hai. Jo uske peechhe jaata hai, use raasta nahi milta.",
    todayTitle: "SACH", today: ["GHANA KOHRA", "RAASTA BHATAKNA AASAAN"],
    todayHi: "सच ये है, कि यहाँ का कोहरा इतना घना होता है, कि दो क़दम आगे भी नहीं दिखता। रास्ता भटकना आसान है।",
    todayEn: "Sach ye hai ki yahan ka kohra itna ghana hota hai ki do kadam aage bhi nahi dikhta. Raasta bhatakna aasaan hai.",
    title: "Dow Hill Kurseong — kohre wala jungle", sources: "Dow Hill, Kurseong (Victoria Boys' School, est. 1879); local folklore", tags: ["dow hill", "kurseong", "darjeeling", "haunted forest"]
  },
  {
    h1: "SHANIWAR", h2: "WADA", place: "SHANIWAR WADA", region: "PUNE, MAHARASHTRA", stamp: "TAPE 04 · 12:00 AM", ruin: "fort", shadow: "boy",
    hookHi: "पूनम की रात, पुणे के एक महल से, एक आवाज़। काका, मुझे बचाओ।",
    hookEn: "Poonam ki raat, Pune ke ek mahal se, ek awaaz: Kaka, mujhe bachao.",
    placeHi: "शनिवार वाड़ा, पेशवाओं का महल, सत्रह सौ बत्तीस में बना। अठारह सौ अट्ठाईस की आग के बाद, आज सिर्फ़ दीवारें और दरवाज़े बचे हैं।",
    placeEn: "Shaniwar Wada, Peshwaon ka mahal, 1732 mein bana. 1828 ki aag ke baad aaj sirf deewarein aur darwaaze bache hain.",
    legendHi: "इतिहास में, सत्रह सौ तिहत्तर में किशोर पेशवा नारायणराव की यहीं हत्या हुई। लोक कथा कहती है, पूनम की रात आज भी उसकी पुकार सुनाई देती है।",
    legendEn: "Itihaas mein, 1773 mein kishor Peshwa Narayanrao ki yahin hatya hui. Lok katha kehti hai, poonam ki raat aaj bhi uski pukaar sunai deti hai.",
    todayTitle: "AAJ", today: ["DIN MEIN KHULA", "LIGHT & SOUND SHOW"],
    todayHi: "आज ये संरक्षित स्मारक है। दिन में खुला रहता है, और शाम को यहाँ इतिहास का लाइट एंड साउंड शो होता है।",
    todayEn: "Aaj ye sanrakshit smarak hai. Din mein khula rehta hai, aur shaam ko yahan itihaas ka light and sound show hota hai.",
    title: "Shaniwar Wada — poonam ki raat ki awaaz", sources: "Shaniwar Wada (built 1732, fire 1828; Narayanrao Peshwa killed 1773); Pune folklore", tags: ["shaniwar wada", "pune", "peshwa", "maharashtra history"]
  },
  {
    h1: "DUMAS", h2: "BEACH", place: "DUMAS BEACH", region: "SURAT, GUJARAT", stamp: "TAPE 05 · 10:22 PM", ruin: "shore", shadow: "woman",
    hookHi: "काली रेत, तेज़ हवा, और रात को लहरों के बीच, फुसफुसाहटें।",
    hookEn: "Kaali ret, tez hawa, aur raat ko lehron ke beech fusfusahatein.",
    placeHi: "सूरत का डुमस बीच, अरब सागर के किनारे। यहाँ की रेत सुनहरी नहीं, काली है।",
    placeEn: "Surat ka Dumas beach, Arab Sagar ke kinare. Yahan ki ret sunehri nahi, kaali hai.",
    legendHi: "लोग कहते हैं, रात को यहाँ अकेले टहलो, तो पीछे से कोई नाम लेकर पुकारता है। और कुत्ते, ख़ाली अँधेरे की तरफ़ भौंकते हैं।",
    legendEn: "Log kehte hain, raat ko yahan akele tehlo to peechhe se koi naam lekar pukaarta hai. Aur kutte khaali andhere ki taraf bhaunkte hain.",
    todayTitle: "SACH", today: ["KAALI RET", "= KHANIJ / MITTI"],
    todayHi: "रेत का काला रंग खनिज और मिट्टी से है, ये विज्ञान है। पर रात की हवा की आवाज़ें, आज भी लोगों को डराती हैं।",
    todayEn: "Ret ka kaala rang khanij aur mitti se hai, ye vigyaan hai. Par raat ki hawa ki aawazein aaj bhi logon ko daraati hain.",
    title: "Dumas Beach Surat — kaali ret ka raaz", sources: "Dumas Beach, Surat (black sand); local folklore", tags: ["dumas beach", "surat", "gujarat", "black sand beach"]
  },
  {
    h1: "AGRASEN KI", h2: "BAOLI", place: "AGRASEN KI BAOLI", region: "NEW DELHI", stamp: "TAPE 06 · 07:05 PM", ruin: "stepwell", shadow: "man",
    hookHi: "दिल्ली के बीचों बीच, एक सौ से ज़्यादा सीढ़ियाँ, जो नीचे अँधेरे में उतरती हैं।",
    hookEn: "Delhi ke beechon beech, 100 se zyada seedhiyan, jo neeche andhere mein utarti hain.",
    placeHi: "कनॉट प्लेस के पास अग्रसेन की बावली, एक पुरानी सीढ़ीदार बावड़ी। ऊपर शहर का शोर, नीचे अजीब सन्नाटा।",
    placeEn: "Connaught Place ke paas Agrasen ki Baoli, ek purani seedhidaar baodi. Upar shehar ka shor, neeche ajeeb sannata.",
    legendHi: "कहानी है, जितना नीचे उतरो, उतना ठंडा और भारी लगता है। और नीचे से, चमगादड़ों के अलावा, कुछ और आवाज़ें भी आती हैं।",
    legendEn: "Kahani hai, jitna neeche utro, utna thanda aur bhaari lagta hai. Aur neeche se, chamgaadadon ke alawa, kuch aur aawazein bhi aati hain.",
    todayTitle: "AAJ", today: ["ASI SMARAK", "103 SEEDHIYAN"],
    todayHi: "आज ये पुरातत्व विभाग का संरक्षित स्मारक है, और दिन में लोग यहाँ फ़ोटो खींचने आते हैं।",
    todayEn: "Aaj ye ASI ka sanrakshit smarak hai, aur din mein log yahan photo kheenchne aate hain.",
    title: "Agrasen ki Baoli — Delhi ki andheri seedhiyan", sources: "ASI protected monument, Agrasen ki Baoli (~103 steps); Delhi folklore", tags: ["agrasen ki baoli", "delhi", "stepwell", "haunted delhi"]
  },
  {
    h1: "BRIJ RAJ", h2: "BHAWAN", place: "BRIJ RAJ BHAWAN", region: "KOTA, RAJASTHAN", stamp: "TAPE 07 · 02:15 AM", ruin: "bungalow", shadow: "man",
    hookHi: "एक अंग्रेज़ अफ़सर, जो मरने के बाद भी, पहरेदारों को सोने नहीं देता।",
    hookEn: "Ek angrez afsar, jo marne ke baad bhi pehredaaron ko sone nahi deta.",
    placeHi: "कोटा का बृज राज भवन, उन्नीसवीं सदी की एक इमारत। अठारह सौ सत्तावन की क्रांति में, यहाँ मेजर बर्टन मारे गए थे।",
    placeEn: "Kota ka Brij Raj Bhawan, 19vi sadi ki ek imaarat. 1857 ki kranti mein yahan Major Burton maare gaye the.",
    legendHi: "लोक कथा कहती है, आज भी रात को, गलियारों में एक साया चलता है। और अगर कोई पहरेदार ड्यूटी पर सो जाए, तो उसे थप्पड़ पड़ता है।",
    legendEn: "Lok katha kehti hai, aaj bhi raat ko galiyaaron mein ek saaya chalta hai. Aur agar koi pehredaar duty par so jaaye, to use thappad padta hai.",
    todayTitle: "ITIHAAS", today: ["1857 KI KRANTI", "MAJOR BURTON"],
    todayHi: "इतिहास सच है, अठारह सौ सत्तावन में कोटा में मेजर बर्टन मारे गए थे। बाक़ी, लोगों की कहानी है।",
    todayEn: "Itihaas sach hai, 1857 mein Kota mein Major Burton maare gaye the. Baaki, logon ki kahani hai.",
    title: "Brij Raj Bhawan Kota — Major Burton ki kahani", sources: "History of the 1857 uprising at Kota (Major Charles Burton); local folklore", tags: ["brij raj bhawan", "kota", "1857", "rajasthan"]
  },
  {
    h1: "JATINGA:", h2: "PANCHHI KYUN?", place: "JATINGA", region: "DIMA HASAO, ASSAM", stamp: "TAPE 08 · 08:30 PM", ruin: "forest", shadow: "man",
    hookHi: "असम का एक गाँव, जहाँ कुछ रातों को, पंछी आसमान से रोशनी की तरफ़ गिरने लगते हैं।",
    hookEn: "Assam ka ek gaon, jahan kuch raaton ko panchhi aasmaan se roshni ki taraf girne lagte hain.",
    placeHi: "असम की पहाड़ियों में जतिंगा। अगस्त से अक्टूबर की कुछ अँधेरी, कोहरे वाली रातों में, ये अजीब घटना होती है।",
    placeEn: "Assam ki pahadiyon mein Jatinga. August se October ki kuch andheri, kohre wali raaton mein ye ajeeb ghatna hoti hai.",
    legendHi: "पुराने लोग इसे बुरी आत्माओं का काम मानते थे। कहते थे, आसमान से श्राप उतरता है।",
    legendEn: "Purane log ise buri aatmaon ka kaam maante the. Kehte the, aasmaan se shraap utarta hai.",
    todayTitle: "VIGYAAN", today: ["KOHRA + TEZ HAWA", "ROSHNI SE BHATKE"],
    todayHi: "वैज्ञानिक मानते हैं, कोहरे और तेज़ हवा में पंछी रास्ता भटककर, गाँव की रोशनी की तरफ़ आ जाते हैं। अब लोग इन्हें बचाने की मुहिम भी चलाते हैं।",
    todayEn: "Vaigyanik maante hain, kohre aur tez hawa mein panchhi raasta bhatak kar gaon ki roshni ki taraf aa jaate hain. Ab log inhe bachaane ki muhim bhi chalaate hain.",
    title: "Jatinga Assam — panchhiyon ka rahasya", sources: "Jatinga bird phenomenon (Assam Forest Dept; studies on fog, wind and lights); folklore", tags: ["jatinga", "assam", "bird mystery", "northeast india"]
  },
  {
    h1: "MUKESH", h2: "MILLS", place: "MUKESH MILLS", region: "COLABA, MUMBAI", stamp: "TAPE 09 · 01:05 AM", ruin: "mill", shadow: "woman",
    hookHi: "समंदर किनारे एक जली हुई मिल। दिन में यहाँ फ़िल्में शूट होती हैं, रात को कोई नहीं रुकता।",
    hookEn: "Samandar kinare ek jali hui mill. Din mein yahan filmein shoot hoti hain, raat ko koi nahi rukta.",
    placeHi: "मुंबई के कोलाबा में मुकेश मिल्स, अठारह सौ सत्तर के आसपास बनी। उन्नीस सौ बयासी की आग के बाद, ये खंडहर बन गई।",
    placeEn: "Mumbai ke Colaba mein Mukesh Mills, 1870 ke aaspaas bani. 1982 ki aag ke baad ye khandhar ban gayi.",
    legendHi: "फ़िल्म वालों के बीच कहानी है, कि रात की शिफ़्ट में, ख़ाली हॉल से किसी के चलने की आवाज़ आती है। इसलिए शूटिंग शाम से पहले ख़त्म।",
    legendEn: "Film walon ke beech kahani hai ki raat ki shift mein khaali hall se kisi ke chalne ki awaaz aati hai. Isliye shooting shaam se pehle khatam.",
    todayTitle: "AAJ", today: ["PRIVATE PROPERTY", "BINA IJAZAT NO ENTRY"],
    todayHi: "आज ये प्राइवेट प्रॉपर्टी है। यहाँ बिना इजाज़त जाना मना है।",
    todayEn: "Aaj ye private property hai. Yahan bina ijazat jaana mana hai.",
    title: "Mukesh Mills Mumbai — raat ki shift ka darr", sources: "Mukesh Mills, Colaba (built c. 1870, fire 1982); film-industry folklore", tags: ["mukesh mills", "mumbai", "colaba", "abandoned mill"]
  },
  {
    h1: "SANJAY VAN", h2: "KI RAAT", place: "SANJAY VAN", region: "MEHRAULI, DELHI", stamp: "TAPE 10 · 11:11 PM", ruin: "forest", shadow: "woman",
    hookHi: "दिल्ली के बीच एक जंगल, जहाँ रात को, सफ़ेद कपड़ों में एक औरत दिखने की बात कही जाती है।",
    hookEn: "Delhi ke beech ek jungle, jahan raat ko safed kapdon mein ek aurat dikhne ki baat kahi jaati hai.",
    placeHi: "महरौली का संजय वन, सैकड़ों एकड़ का जंगल। अंदर पुरानी कब्रें और सूफ़ी दरगाहें भी हैं।",
    placeEn: "Mehrauli ka Sanjay Van, saikdon acre ka jungle. Andar purani kabrein aur Sufi dargahein bhi hain.",
    legendHi: "सुबह टहलने वाले कहते हैं, कोहरे में कोई पेड़ों के बीच खड़ा दिखता है। पास जाओ, तो वहाँ कोई नहीं होता।",
    legendEn: "Subah tehelne wale kehte hain, kohre mein koi pedon ke beech khada dikhta hai. Paas jao, to wahan koi nahi hota.",
    todayTitle: "AAJ", today: ["CITY FOREST", "SUBAH WALKERS"],
    todayHi: "आज ये दिल्ली का एक शहरी जंगल है, जहाँ सुबह सैकड़ों लोग टहलते हैं।",
    todayEn: "Aaj ye Delhi ka ek shehri jungle hai, jahan subah saikdon log tehelte hain.",
    title: "Sanjay Van Delhi — kohre wala jungle", sources: "Sanjay Van, Mehrauli (DDA city forest); Delhi folklore", tags: ["sanjay van", "delhi", "mehrauli", "haunted delhi"]
  },
  {
    h1: "DELHI CANTT", h2: "KI LIFT", place: "DELHI CANTT ROAD", region: "NEW DELHI", stamp: "TAPE 11 · 03:03 AM", ruin: "road", shadow: "woman",
    hookHi: "रात तीन बजे, सुनसान सड़क, और सफ़ेद साड़ी में एक औरत, लिफ़्ट माँगती हुई।",
    hookEn: "Raat teen baje, sunsaan sadak, aur safed saadi mein ek aurat, lift maangti hui.",
    placeHi: "दिल्ली कैंटोनमेंट की चौड़ी, पेड़ों से घिरी सड़कें। रात को यहाँ बहुत कम गाड़ियाँ चलती हैं।",
    placeEn: "Delhi Cantonment ki chaudi, pedon se ghiri sadkein. Raat ko yahan bahut kam gaadiyan chalti hain.",
    legendHi: "शहरी कहानी कहती है, जो रुकता नहीं, उसकी गाड़ी के साथ साथ, वो औरत उतनी ही तेज़ भागती है। और शीशे में, पीछे बैठी दिखती है।",
    legendEn: "Shehri kahani kehti hai, jo rukta nahi, uski gaadi ke saath saath woh aurat utni hi tez bhaagti hai. Aur sheeshe mein peechhe baithi dikhti hai.",
    todayTitle: "SACH YA?", today: ["URBAN LEGEND", "KOI PROOF NAHI"],
    todayHi: "ये एक मशहूर शहरी कहानी है, जिसका कोई सबूत नहीं मिला। पर रात को ड्राइवर आज भी रुकते नहीं।",
    todayEn: "Ye ek mashhoor shehri kahani hai, jiska koi saboot nahi mila. Par raat ko driver aaj bhi rukte nahi.",
    title: "Delhi Cantt — raat 3 baje lift maangti aurat", sources: "Delhi urban legend (no evidence; told for entertainment)", tags: ["delhi cantt", "urban legend", "lift", "haunted road"]
  },
  {
    h1: "D'SOUZA", h2: "CHAWL", place: "D'SOUZA CHAWL", region: "MAHIM, MUMBAI", stamp: "TAPE 12 · 09:45 PM", ruin: "bungalow", shadow: "woman",
    hookHi: "मुंबई की एक चाल, और उसके आँगन का कुआँ। लोग कहते हैं, रात को वहाँ कोई खड़ा रहता है।",
    hookEn: "Mumbai ki ek chawl, aur uske aangan ka kuaan. Log kehte hain, raat ko wahan koi khada rehta hai.",
    placeHi: "माहिम की डिसूज़ा चाल, एक पुरानी रिहायशी चाल। बीच में एक पुराना कुआँ।",
    placeEn: "Mahim ki D'Souza chawl, ek purani rihaayshi chawl. Beech mein ek purana kuaan.",
    legendHi: "कहानी है, बरसों पहले, पानी भरते हुए एक औरत कुएँ में गिर गई। तब से रात को, कुएँ के पास एक साया दिखने की बातें होती हैं। पर वो किसी को परेशान नहीं करता।",
    legendEn: "Kahani hai, barson pehle paani bharte hue ek aurat kuein mein gir gayi. Tab se raat ko kuein ke paas ek saaya dikhne ki baatein hoti hain. Par woh kisi ko pareshaan nahi karta.",
    todayTitle: "AAJ", today: ["LOG RAHTE HAIN", "IZZAT SE BAAT KAREIN"],
    todayHi: "यहाँ आज भी परिवार रहते हैं। इसलिए ये सिर्फ़ एक कहानी है, किसी के घर में घुसने की वजह नहीं।",
    todayEn: "Yahan aaj bhi parivaar rehte hain. Isliye ye sirf ek kahani hai, kisi ke ghar mein ghusne ki wajah nahi.",
    title: "D'Souza Chawl Mahim — kuein ki kahani", sources: "Mumbai folklore (D'Souza Chawl, Mahim)", tags: ["dsouza chawl", "mahim", "mumbai", "mumbai horror"]
  },
  {
    h1: "LAMBI DEHAR", h2: "KI KHAANEIN", place: "LAMBI DEHAR MINES", region: "MUSSOORIE, UTTARAKHAND", stamp: "TAPE 13 · 06:20 PM", ruin: "mill", shadow: "man",
    hookHi: "मसूरी की ख़ूबसूरत पहाड़ियों में, बंद पड़ी चूना पत्थर की खदानें।",
    hookEn: "Mussoorie ki khoobsurat pahadiyon mein, band padi choona patthar ki khaanein.",
    placeHi: "लंबी देहार की खदानें, जो कई साल पहले बंद हो गईं। अब यहाँ टूटी दीवारें और ख़ाली रास्ते हैं।",
    placeEn: "Lambi Dehar ki khaanein, jo kai saal pehle band ho gayin. Ab yahan tooti deewarein aur khaali raaste hain.",
    legendHi: "कहा जाता है, खदानों में काम करने वाले मज़दूरों की सेहत ख़राब हुई, और कई लोगों की जान गई। लोग कहते हैं, शाम को हवा में खाँसने की आवाज़ें आती हैं।",
    legendEn: "Kaha jaata hai, khaanon mein kaam karne wale mazdooron ki sehat kharaab hui, aur kai logon ki jaan gayi. Log kehte hain, shaam ko hawa mein khaansne ki aawazein aati hain.",
    todayTitle: "SABAK", today: ["MAZDOOR KI SEHAT", "SABSE ZAROORI"],
    todayHi: "डर से बड़ा सबक ये है, कि खदानों में काम करने वालों की सुरक्षा और सेहत, सबसे ज़रूरी है।",
    todayEn: "Darr se bada sabak ye hai ki khaanon mein kaam karne walon ki suraksha aur sehat sabse zaroori hai.",
    title: "Lambi Dehar Mines Mussoorie — band khaanon ki kahani", sources: "Lambi Dehar limestone mines, Mussoorie (closed); local folklore", tags: ["lambi dehar mines", "mussoorie", "uttarakhand", "abandoned mines"]
  },
  {
    h1: "HIGHWAY KA", h2: "BAND DHABA", place: "EK KAHANI", region: "HIGHWAY · KAHANI", stamp: "TAPE 14 · 02:00 AM", ruin: "road", shadow: "man",
    hookHi: "ये एक कहानी है। हाईवे, रात दो बजे, और एक ढाबा, जो दिन में कभी दिखता ही नहीं।",
    hookEn: "Ye ek kahani hai. Highway, raat do baje, aur ek dhaba jo din mein kabhi dikhta hi nahi.",
    placeHi: "ट्रक ड्राइवरों के बीच ये कहानी चलती है। लंबे सफ़र में, थकान और नींद के बीच, सड़क किनारे एक जलता हुआ बोर्ड।",
    placeEn: "Truck driveron ke beech ye kahani chalti hai. Lambe safar mein, thakaan aur neend ke beech, sadak kinare ek jalta hua board.",
    legendHi: "कहानी में, ड्राइवर रुकता है, गरम चाय पीता है। सुबह लौटकर देखता है, तो वहाँ सिर्फ़ टूटी दीवारें हैं, और बीस साल पुराना एक बोर्ड।",
    legendEn: "Kahani mein, driver rukta hai, garam chai peeta hai. Subah laut kar dekhta hai, to wahan sirf tooti deewarein hain, aur bees saal purana ek board.",
    todayTitle: "ASLI SABAK", today: ["THAKAN MEIN", "DRIVE MAT KARO"],
    todayHi: "असली डर, नींद में गाड़ी चलाना है। थके हो, तो रुको और आराम करो।",
    todayEn: "Asli darr neend mein gaadi chalana hai. Thake ho, to ruko aur aaram karo.",
    title: "Highway ka band dhaba — raat 2 baje ki kahani", sources: "Fiction / trucker folklore, told for entertainment", tags: ["highway horror", "dhaba", "truck driver story", "hindi horror story"]
  }
];

const PAL = { paper: "#ECE6D8", ink: "#0C0A10", accent: "#FF3B2F", accent2: "#F2D16B", accent3: "#9ED8F5" };
const SKIES: [string, string][] = [["#06070E", "#1A1626"], ["#0A0C14", "#22202E"], ["#07090C", "#1C2420"], ["#0B0710", "#2A1A22"]];

export const HORROR_HANDLE = "@IndianHorrorTapes";
export const HORROR_CTA_VOICE = "आपको क्या लगता है? सच, या अफ़वाह? कमेंट में लिखो, और अगली टेप के लिए फॉलो करो।";
export const horrorTapeCount = () => TAPES.length;

export function horrorTape(n: number): Tape {
  const t = TAPES[Math.floor(n) - 1];
  if (!t) throw new Error(`Horror Tape #${n} is not written yet in content/indian-horror-tapes/tapes.ts`);
  return t;
}

type Scene = Omit<StoryDioramaInput["scenes"][number], "fig">;

/** The set for a tape: building / road / forest / shore + moon + optional lantern. */
function set(t: Tape, n: number, shadowAt?: number) {
  const layers = [P("moon", 820, 640, { depth: 0.1, idle: "pulse", data: { phase: 1 } })];
  if (t.ruin === "road") layers.push(P("road", 540, 1000, { depth: 0.5, enter: "none", data: { sign: t.h2.includes("DHABA") ? "DHABA" : "" } }));
  else if (t.ruin === "forest") layers.push(...[180, 420, 700, 930].map((x, i) => P("tree", x, 1500 - (i % 2) * 40, { depth: 0.3 + i * 0.15, scale: 1.3 - (i % 2) * 0.2, idle: "sway" })));
  else if (t.ruin === "shore") layers.push(P("water", 540, 1420, { depth: 0.4, data: { color: "#16202A" } }));
  else layers.push(P("ruin", 540, 1480, { depth: 0.5, scale: 1.1, data: { kind: t.ruin } }));
  if (t.ruin !== "road" && n % 2 === 0) layers.push(P("lantern", 950, 200, { depth: 0.9, enter: "fade" }));
  if (shadowAt !== undefined) layers.push(P("shadow", t.ruin === "road" ? 760 : 820, 1560, { depth: 1, at: shadowAt, enter: "none", data: { kind: t.shadow, eyes: t.shadow !== "boy" } }));
  return layers;
}

/** Post n -> a found-footage Short on the story-diorama engine (VHS finish) with the shared AskOutro ending. */
export function horrorTapeForDay(n: number): StoryDiorama {
  const t = horrorTape(n);
  const sky = SKIES[(n - 1) % SKIES.length]!;
  const ground = t.ruin === "road" ? undefined : { color: "#0E0D12", y: 1480 };
  const tape = `TAPE #${String(n).padStart(2, "0")}`;
  const scenes: Scene[] = [
    {
      id: "cold-open", seconds: 6, location: `${t.place} · ${t.region}`, sky, ground, tone: "light", particles: "none", camera: "push",
      narration: t.hookHi, caption: t.hookEn, sfx: ["wind"],
      headlines: [{ at: 0, lines: [{ text: t.h1 }, { text: t.h2, tone: "accent" }] }],
      layers: set(t, n)
    },
    {
      id: "place", seconds: 8, location: t.region, sky, ground, tone: "light", particles: "none", camera: "panLeft",
      narration: t.placeHi, caption: t.placeEn, sfx: ["creak"],
      headlines: [{ at: 0, lines: [{ text: "YE JAGAH" }, { text: "ASLI HAI", tone: "accent2" }] }],
      layers: set(t, n + 1)
    },
    {
      id: "legend", seconds: 9.5, location: "LOK KATHA", sky, ground, tone: "light", particles: t.ruin === "shore" ? "none" : "rain", camera: "push",
      narration: t.legendHi, caption: t.legendEn, sfx: ["heartbeat", "stinger"],
      headlines: [{ at: 0, lines: [{ text: "LOG KEHTE" }, { text: "HAIN...", tone: "accent" }] }],
      layers: set(t, n, 3.5)
    },
    {
      id: "today", seconds: 7.5, location: t.todayTitle, sky, ground, tone: "light", particles: "none", camera: "still",
      narration: t.todayHi, caption: t.todayEn,
      headlines: [{ at: 0, lines: [{ text: t.todayTitle.length <= 16 ? t.todayTitle : "AAJ" }] }],
      layers: [...set(t, n + 1), P("noteCard", 540, 980, { depth: 0.8, at: 0.4, enter: "drop", scale: 0.82, data: { title: t.todayTitle, items: t.today } })]
    },
    {
      id: "ask", seconds: 9.5, location: tape, sky, ground, tone: "light", particles: "none", camera: "still",
      narration: `${HORROR_CTA_VOICE}`, caption: "",
      headlines: [{ at: 0, lines: [{ text: "SACH YA" }, { text: "AFWAAH?", tone: "accent" }] }],
      layers: set(t, n, 0.6)
    }
  ];
  return StoryDioramaSchema.parse({
    music: "sfx/music_horror.mp3",
    brand: "INDIAN HORROR TAPES", handle: HORROR_HANDLE,
    tag: "TAPE · #", tagAccent: String(n).padStart(2, "0"),
    palette: PAL, transitionFrames: 6, finish: "vhs", stamp: t.stamp,
    scenes: scenes.map((s, i) => ({ ...s, fig: `REC ${i + 1}/5` })),
    ask: askOutro({
      question: "SACH YA AFWAAH?", options: ["A: SACH", "B: AFWAAH"], voiceQuestion: "आपको क्या लगता है? सच, या अफ़वाह?",
      cta: "COMMENT KARO: A YA B 👇", ctaSub: "Agli tape ke liye FOLLOW karo!", voiceCta: "कमेंट में लिखो, और अगली टेप के लिए फॉलो करो।",
      handle: HORROR_HANDLE, questionSeconds: 4, ctaSeconds: 5.5
    })
  });
}

export function horrorTapeMeta(n: number) {
  const t = horrorTape(n);
  return {
    title: `${t.title} 😨 | Tape #${n} #shorts`.slice(0, 100),
    description: [
      `${t.title} — ${t.region}`,
      "Sach ya afwaah? A ya B comment karo 👇",
      "",
      "⚠️ Ye lok-kathayein aur kisse hain, entertainment ke liye. Kisi bhi jagah par raat ko, bina ijazat ya akele na jaayein.",
      `Source / context: ${t.sources}`,
      "", "Har roz ek nayi tape — subscribe @IndianHorrorTapes",
      "#IndianHorror #HorrorStories #HauntedIndia #Bhoot #HindiHorror #shorts"
    ].join("\n"),
    tags: ["indian horror", "horror story hindi", "haunted places in india", "bhoot", "real horror", ...t.tags, "shorts"].slice(0, 20),
    caption: `${t.title} 😨\nSach ya afwaah? Comment karo 👇\nYouTube pe roz nayi tape 👉 @IndianHorrorTapes\n#indianhorror #haunted #bhoot #reels`,
    language: "hi",
    categoryId: "24"
  };
}
