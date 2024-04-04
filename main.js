const quill = new Quill("#editor", { theme: "snow" }); 

const chooseFileButton = document.querySelector("#choosefile");
const saveFileButton = document.querySelector("#savefile");

async function getFile() {
    const [fileHandle] = await window.showOpenFilePicker({
        multiple: false,
        types: [
            {
                description: "Plain text files",
                accept: {
                    "text/*": [".txt", ".html", ".md"]
                }
            }
        ]
    });
    const file = await fileHandle.getFile();
    const writableStream = await fileHandle.createWritable();
    return { file, writableStream };
}

let handle = {};

chooseFileButton.addEventListener("click", async () => {
    handle = await getFile();
    quill.root.innerHTML = await handle.file.text();
});

saveFileButton.addEventListener("click", async () => {
    const content = quill.root.innerHTML;
    const data = { filename: handle.file.name, bytesWritten: content.length };

    await handle.writableStream.write(content);
    await handle.writableStream.close();
    quill.root.innerHTML = "";

    Notification.requestPermission().then((result) => {
        if (result === "granted") {
            notifyWrite(data);
        }
    })
});

function notifyWrite({ filename, bytesWritten }) {
    const title = "Successfull write";
    const msg = `The file "${title}" has been overwritten by a text of ${bytesWritten} bytes.`;
    const img = "./icons/github-icon_72x72.png";
    const options = { body: msg, icon: img };
    new Notification(title, options);
}




