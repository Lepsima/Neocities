InitPanels();

function InitPanels() {
    let panels = document.querySelectorAll('.ac-panel');
    panels.forEach(panel => {
        // Deactivate panel
        SetPanelActive(panel, false);
        AnimatePanelTowards(panel, false);

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

function AnimatePanelTowards(panel, right) {
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