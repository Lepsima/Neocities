let titles = [
    "Lepsima's site",
    "Lepisma's site",
    "I ran out of ideas",
    "The title is randomized btw",
    "500 Cigarretes",
    "Generic page title",
    "{零} This space intentionally left blank",
    "Sike",
    "This title probably wont fit inside the tab, so idk, congratulations if you have noticed it!",
    "I really don't have more interesting ideas, any suggestions?",
    "Subscribe to my github",
    ":3"
];

const randomTitle = Math.floor(Math.random() * titles.length);
SetTitle(titles[randomTitle]);

function SetTitle(title) {
    const titleelement = document.getElementById("randomTitle");
    titleelement.innerHTML = title;
}