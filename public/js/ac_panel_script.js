const svg = document.getElementById("lines");
const lines = [];

InitPanels();
Animate();

function InitPanels() {
    let panels = document.querySelectorAll('.ac-sub-panel');

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

            } else {
                button.setAttribute('ac_tgt', panelID);
            }

            let func = `SwitchPanel('${panelID}')`;
            button.setAttribute('onclick', func);
            button.removeAttribute('ac_goto');
        })
    });

    let active = document.querySelector('.ac-begin');
    SetPanelActive(active, true);
}

function SetPanelActive(subpanel, active) {
    let panel = subpanel.parentElement;

    if (active) {
        let action = subpanel.getAttribute('action');
        if (action == null) action = "empty-panel";

        let event = new Event(action);
        document.dispatchEvent(event);
    }

    document
    if (active) {
        // remove anims
        panel.classList.remove('ac-move-right');
        panel.classList.remove('ac-move-left');

        subpanel.classList.remove('ac-sub-inactive');
        subpanel.classList.add('ac-sub-active');

        // Activate panel
        panel.classList.remove('ac-inactive');
        panel.classList.add('ac-active');

    } else {
        subpanel.classList.remove('ac-sub-active');
        subpanel.classList.add('ac-sub-inactive');

        // Deactivate panel
        panel.classList.remove('ac-active');
        panel.classList.add('ac-inactive');
    }
}

function AnimatePanelTowards(subpanel, right, animateParent) {
    let panel = subpanel.parentElement;

    if (right) {
        panel.classList.remove('ac-move-left');
        panel.classList.add('ac-move-right');
    } else {
        panel.classList.remove('ac-move-right');
        panel.classList.add('ac-move-left');
    }

    if (animateParent) {
        let parentSubpanel = GetPanelParent(subpanel);
        if (parentSubpanel == null) return;
        let parentPanel = parentSubpanel.parentElement;

        let superSubpanel = GetPanelParent(parentSubpanel);
        let superPanel = superSubpanel == undefined ? undefined : superSubpanel.parentElement;
        let superPanel2 = GetPanelParent(superPanel)?.parentElement;

        if (right) {
            parentPanel?.classList.add('ac-move-far-right');
            superPanel?.classList.add('ac-move-very-far-right');

        } else {
            parentPanel?.classList.remove('ac-move-far-right');
            superPanel?.classList.remove('ac-move-far-right');
            superPanel2?.classList.remove('ac-move-very-far-right');
        }
    }
}

function CreateLinesFor(panel) {
    RemoveAllLines();
    let depth = 0;
    let lastPanel = panel;

    while (depth < 32) {
        let parent = GetPanelParent(lastPanel);
        if (parent == null) break;

        let selector = `:scope > button[ac_tgt*="${lastPanel.id}"]`;
        let from = lastPanel.querySelector(':scope > button:not([ac_tgt])');
        let to = parent.querySelector(selector);

        let line = CreateLine(from, to);
        let lineDepth = Math.min(2, depth);
        line.path.classList.add(`ac-line-dep-${lineDepth}`);

        depth++;
        lastPanel = parent;
    }
    return;
}

function GetPanelParent(panel) {
    if (panel == null) return null;
    if (panel.id.indexOf('-') == -1) return null;

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
    let inactive = document.querySelector('.ac-sub-active');
    let active = document.getElementById(newPanel);

    location.href = '#' + newPanel;

    ClearAnimations();
    SetPanelActive(inactive, false);
    SetPanelActive(active, true);

    let isNewDeeper = IsDeeperThan(active, inactive);
    AnimatePanelTowards(inactive, isNewDeeper, true);

    PlayAnimations();
    CreateLinesFor(active);
}

function ClearAnimations() {
    document.querySelectorAll('.ac-anim-trigger').forEach(panel => {
        panel.classList.remove('ac-anim-trigger');
    });
}

function PlayAnimations() {
    document.querySelectorAll('.ac-panel').forEach(panel => {
        panel.classList.add('ac-anim-trigger');
    });
}

function CreateLine(a, b) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.appendChild(path);

    const line = { boxA: a, boxB: b, path };
    lines.push(line);

    return line;
}

function RemoveLine(line) {
    svg.removeChild(line.path);

    const index = lines.indexOf(line);
    if (index > -1) {
        lines.splice(index, 1);
    }
}

function RemoveAllLines() {
    lines.forEach(line => svg.removeChild(line.path));
    lines.length = 0;
}

function UpdateLines() {
    lines.forEach(line => {
        const b1 = line.boxA.getBoundingClientRect();
        const b2 = line.boxB.getBoundingClientRect();
        const c = svg.getBoundingClientRect();

        const x1 = b1.right - c.left;
        const y1 = b1.top + b1.height / 2 - c.top;

        const x2 = b2.left - c.left;
        const y2 = b2.top + b2.height / 2 - c.top;

        const midX = (x1 + x2) / 2;

        const d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
        line.path.setAttribute("d", d);
    });
}

function Animate() {
    UpdateLines();
    requestAnimationFrame(Animate);
}