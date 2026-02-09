ImportMemes();
let memes = null;
let currentMeme = 0;

async function ImportMemes() {
    const memeImporter = await import("./meme_importer.js");
    memes = memeImporter.GetMemeData().files;
}

function GetRandomMeme() {
    const random = Math.floor(Math.random() * memes.length);
    currentMeme = random;
    return GetSource(memes[currentMeme]);
}

function GetNextMeme(dir) {
    if (dir) currentMeme++;
    else currentMeme--;

    if (currentMeme < 0) currentMeme = memes.length - 1;
    if (currentMeme >= memes.length) currentMeme = 0;

    return GetSource(memes[currentMeme]);
}

function GetSource(url) {
    return 'https://lepsima.github.io/Neocities/assets/' + url;
}