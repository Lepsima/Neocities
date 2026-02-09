ImportMemes();
let memes = null;
let currentMeme = 0;
let timeoutID = null;
let mode = null;

let mediaClass = 'meme-media';
let panelClass = 'meme-panel';

async function ImportMemes() {
    const memeImporter = await import("./meme_importer.js");
    memes = memeImporter.GetMemeData().files;
}

function GetRandomMeme() {
    const random = Math.floor(Math.random() * memes.length);
    currentMeme = random;
    return GetCurrentMeme();
}

function LoadNextMeme(dir) {
    if (mode == null || mode == "newest") {
        LoadMeme(GetNextMeme(dir));
    } else if (mode == "random") {
        LoadMeme(GetRandomMeme());
    }

}

function GetNextMeme(dir) {
    if (dir == '2')
        currentMeme++;
    else
        currentMeme--;

    if (currentMeme < 0) currentMeme = memes.length - 1;
    if (currentMeme >= memes.length) currentMeme = 0;

    return GetCurrentMeme();
}

function GetCurrentMeme() {
    return GetSource(memes[currentMeme]);
}

function GetSource(url) {
    return 'https://lepsima.github.io/Neocities/assets/' + url;
}

document.addEventListener("meme-random",
    function () {
        LoadMeme(GetRandomMeme());
        mode = "random";
    });

document.addEventListener("meme-newest",
    function () {
        LoadMeme(GetCurrentMeme());
        mode = "newest";
    });

document.addEventListener("meme-favs",
    function () {
        console.debug("Favs");
        mode = null;
    });

document.addEventListener("empty-panel",
    function () {
        Unload();
        mode = null;
    });

function LoadMeme(url) {
    const panel = document.getElementById(panelClass);
    panel.classList.add("active");

    RemoveMedia();

    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        panel.innerHTML += `<img id="${mediaClass}" src="${url}">`;
    }
    else if (url.match(/\.(mp4|qt|webm|ogg|mov|MP4)$/)) {
        panel.innerHTML += `<video id="${mediaClass}" src="${url}" autoplay loop></video>`;
    }
    else {
        panel.innerHTML += `<iframe id="${mediaClass}" src="${url}"></iframe>`;
    }
}

function Unload() {
    const panel = document.getElementById("meme-panel");
    panel.classList.remove("active");

    if (timeoutID != null) clearTimeout(timeoutID);
    timeoutID = setTimeout(RemoveMedia, 1000);
}

function RemoveMedia() {
    if (timeoutID != null) {
        clearTimeout(timeoutID);
        timeoutID = null;
    }

    const mediaElement = document.getElementById(mediaClass);
    mediaElement?.remove();
}

