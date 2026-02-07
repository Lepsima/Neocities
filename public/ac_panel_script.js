InitPanels();

function InitPanels() {
    let panels = document.querySelectorAll('.ac-panel');
    panels.forEach(panel => {
        // Deactivate panel
        SetPanelActive(panel, false);
        AnimatePanelTowards(panel, false, false);

        // Set button actions
        let buttons = panel.querySelectorAll(":scope > button");
        buttons.forEach(button => {
            let subpanel = button.getAttribute('ac_goto');
            let panelID = `${panel.id}-${subpanel}`;

            if (subpanel == "back") {
                let idx = panel.id.lastIndexOf('-');
                panelID = panel.id.slice(0, idx);
            }

            let func = `SwitchPanel('${panelID}')`;
            button.setAttribute('onclick', func);
            button.removeAttribute('ac_goto');
        })
    });

    let active = document.querySelector('.ac-begin');
    SetPanelActive(active, true);
}

function SetPanelActive(panel, active) {
    if (active) {
        // Activate panel, no animations
        panel.classList.remove('ac-inactive');
        panel.classList.remove('ac-move-right');
        panel.classList.remove('ac-move-left');
        panel.classList.add('ac-active');
    } else {
        // Deactivate panel
        panel.classList.remove('ac-active');
        panel.classList.add('ac-inactive');
    }
}

function AnimatePanelTowards(panel, right, animateParent) {
    if (right) {
        panel.classList.remove('ac-move-left');
        panel.classList.add('ac-move-right');
    } else {
        panel.classList.remove('ac-move-right');
        panel.classList.add('ac-move-left');
    }

    if (!animateParent) return;

    let parent = GetPanelParent(panel);
    if (parent == null) return;

    if (right) {
        parent.classList.add('ac-move-far-right');

        let superParent = GetPanelParent(parent);
        if (superParent == null) return;
        superParent.classList.add('ac-move-very-far-right');

    } else {
        parent.classList.remove('ac-move-far-right');

        let superParent = GetPanelParent(parent);
        if (superParent == null) return;
        superParent.classList.remove('ac-move-far-right');

        let superSuperParent = GetPanelParent(superParent);
        if (superSuperParent == null) return;
        superSuperParent.classList.remove('ac-move-very-far-right');
    }
}

function GetPanelParent(panel) {
    let idx = panel.id.lastIndexOf('-');
    let id = panel.id.slice(0, idx);
    return document.getElementById(id);
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
    AnimatePanelTowards(inactive, isNewDeeper, true);
}