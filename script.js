let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    debugger;
    currFolder = folder;
    let a = await fetch(`/${currFolder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}`)[1]);
        }
    }

    // show all the song to the playlist
    let songUL = document
        .querySelector(".song-list")
        .getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        // Add the song to the list with %20 encoding
        let decodedSongName = song.replace(/%20/g, " ");
        songUL.innerHTML += `<li>
            <img class="invert" src="./assets/images/music.svg" alt="">
            <div class="info">
                <div>${decodedSongName}</div>
                <div>Sweta</div>
            </div>
            <div class="play-now">
                <span>Play Now</span>
                <img class="invert" src="./assets/images/play.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(
        document.querySelector(".song-list").getElementsByTagName("li")
    ).forEach((e) => {
        e.addEventListener("click", (element) => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currFolder}` + track;
    if (!pause) {
        currentSong.play();
        play.src = "./assets/images/pause.svg";
    }
    document.querySelector(".song-info").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    debugger;
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            //    get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML =
                cardContainer.innerHTML +
                `<div class="card" data-folder="${folder}/">
         <div class="play">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
                 <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                     stroke-linejoin="round" />
             </svg>
         </div>
 
         <img src="/songs/${folder}/cover.jpg" alt="" />
         <h2>${response.title}</h2>
         <p>${response.description}</p>
     </div>`;
        }
    }

    // load the playlist whenever card click
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });
}

async function main() {
    // get the list of the songs
    await getSongs("songs/3am/");
    playMusic(songs[0], true);

    // display the all albums name

    displayAlbums();

    // attach to event listener to play and pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./assets/images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "./assets/images/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(
            currentSong.currentTime
        )}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // add an event listener to seekbar
    document.querySelector(".seek-bar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = +percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // add eventlister to hamburger while responsive
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // add event listener to close the button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-140%";
    });

    // add event listner to play previous song
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    // add event listner to play next song
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // add an event to manage the volume of song
    document
        .querySelector(".range")
        .getElementsByTagName("input")[0]
        .addEventListener("change", (e) => {
            currentSong.volume = parseInt(e.target.value) / 100;
        });

    // add event listner to mute the volume of song
    document.querySelector(".song-volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document
                .querySelector(".range")
                .getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document
                .querySelector(".range")
                .getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();
