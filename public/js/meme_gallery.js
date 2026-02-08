ImportMemes();

async function ImportMemes() {
    const memeImporter = await import("./meme_importer.js");
    const memes = memeImporter.GetMemeData();

    memes.files.forEach(meme => {
        //DisplayMeme(meme);
    });
}

function DisplayMeme(url) {
    let src = 'https://lepsima.github.io/Neocities/assets/' + url;
    let img = document.createElement('img');

    img.src = src;
    document.body.appendChild(img);
}