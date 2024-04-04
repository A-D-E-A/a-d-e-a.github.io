self.onmessage = (ev) => {
    console.log("Le thread principal a envoyé ce message: ", ev);
    self.postMessage("Coucou, du worker");
}