const comicTitle = document.querySelector("#comic-title");
const comicNum = document.querySelector("#comic-num");
const comicDate = document.querySelector("#comic-date");
const comicImg = document.querySelector("#comic-img");
const comicAlt = document.querySelector("#comic-alt");
const formatter = new Intl.DateTimeFormat(navigator.language);

async function fetchLatestComic() {
    const comicData = await fetch("https://corsproxy.io/?" + encodeURIComponent("https://xkcd.com/info.0.json")).then(r => r.json());
    return comicData;
}

async function displayComic() {
    const data = await fetchLatestComic();
    const date = formatter.format(new Date(`${data.year}-${data.month}-${data.day}`));
    comicTitle.textContent = data.title;
    comicDate.textContent = date;
    comicImg.src = data.img;
    comicAlt.textContent = data.alt;
    comicNum.textContent = data.num;
}

displayComic();

