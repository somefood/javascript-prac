const roomList = document.querySelector(".room-list");

document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('http://localhost:9090/rooms');
  const rooms = await response.json();
  for (const room of rooms) {
    const div = document.createElement("div");
    const aTag = document.createElement("a");
    aTag.setAttribute("href", `room.html?roomId=${room.roomId}`);
    aTag.textContent = `${room.roomName}, ${room.status}`;
    div.appendChild(aTag);
    roomList.appendChild(div);
  }
});
