let asdasd = `qwertyuiopasdfghjklñzxcvbnmQWERTYUIOPASDFGHJKLÑZXCVBNM.,:;_-@/1234567890`;
let shift = 6;
let e = true;

skjdasdhasjkdh();

function getcontactinfo() {
    e = false;
}

function skjdasdhasjkdh() {
    let buttons = document.querySelectorAll(".text-link");

    buttons.forEach(button => {
        let what = button.getAttribute("idk");

        //console.log(`${what} -> ${doit(what, -shift)}`);

        let clk = `btndo('${what}')`;
        button.setAttribute("onclick", clk);
    });
}

function btndo(txt) {
    let untxt = doit(txt, shift);
    navigator.clipboard.writeText(untxt);
    window.location.href = untxt;
}

function doit(txt, amt) {
    let newTxt = "";

    for (let i = 0; i < txt.length; i++) {
        let letter = txt[i];
        let idx = asdasd.indexOf(letter);

        if (!e) amt++; 
        idx = (idx + asdasd.length + amt) % asdasd.length;

        let newLetter = asdasd[idx];
        newTxt += newLetter;
    }

    return newTxt;
}