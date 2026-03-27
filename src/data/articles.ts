import placeTuraif from "@/assets/place-turaif.jpg";
import placeBujairi from "@/assets/place-bujairi.jpg";
import placeWadi from "@/assets/place-wadi.jpg";
import placeZallal from "@/assets/place-zallal.jpg";
import introImg from "@/assets/intro-people.jpg";

export interface Article {
  id: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  image: string;
  category: string;
  categoryEn: string;
  date: string;
  dateEn: string;
  readTime: string;
  readTimeEn: string;
  content: string[];
  contentEn: string[];
}

export const articles: Article[] = [
  {
    id: "history",
    title: "تاريخ الدرعية: من البدايات إلى التراث العالمي",
    titleEn: "History of Diriyah: From Beginnings to World Heritage",
    excerpt: "رحلة عبر أكثر من خمسة قرون من التاريخ، من تأسيس الدرعية على يد مانع المريدي إلى تسجيلها في قائمة التراث العالمي لليونسكو.",
    excerptEn: "A journey through over five centuries of history, from Diriyah's founding by Mani Al Muraidi to its UNESCO World Heritage listing.",
    image: placeTuraif,
    category: "تاريخ",
    categoryEn: "History",
    date: "٢٠ شوال ١٤٤٦",
    dateEn: "20 Shawwal 1446",
    readTime: "٨ دقائق",
    readTimeEn: "8 min read",
    content: [
      "تُعدّ الدرعية واحدة من أهم المواقع التاريخية في المملكة العربية السعودية، حيث تأسست في عام 1446م على يد مانع بن ربيعة المريدي، جد الأسرة الحاكمة آل سعود. تقع الدرعية على ضفاف وادي حنيفة في الجزء الشمالي الغربي من مدينة الرياض، وقد شكّلت منذ نشأتها مركزاً حضارياً وسياسياً بارزاً في قلب شبه الجزيرة العربية.",
      "في عام 1727م، أسس الإمام محمد بن سعود الدولة السعودية الأولى واتخذ من الدرعية عاصمة لها. شهدت المدينة خلال هذه الحقبة ازدهاراً كبيراً في مختلف المجالات؛ فتوسعت رقعتها العمرانية، وازداد عدد سكانها، وأصبحت مركزاً تجارياً وعلمياً يجذب العلماء والتجار من مختلف أنحاء الجزيرة العربية.",
      "حي الطريف، الذي يعلو الجرف المطل على وادي حنيفة، كان المقر الرئيسي لحكام الدولة السعودية الأولى. ضمّ الحي قصر سلوى الشهير ومسجد الإمام محمد بن سعود وعدداً من القصور والمباني الإدارية التي عكست عظمة الدولة وقوتها. تميّز الحي بعمارته النجدية الأصيلة المبنية من الطوب اللبن والحجر.",
      "في عام 2010م، سُجّل حي الطريف في قائمة التراث العالمي لمنظمة اليونسكو، ليصبح أول موقع سعودي يُدرج في هذه القائمة المرموقة. جاء هذا التسجيل اعترافاً بالقيمة التاريخية والمعمارية الاستثنائية للموقع، وبدوره المحوري في تشكيل تاريخ المنطقة.",
      "اليوم، تشهد الدرعية نهضة تطويرية شاملة من خلال مشروع بوابة الدرعية الذي يهدف إلى تحويلها إلى واحدة من أبرز الوجهات السياحية والثقافية في العالم، مع الحفاظ على طابعها التاريخي الأصيل وتراثها العريق.",
    ],
    contentEn: [
      "Diriyah is one of the most important historical sites in Saudi Arabia, founded in 1446 CE by Mani ibn Rabia Al Muraidi, ancestor of the ruling Al Saud family. Located on the banks of Wadi Hanifa in the northwestern part of Riyadh, Diriyah has been a prominent civilizational and political center in the heart of the Arabian Peninsula since its inception.",
      "In 1727, Imam Muhammad ibn Saud established the First Saudi State and made Diriyah its capital. During this era, the city witnessed tremendous growth in various fields; its urban area expanded, its population grew, and it became a commercial and scholarly center attracting scholars and merchants from across the Arabian Peninsula.",
      "At-Turaif district, perched on the cliff overlooking Wadi Hanifa, served as the main seat of the First Saudi State's rulers. The district housed the famous Salwa Palace, Imam Muhammad ibn Saud Mosque, and numerous palaces and administrative buildings that reflected the state's grandeur and power. The district was distinguished by its authentic Najdi architecture built from mud brick and stone.",
      "In 2010, At-Turaif district was inscribed on the UNESCO World Heritage List, becoming the first Saudi site to be listed in this prestigious registry. This inscription recognized the exceptional historical and architectural value of the site and its pivotal role in shaping the region's history.",
      "Today, Diriyah is undergoing a comprehensive development renaissance through the Diriyah Gate project, which aims to transform it into one of the world's premier tourist and cultural destinations while preserving its authentic historical character and rich heritage.",
    ],
  },
  {
    id: "architecture",
    title: "العمارة النجدية: جمال الطين والحجر",
    titleEn: "Najdi Architecture: The Beauty of Mud and Stone",
    excerpt: "اكتشف أسرار البناء بالطراز النجدي التقليدي، حيث تتحول مواد بسيطة مثل الطين واللبن إلى تحف معمارية تتحدى الزمن.",
    excerptEn: "Discover the secrets of traditional Najdi building style, where simple materials like mud and adobe transform into architectural masterpieces that defy time.",
    image: placeZallal,
    category: "عمارة",
    categoryEn: "Architecture",
    date: "١٥ شوال ١٤٤٦",
    dateEn: "15 Shawwal 1446",
    readTime: "٦ دقائق",
    readTimeEn: "6 min read",
    content: [
      "تمثّل العمارة النجدية واحدة من أروع الأنماط المعمارية في شبه الجزيرة العربية، حيث استطاع أهل نجد تطوير أسلوب بناء فريد يتناغم مع البيئة الصحراوية القاسية ويحقق أقصى درجات الراحة والجمال باستخدام مواد طبيعية محلية.",
      "يعتمد البناء النجدي بشكل أساسي على الطوب اللبن المصنوع من خليط الطين والتبن المجفف تحت أشعة الشمس، إلى جانب الحجر الجيري المحلي. توفر هذه المواد عزلاً حرارياً ممتازاً، حيث تبقى الجدران السميكة باردة في الصيف ودافئة في الشتاء، مما يجعلها مثالية للمناخ الصحراوي.",
      "تتميز الواجهات النجدية بزخارف هندسية رائعة تُنقش على الجص الأبيض، وتشمل أنماطاً مثلثية ومعيّنية تعكس الذوق الجمالي الراقي لأهل المنطقة. كما تُزيّن النوافذ بأطر خشبية مزخرفة وحجاب خشبي (مشربيات) يسمح بمرور الهواء والضوء مع الحفاظ على الخصوصية.",
      "في حي الطريف بالدرعية، تتجلى العمارة النجدية في أبهى صورها. تتراص المباني بشكل متناسق على حافة الوادي، وترتفع الجدران بألوان ترابية دافئة تتناغم مع لون الصحراء المحيطة. القصور والمساجد تحمل بصمة معمارية مميزة جعلتها تستحق التسجيل في قائمة التراث العالمي.",
      "تعمل هيئة تطوير بوابة الدرعية اليوم على الحفاظ على هذا الإرث المعماري الفريد وترميمه بأساليب علمية حديثة، مع إدماج عناصر العمارة النجدية في التصاميم المعاصرة لتبقى هذه الهوية حاضرة في المشهد العمراني السعودي.",
    ],
    contentEn: [
      "Najdi architecture represents one of the finest architectural styles in the Arabian Peninsula, where the people of Najd developed a unique building method that harmonizes with the harsh desert environment while achieving maximum comfort and beauty using local natural materials.",
      "Najdi construction primarily relies on adobe bricks made from a mixture of clay and straw dried under the sun, along with local limestone. These materials provide excellent thermal insulation, with thick walls staying cool in summer and warm in winter, making them ideal for the desert climate.",
      "Najdi façades are distinguished by remarkable geometric decorations carved into white plaster, including triangular and diamond patterns that reflect the refined aesthetic taste of the region's people. Windows are adorned with decorated wooden frames and wooden screens (mashrabiyyas) that allow air and light to pass while maintaining privacy.",
      "In At-Turaif district of Diriyah, Najdi architecture is showcased at its finest. Buildings are arranged harmoniously along the valley's edge, with walls rising in warm earthen tones that blend with the surrounding desert landscape. The palaces and mosques bear a distinctive architectural signature that earned them a place on the UNESCO World Heritage List.",
      "The Diriyah Gate Development Authority is now working to preserve and restore this unique architectural heritage using modern scientific methods, while integrating elements of Najdi architecture into contemporary designs to keep this identity present in the Saudi urban landscape.",
    ],
  },
  {
    id: "bujairi",
    title: "مطل البجيري: حيث يلتقي التراث بالذائقة",
    titleEn: "Bujairi Terrace: Where Heritage Meets Taste",
    excerpt: "تعرّف على قصة تحوّل مطل البجيري من موقع تاريخي إلى وجهة عالمية للطعام والترفيه الفاخر.",
    excerptEn: "Learn the story of Bujairi Terrace's transformation from a historic site to a world-class dining and entertainment destination.",
    image: placeBujairi,
    category: "وجهات",
    categoryEn: "Destinations",
    date: "١٠ شوال ١٤٤٦",
    dateEn: "10 Shawwal 1446",
    readTime: "٥ دقائق",
    readTimeEn: "5 min read",
    content: [
      "يُعدّ مطل البجيري أحد أبرز المعالم في مشروع بوابة الدرعية، حيث يقع على الضفة الشرقية لوادي حنيفة مقابل حي الطريف التاريخي. يحمل الموقع اسمه نسبة إلى حي البجيري التاريخي الذي اشتهر بأنه الحي العلمي في الدرعية القديمة.",
      "افتُتح مطل البجيري في ديسمبر 2022م كأول مرحلة مكتملة من مشروع بوابة الدرعية، ويمتد على مساحة تزيد عن 100 ألف متر مربع. يضم المطل أكثر من 20 مطعماً ومقهى من أرقى العلامات التجارية العالمية والمحلية.",
      "تتنوع الخيارات الغذائية في المطل بين المطابخ العالمية المختلفة، من المأكولات الإيطالية والفرنسية واليابانية إلى الأطباق العربية الأصيلة. كما يضم المطل عدداً من المتاجر الفاخرة ومساحات الفعاليات والمعارض الثقافية.",
      "ما يميز مطل البجيري هو تصميمه المعماري الذي يمزج بين الأصالة والمعاصرة؛ فالمباني مشيّدة بالطراز النجدي التقليدي مع لمسات عصرية أنيقة، والممرات المتعرجة بين المباني تمنح الزائر إحساساً بالسير في أزقة الدرعية القديمة.",
      "يوفر المطل إطلالات بانورامية ساحرة على حي الطريف ووادي حنيفة، خاصة عند غروب الشمس حين تكسو الأضواء الذهبية المباني التاريخية المقابلة. هذا المزيج الفريد بين التراث والذائقة والطبيعة جعل مطل البجيري وجهة مفضلة لسكان الرياض وزوارها على حد سواء.",
    ],
    contentEn: [
      "Bujairi Terrace is one of the most prominent landmarks in the Diriyah Gate project, located on the eastern bank of Wadi Hanifa opposite the historic At-Turaif district. The site takes its name from the historic Bujairi neighborhood, known as the scholarly quarter of old Diriyah.",
      "Bujairi Terrace opened in December 2022 as the first completed phase of the Diriyah Gate project, spanning over 100,000 square meters. The terrace houses more than 20 restaurants and cafés from the finest global and local brands.",
      "The dining options at the terrace range across various international cuisines, from Italian, French, and Japanese to authentic Arabian dishes. The terrace also features luxury retail outlets, event spaces, and cultural exhibition areas.",
      "What distinguishes Bujairi Terrace is its architectural design that blends authenticity with modernity; buildings are constructed in traditional Najdi style with elegant contemporary touches, and winding pathways between buildings give visitors the feeling of walking through old Diriyah's alleys.",
      "The terrace offers enchanting panoramic views of At-Turaif district and Wadi Hanifa, especially at sunset when golden lights bathe the historic buildings across the valley. This unique blend of heritage, gastronomy, and nature has made Bujairi Terrace a favorite destination for Riyadh residents and visitors alike.",
    ],
  },
  {
    id: "wadi",
    title: "وادي حنيفة: واحة الطبيعة في قلب الرياض",
    titleEn: "Wadi Hanifa: A Natural Oasis in the Heart of Riyadh",
    excerpt: "استكشف أحد أطول الأودية في المنطقة وكيف تحوّل إلى متنزه بيئي يستقطب ملايين الزوار سنوياً.",
    excerptEn: "Explore one of the longest valleys in the region and how it was transformed into an ecological park attracting millions of visitors annually.",
    image: placeWadi,
    category: "طبيعة",
    categoryEn: "Nature",
    date: "٥ شوال ١٤٤٦",
    dateEn: "5 Shawwal 1446",
    readTime: "٧ دقائق",
    readTimeEn: "7 min read",
    content: [
      "يمتد وادي حنيفة على مسافة تزيد عن 120 كيلومتراً عبر قلب مدينة الرياض، وهو أحد أهم المعالم الطبيعية في المنطقة الوسطى من المملكة العربية السعودية. يُعتبر الوادي شرياناً حيوياً ارتبط تاريخياً بنشوء المستوطنات البشرية على ضفافه، بما في ذلك الدرعية.",
      "شهد وادي حنيفة واحدة من أنجح قصص التحول البيئي في المنطقة. فبعد أن كان يعاني من التلوث والإهمال، خضع لمشروع تأهيل بيئي شامل بدأ في عام 2001م. تضمّن المشروع معالجة المياه وإعادة تأهيل الغطاء النباتي وإنشاء سدود حيوية للحفاظ على المياه.",
      "اليوم، يضم الوادي عدة متنزهات ومناطق ترفيهية متصلة بممرات للمشي وركوب الدراجات. من أبرز هذه المناطق: بحيرة المصانع، ومتنزه سد العلب، ومنطقة الإلهام. توفر هذه المناطق بيئة طبيعية هادئة بعيداً عن صخب المدينة.",
      "في الجزء المحاذي للدرعية، يتخذ الوادي طابعاً خاصاً حيث تتدفق المياه بين النخيل والأشجار المحلية، مع إطلالات مذهلة على حي الطريف التاريخي. هذا المشهد الطبيعي الساحر جعل من المنطقة محطة مفضلة للتصوير والتأمل والاسترخاء.",
      "يستقطب وادي حنيفة اليوم أكثر من 3 ملايين زائر سنوياً، ويُعدّ نموذجاً رائداً في الاستدامة البيئية والتطوير الحضري المتوازن، حيث نجح في الجمع بين الحفاظ على البيئة الطبيعية وتوفير مساحات ترفيهية عصرية لسكان العاصمة.",
    ],
    contentEn: [
      "Wadi Hanifa extends over 120 kilometers through the heart of Riyadh, making it one of the most important natural landmarks in the central region of Saudi Arabia. The valley is a vital artery historically linked to the rise of human settlements on its banks, including Diriyah.",
      "Wadi Hanifa witnessed one of the most successful environmental transformation stories in the region. After suffering from pollution and neglect, it underwent a comprehensive environmental rehabilitation project starting in 2001. The project included water treatment, vegetation rehabilitation, and construction of bio-dams for water conservation.",
      "Today, the valley contains several parks and recreational areas connected by walking and cycling paths. Notable areas include Al-Masane Lake, Al-Elb Dam Park, and Al-Ilham Zone. These areas provide a peaceful natural environment away from the city's bustle.",
      "In the section adjacent to Diriyah, the valley takes on a special character as water flows between palm trees and native vegetation, with stunning views of the historic At-Turaif district. This enchanting natural scene has made the area a favorite spot for photography, contemplation, and relaxation.",
      "Wadi Hanifa today attracts over 3 million visitors annually and is considered a leading model in environmental sustainability and balanced urban development, successfully combining natural environment preservation with providing modern recreational spaces for the capital's residents.",
    ],
  },
  {
    id: "culture",
    title: "الثقافة السعودية الأصيلة في الدرعية",
    titleEn: "Authentic Saudi Culture in Diriyah",
    excerpt: "من القهوة العربية إلى العرضة، اكتشف كيف تحتفي الدرعية بالموروث الثقافي السعودي بطرق مبتكرة.",
    excerptEn: "From Arabic coffee to Ardah, discover how Diriyah celebrates Saudi cultural heritage in innovative ways.",
    image: introImg,
    category: "ثقافة",
    categoryEn: "Culture",
    date: "١ شوال ١٤٤٦",
    dateEn: "1 Shawwal 1446",
    readTime: "٦ دقائق",
    readTimeEn: "6 min read",
    content: [
      "تحتضن الدرعية إرثاً ثقافياً عريقاً يعكس أصالة الثقافة السعودية وعمقها التاريخي. كمهد الدولة السعودية الأولى، شكّلت الدرعية بوتقة انصهرت فيها العادات والتقاليد النجدية مع تأثيرات ثقافية من مختلف أنحاء الجزيرة العربية.",
      "القهوة العربية تُعدّ رمزاً أساسياً للضيافة السعودية، وتحتل مكانة خاصة في ثقافة الدرعية. تُحضّر من حبوب البن المحمّصة تحميصاً خفيفاً مع الهيل والزعفران، وتُقدّم في دلال نحاسية تقليدية مع التمر. في الدرعية اليوم، يمكن للزوار تجربة طقوس القهوة الأصيلة في عدة مقاهٍ متخصصة.",
      "العرضة السعودية، الرقصة الوطنية للمملكة، لها جذور عميقة في تاريخ الدرعية. كانت تُؤدّى احتفالاً بالنصر والمناسبات الوطنية، حيث يصطف الرجال في صفين متقابلين يرددون الأشعار الحماسية مع إيقاع الطبول. اليوم، تُقام عروض العرضة في فعاليات الدرعية الموسمية.",
      "الحرف اليدوية التقليدية لا تزال حاضرة في الدرعية، من صناعة السدو (النسيج البدوي) إلى الخوص والفخار. تنظّم الدرعية ورش عمل تفاعلية تتيح للزوار تعلّم هذه الحرف من حرفيين محليين، مما يسهم في الحفاظ على هذا الإرث ونقله للأجيال القادمة.",
      "تستضيف الدرعية على مدار العام فعاليات ثقافية متنوعة تشمل مهرجانات الطعام التقليدي، والمعارض الفنية، والعروض المسرحية، والحفلات الموسيقية. هذا التنوع الثقافي يجعل من الدرعية وجهة حية تجمع بين الأصالة والمعاصرة بتناغم فريد.",
    ],
    contentEn: [
      "Diriyah embraces a rich cultural heritage that reflects the authenticity and historical depth of Saudi culture. As the birthplace of the First Saudi State, Diriyah served as a melting pot where Najdi customs and traditions blended with cultural influences from across the Arabian Peninsula.",
      "Arabic coffee is a fundamental symbol of Saudi hospitality and holds a special place in Diriyah's culture. It's prepared from lightly roasted coffee beans with cardamom and saffron, and served in traditional brass coffee pots with dates. In today's Diriyah, visitors can experience authentic coffee rituals at several specialized cafés.",
      "The Saudi Ardah, the Kingdom's national dance, has deep roots in Diriyah's history. It was performed to celebrate victories and national occasions, with men lined up in two facing rows chanting martial poetry to the rhythm of drums. Today, Ardah performances are held during Diriyah's seasonal events.",
      "Traditional handicrafts remain present in Diriyah, from Sadu weaving (Bedouin textile) to palm frond crafting and pottery. Diriyah organizes interactive workshops allowing visitors to learn these crafts from local artisans, contributing to preserving this heritage and passing it to future generations.",
      "Diriyah hosts diverse cultural events throughout the year, including traditional food festivals, art exhibitions, theatrical performances, and music concerts. This cultural diversity makes Diriyah a vibrant destination that uniquely harmonizes authenticity with modernity.",
    ],
  },
];
