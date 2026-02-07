InitPanels();

function InitPanels() {
    let panels = document.querySelectorAll('.ac-panel');
    panels.forEach(panel => {
        SetPanelActive(panel, false);
        AnimatePanelTowards(panel, false);
    });

    let active = document.querySelector('.ac-begin');
    SetPanelActive(active, true);
}

function SetPanelActive(panel, active) {
    if (active) {
        panel.classList.remove('ac-inactive');
        panel.classList.remove('ac-move-right');
        panel.classList.remove('ac-move-left');

        requestAnimationFrame(() => {
            panel.classList.add('ac-active');
        });
    } else {
        panel.classList.remove('ac-active');


        requestAnimationFrame(() => {
            panel.classList.add('ac-inactive');
        });
    }
}

function AnimatePanelTowards(panel, right) {
    console.debug(right);
    if (right) {
        panel.classList.remove('ac-move-left');
        panel.classList.add('ac-move-right');
    } else {
        panel.classList.remove('ac-move-right');
        panel.classList.add('ac-move-left');
    }
}

function CountChars(str, char) {
    let count = 0;

    for (let i = 0; i < str.length; i++) {
        if (str[i] === char) {
            count++;
        }
    }

    return count;
}

function IsDeeperThan(a, b) {
    let ac = CountChars(a.id, '-');
    let bc = CountChars(b.id, '-');
    return ac > bc;
}

function SwitchPanel(newPanel) {
    let inactive = document.querySelector('.ac-active');
    let active = document.getElementById(newPanel);

    SetPanelActive(inactive, false);
    SetPanelActive(active, true);

    let isNewDeeper = IsDeeperThan(active, inactive);
    AnimatePanelTowards(inactive, isNewDeeper);
}

