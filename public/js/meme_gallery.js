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

document.addEventListener("meme-random",
    function () {
        Load(GetRandomMeme());
    });

document.addEventListener("meme-newest",
    function () {
        console.debug("Newest");
    });

document.addEventListener("meme-favs",
    function () {
        console.debug("Favs");
    });

document.addEventListener("empty-panel",
    function () {

    });

function Load(url) {
    const panel = document.getElementById("meme-panel");
    panel.innerHTML = "";

    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        panel.innerHTML = `<img src="${url}">`;
    }
    else if (url.match(/\.(mp4|qt|webm|ogg)$/)) {
        panel.innerHTML = `
      <video src="${url}" autoplay loop muted></video>
    `;
    }
    else {
        panel.innerHTML = `<iframe src="${url}"></iframe>`;
    }
}