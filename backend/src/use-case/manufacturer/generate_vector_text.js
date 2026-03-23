exports.generate_vector_text = async (response, { manufacturer_repositoy, openai }) => {
    // console.log(response);
    const { questionData, history, userInstruction } = response;
 
    
    // questionData null olabileceği için optional chaining (?) kullanıyoruz
    const dersBilgisi = questionData?.ders || "Bilinmiyor";

const SYSTEM_PROMPT = `Sen bir Adaptif Öğrenme Sistemi için "Derin Yapı Analizi" (Deep Structure Analysis) yapan bir Vektör Veritabanı Uzmanısın.

MUTLAK KURAL (KULLANICI ÖNCELİĞİ):
Kullanıcı tarafından istenilene harfiyen uy. Eğer kullanıcı sana özel bir talimat verir, bir kelimeyi eklemeni ister veya kendi yazdığı bir metni "bunu düzelt/bunu kullan" diyerek gönderirse, aşağıdaki TÜM KISITLAMALARI VE KURALLARI YOK SAY. Kullanıcının talimatı her şeyden üstündür.

GÖREVİN:
Verilen sorunun "YÜZEYDEKİ HİKAYESİNİ" tamamen çöpe atıp, "DERİNDEKİ MANTIĞINI" ortaya çıkarmaktır. 

KESİN YASAKLAR (KULLANICI AKSİNİ İSTEMEDİKÇE):
1. HİKAYE UNSURLARI YASAK: Sorudaki nesneleri (bilye, elma), kişileri, mekanları KESİNLİKLE YAZMA.
2. EYLEMLER YASAK: "Tartılır, gider" gibi fiziksel eylemleri yazma.

YAPMAN GEREKENLER (SOYUTLAMA):
- Sorunun arkasında yatan TEOREM, ALGORİTMA veya MATEMATİKSEL MODELİ yaz (Örn: Böl ve Fethet, Optimizasyon).
- Öğrencinin kullanması gereken bilişsel beceriyi belirt.

ÖRNEK ANALİZLER:
- İYİ ÇIKTI: Matematik, Sayısal Mantık ve Problemler. Optimizasyon ve algoritma kurma becerisi. 'Böl ve fethet' stratejisi kullanılarak minimum adım sayısını bulma.

KULLANICININ VERDİĞİ KONU BİLGİSİ: ${dersBilgisi}
SORU METNİ AŞAĞIDADIR:`;

    let messages = [
        { role: "system", content: SYSTEM_PROMPT }
    ];

    if (history && history.length > 0) {
        messages = messages.concat(history);
        messages.push({ role: "user", content: `Yeni talimatım: ${userInstruction || 'Tekrar analiz et.'}` });
    } else {
        // Markdown içindeki görsel URL'lerini bulmak için Regex
        const imageRegex = /!\[.*?\]\((.*?)\)/g;
        let imageUrls = [];
        let match;

        // soru_metni içindeki tüm görselleri yakalayıp diziye atıyoruz
        if (questionData && questionData.soru_metni) {
            while ((match = imageRegex.exec(questionData.soru_metni)) !== null) {
                // match[1] regex içindeki parantezli kısımdır (yani sadece URL)
                imageUrls.push(match[1]); 
            }
        }

        let userContentArray = [
            {
                type: "text",
                text: `İşte soru verisi:\n${JSON.stringify(questionData)}\n\nTalimat: ${userInstruction || 'Vektör metnini oluştur.'}`
            }
        ];

        // Yakalanan her bir görseli Vision formatında diziye ekliyoruz
        imageUrls.forEach(url => {
            userContentArray.push({
                type: "image_url",
                image_url: { url: url }
            });
        });

        messages.push({ role: "user", content: userContentArray });
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.1,
        max_tokens: 150 // Çıktının yarım kesilmemesi için artırıldı
    });

    const aiResponseText = completion.choices[0].message.content;

    return {
        success: true,
        vectorText: aiResponseText
    };
};