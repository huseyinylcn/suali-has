exports.mathpix_translate = async (response, { manufacturer_repositoy,axios }) => {
 
 const { image } = response 

    if (!image) {
        return{ err: 'Please send an image file (base64).' };
    }

  

        const result = await axios.post(
            'https://api.mathpix.com/v3/text',
            {
                src: image, 
                formats: ['text', 'data'], 
                data_options: {
                    include_latex: true 
                }
            },
            {
                headers: {
                    'app_id': process.env.MATHPIX_APP_ID,
                    'app_key': process.env.MATHPIX_APP_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

  
        const temizMetin = result.data.text;

        return {
            latex: temizMetin
        };
}