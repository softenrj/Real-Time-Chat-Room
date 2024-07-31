//join room
const userName = document.querySelector(".username");
const roomName = document.querySelector(".roomname");
const joinForm = document.querySelector(".join");

//info
const roomDisp = document.querySelector(".room");
const usersName = document.querySelector(".users");
const activity = document.querySelector(".activity");

// chat area
const chatArea = document.querySelector(".chat-display");

//send message
const messageSend = document.querySelector(".send-message");
const msgForm = document.querySelector(".sendmessage");


msgForm.addEventListener("submit",e =>{
    e.preventDefault();
    const message = messageSend.value;
    if(message==="") return;

    displayMessage(message,userName.value);

    //clint to server
    socket.emit("send-msg",message,roomName.value,userName.value);
    messageSend.value ="";
})


function displayMessage(m, anyUser) {
    let li = document.createElement("li");
    if (anyUser === userName.value) {
        li.innerHTML = `
            <div class="left-chat">
                <span class="name-l">You</span>
                <br>
                <div class="message">
                    ${m}
                </div>
                <span class="time-l">${new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })
                  }</span>
            </div>
        `;
    } else {
        li.innerHTML = `
            <div class="right-chat">
                <span class="name-r">${anyUser}</span>
                <br>
                <div class="message">
                    ${m}
                </div>
                <span class="time-r">${new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })
                  }</span>
            </div>
        `;
    }
    chatArea.appendChild(li);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function serverMsg(m){
    let p = document.createElement("p");
    p.className="admin";
    p.innerHTML=`
         ${m}
    `;
    chatArea.scrollTop = chatArea.scrollHeight;
    chatArea.prepend(p);
}



//socket

const socket = io();

socket.on("connect",()=>{
    serverMsg(`Default You connect to ${socket.id} \n create room or join from above`);
})

socket.on("received",(message,anyUser)=>{
    displayMessage(message,anyUser);
})

socket.on("userJoin",(m)=>{
    newJoin(m);
})

function newJoin(m){
    let p = document.createElement("p");
    p.className="admin";
    p.innerHTML=`
         ${m}
    `;
    chatArea.scrollTop = chatArea.scrollHeight;
    chatArea.appendChild(p);
}

//room
joinForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    const room = roomName.value.trim();
    const user = userName.value.trim();

    if(room && user){
        socket.emit('join-room',room,user);
    }

    roomDisp.innerHTML=roomName.value;
    activity.innerHTML="online";
})

//show activity

let typingTimeout;

messageSend.addEventListener("input",()=>{
    console.log("hellolllllll");
    socket.emit("typing",roomName.value,userName.value);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(()=>{
        socket.emit("stop-typing",roomName.value);
    },1000)
})

socket.on("typing", (m) => {
    console.log("dsssssss");
    activity.innerHTML = m;
});

socket.on("stop-typing", () => {
    activity.innerHTML = '';
});


//user list
socket.on("userList", (users) => {
    usersName.innerHTML = '';
    for (let i = 0; i < users.length; i++) {
        if (i === 0) {
            usersName.innerHTML += users[i];
        } else {
            usersName.innerHTML += ", " + users[i];
        }
    }
});

