let memes = null;
let favorites = null;
let currentMeme = 0;
let timeoutID = null;
let mode = null;

let mediaClass = 'meme-media';
let panelClass = 'meme-panel';

fetch('https://memes.colon3.me/memes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    })
    .then(data => {
        memes = data.files;
        InitializeMemes();
        LoadMemeGallery();
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    });



function LoadMemeGallery() {
    let params = new URL(document.location.toString()).searchParams;
    if (params.has("memes")) {
        let mode = params.get("memes");

        SwitchPanel("ac-1-1");
        SwitchPanel(mode == "newest" ? "ac-1-1-2" : "ac-1-1-1");
        SetTitle("Here for the memes?");
    }
}

function SetFavorite() {
    let meme = GetCurrentMeme();
    console.debug(favorites);

    if (favorites != null && favorites.includes(meme)) {
        favorites = removeItem(favorites, meme);

        if (mode == 'favorites' && !IsFavorite()) {
            SwitchPanel("ac-1-1");
            alert("The last favorite was removed!");
        }
        LoadMeme(GetRandomMeme());

    } else if (favorites == null) {
        favorites = [meme];
    } else {
        favorites.push(meme);
    }

    let json = {
        memes: favorites
    }

    localStorage.setItem('meme-favorites', JSON.stringify(json));
    UpdateFavoriteButton();
}

function removeItem(array, itemToRemove) {
    const index = array.indexOf(itemToRemove);

    if (index !== -1) {
        array.splice(index, 1);
    }

    return array;
}

function UpdateFavoriteButton() {
    let fav_button = document.getElementById('favorite-meme-button');

    let meme = GetCurrentMeme();
    if (favorites != null && favorites.includes(meme)) {
        fav_button.innerHTML = "Remove Favorite";
    } else {
        fav_button.innerHTML = "Add Favorite";
    }
}

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
    let fav_data = localStorage.getItem('meme-favorites');
    let fav_json = fav_data ? JSON.parse(fav_data) : null;
    favorites = fav_json?.memes;

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
    return GetCurrentMemeURL();
}

function LoadNextMeme(dir) {
    if (mode == "favorites" && !IsFavorite()) {
        SwitchPanel("ac-1-1");
        alert("All favorites removed!");
        return;
    }

    if (mode == "random") {
        LoadMeme(GetRandomMeme());
    } else {
        LoadMeme(GetNextMeme(dir));
    }
}

function GetNextMeme(dir) {
    if (dir == '2')
        currentMeme++;
    else
        currentMeme--;

    return GetCurrentMemeURL();
}

function ClampIndex() {
    let length = IsFavorite() ? favorites.length : memes.length;
    if (currentMeme < 0) currentMeme = length - 1;
    if (currentMeme >= length) currentMeme = 0;
}

function GetCurrentMeme() {
    ClampIndex();
    return IsFavorite() ? favorites[currentMeme] : memes[currentMeme];
}

function GetCurrentMemeURL() {
    return GetSource(GetCurrentMeme());
}

function IsFavorite() {
    return mode == 'favorites' && favorites != null && favorites.length > 0;
}

function GetSource(url) {
    return 'https://memes.colon3.me/' + url;
}

document.addEventListener("meme-random", () => {
    mode = "random";
    LoadMeme(GetRandomMeme());
});

document.addEventListener("meme-newest", () => {
    currentMeme = memes.length - 1;
    mode = "newest";
    LoadMeme(GetCurrentMemeURL());
});

document.addEventListener("meme-favs", () => {
    currentMeme = 0;
    mode = "favorites";

    if (!IsFavorite()) {
        SwitchPanel("ac-1-1");
        alert("No favorites found!");
    } else {
        LoadMeme(GetCurrentMemeURL());
    }
});

document.addEventListener("empty-panel", () => {
    Unload();
    mode = null;
});

function LoadMeme(url) {
    const panel = document.getElementById(panelClass);
    panel.classList.add("active");

    RemoveMedia();

    let discordURL = `[⠀](${url})`;
    let discordButton = document.getElementById("discord-meme-button");
    discordButton.setAttribute('onclick', `PasteToClipboard('${discordURL}')`);

    UpdateFavoriteButton();

    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        panel.innerHTML += `<img id="${mediaClass}" src="${url}">`;
    }
    else if (url.match(/\.(mp4|qt|webm|ogg|mov|MP4|mpg4)$/)) {
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

function PasteToClipboard(text) {
    navigator.clipboard.writeText(text);
}