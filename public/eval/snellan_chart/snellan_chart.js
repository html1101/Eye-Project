// A teeny tiny thing to do some night mode toggling
let night_tog = document.querySelector(".night_toggle");
let mode = night_tog.classList.contains("night") ? "night" : "sun";
document.body.className = mode;
const std_N = 1;
const THRESHOLD = 10;

night_tog.addEventListener("click", evt => {
    if(night_tog.classList.contains("night")) { mode = "sun"; }
    else { mode = "night"; }

    night_tog.className = `night_toggle ${mode}`;
    document.body.className = mode;
});

// Letter generation time
let letters = [
    {vision: "20-100", letters: 1},
    {vision: "20-70", letters: 2},
    {vision: "20-60", letters: 3},
    {vision: "20-50", letters: 4},
    {vision: "20-40", letters: 5},
    {vision: "20-30", letters: 5},
    {vision: "20-20", letters: 5},
    {vision: "15-20", letters: 8},
    {vision: "10-20", letters: 8},
    {vision: "7-20", letters: 8},
    {vision: "4-20", letters: 8}
];

// Generate a sequence of random letters of length n
function randomLetters(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

const chart_elem = document.querySelector(".letters");
letters.forEach(level => {
    // Add element to letters
    let parent_el = document.createElement("div");
    parent_el.className = "info";
    let actual_level = level.vision.split("-").join("/");
    parent_el.setAttribute("vision", actual_level);
    // Info about this size
    let size = document.createElement("div");
    size.innerHTML = actual_level;
    size.className = "level";
    parent_el.appendChild(size);
    let new_elem = document.createElement("div");
    // Generate a random A-Z letter
    new_elem.className = "s" + level.vision;
    new_elem.innerHTML = randomLetters(level.letters);
    parent_el.appendChild(new_elem);
    chart_elem.appendChild(parent_el);
    // If @ 20/30, display green strip underneath
    // If @ 20/20, display red strip underneath
});

// On down arrowing, move everything down by 1
let removed = [];
window.addEventListener("keypress", async evt => {
    if(evt.key == "s") {
        // Delete the first .info
        let el = chart_elem.firstElementChild;
        removed.push(el);
        chart_elem.removeChild(el);
    } 
    else if(evt.key == "w") {
        let last_rem = removed.pop();
        console.log(last_rem);
        chart_elem.insertBefore(last_rem, chart_elem.firstElementChild);
    }
    else if(evt.key == "Enter") {
        // We are done with what we can do, record this
        console.log("Got stuck at:");
        let vision_level = chart_elem.firstElementChild.getAttribute("vision");
        // Send this to the backend
        await fetch(`/save/snellan_chart?vision=${vision_level}`);
        window.location = "/";
    }
})