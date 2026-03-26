exports.generate_vector_text = async (response, { manufacturer_repositoy, openai }) => {
    console.log(response);
    const { questionData, history, userInstruction } = response;
 
    
    // questionData null olabileceği için optional chaining (?) kullanıyoruz
    const dersBilgisi = questionData?.ders || "Bilinmiyor";

const SYSTEM_PROMPT = `Sen bir Adaptif Öğrenme Sistemi için "Derin Yapı Analizi" yapan bir Vektör Veritabanı Uzmanısın.

GÖREV:
Sorunun yüzeydeki hikayesini tamamen kaldır.
Sadece sorunun ölçtüğü bilişsel beceriyi ve akademik kategorisini yaz.

KURALLAR:
- Hikaye, örnek, metin içeriği yazma
- Kısa, yoğun, embedding dostu yaz
- Virgülle ayrılmış kavramlar kullan
- Maksimum soyutluk

ÇIKTI FORMATI:
[Ders], [Konu], [Beceri], [Alt beceri], [Bilişsel işlem]

ÖRNEKLER:

Matematik:
Matematik, problem çözme, optimizasyon, algoritmik düşünme, minimum adım stratejisi

Türkçe:
Türkçe, paragraf anlama, ana düşünce, başlık bulma, metin özeti, ana fikir çıkarma

Fen:
Fen bilimleri, grafik yorumlama, veri analizi, değişken ilişkisi, çıkarım yapma

KULLANICININ VERDİĞİ KONU BİLGİSİ: ${dersBilgisi}
`;

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


        imageUrls.forEach(url => {
            userContentArray.push({
                type: "image_url",
                image_url: { url: url }
            });
        });

        messages.push({ role: "user", content: userContentArray });
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
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