fetch('https://lepsima.github.io/Neocities-Media/memes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    })
    .then(data => {
        memes = data.files;
        InitializeMemes();
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    });


let memes = null;
let currentMeme = 0;
let timeoutID = null;
let mode = null;

let mediaClass = 'meme-media';
let panelClass = 'meme-panel';

function InitializeMemes() {
    let images = 0;
    let videos = 0;

    memes.forEach(meme => {
        if (meme.match(/\.(gif|GIF|mp4|qt|webm|ogg|mov|MP4)$/)) {
            videos++;
        } else {
            images++;
        }
    })

    let infotext = document.getElementById('serving-memes');
    infotext.innerHTML =
        `
Serving <i>${memes.length}</i> memes
<i>${videos}</i> Videos / Gifs
<i>${images}</i> Images
        `;

    updateSessionData();
}

function updateSessionData() {
    let name = 'meme_session_data';
    let data = localStorage.getItem(name);
    let json = data ? JSON.parse(data) : null;

    let prevMemes = json == null ? 0 : json.memeCount;
    let newMemes = memes.length - prevMemes;

    if (json == null) {
        json = {
            memeCount: 0
        }
    }

    if (newMemes > 0) {
        let button = document.querySelector('#ac-1 > button:nth-child(2)');
        button.innerHTML = `Memes (+${newMemes})`;
    }

    json.memeCount = memes.length;
    localStorage.setItem(name, JSON.stringify(json));
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
    return 'https://memes.colon3.me/' + url;
}

document.addEventListener("meme-random", () => {
    LoadMeme(GetRandomMeme());
    mode = "random";
});

document.addEventListener("meme-newest", () => {
    currentMeme = memes.length - 1;
    LoadMeme(GetCurrentMeme());
    mode = "newest";
});

document.addEventListener("meme-favs", () => {
    console.debug("Favs");
    mode = null;
});

document.addEventListener("empty-panel", () => {
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

