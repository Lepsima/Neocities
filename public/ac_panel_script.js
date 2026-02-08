const svg = document.getElementById("lines");
const lines = [];

InitPanels();
Animate();

function InitPanels() {
    let panels = document.querySelectorAll('.ac-panel');
    panels.forEach(panel => {
        // Deactivate panel
        SetPanelActive(panel, false);
        AnimatePanelTowards(panel, false, false);

        let idx = panel.id.lastIndexOf('-');
        let panelIndex = panel.id.slice(idx + 1);
        let ypos = panelIndex * 75 + 50;
        panel.style.top = ypos + 'px';

        // Set button actions
        let buttons = panel.querySelectorAll(":scope > button");
        buttons.forEach(button => {
            let subpanel = button.getAttribute('ac_goto');
            let panelID = `${panel.id}-${subpanel}`;

            if (subpanel == "back") {
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

function CreateLinesFor(panel) {
    RemoveAllLines();
    let depth = 0;
    let lastPanel = panel;

    while (depth < 32) {
        let parent = GetPanelParent(lastPanel);
        if (parent == null) break;

        let selector = `:scope > button[ac_tgt*="${lastPanel.id}"]`;
        let from = lastPanel.querySelector('.ac_panel_header');
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
    let inactive = document.querySelector('.ac-active');
    let active = document.getElementById(newPanel);

    SetPanelActive(inactive, false);
    SetPanelActive(active, true);

    let isNewDeeper = IsDeeperThan(active, inactive);
    AnimatePanelTowards(inactive, isNewDeeper, true);

    CreateLinesFor(active);
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