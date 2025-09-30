window.onload = () => {
    let audio = null;
    let currentHour = new Date().getHours() % 12 || 12;

    const songTitles = [
        "Lonely Universe (cover) by Fukane",// hour1
        "SOUL VACATION by The Vanished People",// hour2
        "Summer Ghost by Akira Kosemura",// hour3
        "WAY OUT by FKJ",// hour4
        "Zenzenzense (movie ver.) by RADWIMPS",// hour5
        "Thxnks by ChiliChill",// hour6
        "Ahead of Us by Akira Kosemura",// hour7
        "Run It Back by Public Library Commute",// hour8
        "Interestella Drift by HOYO-MiX",// hour9
        "A Beautiful Color by ChiliChill",// hour10
        "Whiplash by Hank Levy",// hour11
        "The Dawn After by BaishaJAWS",// hour12
    ];

    setInterval(() => {
        const d = new Date();
        const minute = d.getMinutes() * 6;
        const hour = d.getHours() * 30 + Math.round(minute / 12);
        document.getElementById("minute-hand").style.transform = `rotate(${minute}deg)`;
        document.getElementById("hour-hand").style.transform = `rotate(${hour}deg)`;
    }, 1000);

    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100%";
    popup.style.height = "100%";
    popup.style.backgroundColor = "rgba(0,0,0,0.8)";
    popup.style.display = "flex";
    popup.style.flexDirection = "column";
    popup.style.alignItems = "center";
    popup.style.justifyContent = "center";
    popup.style.color = "white";
    popup.style.fontSize = "24px";
    popup.style.zIndex = "9999";
    popup.innerHTML = `
        <div>
            <p>Do you want to play music?</p>
            <button id="startMusicBtn" style="
                font-size: 20px;
                padding: 10px 20px;
                margin-top: 20px;
                cursor: pointer;
            ">Yes</button>
        </div>
    `;
    document.body.appendChild(popup);

    document.getElementById("startMusicBtn").onclick = () => {
        popup.remove();
        startMusic();
    };

    function startMusic() {
        playHourMusic();

        setInterval(() => {
            const newHour = new Date().getHours() % 12 || 12;
            if (newHour !== currentHour) {
                currentHour = newHour;
                playHourMusic();
            }
        }, 60000);

    }

    function playHourMusic() {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }

    const audioId = `hour${currentHour}`;
    audio = document.getElementById(audioId);

    const titleIndex = (currentHour - 1);
    const nowPlayingText = `Now Playing: ${songTitles[titleIndex] || "Unknown Track"}`;
    document.getElementById("now-playing").textContent = nowPlayingText;

    if (audio) {
        audio.play().catch(err => {
            console.error("Audio playback failed:", err);
        });
    } else {
        console.warn(`Audio element with ID "${audioId}" not found.`);
    }
}

};
