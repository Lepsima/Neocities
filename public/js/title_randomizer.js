let titles = [
    "Lepsima's site", "Lepisma's site", "I ran out of ideas"
];

const titleelement = document.getElementById("randomTitle");
const randomTitle = Math.floor(Math.random() * titles.length);
titleelement.innerHTML = titles[randomTitle];
